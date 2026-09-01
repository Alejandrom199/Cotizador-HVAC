export const SlaStageName = {
  Revision: 'Revisión',
  Planos: 'Planos',
  Calculos: 'Cálculos',
  Cotizacion: 'Cotización',
} as const;

export type SlaStageName = (typeof SlaStageName)[keyof typeof SlaStageName];
