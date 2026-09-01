export const ClientType = {
  Juridica: 'Jurídica',
  Natural: 'Natural',
  Publica: 'Pública',
} as const;

export type ClientType = (typeof ClientType)[keyof typeof ClientType];
