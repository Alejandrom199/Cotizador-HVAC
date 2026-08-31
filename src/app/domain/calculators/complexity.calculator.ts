import { ComplexityTier } from '../enums/complexity-tier.enum';
import { ProductCategory } from '../enums/product-category.enum';
import { Quote } from '../models/quote.model';
import { ComplexityResult } from '../models/results.model';
import { SystemTemplate } from '../models/template.model';
import { QuoteSettings } from '../settings/quote-settings';
import { effectiveArea, roomCount } from './quote-metrics';

function ptsFromBands(value: number, bands: Array<{ max: number; pts: number }>): number {
  for (const band of bands) {
    if (value < band.max) {
      return band.pts;
    }
  }
  return bands[bands.length - 1]?.pts ?? 0;
}

/**
 * Complejidad y SLA. Dueño canónico: no recalcular en KPIs de pantalla.
 */
export function computeComplexity(
  quote: Quote | null,
  template: SystemTemplate | undefined,
  settings: QuoteSettings,
): ComplexityResult {
  const fallback = settings.complexity.bands[0];
  if (!quote) {
    return {
      score: 0,
      tier: ComplexityTier.Simple,
      slaHours: fallback.slaHours,
      color: fallback.color,
      bg: fallback.bg,
      drivers: [],
    };
  }

  const rooms = roomCount(quote);
  const area = effectiveArea(quote);
  const equipmentQty = (quote.elements ?? [])
    .filter((line) => line.cat === ProductCategory.Equipos)
    .reduce((acc, line) => acc + line.qty, 0);

  const drivers = [];
  let score = 0;

  const areaPts = ptsFromBands(area, settings.complexity.areaPts);
  score += areaPts;
  drivers.push({ label: 'Área ' + area.toFixed(0) + ' m²', pts: areaPts });

  const roomPts = ptsFromBands(rooms, settings.complexity.roomPts);
  score += roomPts;
  drivers.push({ label: rooms + ' ambientes', pts: roomPts });

  const systemPts = settings.complexity.templatePts[quote.plantilla] ?? 0;
  score += systemPts;
  drivers.push({ label: template?.name || 'Sistema', pts: systemPts });

  const ductPts = template?.ducto ? settings.complexity.ductPts : 0;
  score += ductPts;
  drivers.push({ label: template?.ducto ? 'Red de ductos' : 'Sin ductos', pts: ductPts });

  const eqPts = ptsFromBands(equipmentQty, settings.complexity.equipmentPts);
  score += eqPts;
  drivers.push({ label: Math.round(equipmentQty) + ' equipos', pts: eqPts });

  const band =
    settings.complexity.bands.find((item) => score <= item.maxScore) ??
    settings.complexity.bands[settings.complexity.bands.length - 1];

  return {
    score,
    tier: band.tier,
    slaHours: band.slaHours,
    color: band.color,
    bg: band.bg,
    drivers,
  };
}
