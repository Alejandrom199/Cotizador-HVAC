/**
 * Estados de cotización (promesa de negocio, no índice de UI).
 * Mezcla deliberada con nombres de etapa en el prototipo: se conserva para paridad.
 */
export const QuoteStatus = {
  Solicitud: 'Solicitud',
  Elaboracion: 'Elaboración',
  Planos: 'Planos',
  Calculos: 'Cálculos',
  Cotizacion: 'Cotización',
  Validacion: 'Validación',
  Enviada: 'Enviada',
  Aprobada: 'Aprobada',
  Reajuste: 'Reajuste',
  Perdida: 'Perdida',
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];
