import { Quote } from '../models/quote.model';
import { StageTimeRow } from '../models/results.model';
import { QuoteSettings } from '../settings/quote-settings';

export function computeStageTimes(
  quote: Quote,
  slaHours: number,
  settings: QuoteSettings,
): StageTimeRow[] {
  const hrs = quote.hrs || [null, null, null, null];
  const closedCount = hrs.filter((h) => h != null).length;
  return settings.stageWeights.map((stage, index) => {
    const meta = +(slaHours * stage.w).toFixed(1);
    const real = hrs[index] ?? null;
    const done = real != null;
    const desvio = done ? +(real - meta).toFixed(1) : null;
    return {
      name: stage.k,
      meta,
      real,
      done,
      desvio,
      activa: !done && index === closedCount,
      pct: Math.min(100, Math.round(((real ?? 0) / Math.max(1, meta)) * 100)),
    };
  });
}
