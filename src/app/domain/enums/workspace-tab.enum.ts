export const WorkspaceTab = {
  Resumen: 'resumen',
  Calculo: 'calculo',
  Ductos: 'ductos',
  Elementos: 'elementos',
  Tiempos: 'tiempos',
  Reajuste: 'reajuste',
  Informe: 'informe',
} as const;

export type WorkspaceTab = (typeof WorkspaceTab)[keyof typeof WorkspaceTab];
