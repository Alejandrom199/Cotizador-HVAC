import { ProductCategory } from '../../domain/enums/product-category.enum';
import { Product } from '../../domain/models/product.model';
import { Client } from '../../domain/models/client.model';
import { SystemTemplate } from '../../domain/models/template.model';
import { Quote } from '../../domain/models/quote.model';
import { QuoteLine } from '../../domain/models/quote-line.model';
import { StaffMember } from '../../domain/models/results.model';
import { QuoteKind } from '../../domain/enums/quote-kind.enum';
import { QuoteStatus } from '../../domain/enums/quote-status.enum';
import { Priority } from '../../domain/enums/priority.enum';
import { RoomKind } from '../../domain/enums/room-kind.enum';
import { newUid } from '../../domain/calculators/quote-metrics';

export const SEED_PRODUCTS: Omit<Product, 'activo'>[] = [
  { code: 'EQ-018', cat: ProductCategory.Equipos, name: 'Split Inverter 18k BTU', unit: 'Unidad', costo: 480, pvp: 690, stock: 15, spec: 'Frío/calor - R-410A - Falcoil' },
  { code: 'EQ-024', cat: ProductCategory.Equipos, name: 'Split Inverter 24k BTU', unit: 'Unidad', costo: 620, pvp: 890, stock: 8, spec: 'Frío/calor - R-410A' },
  { code: 'EQ-036', cat: ProductCategory.Equipos, name: 'Cassette 36k BTU', unit: 'Unidad', costo: 980, pvp: 1390, stock: 6, spec: '4 vías - falso techo' },
  { code: 'EQ-048', cat: ProductCategory.Equipos, name: 'Unidad de conductos 48k BTU', unit: 'Unidad', costo: 1420, pvp: 1980, stock: 4, spec: 'Alta presión estática' },
  { code: 'EQ-060', cat: ProductCategory.Equipos, name: 'Condensadora VRF 5TR', unit: 'Unidad', costo: 3200, pvp: 4460, stock: 2, spec: 'Rooftop - modulante' },
  { code: 'EQ-UMA', cat: ProductCategory.Equipos, name: 'UMA central 20TR', unit: 'Unidad', costo: 12800, pvp: 17900, stock: 1, spec: 'Filtra, enfría y distribuye' },
  { code: 'EQ-CHL', cat: ProductCategory.Equipos, name: 'Chiller 40TR agua helada', unit: 'Unidad', costo: 26500, pvp: 35900, stock: 0, spec: 'Importación 6-8 sem' },
  { code: 'IN-CU14', cat: ProductCategory.Insumos, name: 'Tubería de cobre 1/4" deshidratada', unit: 'm', costo: 3.2, pvp: 5.1, stock: 320, spec: 'Tramo - Tipo L' },
  { code: 'IN-CU12', cat: ProductCategory.Insumos, name: 'Tubería de cobre 1/2"', unit: 'm', costo: 4.6, pvp: 7.2, stock: 280, spec: 'Tipo L' },
  { code: 'IN-AISL', cat: ProductCategory.Insumos, name: 'Aislamiento elastomérico', unit: 'm', costo: 1.8, pvp: 3.0, stock: 500, spec: 'Espuma negra' },
  { code: 'IN-DUCT', cat: ProductCategory.Insumos, name: 'Plancha fibra de vidrio Climaver', unit: 'm²', costo: 9.5, pvp: 15.0, stock: 210, spec: 'Ducto autoportante' },
  { code: 'IN-REJI', cat: ProductCategory.Insumos, name: 'Rejilla impulsión doble deflexión', unit: 'Unidad', costo: 22, pvp: 38, stock: 60, spec: 'Aluminio' },
  { code: 'IN-REJR', cat: ProductCategory.Insumos, name: 'Rejilla de retorno', unit: 'Unidad', costo: 18, pvp: 30, stock: 45, spec: 'Fija' },
  { code: 'IN-DREN', cat: ProductCategory.Insumos, name: 'Tubería de drenaje PVC', unit: 'm', costo: 1.1, pvp: 2.0, stock: 300, spec: 'Condensación' },
  { code: 'IN-CINTA', cat: ProductCategory.Insumos, name: 'Cinta de aluminio alta resistencia', unit: 'Rollo', costo: 6.5, pvp: 11, stock: 90, spec: 'Sellado juntas' },
  { code: 'IN-GAS', cat: ProductCategory.Insumos, name: 'Gas refrigerante R-410A', unit: 'kg', costo: 14, pvp: 22, stock: 40, spec: 'Carga' },
  { code: 'IN-SOLD', cat: ProductCategory.Insumos, name: 'Soldadura de plata (varilla)', unit: 'Unidad', costo: 3.5, pvp: 6, stock: 120, spec: 'Aleación' },
  { code: 'IN-SOP', cat: ProductCategory.Insumos, name: 'Soporte / varilla roscada', unit: 'Unidad', costo: 2.2, pvp: 4, stock: 200, spec: 'Fijación' },
  { code: 'MO-INST', cat: ProductCategory.ManoDeObra, name: 'Instalación técnica HVAC', unit: 'hora', costo: 8, pvp: 18, stock: null, spec: 'Cuadrilla certificada' },
  { code: 'MO-DUCT', cat: ProductCategory.ManoDeObra, name: 'Armado y montaje de ductos', unit: 'm²', costo: 4, pvp: 9, stock: null, spec: 'Fibra/metal' },
  { code: 'MO-DESM', cat: ProductCategory.ManoDeObra, name: 'Desmontaje de equipo existente', unit: 'Global', costo: 60, pvp: 120, stock: null, spec: '' },
  { code: 'MO-PRUEB', cat: ProductCategory.ManoDeObra, name: 'Pruebas y puesta en marcha', unit: 'Global', costo: 90, pvp: 180, stock: null, spec: 'Vacío + carga' },
  { code: 'LG-TRANS', cat: ProductCategory.Logistica, name: 'Transporte y traslados', unit: 'Global', costo: 80, pvp: 150, stock: null, spec: '' },
  { code: 'LG-GRUA', cat: ProductCategory.Logistica, name: 'Servicio de grúa', unit: 'día', costo: 220, pvp: 380, stock: null, spec: 'Izaje azotea' },
];

export const SEED_CLIENTS: Client[] = [
  { ruc: '1791234567001', name: 'Afecor Cía. Ltda.', city: 'Quito', direccion: 'Av. Amazonas N34-120, Quito', mail: 'compras@afecor.ec', phone: '+593 2 245 6789', type: 'Jurídica' },
  { ruc: '0992345678001', name: 'Constructora Aluxa S.A.', city: 'Guayaquil', direccion: 'Av. 9 de Octubre 100, Guayaquil', mail: 'proyectos@aluxa.ec', phone: '+593 4 268 4410', type: 'Jurídica' },
  { ruc: '0190987654001', name: 'Clínica Santa Inés', city: 'Cuenca', direccion: 'Av. Solano 12-80, Cuenca', mail: 'mantenimiento@santaines.ec', phone: '+593 7 405 1122', type: 'Jurídica' },
  { ruc: '0993456789001', name: 'Hotel Oro Verde', city: 'Machala', direccion: 'Av. 25 de Junio, Machala', mail: 'ing@oroverde.ec', phone: '+593 7 293 0555', type: 'Jurídica' },
  { ruc: '1712345678001', name: 'Corp. Vinueza', city: 'Quito', direccion: 'Cumbayá, Quito', mail: 'jvinueza@correo.ec', phone: '+593 99 812 3344', type: 'Natural' },
];

export const SEED_TEMPLATES: SystemTemplate[] = [
  { code: 'PL-01', name: 'Climatización Directa', sub: 'Split / Cassette (Falcoil)', driver: 'Expansión directa, sin red de ductos', factorBtu: 600, ducto: false, items: ['EQ-auto', 'IN-CU14', 'IN-CU12', 'IN-AISL', 'IN-DREN', 'IN-SOP', 'IN-SOLD', 'IN-GAS', 'MO-INST', 'MO-PRUEB', 'LG-TRANS'] },
  { code: 'PL-02', name: 'Climatización por Ductos', sub: 'Fibra Climaver + rejillas', driver: 'Unidad de conductos con red de distribución', factorBtu: 650, ducto: true, items: ['EQ-auto', 'IN-DUCT', 'IN-REJI', 'IN-REJR', 'IN-CU12', 'IN-AISL', 'IN-DREN', 'IN-CINTA', 'IN-SOP', 'IN-GAS', 'MO-INST', 'MO-DUCT', 'MO-PRUEB', 'LG-TRANS', 'LG-GRUA'] },
  { code: 'PL-03', name: 'UMAS / Sistema Central', sub: 'UMA + Chiller - edificio', driver: 'Manejadora central y red metálica', factorBtu: 700, ducto: true, items: ['EQ-UMA', 'IN-DUCT', 'IN-REJI', 'IN-REJR', 'IN-CU12', 'IN-AISL', 'IN-CINTA', 'IN-SOP', 'IN-GAS', 'MO-INST', 'MO-DUCT', 'MO-DESM', 'MO-PRUEB', 'LG-TRANS', 'LG-GRUA'] },
  { code: 'PL-04', name: 'Mantenimiento', sub: 'Preventivo / Correctivo', driver: 'Mano de obra y repuestos, sin obra nueva', factorBtu: 0, ducto: false, items: ['MO-INST', 'MO-PRUEB', 'IN-GAS', 'IN-SOLD'] },
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
    mkEl('EQ-018', 1), mkEl('EQ-036', 1), mkEl('IN-CU14', 48), mkEl('IN-CU12', 48),
    mkEl('IN-AISL', 96), mkEl('IN-DREN', 20), mkEl('IN-SOP', 22), mkEl('IN-SOLD', 16),
    mkEl('IN-GAS', 3), mkEl('MO-INST', 60), mkEl('MO-PRUEB', 1), mkEl('LG-TRANS', 1),
  ];

  return [
    { id: 'Q-016', code: 'COT-2026-016', name: 'Ventilación subsuelos Hipermarket', cliente: 'Constructora Aluxa S.A.', ruc: '0992345678001', tipo: QuoteKind.Instalacion, subtipo: 'Completa', plantilla: 'PL-02', area: 4322, estado: QuoteStatus.Solicitud, prio: Priority.Alta, asignado: null, vendedor: 'R. Tapia', ingeniero: null, hrs: [null, null, null, null], fecha: '05 ago', etapa: 1, motivo: null, rooms: [{ id: 's5', name: 'Subsuelo 5', area: 1080.7, tipo: RoomKind.Comercial }, { id: 's4', name: 'Subsuelo 4', area: 1080.7, tipo: RoomKind.Comercial }, { id: 's3', name: 'Subsuelo 3', area: 1080.7, tipo: RoomKind.Comercial }, { id: 's2', name: 'Subsuelo 2', area: 1080.7, tipo: RoomKind.Comercial }], elements: [], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 20, log: [] },
    { id: 'Q-015', code: 'COT-2026-015', name: 'Cortinas de aire Oro Verde', cliente: 'Hotel Oro Verde', ruc: '0993456789001', tipo: QuoteKind.Mantenimiento, subtipo: 'Correctivo', plantilla: 'PL-04', area: 0, estado: QuoteStatus.Solicitud, prio: Priority.Baja, asignado: null, vendedor: 'M. Coello', ingeniero: null, hrs: [null, null, null, null], fecha: '05 ago', etapa: 1, motivo: null, rooms: [], elements: [], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 30, log: [] },
    { id: 'Q-014', code: 'COT-2026-014', name: 'Climatización Casa Vinueza', cliente: 'Corp. Vinueza', ruc: '1712345678001', tipo: QuoteKind.Instalacion, subtipo: 'Completa', plantilla: 'PL-01', area: 85.3, estado: QuoteStatus.Elaboracion, prio: Priority.Media, asignado: 'Ing. Paredes', vendedor: 'M. Coello', ingeniero: 'Ing. Paredes', hrs: [1.2, 3.5, null, null], fecha: '18 jul', etapa: 2, motivo: null, rooms: casaRooms, elements: casaEls, descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 22, log: [] },
    { id: 'Q-013', code: 'COT-2026-013', name: 'Torre Aluxa — 15 pisos', cliente: 'Constructora Aluxa S.A.', ruc: '0992345678001', tipo: QuoteKind.Instalacion, subtipo: 'Completa', plantilla: 'PL-03', area: 4200, estado: QuoteStatus.Validacion, prio: Priority.Alta, asignado: 'Ing. Salgado', vendedor: 'R. Tapia', ingeniero: 'Ing. Salgado', hrs: [3.5, 26, 41, null], fecha: '15 jul', etapa: 4, motivo: null, rooms: [{ id: 'b1', name: 'Planta tipo (piso 1-15)', area: 280, tipo: RoomKind.Comercial, n: 15 }], elements: [], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 20, log: [] },
    { id: 'Q-011', code: 'COT-2026-011', name: 'Quirófanos Clínica Santa Inés', cliente: 'Clínica Santa Inés', ruc: '0190987654001', tipo: QuoteKind.Instalacion, subtipo: 'Completa', plantilla: 'PL-03', area: 640, estado: QuoteStatus.Enviada, prio: Priority.Alta, asignado: 'Ing. Salgado', vendedor: 'R. Tapia', ingeniero: 'Ing. Salgado', hrs: [2, 12, 22, 9], fecha: '11 jul', etapa: 4, motivo: null, rooms: [], elements: [mkEl('EQ-UMA', 2), mkEl('IN-DUCT', 540), mkEl('MO-DUCT', 540), mkEl('MO-INST', 420)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 24, log: [] },
    { id: 'Q-009', code: 'COT-2026-009', name: 'Lobby Hotel Oro Verde', cliente: 'Hotel Oro Verde', ruc: '0993456789001', tipo: QuoteKind.Instalacion, subtipo: 'Materiales', plantilla: 'PL-02', area: 310, estado: QuoteStatus.Aprobada, prio: Priority.Media, asignado: 'Ing. Paredes', vendedor: 'M. Coello', ingeniero: 'Ing. Paredes', hrs: [1.5, 6, 11, 5], fecha: '04 jul', etapa: 4, motivo: null, rooms: [], elements: [mkEl('EQ-048', 3), mkEl('IN-DUCT', 265), mkEl('IN-REJI', 22), mkEl('MO-DUCT', 265), mkEl('MO-INST', 180), mkEl('LG-TRANS', 1)], descInsumos: -5, descEquipos: -5, descMO: 0, margenMin: 20, log: [] },
    { id: 'Q-007', code: 'COT-2026-007', name: 'Oficinas Afecor', cliente: 'Afecor Cía. Ltda.', ruc: '1791234567001', tipo: QuoteKind.Instalacion, subtipo: 'Equipos', plantilla: 'PL-01', area: 140, estado: QuoteStatus.Reajuste, prio: Priority.Media, asignado: 'Ing. Paredes', vendedor: 'L. Bermeo', ingeniero: 'Ing. Paredes', hrs: [1, 4, 7, 4], fecha: '01 jul', etapa: 4, motivo: null, rooms: [], elements: [mkEl('EQ-024', 4), mkEl('IN-CU12', 120), mkEl('MO-INST', 96)], descInsumos: -8, descEquipos: -8, descMO: -12, margenMin: 22, log: [{ t: '01 jul', u: 'Gerencia', m: 'Cliente pide -10% global. Autorizado bajar insumos 8% y M.O. 12%.' }] },
    { id: 'Q-005', code: 'COT-2026-005', name: 'Bodega refrigerada Danec', cliente: 'Afecor Cía. Ltda.', ruc: '1791234567001', tipo: QuoteKind.Instalacion, subtipo: 'Completa', plantilla: 'PL-02', area: 520, estado: QuoteStatus.Perdida, prio: Priority.Baja, asignado: 'Ing. Salgado', vendedor: 'L. Bermeo', ingeniero: 'Ing. Salgado', hrs: [2, 14, 29, 11], fecha: '22 jun', etapa: 4, motivo: 'Precio', rooms: [], elements: [mkEl('EQ-060', 2), mkEl('IN-DUCT', 440)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 20, log: [] },
    { id: 'Q-004', code: 'COT-2026-004', name: 'Mant. preventivo Santa Inés', cliente: 'Clínica Santa Inés', ruc: '0190987654001', tipo: QuoteKind.Mantenimiento, subtipo: 'Preventivo', plantilla: 'PL-04', area: 0, estado: QuoteStatus.Aprobada, prio: Priority.Baja, asignado: 'Ing. Paredes', vendedor: 'M. Coello', ingeniero: 'Ing. Cabrera', hrs: [0.5, 1, 2, 1], fecha: '20 jun', etapa: 4, motivo: null, rooms: [], elements: [mkEl('MO-INST', 24), mkEl('IN-GAS', 4)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 30, log: [] },
    { id: 'Q-002', code: 'COT-2026-002', name: 'Data center Aluxa', cliente: 'Constructora Aluxa S.A.', ruc: '0992345678001', tipo: QuoteKind.Instalacion, subtipo: 'Completa', plantilla: 'PL-03', area: 180, estado: QuoteStatus.Perdida, prio: Priority.Media, asignado: 'Ing. Salgado', vendedor: 'R. Tapia', ingeniero: 'Ing. Salgado', hrs: [3, 9, 34, 14], fecha: '12 jun', etapa: 4, motivo: 'Tiempo de entrega', rooms: [], elements: [mkEl('EQ-CHL', 1)], descInsumos: 0, descEquipos: 0, descMO: 0, margenMin: 22, log: [] },
  ];
}
