import { ProductCategory } from '../enums/product-category.enum';
import { Quote } from '../models/quote.model';
import { PricingResult } from '../models/results.model';
import { QuoteSettings } from '../settings/quote-settings';

/**
 * Pricing oficial. IVA, variación de precio y piso salen de settings + cotización, no de la UI.
 * desc* positivo sube el PVP de esa categoría; negativo lo baja.
 */
export function computePricing(quote: Quote | null, settings: QuoteSettings): PricingResult {
  const empty: PricingResult = {
    subtotal: 0,
    base: 0,
    baseItems: 0,
    baseMO: 0,
    sItems: 0,
    sMO: 0,
    sOther: 0,
    iva: 0,
    total: 0,
    costo: 0,
    util: 0,
    margen: 0,
    piso: 0,
    bajoPiso: false,
  };
  if (!quote) {
    return empty;
  }

  let sInsumos = 0;
  let sEquipos = 0;
  let sMO = 0;
  let cItems = 0;
  let cMO = 0;
  let sOther = 0;
  let cOther = 0;

  for (const line of quote.elements ?? []) {
    const sale = line.qty * line.pvp;
    const cost = line.qty * line.costo;
    if (line.cat === ProductCategory.ManoDeObra) {
      sMO += sale;
      cMO += cost;
    } else if (line.cat === ProductCategory.Insumos) {
      sInsumos += sale;
      cItems += cost;
    } else if (line.cat === ProductCategory.Equipos) {
      sEquipos += sale;
      cItems += cost;
    } else {
      sOther += sale;
      cOther += cost;
    }
  }

  const sItems = sInsumos + sEquipos;
  const baseInsumos = sInsumos * (1 + (quote.descInsumos || 0) / 100);
  const baseEquipos = sEquipos * (1 + (quote.descEquipos || 0) / 100);
  const baseItems = baseInsumos + baseEquipos;
  const baseMO = sMO * (1 + (quote.descMO || 0) / 100);
  const base = baseItems + baseMO + sOther;
  const subtotal = sItems + sMO + sOther;
  const costo = cItems + cMO + cOther;
  const iva = base * settings.ivaRate / 100;
  const total = base + iva;
  const util = base - costo;
  const margen = base > 0 ? (util / base) * 100 : 0;
  const floorPct = quote.margenMin || settings.defaultMarginInstall;
  const piso = costo * (1 + floorPct / 100);

  return {
    subtotal,
    base,
    baseItems,
    baseMO,
    sItems,
    sMO,
    sOther,
    iva,
    total,
    costo,
    util,
    margen,
    piso,
    bajoPiso: base < piso && base > 0,
  };
}
