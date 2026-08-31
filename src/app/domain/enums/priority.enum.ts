export const Priority = {
  Alta: 'Alta',
  Media: 'Media',
  Baja: 'Baja',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];
