import { DEFAULT_QUOTE_SETTINGS } from '../settings/quote-settings';
import { computeComplexity } from './complexity.calculator';
import { computePricing } from './pricing.calculator';
import { computeRoomThermal } from './thermal.calculator';
import { Quote } from '../models/quote.model';
import { SystemTemplate } from '../models/template.model';
import { QuoteStatus } from '../enums/quote-status.enum';
import { QuoteKind } from '../enums/quote-kind.enum';
import { Priority } from '../enums/priority.enum';
import { ProductCategory } from '../enums/product-category.enum';
import { RoomKind } from '../enums/room-kind.enum';

const settings = DEFAULT_QUOTE_SETTINGS;

const pl01: SystemTemplate = {
  code: 'PL-01',
  name: 'Climatización Directa',
  sub: 'Split / Cassette',
  driver: '',
  factorBtu: 600,
  ducto: false,
  items: [],
};

function line(
  code: string,
  cat: ProductCategory,
  qty: number,
  pvp: number,
  costo: number,
) {
  return { uid: code, code, name: code, cat, unit: 'u', costo, pvp, qty };
}

describe('computeRoomThermal', () => {
  it('Recepción 24 m² PL-01 comercial → 18k BTU / EQ-018', () => {
    const result = computeRoomThermal(
      { area: 24, tipo: RoomKind.Comercial },
      pl01,
      settings,
    );
    expect(result.btu).toBe(14400);
    expect(result.nominal).toBe(18000);
    expect(result.ton).toBe(1.5);
    expect(result.cfm).toBe(600);
    expect(result.equipo).toBe('EQ-018');
  });

  it('ambiente crítico aplica multiplicador 1.25', () => {
    const result = computeRoomThermal(
      { area: 24, tipo: RoomKind.Critico },
      pl01,
      settings,
    );
    expect(result.btu).toBe(18000);
    expect(result.nominal).toBe(18000);
  });
});

describe('computeComplexity', () => {
  it('Casa Vinueza (85.3 m², 4 ambientes, PL-01, 2 equipos) es Simple / 8 h', () => {
    const quote: Quote = {
      id: 'Q-014',
      code: 'COT-2026-014',
      name: 'Casa Vinueza',
      cliente: 'Corp. Vinueza',
      ruc: '1712345678001',
      tipo: QuoteKind.Instalacion,
      subtipo: 'Completa',
      plantilla: 'PL-01',
      area: 85.3,
      estado: QuoteStatus.Elaboracion,
      prio: Priority.Media,
      asignado: 'Ing. Paredes',
      vendedor: 'M. Coello',
      ingeniero: 'Ing. Paredes',
      hrs: [1.2, 3.5, null, null],
      fecha: '18 jul',
      etapa: 2,
      motivo: null,
      rooms: [
        { id: 'r1', name: 'Recepción', area: 24, tipo: RoomKind.Comercial },
        { id: 'r2', name: 'Oficina', area: 19.4, tipo: RoomKind.Comercial },
        { id: 'r3', name: 'Consultorio', area: 24, tipo: RoomKind.Comercial },
        { id: 'r4', name: 'GYM', area: 17.9, tipo: RoomKind.Comercial },
      ],
      elements: [
        line('EQ-018', ProductCategory.Equipos, 1, 690, 480),
        line('EQ-036', ProductCategory.Equipos, 1, 1390, 980),
      ],
      descInsumos: 0,
      descEquipos: 0,
      descMO: 0,
      margenMin: 22,
      log: [],
    };
    const result = computeComplexity(quote, pl01, settings);
    expect(result.score).toBe(0);
    expect(result.tier).toBe('Simple');
    expect(result.slaHours).toBe(8);
  });
});

describe('computePricing', () => {
  it('Casa Vinueza: total 5357.16 con IVA 15%', () => {
    const quote: Quote = {
      id: 'Q-014',
      code: 'COT-2026-014',
      name: 'Casa Vinueza',
      cliente: 'Corp. Vinueza',
      ruc: '1',
      tipo: QuoteKind.Instalacion,
      subtipo: 'Completa',
      plantilla: 'PL-01',
      area: 85.3,
      estado: QuoteStatus.Elaboracion,
      prio: Priority.Media,
      asignado: null,
      vendedor: null,
      ingeniero: null,
      hrs: [],
      fecha: '',
      etapa: 1,
      motivo: null,
      rooms: [],
      elements: [
        line('EQ-018', ProductCategory.Equipos, 1, 690, 480),
        line('EQ-036', ProductCategory.Equipos, 1, 1390, 980),
        line('IN-CU14', ProductCategory.Insumos, 48, 5.1, 3.2),
        line('IN-CU12', ProductCategory.Insumos, 48, 7.2, 4.6),
        line('IN-AISL', ProductCategory.Insumos, 96, 3.0, 1.8),
        line('IN-DREN', ProductCategory.Insumos, 20, 2.0, 1.1),
        line('IN-SOP', ProductCategory.Insumos, 22, 4.0, 2.2),
        line('IN-SOLD', ProductCategory.Insumos, 16, 6.0, 3.5),
        line('IN-GAS', ProductCategory.Insumos, 3, 22, 14),
        line('MO-INST', ProductCategory.ManoDeObra, 60, 18, 8),
        line('MO-PRUEB', ProductCategory.ManoDeObra, 1, 180, 90),
        line('LG-TRANS', ProductCategory.Logistica, 1, 150, 80),
      ],
      descInsumos: 0,
      descEquipos: 0,
      descMO: 0,
      margenMin: 22,
      log: [],
    };
    const result = computePricing(quote, settings);
    expect(result.sItems).toBeCloseTo(3248.4, 1);
    expect(result.sMO).toBeCloseTo(1260, 1);
    expect(result.base).toBeCloseTo(4658.4, 1);
    expect(result.iva).toBeCloseTo(698.76, 2);
    expect(result.total).toBeCloseTo(5357.16, 2);
    expect(result.costo).toBeCloseTo(2825.6, 1);
    expect(result.bajoPiso).toBe(false);
  });

  it('variación +10% en insumos sube subtotal y total', () => {
    const baseQuote: Quote = {
      id: 'Q-014',
      code: 'COT-2026-014',
      name: 'Casa Vinueza',
      cliente: 'Corp. Vinueza',
      ruc: '1',
      tipo: QuoteKind.Instalacion,
      subtipo: 'Completa',
      plantilla: 'PL-01',
      area: 85.3,
      estado: QuoteStatus.Elaboracion,
      prio: Priority.Media,
      asignado: null,
      vendedor: null,
      ingeniero: null,
      hrs: [],
      fecha: '',
      etapa: 1,
      motivo: null,
      rooms: [],
      elements: [
        line('EQ-018', ProductCategory.Equipos, 1, 690, 480),
        line('IN-CU14', ProductCategory.Insumos, 48, 5.1, 3.2),
        line('MO-INST', ProductCategory.ManoDeObra, 60, 18, 8),
      ],
      descInsumos: 0,
      descEquipos: 0,
      descMO: 0,
      margenMin: 22,
      log: [],
    };
    const zero = computePricing(baseQuote, settings);
    const up = computePricing({ ...baseQuote, descInsumos: 10 }, settings);
    expect(up.base).toBeGreaterThan(zero.base);
    expect(up.total).toBeGreaterThan(zero.total);
    expect(up.base - zero.base).toBeCloseTo(48 * 5.1 * 0.1, 2);
  });

  it('categoryDiscountParams tiene configurados limites comerciales para Insumos, Equipos y Mano de Obra', () => {
    const params = settings.categoryDiscountParams;
    expect(params).toBeDefined();
    expect(params.descInsumos.maxDiscountPct).toBe(30);
    expect(params.descInsumos.maxSurchargePct).toBe(40);
    expect(params.descEquipos.maxDiscountPct).toBe(15);
    expect(params.descEquipos.maxSurchargePct).toBe(30);
    expect(params.descMO.maxDiscountPct).toBe(35);
    expect(params.descMO.maxSurchargePct).toBe(50);
  });
});
