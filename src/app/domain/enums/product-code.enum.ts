/**
 * Códigos estándar de catálogo de productos e insumos HVAC.
 */
export const ProductCode = {
  // Equipos
  Eq018: 'EQ-018',
  Eq024: 'EQ-024',
  Eq036: 'EQ-036',
  Eq048: 'EQ-048',
  Eq060: 'EQ-060',
  EqUma: 'EQ-UMA',
  EqChiller: 'EQ-CHL',
  EqAuto: 'EQ-auto',

  // Insumos
  InCu14: 'IN-CU14',
  InCu12: 'IN-CU12',
  InAisl: 'IN-AISL',
  InDuct: 'IN-DUCT',
  InReji: 'IN-REJI',
  InRejr: 'IN-REJR',
  InDren: 'IN-DREN',
  InCinta: 'IN-CINTA',
  InGas: 'IN-GAS',
  InSold: 'IN-SOLD',
  InSop: 'IN-SOP',

  // Mano de Obra
  MoInst: 'MO-INST',
  MoDuct: 'MO-DUCT',
  MoDesm: 'MO-DESM',
  MoPrueb: 'MO-PRUEB',

  // Logística
  LgTrans: 'LG-TRANS',
  LgGrua: 'LG-GRUA',
} as const;

export type ProductCode = (typeof ProductCode)[keyof typeof ProductCode];
