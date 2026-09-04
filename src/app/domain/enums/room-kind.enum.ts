/** Multiplicador térmico del ambiente. Los coeficientes viven en QuoteSettings. */
export const RoomKind = {
  Comida: 'comida',
  Comercial: 'comercial',
  Oficina: 'oficina',
  Critico: 'critico',
  Residencial: 'residencial',
} as const;

export type RoomKind = (typeof RoomKind)[keyof typeof RoomKind];
