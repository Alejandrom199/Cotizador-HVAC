import {
  ProductCategory,
  QuoteKind,
  QuoteStatus,
  Priority,
  RoomKind,
  ClientType,
  InstallationSubtype,
  MaintenanceSubtype,
  ProductCode,
} from '../../domain/enums';
import { Product } from '../../domain/models/product.model';
import { Client } from '../../domain/models/client.model';
import { SystemTemplate } from '../../domain/models/template.model';
import { Quote } from '../../domain/models/quote.model';
import { QuoteLine } from '../../domain/models/quote-line.model';
import { StaffMember } from '../../domain/models/results.model';
import { newUid } from '../../domain/calculators/quote-metrics';

export const SEED_PRODUCTS: Omit<Product, 'activo'>[] = [
  { code: ProductCode.Eq018, cat: ProductCategory.Equipos, name: 'Split Inverter 18k BTU', unit: 'Unidad', costo: 480, pvp: 690, stock: 15, spec: 'Frío/calor - R-410A - Falcoil' },
  { code: ProductCode.Eq024, cat: ProductCategory.Equipos, name: 'Split Inverter 24k BTU', unit: 'Unidad', costo: 620, pvp: 890, stock: 8, spec: 'Frío/calor - R-410A' },
  { code: ProductCode.Eq036, cat: ProductCategory.Equipos, name: 'Cassette 36k BTU', unit: 'Unidad', costo: 980, pvp: 1390, stock: 6, spec: '4 vías - falso techo' },
  { code: ProductCode.Eq048, cat: ProductCategory.Equipos, name: 'Unidad de conductos 48k BTU', unit: 'Unidad', costo: 1420, pvp: 1980, stock: 4, spec: 'Alta presión estática' },
  { code: ProductCode.Eq060, cat: ProductCategory.Equipos, name: 'Condensadora VRF 5TR', unit: 'Unidad', costo: 3200, pvp: 4460, stock: 2, spec: 'Rooftop - modulante' },
  { code: ProductCode.EqUma, cat: ProductCategory.Equipos, name: 'UMA central 20TR', unit: 'Unidad', costo: 12800, pvp: 17900, stock: 1, spec: 'Filtra, enfría y distribuye' },
  { code: ProductCode.EqChiller, cat: ProductCategory.Equipos, name: 'Chiller 40TR agua helada', unit: 'Unidad', costo: 26500, pvp: 35900, stock: 0, spec: 'Importación 6-8 sem' },
  { code: ProductCode.InCu14, cat: ProductCategory.Insumos, name: 'Tubería de cobre 1/4" deshidratada', unit: 'm', costo: 3.2, pvp: 5.1, stock: 320, spec: 'Tramo - Tipo L' },
  { code: ProductCode.InCu12, cat: ProductCategory.Insumos, name: 'Tubería de cobre 1/2"', unit: 'm', costo: 4.6, pvp: 7.2, stock: 280, spec: 'Tipo L' },
  { code: ProductCode.InAisl, cat: ProductCategory.Insumos, name: 'Aislamiento elastomérico', unit: 'm', costo: 1.8, pvp: 3.0, stock: 500, spec: 'Espuma negra' },
  { code: ProductCode.InDuct, cat: ProductCategory.Insumos, name: 'Plancha fibra de vidrio Climaver', unit: 'm²', costo: 9.5, pvp: 15.0, stock: 210, spec: 'Ducto autoportante' },
  { code: ProductCode.InReji, cat: ProductCategory.Insumos, name: 'Rejilla impulsión doble deflexión', unit: 'Unidad', costo: 22, pvp: 38, stock: 60, spec: 'Aluminio' },
  { code: ProductCode.InRejr, cat: ProductCategory.Insumos, name: 'Rejilla de retorno', unit: 'Unidad', costo: 18, pvp: 30, stock: 45, spec: 'Fija' },
  { code: ProductCode.InDren, cat: ProductCategory.Insumos, name: 'Tubería de drenaje PVC', unit: 'm', costo: 1.1, pvp: 2.0, stock: 300, spec: 'Condensación' },
  { code: ProductCode.InCinta, cat: ProductCategory.Insumos, name: 'Cinta de aluminio alta resistencia', unit: 'Rollo', costo: 6.5, pvp: 11, stock: 90, spec: 'Sellado juntas' },
  { code: ProductCode.InGas, cat: ProductCategory.Insumos, name: 'Gas refrigerante R-410A', unit: 'kg', costo: 14, pvp: 22, stock: 40, spec: 'Carga' },
  { code: ProductCode.InSold, cat: ProductCategory.Insumos, name: 'Soldadura de plata (varilla)', unit: 'Unidad', costo: 3.5, pvp: 6, stock: 120, spec: 'Aleación' },
  { code: ProductCode.InSop, cat: ProductCategory.Insumos, name: 'Soporte / varilla roscada', unit: 'Unidad', costo: 2.2, pvp: 4, stock: 200, spec: 'Fijación' },
  { code: ProductCode.MoInst, cat: ProductCategory.ManoDeObra, name: 'Instalación técnica HVAC', unit: 'hora', costo: 8, pvp: 18, stock: null, spec: 'Cuadrilla certificada' },
  { code: ProductCode.MoDuct, cat: ProductCategory.ManoDeObra, name: 'Armado y montaje de ductos', unit: 'm²', costo: 4, pvp: 9, stock: null, spec: 'Fibra/metal' },
  { code: ProductCode.MoDesm, cat: ProductCategory.ManoDeObra, name: 'Desmontaje de equipo existente', unit: 'Global', costo: 60, pvp: 120, stock: null, spec: '' },
  { code: ProductCode.MoPrueb, cat: ProductCategory.ManoDeObra, name: 'Pruebas y puesta en marcha', unit: 'Global', costo: 90, pvp: 180, stock: null, spec: 'Vacío + carga' },
  { code: ProductCode.LgTrans, cat: ProductCategory.Logistica, name: 'Transporte y traslados', unit: 'Global', costo: 80, pvp: 150, stock: null, spec: '' },
  { code: ProductCode.LgGrua, cat: ProductCategory.Logistica, name: 'Servicio de grúa', unit: 'día', costo: 220, pvp: 380, stock: null, spec: 'Izaje azotea' },
];

export const SEED_CLIENTS: Client[] = [
  { ruc: '1791234567001', name: 'Afecor Cía. Ltda.', city: 'Quito', direccion: 'Av. Amazonas N34-120, Quito', mail: 'compras@afecor.ec', phone: '+593 2 245 6789', type: ClientType.Juridica },
  { ruc: '0992345678001', name: 'Constructora Aluxa S.A.', city: 'Guayaquil', direccion: 'Av. 9 de Octubre 100, Guayaquil', mail: 'proyectos@aluxa.ec', phone: '+593 4 268 4410', type: ClientType.Juridica },
  { ruc: '0190987654001', name: 'Clínica Santa Inés', city: 'Cuenca', direccion: 'Av. Solano 12-80, Cuenca', mail: 'mantenimiento@santaines.ec', phone: '+593 7 405 1122', type: ClientType.Juridica },
  { ruc: '0993456789001', name: 'Hotel Oro Verde', city: 'Machala', direccion: 'Av. 25 de Junio, Machala', mail: 'ing@oroverde.ec', phone: '+593 7 293 0555', type: ClientType.Juridica },
  { ruc: '1712345678001', name: 'Corp. Vinueza', city: 'Quito', direccion: 'Cumbayá, Quito', mail: 'jvinueza@correo.ec', phone: '+593 99 812 3344', type: ClientType.Natural },
  { ruc: '0010930674288', name: 'Saul Maldonado', city: 'Guayaquil', direccion: 'Av. Francisco de Orellana, Guayaquil', mail: 'smaldonado@emasesor.ec', phone: '+593 99 123 4567', type: ClientType.Juridica },
];

export const SEED_TEMPLATES: SystemTemplate[] = [
  { code: 'PL-01', name: 'Climatización Directa', sub: 'Split / Cassette (Falcoil)', driver: 'Expansión directa, sin red de ductos', factorBtu: 600, ducto: false, items: [ProductCode.EqAuto, ProductCode.InCu14, ProductCode.InCu12, ProductCode.InAisl, ProductCode.InDren, ProductCode.InSop, ProductCode.InSold, ProductCode.InGas, ProductCode.MoInst, ProductCode.MoPrueb, ProductCode.LgTrans] },
  { code: 'PL-02', name: 'Climatización por Ductos', sub: 'Fibra Climaver + rejillas', driver: 'Unidad de conductos con red de distribución', factorBtu: 650, ducto: true, items: [ProductCode.EqAuto, ProductCode.InDuct, ProductCode.InReji, ProductCode.InRejr, ProductCode.InCu12, ProductCode.InAisl, ProductCode.InDren, ProductCode.InCinta, ProductCode.InSop, ProductCode.InGas, ProductCode.MoInst, ProductCode.MoDuct, ProductCode.MoPrueb, ProductCode.LgTrans, ProductCode.LgGrua] },
  { code: 'PL-03', name: 'UMAS / Sistema Central', sub: 'UMA + Chiller - edificio', driver: 'Manejadora central y red metálica', factorBtu: 700, ducto: true, items: [ProductCode.EqUma, ProductCode.InDuct, ProductCode.InReji, ProductCode.InRejr, ProductCode.InCu12, ProductCode.InAisl, ProductCode.InCinta, ProductCode.InSop, ProductCode.InGas, ProductCode.MoInst, ProductCode.MoDuct, ProductCode.MoDesm, ProductCode.MoPrueb, ProductCode.LgTrans, ProductCode.LgGrua] },
  { code: 'PL-04', name: 'Mantenimiento', sub: 'Preventivo / Correctivo', driver: 'Mano de obra y repuestos, sin obra nueva', factorBtu: 0, ducto: false, items: [ProductCode.MoInst, ProductCode.MoPrueb, ProductCode.InGas, ProductCode.InSold] },
];

export const SEED_SELLERS: StaffMember[] = [
  { id: 'V1', name: 'M. Coello', ini: 'MC' },
  { id: 'V2', name: 'R. Tapia', ini: 'RT' },
  { id: 'V3', name: 'L. Bermeo', ini: 'LB' },
];

export const SEED_ENGINEERS: StaffMember[] = [
  { id: 'I1', name: 'Ing. Paredes', ini: 'IP' },
  { id: 'I2', name: 'Ing. Salgado', ini: 'IS' },
  { id: 'I3', name: 'Ing. Cabrera', ini: 'IC' },
];

function mkEl(code: string, qty: number): QuoteLine {
  const product = SEED_PRODUCTS.find((p) => p.code === code);
  if (!product) {
    throw new Error('Producto seed inexistente: ' + code);
  }
  return {
    uid: newUid(code),
    code,
    name: product.name,
    cat: product.cat,
    unit: product.unit,
    costo: product.costo,
    pvp: product.pvp,
    qty,
  };
}

export function createSeedQuotes(): Quote[] {
  const casaRooms = [
    { id: 'r1', name: 'Recepción', area: 24, tipo: RoomKind.Comercial },
    { id: 'r2', name: 'Oficina', area: 19.4, tipo: RoomKind.Comercial },
    { id: 'r3', name: 'Consultorio terapia', area: 24, tipo: RoomKind.Comercial },
    { id: 'r4', name: 'GYM', area: 17.9, tipo: RoomKind.Comercial },
  ];
  const casaEls = [
    mkEl(ProductCode.Eq018, 1),
    mkEl(ProductCode.Eq036, 1),
    mkEl(ProductCode.InCu14, 48),
    mkEl(ProductCode.InCu12, 48),
    mkEl(ProductCode.InAisl, 96),
    mkEl(ProductCode.InDren, 20),
    mkEl(ProductCode.InSop, 22),
    mkEl(ProductCode.InSold, 16),
    mkEl(ProductCode.InGas, 3),
    mkEl(ProductCode.MoInst, 60),
    mkEl(ProductCode.MoPrueb, 1),
    mkEl(ProductCode.LgTrans, 1),
  ];

  const mallRioRooms = [
    { id: 'r1', name: 'LC 1 - Tienda Departamental Ancla', area: 586.5, tipo: RoomKind.Comercial, personas: 45, sistema: 'VRF' as const },
    { id: 'r2', name: 'LC 2-3-4 - Galería Comercial', area: 150.2, tipo: RoomKind.Comercial, personas: 30, sistema: 'VRF' as const },
    { id: 'r3', name: 'LC 13 - Restaurante & Grill', area: 19.9, tipo: RoomKind.Comida, personas: 8, sistema: 'CAC' as const },
    { id: 'r4', name: 'LC 26 - Cafetería & Pastelería', area: 39.4, tipo: RoomKind.Comida, personas: 12, sistema: 'CAC' as const },
    { id: 'r5', name: 'LC 14 - Salón de Eventos', area: 118.6, tipo: RoomKind.Comercial, personas: 25, sistema: 'CAC' as const },
    { id: 'r6', name: 'Oficinas Administrativas & Control', area: 42.0, tipo: RoomKind.Oficina, personas: 6, sistema: 'CAC' as const },
  ];

  const mallRioDucts = [
    { id: 'ds1', name: 'Tramo 1 (Salida Principal UMA)', aInches: 32, bInches: 18, lengthM: 19.0, flowCfm: 3600 },
    { id: 'ds2', name: 'Tramo 2 (Distribución Tienda Ancla)', aInches: 26, bInches: 16, lengthM: 15.5, flowCfm: 2200 },
    { id: 'ds3', name: 'Tramo 3 (Ramal Patio de Comidas)', aInches: 22, bInches: 12, lengthM: 12.0, flowCfm: 1400 },
    { id: 'ds4', name: 'Tramo 4 (Derivación Locales Galería)', aInches: 18, bInches: 10, lengthM: 9.5, flowCfm: 850 },
    { id: 'ds5', name: 'Tramo 5 (Derivación Salón & Oficinas)', aInches: 14, bInches: 8, lengthM: 6.5, flowCfm: 450 },
  ];

  const mallRioEls = [
    mkEl(ProductCode.Eq060, 2),
    mkEl(ProductCode.Eq048, 3),
    mkEl(ProductCode.Eq036, 2),
    mkEl(ProductCode.Eq024, 2),
    mkEl(ProductCode.InDuct, 280),
    mkEl(ProductCode.InReji, 24),
    mkEl(ProductCode.InRejr, 16),
    mkEl(ProductCode.InCu12, 140),
    mkEl(ProductCode.InCu14, 140),
    mkEl(ProductCode.InAisl, 280),
    mkEl(ProductCode.InDren, 85),
    mkEl(ProductCode.InCinta, 18),
    mkEl(ProductCode.InSop, 45),
    mkEl(ProductCode.InSold, 28),
    mkEl(ProductCode.InGas, 12),
    mkEl(ProductCode.MoInst, 160),
    mkEl(ProductCode.MoDuct, 280),
    mkEl(ProductCode.MoPrueb, 2),
    mkEl(ProductCode.LgTrans, 2),
    mkEl(ProductCode.LgGrua, 1),
  ];

  return [
    {
      id: 'Q-017',
      code: 'COT-2026-017',
      name: 'Climatización & Ventilación — Mall del Río',
      cliente: 'Constructora Aluxa S.A.',
      ruc: '0992345678001',
      tipo: QuoteKind.Instalacion,
      subtipo: InstallationSubtype.Completa,
      plantilla: 'PL-02',
      area: 956.6,
      estado: QuoteStatus.Elaboracion,
      prio: Priority.Alta,
      asignado: 'Ing. Paredes',
      vendedor: 'M. Coello',
      ingeniero: 'Ing. Paredes',
      hrs: [2.0, 5.5, null, null],
      fecha: '04 sep',
      etapa: 2,
      motivo: null,
      rooms: mallRioRooms,
      elements: mallRioEls,
      descInsumos: 0,
      descEquipos: 0,
      descMO: 0,
      margenMin: 22,
      log: [
        { t: '04 sep 08:30', u: 'M. Coello', m: 'Recepción de requerimiento técnico y planos arquitectónicos para Plaza Mall del Río.' },
        { t: '04 sep 10:15', u: 'Ing. Paredes', m: 'Solicitud tomada por Ingeniería. Cálculo térmico cargado con factores EMASESOR y ventilación ASHRAE 62.1.' },
        { t: '04 sep 11:45', u: 'Ing. Paredes', m: 'Dimensionamiento aerodinámico de ductos R-D-003 verificado. Velocidades < 1,000 FPM (confort silencioso).' },
      ],
      ductSegments: mallRioDucts,
    },
    { id: 'Q-016', code: 'COT-2026-016', name: 'Ventilación subsuelos Hipermarket', cliente: 'Constructora Aluxa S.A.', ruc: '0992345678001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Completa, plantilla: 'PL-02', area: 4322, estado: QuoteStatus.Solicitud, prio: Priority.Alta, asignado: null, vendedor: 'R. Tapia', ingeniero: null, hrs: [null, null, null, null], fecha: '05 ago', etapa: 1, motivo: null, rooms: [{ id: 's5', name: 'Subsuelo 5', area: 1080.7, tipo: RoomKind.Comercial }, { id: 's4', name: 'Subsuelo 4', area: 1080.7, tipo: RoomKind.Comercial }, { id: 's3', name: 'Subsuelo 3', area: 1080.7, tipo: RoomKind.Comercial }, { id: 's2', name: 'Subsuelo 2', area: 1080.7, tipo: RoomKind.Comercial }], elements: [], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 20, log: [], ductSegments: [{ id: 'ds1', name: 'Troncal Principal Subsuelos', aInches: 52, bInches: 26, lengthM: 18, flowCfm: 3600 }, { id: 'ds2', name: 'Ramal Distribución Norte', aInches: 34, bInches: 20, lengthM: 12, flowCfm: 1800 }, { id: 'ds3', name: 'Ramal Distribución Sur', aInches: 24, bInches: 16, lengthM: 10, flowCfm: 1200 }] },
    { id: 'Q-015', code: 'COT-2026-015', name: 'Cortinas de aire Oro Verde', cliente: 'Hotel Oro Verde', ruc: '0993456789001', tipo: QuoteKind.Mantenimiento, subtipo: MaintenanceSubtype.Correctivo, plantilla: 'PL-04', area: 0, estado: QuoteStatus.Solicitud, prio: Priority.Baja, asignado: null, vendedor: 'M. Coello', ingeniero: null, hrs: [null, null, null, null], fecha: '05 ago', etapa: 1, motivo: null, rooms: [], elements: [], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 30, log: [] },
    { id: 'Q-014', code: 'COT-2026-014', name: 'Climatización Casa Vinueza', cliente: 'Corp. Vinueza', ruc: '1712345678001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Completa, plantilla: 'PL-01', area: 85.3, estado: QuoteStatus.Elaboracion, prio: Priority.Media, asignado: 'Ing. Paredes', vendedor: 'M. Coello', ingeniero: 'Ing. Paredes', hrs: [1.2, 3.5, null, null], fecha: '18 jul', etapa: 2, motivo: null, rooms: casaRooms, elements: casaEls, descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 22, log: [] },
    { id: 'Q-013', code: 'COT-2026-013', name: 'Torre Aluxa — 15 pisos', cliente: 'Constructora Aluxa S.A.', ruc: '0992345678001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Completa, plantilla: 'PL-03', area: 4200, estado: QuoteStatus.Validacion, prio: Priority.Alta, asignado: 'Ing. Salgado', vendedor: 'R. Tapia', ingeniero: 'Ing. Salgado', hrs: [3.5, 26, 41, null], fecha: '15 jul', etapa: 4, motivo: null, rooms: [{ id: 'b1', name: 'Planta tipo (piso 1-15)', area: 280, tipo: RoomKind.Comercial, n: 15 }], elements: [], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 20, log: [] },
    { id: 'Q-011', code: 'COT-2026-011', name: 'Quirófanos Clínica Santa Inés', cliente: 'Clínica Santa Inés', ruc: '0190987654001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Completa, plantilla: 'PL-03', area: 640, estado: QuoteStatus.Enviada, prio: Priority.Alta, asignado: 'Ing. Salgado', vendedor: 'R. Tapia', ingeniero: 'Ing. Salgado', hrs: [2, 12, 22, 9], fecha: '11 jul', etapa: 4, motivo: null, rooms: [], elements: [mkEl(ProductCode.EqUma, 2), mkEl(ProductCode.InDuct, 540), mkEl(ProductCode.MoDuct, 540), mkEl(ProductCode.MoInst, 420)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 24, log: [] },
    { id: 'Q-009', code: 'COT-2026-009', name: 'Lobby Hotel Oro Verde', cliente: 'Hotel Oro Verde', ruc: '0993456789001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Materiales, plantilla: 'PL-02', area: 310, estado: QuoteStatus.Aprobada, prio: Priority.Media, asignado: 'Ing. Paredes', vendedor: 'M. Coello', ingeniero: 'Ing. Paredes', hrs: [1.5, 6, 11, 5], fecha: '04 jul', etapa: 4, motivo: null, rooms: [], elements: [mkEl(ProductCode.Eq048, 3), mkEl(ProductCode.InDuct, 265), mkEl(ProductCode.InReji, 22), mkEl(ProductCode.MoDuct, 265), mkEl(ProductCode.MoInst, 180), mkEl(ProductCode.LgTrans, 1)], descInsumos: -5, descEquipos: -5, descMO: 0, margenMin: 20, log: [], ductSegments: [{ id: 'd1', name: 'Troncal Lobby', aInches: 32, bInches: 10, lengthM: 19.03, flowCfm: 2000 }] },
    { id: 'Q-007', code: 'COT-2026-007', name: 'Oficinas Afecor', cliente: 'Afecor Cía. Ltda.', ruc: '1791234567001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Equipos, plantilla: 'PL-01', area: 140, estado: QuoteStatus.Reajuste, prio: Priority.Media, asignado: 'Ing. Paredes', vendedor: 'L. Bermeo', ingeniero: 'Ing. Paredes', hrs: [1, 4, 7, 4], fecha: '01 jul', etapa: 4, motivo: null, rooms: [], elements: [mkEl(ProductCode.Eq024, 4), mkEl(ProductCode.InCu12, 120), mkEl(ProductCode.MoInst, 96)], descInsumos: -8, descEquipos: -8, descMO: -12, margenMin: 22, log: [{ t: '01 jul', u: 'Gerencia', m: 'Cliente pide -10% global. Autorizado bajar insumos 8% y M.O. 12%.' }] },
    { id: 'Q-005', code: 'COT-2026-005', name: 'Bodega refrigerada Danec', cliente: 'Afecor Cía. Ltda.', ruc: '1791234567001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Completa, plantilla: 'PL-02', area: 520, estado: QuoteStatus.Perdida, prio: Priority.Baja, asignado: 'Ing. Salgado', vendedor: 'L. Bermeo', ingeniero: 'Ing. Salgado', hrs: [2, 14, 29, 11], fecha: '22 jun', etapa: 4, motivo: 'Precio', rooms: [], elements: [mkEl(ProductCode.Eq060, 2), mkEl(ProductCode.InDuct, 440)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 20, log: [] },
    { id: 'Q-004', code: 'COT-2026-004', name: 'Mant. preventivo Santa Inés', cliente: 'Clínica Santa Inés', ruc: '0190987654001', tipo: QuoteKind.Mantenimiento, subtipo: MaintenanceSubtype.Preventivo, plantilla: 'PL-04', area: 0, estado: QuoteStatus.Aprobada, prio: Priority.Baja, asignado: 'Ing. Paredes', vendedor: 'M. Coello', ingeniero: 'Ing. Cabrera', hrs: [0.5, 1, 2, 1], fecha: '20 jun', etapa: 4, motivo: null, rooms: [], elements: [mkEl(ProductCode.MoInst, 24), mkEl(ProductCode.InGas, 4)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 30, log: [] },
    { id: 'Q-002', code: 'COT-2026-002', name: 'Data center Aluxa', cliente: 'Constructora Aluxa S.A.', ruc: '0992345678001', tipo: QuoteKind.Instalacion, subtipo: InstallationSubtype.Completa, plantilla: 'PL-03', area: 180, estado: QuoteStatus.Perdida, prio: Priority.Media, asignado: 'Ing. Salgado', vendedor: 'R. Tapia', ingeniero: 'Ing. Salgado', hrs: [3, 9, 34, 14], fecha: '12 jun', etapa: 4, motivo: 'Tiempo de entrega', rooms: [], elements: [mkEl(ProductCode.EqChiller, 1)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 22, log: [] },
  ];
}
