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
