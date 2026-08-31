export const ProductCategory = {
  Equipos: 'Equipos',
  Insumos: 'Insumos',
  ManoDeObra: 'Mano de Obra',
  Logistica: 'Logística',
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];
