/** Multiplicador térmico del ambiente. Los coeficientes viven en QuoteSettings. */
export const RoomKind = {
  Comercial: 'comercial',
  Critico: 'critico',
  Residencial: 'residencial',
} as const;

export type RoomKind = (typeof RoomKind)[keyof typeof RoomKind];
