import { Injectable } from '@angular/core';
import { Quote } from '../domain/models/quote.model';
import { QuoteSettings } from '../domain/settings/quote-settings';
import { ProductCategory } from '../domain/enums/product-category.enum';
import { computePricing } from '../domain/calculators/pricing.calculator';
import { formatMoney } from '../domain/calculators/quote-metrics';

@Injectable({ providedIn: 'root' })
export class PrintService {
  printQuote(quote: Quote, settings: QuoteSettings): boolean {
    return this.printFinal(quote, settings);
  }

  printDetailed(quote: Quote, settings: QuoteSettings): boolean {
    const pricing = computePricing(quote, settings);
    const groups: Array<[string, ProductCategory[]]> = [
      ['Suministro de equipos', [ProductCategory.Equipos]],
      ['Servicios, mano de obra e instalación', [ProductCategory.ManoDeObra, ProductCategory.Insumos]],
      ['Logística, grúa y transporte', [ProductCategory.Logistica]],
    ];
    const groupRows = groups
      .map(([label, cats]) => {
        const sum = quote.elements.filter((e) => cats.includes(e.cat)).reduce((a, e) => a + e.qty * e.pvp, 0);
        return `<div class="row"><span class="k">${label}</span><span class="n">${formatMoney(sum)}</span></div>`;
      })
      .join('');
    const rows = quote.elements
      .map(
        (line) =>
          `<tr><td>${line.name}</td><td>${line.cat}</td><td class="n">${line.qty} ${line.unit}</td><td class="n">${formatMoney(line.pvp)}</td><td class="n">${formatMoney(line.qty * line.pvp)}</td></tr>`,
      )
      .join('');
    return this.open(
      `
      <div class="head">
        <div>
          <div class="org">EMASESOR</div>
          <div class="sub">Informe detallado de cotización</div>
        </div>
        <div class="right">
          <div>${quote.code}</div>
          <div class="sub">Quito, Ecuador</div>
        </div>
      </div>
      <p><b>Cliente:</b> ${quote.cliente} &nbsp; <b>RUC:</b> ${quote.ruc || '—'}<br>
      <b>Proyecto:</b> ${quote.name} &nbsp; <b>Tipo:</b> ${quote.tipo} - ${quote.subtipo}</p>
      <div class="box">
        <div class="k">Inversión total estimada</div>
        <div class="big n">${formatMoney(pricing.total)}</div>
        <div class="sub">Incluye IVA ${settings.ivaRate}%</div>
      </div>
      ${groupRows}
      <table>
        <thead><tr><th>Descripción</th><th>Categoría</th><th>Cant.</th><th>Unitario</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `,
      quote.code + ' — detallado',
      true,
    );
  }

  printFinal(quote: Quote, settings: QuoteSettings): boolean {
    const pricing = computePricing(quote, settings);
    const rows = quote.elements
      .map(
        (line) =>
          `<tr><td>${line.name}</td><td>${line.cat}</td><td class="n">${line.qty} ${line.unit}</td><td class="n">${formatMoney(line.pvp)}</td><td class="n">${formatMoney(line.qty * line.pvp)}</td></tr>`,
      )
      .join('');
    return this.open(
      `
      <div class="head">
        <div>
          <div class="org">EMASESOR</div>
          <div class="sub">Propuesta técnico-económica</div>
        </div>
        <div class="right">
          <div>${quote.code}</div>
          <div class="sub">Quito, Ecuador</div>
        </div>
      </div>
      <p><b>Cliente:</b> ${quote.cliente}<br><b>RUC:</b> ${quote.ruc || '—'}<br>
      <b>Proyecto:</b> ${quote.name}<br><b>Tipo:</b> ${quote.tipo} - ${quote.subtipo}</p>
      <table>
        <thead><tr><th>Descripción</th><th>Categoría</th><th>Cant.</th><th>Unitario</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="sum">
        <div class="row"><span>Subtotal</span><span class="n">${formatMoney(pricing.base)}</span></div>
        <div class="row"><span>IVA ${settings.ivaRate}%</span><span class="n">${formatMoney(pricing.iva)}</span></div>
        <div class="row total"><span>TOTAL</span><span class="n">${formatMoney(pricing.total)}</span></div>
      </div>
      <p class="legal">Precio en USD. Incluye IVA vigente en Ecuador (${settings.ivaRate}%). Validez de la oferta: ${settings.offerValidityDays} días.</p>
      <div class="sign">
        <div>Elaborado por: ______________________</div>
        <div>Aceptación del cliente: ______________________</div>
      </div>
    `,
      quote.code,
      true,
    );
  }

  printRequest(payload: {
    cliente: string;
    ruc: string;
    proyecto: string;
    tipo: string;
    prio: string;
    observaciones: string;
    files: Array<{ name: string; sizeStr: string }>;
    ivaRate: number;
  }): boolean {
    const files =
      payload.files.map((f) => `<li>${f.name} (${f.sizeStr})</li>`).join('') ||
      '<li>Sin archivos adjuntos</li>';
    return this.open(
      `
      <div class="head">
        <div>
          <div class="org">EMASESOR</div>
          <div class="sub">Solicitud de cotización</div>
        </div>
      </div>
      <div class="row"><span class="k">Cliente</span><span>${payload.cliente || '—'}</span></div>
      <div class="row"><span class="k">RUC</span><span>${payload.ruc || '—'}</span></div>
      <div class="row"><span class="k">Proyecto</span><span>${payload.proyecto || '—'}</span></div>
      <div class="row"><span class="k">Tipo</span><span>${payload.tipo}</span></div>
      <div class="row"><span class="k">Prioridad</span><span>${payload.prio}</span></div>
      <div class="row"><span class="k">Observaciones</span><span>${payload.observaciones || '—'}</span></div>
      <p><b>Archivos</b></p>
      <ul>${files}</ul>
      <p class="legal">Documento de solicitud (no es la propuesta comercial). IVA Ecuador ${payload.ivaRate}%.</p>
    `,
      'Solicitud de cotización',
      false,
    );
  }

  private open(body: string, title: string, wide: boolean): boolean {
    const popup = window.open('', '_blank');
    if (!popup) {
      return false;
    }
    const max = wide ? '820px' : '720px';
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        body{font-family:'IBM Plex Sans',Arial,sans-serif;color:#161616;padding:36px;max-width:${max};margin:auto;font-size:13px}
        .org{font-weight:600;font-size:16px;letter-spacing:.02em}
        .sub{color:#525252;font-size:12px;margin-top:2px}
        .head{display:flex;justify-content:space-between;border-bottom:2px solid #161616;padding-bottom:12px;margin-bottom:16px}
        .right{text-align:right}
        .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0}
        .k{color:#525252}
        .n{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}
        .box{border:1px solid #161616;padding:12px 14px;margin:14px 0}
        .big{font-size:22px;font-weight:600;margin-top:4px}
        table{width:100%;border-collapse:collapse;margin-top:14px}
        th{text-align:left;padding:7px 8px;background:#161616;color:#fff;font-size:11px;font-weight:600}
        td{padding:7px 8px;border-bottom:1px solid #e0e0e0}
        th:nth-child(n+3),td:nth-child(n+3){text-align:right}
        .sum{margin:16px 0 0 auto;width:280px}
        .total{font-weight:600;border-top:2px solid #161616;padding-top:8px;margin-top:4px}
        .legal{margin-top:24px;font-size:11px;color:#525252;border-top:1px solid #e0e0e0;padding-top:10px}
        .sign{display:flex;gap:40px;margin-top:36px;font-size:12px}
      </style></head><body>${body}<script>setTimeout(function(){window.print()},400)</script></body></html>`);
    popup.document.close();
    return true;
  }
}
