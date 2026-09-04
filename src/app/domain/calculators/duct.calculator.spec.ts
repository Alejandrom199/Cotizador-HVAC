import { describe, expect, it } from 'vitest';
import {
  computeEquivalentDiameter,
  computeDuctVelocity,
  computeDynamicPressure,
  computeDuctArea,
  computeDuctGauge,
  computeDuctSegmentMetrics,
  computeDuctSystemSummary,
  PIRALU_INTERNAL_DEDUCTION_INCHES,
  PIRALU_SHEET_AREA_M2,
} from './duct.calculator';
import { DuctSegment } from '../models/duct-segment.model';

describe('DuctCalculator - Fórmulas de Ingeniería Aerodinámica y Cubicación (Formato R-D-003)', () => {
  it('debe calcular el diámetro equivalente exacto según fórmula de Huebscher (ASHRAE)', () => {
    // Para Tol (sin descuento interno): a=32", b=10" -> Deq = 18.79"
    const deqTol = computeEquivalentDiameter(32, 10, 0);
    expect(deqTol).toBeCloseTo(18.79, 1);

    // Fila 18 de 2 DIMENSIONES DUCTOS.xlsx (PIRALU 20mm): a=32", b=10" -> Deq = 16.68"
    const deqPiralu = computeEquivalentDiameter(32, 10, PIRALU_INTERNAL_DEDUCTION_INCHES);
    expect(deqPiralu).toBeCloseTo(16.68, 1);
  });

  it('debe calcular la velocidad del aire FPM con precisión de ingeniería', () => {
    // Fila 18: Caudal = 2000 CFM, Deq = 16.68" -> Velocidad = 1317.51 FPM
    const deq = computeEquivalentDiameter(32, 10, PIRALU_INTERNAL_DEDUCTION_INCHES);
    const vel = computeDuctVelocity(2000, deq);
    expect(vel).toBeGreaterThan(1310);
    expect(vel).toBeLessThan(1325);
  });

  it('debe calcular la presión dinámica en in H2O y Pascales', () => {
    // V = 1317.51 FPM -> Pdin ≈ 0.108 in H2O (27.05 Pa)
    const press = computeDynamicPressure(1317.51);
    expect(press.inH2O).toBeCloseTo(0.108, 2);
    expect(press.pa).toBeCloseTo(27.05, 0);
  });

  it('debe calcular el área superficial de desarrollo del ducto en m²', () => {
    // Fila 18: a=32", b=10", Largo=19.03m -> Area = 2*(32+10)*0.0254*19.03 = 40.60 m²
    const area = computeDuctArea(32, 10, 19.03);
    expect(area).toBeCloseTo(40.6, 1);
  });

  it('debe asignar el calibre SMACNA y peso unitario según la dimensión máxima', () => {
    // <= 32" -> USG-26 (4.43 kg/m²)
    expect(computeDuctGauge(32, 10)).toEqual({ gauge: 'USG-26', weightPerM2: 4.43 });
    // <= 54" -> USG-24 (5.65 kg/m²)
    expect(computeDuctGauge(52, 26)).toEqual({ gauge: 'USG-24', weightPerM2: 5.65 });
    // <= 84" -> USG-22 (6.88 kg/m²)
    expect(computeDuctGauge(56, 30)).toEqual({ gauge: 'USG-22', weightPerM2: 6.88 });
    // > 84" -> USG-20 (8.10 kg/m²)
    expect(computeDuctGauge(90, 20)).toEqual({ gauge: 'USG-20', weightPerM2: 8.1 });
  });

  it('debe calcular las métricas completas y el semáforo acústico de confort', () => {
    const segment: DuctSegment = {
      id: 'seg-1',
      name: 'Troncal Principal',
      aInches: 32,
      bInches: 10,
      lengthM: 19.03,
      flowCfm: 2000,
    };

    const metrics = computeDuctSegmentMetrics(segment, true);
    expect(metrics.aMeters).toBe(0.813);
    expect(metrics.bMeters).toBe(0.254);
    expect(metrics.btuPerHour).toBe(60000);
    expect(metrics.gauge).toBe('USG-26');
    expect(metrics.statusTone).toBe('ok');
    expect(metrics.weightKg).toBeCloseTo(179.87, 0);
  });

  it('debe alertar con tono warn o bad si la velocidad supera los límites recomendados', () => {
    const highVelSegment: DuctSegment = {
      id: 'seg-noisy',
      name: 'Ramal Estrecho Ruidoso',
      aInches: 12,
      bInches: 8,
      lengthM: 5,
      flowCfm: 1500, // Demasiado aire para 12"x8"
    };

    const metrics = computeDuctSegmentMetrics(highVelSegment, true);
    expect(metrics.velocityFpm).toBeGreaterThan(1800);
    expect(metrics.statusTone).toBe('bad');
  });

  it('debe consolidar el resumen de la red y calcular las planchas PIRALU requeridas', () => {
    const segments: DuctSegment[] = [
      { id: '1', name: 'Tramo 1', aInches: 32, bInches: 10, lengthM: 10, flowCfm: 2000 },
      { id: '2', name: 'Tramo 2', aInches: 24, bInches: 10, lengthM: 10, flowCfm: 1200 },
    ];

    const summary = computeDuctSystemSummary(segments, 0.15, true);
    expect(summary.totalLengthM).toBe(20);
    expect(summary.totalAreaM2).toBeGreaterThan(0);
    expect(summary.piraluSheetsCount).toBeGreaterThan(0);
    expect(PIRALU_SHEET_AREA_M2).toBe(3.6);
  });
});
