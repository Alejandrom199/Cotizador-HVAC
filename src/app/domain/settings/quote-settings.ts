import { ComplexityTier, RoomKind, SlaStageName } from '../enums';

export interface ComplexityBand {
  maxScore: number;
  tier: ComplexityTier;
  slaHours: number;
  color: string;
  bg: string;
}

export interface StageWeight {
  k: SlaStageName | string;
  w: number;
}

export interface QuoteSettings {
  ivaRate: number;
  defaultMarginInstall: number;
  defaultMarginMaintenance: number;
  hoursPerBusinessDay: number;
  offerValidityDays: number;
  maxDiscountPct: number;
  roomTypeMultiplier: Record<RoomKind, number>;
  defaultTemplateFactorBtu: number;
  cfmPerTon: number;
  btuPerTon: number;
  nominalBtuTable: number[];
  equipmentByBtuDirect: Array<{ maxBtu: number; code: string }>;
  equipmentByBtuDuct: Array<{ maxBtu: number; code: string }>;
  equipmentCapacityTons: Record<string, number>;
  stageWeights: StageWeight[];
  complexity: {
    areaPts: Array<{ max: number; pts: number }>;
    roomPts: Array<{ max: number; pts: number }>;
    templatePts: Record<string, number>;
    ductPts: number;
    equipmentPts: Array<{ max: number; pts: number }>;
    bands: ComplexityBand[];
  };
  templateQty: {
    ductAreaFactor: number;
    supplyGrilleArea: number;
    returnGrilleArea: number;
    copperPerRoomM: number;
    insulationPerRoomM: number;
    drainPerRoomM: number;
    tapePerDuctArea: number;
    supportAreaDivisor: number;
    solderPerRoom: number;
    gasPerTon: number;
    laborAreaFactor: number;
    laborFallbackHours: number;
    craneAreaThreshold: number;
  };
  /**
   * Campos del prototipo que no alimentan ningún cálculo (estado huérfano).
   * Quedan aquí documentados para no reintroducirlos en la UI.
   */
  unusedPrototypeKnobs: {
    factorBtuGlobal: number;
    indirectosPct: number;
    utilidadPct: number;
    accesoriosPct: number;
  };
}

export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
  ivaRate: 15,
  defaultMarginInstall: 22,
  defaultMarginMaintenance: 30,
  hoursPerBusinessDay: 8,
  offerValidityDays: 15,
  maxDiscountPct: 40,
  roomTypeMultiplier: {
    [RoomKind.Critico]: 1.25,
    [RoomKind.Comercial]: 1,
    [RoomKind.Residencial]: 0.9,
  },
  defaultTemplateFactorBtu: 650,
  cfmPerTon: 400,
  btuPerTon: 12000,
  nominalBtuTable: [12000, 18000, 24000, 36000, 48000, 60000, 120000, 240000],
  equipmentByBtuDirect: [
    { maxBtu: 18000, code: 'EQ-018' },
    { maxBtu: 24000, code: 'EQ-024' },
    { maxBtu: 36000, code: 'EQ-036' },
    { maxBtu: 48000, code: 'EQ-048' },
    { maxBtu: Number.POSITIVE_INFINITY, code: 'EQ-060' },
  ],
  equipmentByBtuDuct: [
    { maxBtu: 48000, code: 'EQ-048' },
    { maxBtu: 60000, code: 'EQ-060' },
    { maxBtu: Number.POSITIVE_INFINITY, code: 'EQ-UMA' },
  ],
  equipmentCapacityTons: {
    'EQ-UMA': 20,
    'EQ-CHL': 40,
    'EQ-060': 5,
    'EQ-048': 4,
    'EQ-036': 3,
    'EQ-024': 2,
    'EQ-018': 1.5,
  },
  stageWeights: [
    { k: SlaStageName.Revision, w: 0.1 },
    { k: SlaStageName.Planos, w: 0.25 },
    { k: SlaStageName.Calculos, w: 0.4 },
    { k: SlaStageName.Cotizacion, w: 0.25 },
  ],
  complexity: {
    areaPts: [
      { max: 150, pts: 0 },
      { max: 500, pts: 2 },
      { max: 1500, pts: 4 },
      { max: Number.POSITIVE_INFINITY, pts: 6 },
    ],
    roomPts: [
      { max: 5, pts: 0 },
      { max: 15, pts: 2 },
      { max: 30, pts: 4 },
      { max: Number.POSITIVE_INFINITY, pts: 6 },
    ],
    templatePts: { 'PL-03': 4, 'PL-02': 2 },
    ductPts: 2,
    equipmentPts: [
      { max: 3, pts: 0 },
      { max: 10, pts: 1 },
      { max: Number.POSITIVE_INFINITY, pts: 3 },
    ],
    bands: [
      {
        maxScore: 3,
        tier: ComplexityTier.Simple,
        slaHours: 8,
        color: '#1f9d64',
        bg: '#e6f6ec',
      },
      {
        maxScore: 7,
        tier: ComplexityTier.Media,
        slaHours: 24,
        color: '#b5710f',
        bg: '#fff3e2',
      },
      {
        maxScore: 12,
        tier: ComplexityTier.Compleja,
        slaHours: 56,
        color: '#c2410c',
        bg: '#fdeee3',
      },
      {
        maxScore: Number.POSITIVE_INFINITY,
        tier: ComplexityTier.MuyCompleja,
        slaHours: 96,
        color: '#c0392b',
        bg: '#fbeaea',
      },
    ],
  },
  templateQty: {
    ductAreaFactor: 0.85,
    supplyGrilleArea: 14,
    returnGrilleArea: 22,
    copperPerRoomM: 12,
    insulationPerRoomM: 24,
    drainPerRoomM: 5,
    tapePerDuctArea: 40,
    supportAreaDivisor: 4,
    solderPerRoom: 4,
    gasPerTon: 0.9,
    laborAreaFactor: 0.7,
    laborFallbackHours: 24,
    craneAreaThreshold: 300,
  },
  unusedPrototypeKnobs: {
    factorBtuGlobal: 1207,
    indirectosPct: 7,
    utilidadPct: 20,
    accesoriosPct: 2,
  },
};
