export const ComplexityTier = {
  Simple: 'Simple',
  Media: 'Media',
  Compleja: 'Compleja',
  MuyCompleja: 'Muy compleja',
} as const;

export type ComplexityTier = (typeof ComplexityTier)[keyof typeof ComplexityTier];
