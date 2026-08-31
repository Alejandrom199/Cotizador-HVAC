export const QuoteKind = {
  Instalacion: 'Instalación',
  Mantenimiento: 'Mantenimiento',
} as const;

export type QuoteKind = (typeof QuoteKind)[keyof typeof QuoteKind];

export const InstallationSubtype = {
  Materiales: 'Materiales',
  Equipos: 'Equipos',
  Completa: 'Completa',
} as const;

export type InstallationSubtype = (typeof InstallationSubtype)[keyof typeof InstallationSubtype];
