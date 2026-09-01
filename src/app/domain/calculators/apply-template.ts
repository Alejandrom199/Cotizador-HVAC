import { Product } from '../models/product.model';
import { Quote } from '../models/quote.model';
import { QuoteLine } from '../models/quote-line.model';
import { SystemTemplate } from '../models/template.model';
import { QuoteSettings } from '../settings/quote-settings';
import { ProductCode, RoomKind } from '../enums';
import { effectiveArea, newUid, roomCount } from './quote-metrics';
import { computeRoomThermal } from './thermal.calculator';

interface TemplateCalculationContext {
  totalArea: number;
  environments: number;
  tons: number;
  settings: QuoteSettings;
}

/**
 * Mapa de estrategias de cálculo de cantidad por código de producto.
 * Evita cadenas if/else if frágiles y valores mágicos.
 */
const QUANTITY_RESOLVERS: Record<string, (ctx: TemplateCalculationContext) => number> = {
  [ProductCode.InDuct]: (ctx) => Math.round(ctx.totalArea * ctx.settings.templateQty.ductAreaFactor),
  [ProductCode.InReji]: (ctx) => Math.ceil(ctx.totalArea / ctx.settings.templateQty.supplyGrilleArea),
  [ProductCode.InRejr]: (ctx) => Math.ceil(ctx.totalArea / ctx.settings.templateQty.returnGrilleArea),
  [ProductCode.InCu14]: (ctx) => ctx.environments * ctx.settings.templateQty.copperPerRoomM,
  [ProductCode.InCu12]: (ctx) => ctx.environments * ctx.settings.templateQty.copperPerRoomM,
  [ProductCode.InAisl]: (ctx) => ctx.environments * ctx.settings.templateQty.insulationPerRoomM,
  [ProductCode.InDren]: (ctx) => ctx.environments * ctx.settings.templateQty.drainPerRoomM,
  [ProductCode.InCinta]: (ctx) =>
    Math.ceil((ctx.totalArea * ctx.settings.templateQty.ductAreaFactor) / ctx.settings.templateQty.tapePerDuctArea),
  [ProductCode.InSop]: (ctx) => Math.ceil(ctx.totalArea / ctx.settings.templateQty.supportAreaDivisor),
  [ProductCode.InSold]: (ctx) => ctx.environments * ctx.settings.templateQty.solderPerRoom,
  [ProductCode.InGas]: (ctx) => Math.max(1, Math.round(ctx.tons * ctx.settings.templateQty.gasPerTon)),
  [ProductCode.MoInst]: (ctx) =>
    Math.round(ctx.totalArea * ctx.settings.templateQty.laborAreaFactor) ||
    ctx.settings.templateQty.laborFallbackHours,
  [ProductCode.MoDuct]: (ctx) => Math.round(ctx.totalArea * ctx.settings.templateQty.ductAreaFactor),
  [ProductCode.MoPrueb]: () => 1,
  [ProductCode.MoDesm]: () => 1,
  [ProductCode.LgTrans]: () => 1,
  [ProductCode.LgGrua]: (ctx) =>
    ctx.totalArea > ctx.settings.templateQty.craneAreaThreshold ? 2 : 1,
};

/**
 * Genera líneas de materiales desde plantilla + áreas.
 * Las constantes de cantidad viven en settings.templateQty.
 */
export function applyTemplateLines(
  quote: Quote,
  template: SystemTemplate,
  products: Product[],
  settings: QuoteSettings,
): QuoteLine[] {
  const findProduct = (code: string) => products.find((p) => p.code === code);
  const lines: QuoteLine[] = [];

  const push = (code: string, amount: number) => {
    if (amount <= 0) {
      return;
    }
    const product = findProduct(code);
    if (!product) {
      return;
    }
    const current = lines.find((line) => line.code === code);
    if (current) {
      current.qty = +(current.qty + amount).toFixed(1);
      return;
    }
    lines.push({
      uid: newUid(code),
      code,
      name: product.name,
      cat: product.cat,
      unit: product.unit,
      costo: product.costo,
      pvp: product.pvp,
      qty: +amount.toFixed(1),
    });
  };

  const rooms = quote.rooms ?? [];
  const totalArea = effectiveArea(quote);
  let tons = 0;

  rooms.forEach((room) => {
    const thermal = computeRoomThermal(room, template, settings);
    const mult = room.n || 1;
    tons += thermal.ton * mult;
    if (template.items.includes(ProductCode.EqAuto)) {
      push(thermal.equipo, mult);
    }
  });

  if (rooms.length === 0 && template.items.includes(ProductCode.EqAuto)) {
    const thermal = computeRoomThermal(
      { area: totalArea, tipo: RoomKind.Comercial },
      template,
      settings,
    );
    tons = thermal.ton;
    push(thermal.equipo, 1);
  }

  const environments = Math.max(1, roomCount(quote));
  const calcContext: TemplateCalculationContext = {
    totalArea,
    environments,
    tons,
    settings,
  };

  template.items.forEach((code) => {
    if (code === ProductCode.EqAuto) {
      return;
    }

    const resolver = QUANTITY_RESOLVERS[code];
    if (resolver) {
      push(code, resolver(calcContext));
      return;
    }

    if (code.startsWith('EQ-')) {
      const cap = settings.equipmentCapacityTons[code] || 5;
      push(code, Math.max(1, Math.ceil(tons / cap)));
    }
  });

  return lines;
}
