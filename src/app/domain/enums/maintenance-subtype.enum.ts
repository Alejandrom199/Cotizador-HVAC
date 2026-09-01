export const MaintenanceSubtype = {
  Preventivo: 'Preventivo',
  Correctivo: 'Correctivo',
  Integral: 'Integral (Equipos + Ductos)',
} as const;

export type MaintenanceSubtype = (typeof MaintenanceSubtype)[keyof typeof MaintenanceSubtype];
