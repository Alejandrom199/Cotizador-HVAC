import { ComplexityTier } from '../enums/complexity-tier.enum';

export interface ComplexityDriver {
  label: string;
  pts: number;
}

export interface ComplexityResult {
  score: number;
  tier: ComplexityTier;
  slaHours: number;
  color: string;
  bg: string;
  drivers: ComplexityDriver[];
}

export interface StageTimeRow {
  name: string;
  meta: number;
  real: number | null;
  done: boolean;
  desvio: number | null;
  activa: boolean;
  pct: number;
}

export interface ThermalResult {
  btu: number;
  nominal: number;
  ton: number;
  cfm: number;
  equipo: string;
  /** Ventilación de aire exterior según ASHRAE 62.1 (CFM) */
  cfmVentilation: number;
  /** Ventilación en Litros por segundo (L/s) */
  litersPerSec: number;
  /** Ventilación en m³/h */
  m3PerHour: number;
  /** Densidad de potencia térmica real (BTU/h / m²) */
  thermalDensity: number;
  /** Evaluación acústica / semáforo térmico */
  densityStatus: 'optimo' | 'subenfriado' | 'sobredimensionado';
  /** Nomenclatura del condensador sugerido (p. ej. AC036, AC048, AM100, AM300) */
  condensador?: string;
}

export interface PricingResult {
  subtotal: number;
  base: number;
  baseItems: number;
  baseMO: number;
  sItems: number;
  sMO: number;
  sOther: number;
  iva: number;
  total: number;
  costo: number;
  util: number;
  margen: number;
  piso: number;
  bajoPiso: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  ini: string;
}
