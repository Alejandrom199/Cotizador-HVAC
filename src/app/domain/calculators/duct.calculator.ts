import { DuctSegment, DuctSegmentMetrics, DuctSystemSummary } from '../models/duct-segment.model';

/**
 * Área de una plancha estándar de panel PIRALU / Fibra Climaver (1.20m x 3.00m).
 */
export const PIRALU_SHEET_AREA_M2 = 3.6;

/**
 * Espesor de pared interna para paneles PIRALU de 20mm (2 x 20mm = 40mm ≈ 1.5748 pulgadas).
 */
export const PIRALU_INTERNAL_DEDUCTION_INCHES = 1.5748;

/**
 * Constante estándar de velocidad del aire para cálculo de presión dinámica (ASHRAE).
 */
const VELOCITY_PRESSURE_CONSTANT = 4005;

/**
 * Factor de conversión de Pulgadas de Columna de Agua (in H2O) a Pascales (Pa).
 */
const IN_H2O_TO_PA = 249.0889;

/**
 * Diámetro Equivalente Circular (Fórmula de Huebscher / ASHRAE).
 * Deq = 1.30 * ((a_net * b_net)^0.625) / ((a_net + b_net)^0.25)
 * @param aInches Dimensión exterior a en pulgadas
 * @param bInches Dimensión exterior b en pulgadas
 * @param wallDeductionInches Descuento por espesor de pared (1.5748 para PIRALU de 20mm, 0 para Tol)
 */
export function computeEquivalentDiameter(
  aInches: number,
  bInches: number,
  wallDeductionInches = 0,
): number {
  const aNet = aInches - wallDeductionInches;
  const bNet = bInches - wallDeductionInches;
  if (aNet <= 0 || bNet <= 0) return 0;
  const numerator = Math.pow(aNet * bNet, 0.625);
  const denominator = Math.pow(aNet + bNet, 0.25);
  if (denominator <= 0) return 0;
  return Number((1.3 * (numerator / denominator)).toFixed(2));
}

/**
 * Velocidad del aire dentro del ducto en Pies por Minuto (FPM).
 * V = CFM / AreaTransversal (ft²)
 */
export function computeDuctVelocity(flowCfm: number, deqInches: number): number {
  if (flowCfm <= 0 || deqInches <= 0) return 0;
  const radiusFt = deqInches / 12 / 2;
  const areaFt2 = Math.PI * radiusFt * radiusFt;
  if (areaFt2 <= 0) return 0;
  return Number((flowCfm / areaFt2).toFixed(2));
}

/**
 * Presión dinámica en Pulgadas de Columna de Agua y Pascales.
 * Pdin = (V / 4005)²
 */
export function computeDynamicPressure(velocityFpm: number): { inH2O: number; pa: number } {
  if (velocityFpm <= 0) return { inH2O: 0, pa: 0 };
  const inH2O = Math.pow(velocityFpm / VELOCITY_PRESSURE_CONSTANT, 2);
  const pa = inH2O * IN_H2O_TO_PA;
  return {
    inH2O: Number(inH2O.toFixed(4)),
    pa: Number(pa.toFixed(2)),
  };
}

/**
 * Área superficial de desarrollo del tramo de ducto en metros cuadrados (m²).
 * Area = 2 * (a + b) * 0.0254 * Largo (m)
 */
export function computeDuctArea(aInches: number, bInches: number, lengthM: number): number {
  if (aInches <= 0 || bInches <= 0 || lengthM <= 0) return 0;
  const perimeterM = (aInches + bInches) * 2 * 0.0254;
  return Number((perimeterM * lengthM).toFixed(2));
}

/**
 * Calibre SMACNA y peso unitario en kg/m² según la mayor dimensión del ducto.
 */
export function computeDuctGauge(aInches: number, bInches: number): { gauge: string; weightPerM2: number } {
  const maxDim = Math.max(aInches, bInches);
  if (maxDim <= 32) {
    return { gauge: 'USG-26', weightPerM2: 4.43 };
  }
  if (maxDim <= 54) {
    return { gauge: 'USG-24', weightPerM2: 5.65 };
  }
  if (maxDim <= 84) {
    return { gauge: 'USG-22', weightPerM2: 6.88 };
  }
  return { gauge: 'USG-20', weightPerM2: 8.1 };
}

/**
 * Calcula todas las métricas aerodinámicas y de cubicación de un tramo de ducto.
 */
export function computeDuctSegmentMetrics(
  segment: DuctSegment,
  isPiralu = true,
): DuctSegmentMetrics {
  const deduction = isPiralu ? PIRALU_INTERNAL_DEDUCTION_INCHES : 0;
  const deq = computeEquivalentDiameter(segment.aInches, segment.bInches, deduction);
  const velocity = computeDuctVelocity(segment.flowCfm, deq);
  const pressure = computeDynamicPressure(velocity);
  const area = computeDuctArea(segment.aInches, segment.bInches, segment.lengthM);
  const { gauge, weightPerM2 } = computeDuctGauge(segment.aInches, segment.bInches);
  const weightKg = Number((area * weightPerM2).toFixed(2));

  let statusTone: 'ok' | 'warn' | 'bad' = 'ok';
  let statusLabel = 'Óptimo (< 1500 FPM)';

  if (velocity > 1800) {
    statusTone = 'bad';
    statusLabel = 'Ruidoso (> 1800 FPM)';
  } else if (velocity > 1500) {
    statusTone = 'warn';
    statusLabel = 'Moderado (1500 - 1800 FPM)';
  }

  const aMeters = Number((segment.aInches * 0.0254).toFixed(3));
  const bMeters = Number((segment.bInches * 0.0254).toFixed(3));
  const btuPerHour = Math.round(segment.flowCfm * 30);

  return {
    aMeters,
    bMeters,
    deqInches: deq,
    velocityFpm: velocity,
    dynamicInH2O: pressure.inH2O,
    dynamicPa: pressure.pa,
    areaM2: area,
    gauge,
    weightPerM2,
    weightKg,
    btuPerHour,
    statusTone,
    statusLabel,
  };
}

/**
 * Resumen consolidado de toda la red de ductos de una cotización.
 */
export function computeDuctSystemSummary(
  segments: DuctSegment[] = [],
  wastePct = 0.15,
  isPiralu = true,
): DuctSystemSummary {
  let totalLength = 0;
  let totalArea = 0;
  let totalWeight = 0;
  let maxVel = 0;

  for (const s of segments) {
    const m = computeDuctSegmentMetrics(s, isPiralu);
    totalLength += s.lengthM;
    totalArea += m.areaM2;
    totalWeight += m.weightKg;
    if (m.velocityFpm > maxVel) {
      maxVel = m.velocityFpm;
    }
  }

  const weightWithWaste = Number((totalWeight * (1 + wastePct)).toFixed(1));
  const areaWithWaste = totalArea * (1 + wastePct);
  const piraluSheets = Math.ceil(areaWithWaste / PIRALU_SHEET_AREA_M2);

  let systemTone: 'ok' | 'warn' | 'bad' = 'ok';
  if (maxVel > 1800) {
    systemTone = 'bad';
  } else if (maxVel > 1500) {
    systemTone = 'warn';
  }

  return {
    totalLengthM: Number(totalLength.toFixed(1)),
    totalAreaM2: Number(totalArea.toFixed(2)),
    totalWeightKg: Number(totalWeight.toFixed(1)),
    totalWeightWithWasteKg: weightWithWaste,
    piraluSheetsCount: piraluSheets,
    wastePct,
    maxVelocityFpm: maxVel,
    systemTone,
  };
}
