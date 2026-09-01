export const DiscountCategory = {
  Insumos: 'descInsumos',
  Equipos: 'descEquipos',
  ManoDeObra: 'descMO',
} as const;

export type DiscountCategory = (typeof DiscountCategory)[keyof typeof DiscountCategory];
