import { Product } from '../models/product.model';
import { Quote } from '../models/quote.model';
import { QuoteLine } from '../models/quote-line.model';
import { SystemTemplate } from '../models/template.model';
import { QuoteSettings } from '../settings/quote-settings';
import { effectiveArea, newUid, roomCount } from './quote-metrics';
import { computeRoomThermal } from './thermal.calculator';

/**
 * Genera líneas de materiales desde plantilla + áreas.
 * Las constantes de cantidad viven en settings.templateQty.
 */
export function applyTemplateLines(
  quote: Quote,
  template: SystemTemplate,
  products: Product[],
  settings: QuoteSettings,
): QuoteLine[] {
  const findProduct = (code: string) => products.find((p) => p.code === code);
  const lines: QuoteLine[] = [];
  const qty = settings.templateQty;

  const push = (code: string, amount: number) => {
    if (amount <= 0) {
      return;
    }
    const product = findProduct(code);
    if (!product) {
      return;
    }
    const current = lines.find((line) => line.code === code);
    if (current) {
      current.qty = +(current.qty + amount).toFixed(1);
      return;
    }
    lines.push({
      uid: newUid(code),
      code,
      name: product.name,
      cat: product.cat,
      unit: product.unit,
      costo: product.costo,
      pvp: product.pvp,
      qty: +amount.toFixed(1),
    });
  };

  const rooms = quote.rooms ?? [];
  const totalArea = effectiveArea(quote);
  let tons = 0;

  rooms.forEach((room) => {
    const thermal = computeRoomThermal(room, template, settings);
    const mult = room.n || 1;
    tons += thermal.ton * mult;
    if (template.items.includes('EQ-auto')) {
      push(thermal.equipo, mult);
    }
  });

  if (rooms.length === 0 && template.items.includes('EQ-auto')) {
    const thermal = computeRoomThermal(
      { area: totalArea, tipo: 'comercial' },
      template,
      settings,
    );
    tons = thermal.ton;
    push(thermal.equipo, 1);
  }

  const environments = Math.max(1, roomCount(quote));

  template.items.forEach((code) => {
    if (code === 'EQ-auto') {
      return;
    }
    if (code === 'IN-DUCT') {
      push(code, Math.round(totalArea * qty.ductAreaFactor));
    } else if (code === 'IN-REJI') {
      push(code, Math.ceil(totalArea / qty.supplyGrilleArea));
    } else if (code === 'IN-REJR') {
      push(code, Math.ceil(totalArea / qty.returnGrilleArea));
    } else if (code === 'IN-CU14' || code === 'IN-CU12') {
      push(code, environments * qty.copperPerRoomM);
    } else if (code === 'IN-AISL') {
      push(code, environments * qty.insulationPerRoomM);
    } else if (code === 'IN-DREN') {
      push(code, environments * qty.drainPerRoomM);
    } else if (code === 'IN-CINTA') {
      push(code, Math.ceil((totalArea * qty.ductAreaFactor) / qty.tapePerDuctArea));
    } else if (code === 'IN-SOP') {
      push(code, Math.ceil(totalArea / qty.supportAreaDivisor));
    } else if (code === 'IN-SOLD') {
      push(code, environments * qty.solderPerRoom);
    } else if (code === 'IN-GAS') {
      push(code, Math.max(1, Math.round(tons * qty.gasPerTon)));
    } else if (code === 'MO-INST') {
      push(code, Math.round(totalArea * qty.laborAreaFactor) || qty.laborFallbackHours);
    } else if (code === 'MO-DUCT') {
      push(code, Math.round(totalArea * qty.ductAreaFactor));
    } else if (code === 'MO-PRUEB' || code === 'MO-DESM' || code === 'LG-TRANS') {
      push(code, 1);
    } else if (code === 'LG-GRUA') {
      push(code, totalArea > qty.craneAreaThreshold ? 2 : 1);
    } else if (code.startsWith('EQ-')) {
      const cap = settings.equipmentCapacityTons[code] || 5;
      push(code, Math.max(1, Math.ceil(tons / cap)));
    }
  });

  return lines;
}
