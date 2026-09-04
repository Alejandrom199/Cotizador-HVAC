export interface DuctSegment {
  id: string;
  name: string;
  aInches: number;
  bInches: number;
  lengthM: number;
  flowCfm: number;
}

export interface DuctSegmentMetrics {
  aMeters: number;
  bMeters: number;
  deqInches: number;
  velocityFpm: number;
  dynamicInH2O: number;
  dynamicPa: number;
  areaM2: number;
  gauge: string;
  weightPerM2: number;
  weightKg: number;
  btuPerHour: number;
  statusTone: 'ok' | 'warn' | 'bad';
  statusLabel: string;
}

export interface DuctSystemSummary {
  totalLengthM: number;
  totalAreaM2: number;
  totalWeightKg: number;
  totalWeightWithWasteKg: number;
  piraluSheetsCount: number;
  wastePct: number;
  maxVelocityFpm: number;
  systemTone: 'ok' | 'warn' | 'bad';
}
