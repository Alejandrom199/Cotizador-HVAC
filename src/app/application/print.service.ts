import { Injectable } from '@angular/core';
import { Quote } from '../domain/models/quote.model';
import { QuoteSettings } from '../domain/settings/quote-settings';
import { ProductCategory } from '../domain/enums/product-category.enum';
import { computePricing } from '../domain/calculators/pricing.calculator';
import { effectiveArea, formatMoney, roomCount } from '../domain/calculators/quote-metrics';
import { QuoteLine } from '../domain/models/quote-line.model';

interface CategoryGroup {
  id: ProductCategory | string;
  name: string;
  badge: string;
  badgeClass: string;
  elements: QuoteLine[];
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class PrintService {
  /**
   * Imprime la cotización comercial estándar.
   */
  printQuote(quote: Quote, settings: QuoteSettings): boolean {
    return this.printFinal(quote, settings);
  }

  /**
   * Genera e imprime el Informe Técnico Detallado con desglose de ingeniería y métricas.
   */
  printDetailed(quote: Quote, settings: QuoteSettings): boolean {
    const pricing = computePricing(quote, settings);
    const groups = this.groupQuoteElements(quote.elements ?? []);
    const issueDate = this.formatDate(quote.fecha);
    const totalArea = effectiveArea(quote);
    const totalRooms = roomCount(quote);

    const summaryCards = groups
      .map(
        (g) => `
        <div class="kpi-card">
          <div class="kpi-label">${this.escapeHtml(g.name)}</div>
          <div class="kpi-value n">${formatMoney(g.subtotal)}</div>
          <div class="kpi-meta">${g.elements.length} ítem${g.elements.length === 1 ? '' : 's'}</div>
        </div>
      `,
      )
      .join('');

    const tableRows = this.buildGroupedTableRows(groups);

    const htmlBody = `
      <div class="print-container">
        <table class="report-layout-table">
          <!-- CABECERA REPETIBLE EN TODAS LAS PÁGINAS -->
          <thead>
            <tr>
              <td>
                <header class="doc-header">
                  <div class="brand-section">
                    <div class="brand-logo">
                      <span class="brand-name">EMASESOR</span>
                      <span class="brand-pill">HVAC</span>
                    </div>
                    <div class="brand-tagline">Climatización &amp; Ventilación Mecánica — Ecuador</div>
                    <div class="brand-contact">RUC: 1792182749001 | PBX: (02) 299-0000 | Quito, Ecuador | info@emasesor.com</div>
                  </div>
                  <div class="doc-badge-section">
                    <div class="doc-type-badge detailed">INFORME TÉCNICO DETALLADO</div>
                    <div class="doc-code">${this.escapeHtml(quote.code)}</div>
                    <div class="doc-meta-item"><b>Emisión:</b> ${issueDate}</div>
                    <div class="doc-meta-item"><b>Validez:</b> ${settings.offerValidityDays} días calendario</div>
                  </div>
                </header>
              </td>
            </tr>
          </thead>

          <!-- PIE DE PÁGINA REPETIBLE EN TODAS LAS PÁGINAS -->
          <tfoot>
            <tr>
              <td>
                <footer class="doc-footer">
                  <div class="footer-left">
                    <span class="footer-brand">EMASESOR HVAC Ecuador</span> &bull; RUC: 1792182749001 &bull; info@emasesor.com &bull; Documento Técnico Confidencial
                  </div>
                  <div class="footer-right">
                    <span>Ref: ${this.escapeHtml(quote.code)}</span> &bull; <span class="page-indicator">Documento Oficial</span>
                  </div>
                </footer>
              </td>
            </tr>
          </tfoot>

          <!-- CUERPO PRINCIPAL DEL DOCUMENTO -->
          <tbody>
            <tr>
              <td>
                <!-- GRID DE METADATOS DEL PROYECTO -->
                <section class="meta-grid">
                  <div class="meta-card">
                    <span class="meta-label">CLIENTE / RAZÓN SOCIAL</span>
                    <span class="meta-value highlight">${this.escapeHtml(quote.cliente || '—')}</span>
                    <span class="meta-sub"><b>RUC/C.I.:</b> ${this.escapeHtml(quote.ruc || '—')}</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">PROYECTO &amp; UBICACIÓN</span>
                    <span class="meta-value">${this.escapeHtml(quote.name || '—')}</span>
                    <span class="meta-sub"><b>Ubicación:</b> Quito / Pichincha</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">TIPO DE SERVICIO &amp; ALCANCE</span>
                    <span class="meta-value">${this.escapeHtml(quote.tipo || '—')} ${quote.subtipo ? '• ' + this.escapeHtml(quote.subtipo) : ''}</span>
                    <span class="meta-sub"><b>Plantilla base:</b> ${this.escapeHtml(quote.plantilla || 'Personalizada')}</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">RESPONSABLES TÉCNICOS</span>
                    <span class="meta-value"><b>Asesor:</b> ${this.escapeHtml(quote.vendedor || '—')}</span>
                    <span class="meta-sub"><b>Ingeniero:</b> ${this.escapeHtml(quote.ingeniero || quote.asignado || '—')}</span>
                  </div>
                </section>

                <!-- RESUMEN EJECUTIVO DE INGENIERÍA -->
                <section class="executive-summary">
                  <div class="summary-hero">
                    <div class="hero-text">
                      <span class="hero-label">INVERSIÓN TOTAL ESTIMADA</span>
                      <span class="hero-total n">${formatMoney(pricing.total)}</span>
                      <span class="hero-note">Monto en USD (Incluye IVA Ecuador ${settings.ivaRate}%)</span>
                    </div>
                    <div class="hero-specs">
                      <div class="spec-chip"><b>Área Total:</b> ${totalArea > 0 ? totalArea + ' m²' : '—'}</div>
                      <div class="spec-chip"><b>Ambientes:</b> ${totalRooms > 0 ? totalRooms + ' zonas' : '—'}</div>
                      <div class="spec-chip"><b>Prioridad:</b> ${this.escapeHtml(quote.prio || 'Normal')}</div>
                    </div>
                  </div>
                  <div class="kpi-grid">
                    ${summaryCards}
                  </div>
                </section>

                <!-- TABLA AGRUPADA POR CATEGORÍAS -->
                <section class="table-section">
                  <div class="section-title">DESGLOSE DE PARTIDAS TÉCNICO-ECONÓMICAS</div>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th style="width: 46%;">Descripción del Ítem</th>
                        <th style="width: 12%; text-align: center;">Cantidad</th>
                        <th style="width: 12%; text-align: center;">Unidad</th>
                        <th style="width: 15%; text-align: right;">P. Unitario</th>
                        <th style="width: 15%; text-align: right;">Total Parcial</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tableRows}
                    </tbody>
                  </table>
                </section>

                <!-- BLOQUE DE TOTALES Y LIQUIDACIÓN -->
                <section class="financial-block">
                  <div class="financial-notes">
                    <div class="notes-title">Notas de Ingeniería y Dimensionamiento:</div>
                    <p class="notes-text">
                      El presente informe detalla el cómputo de materiales, maquinarias HVAC y horas técnicas estimadas para la correcta ejecución del proyecto según normativas ASHRAE y NEC de Climatización.
                    </p>
                  </div>
                  <div class="totals-card">
                    <div class="tot-row">
                      <span class="tot-label">Subtotal Equipos &amp; Insumos:</span>
                      <span class="tot-val n">${formatMoney(pricing.baseItems)}</span>
                    </div>
                    <div class="tot-row">
                      <span class="tot-label">Subtotal Mano de Obra &amp; Logística:</span>
                      <span class="tot-val n">${formatMoney(pricing.baseMO + pricing.sOther)}</span>
                    </div>
                    <div class="tot-row subtotal-divider">
                      <span class="tot-label">Subtotal Base Imponible:</span>
                      <span class="tot-val n">${formatMoney(pricing.base)}</span>
                    </div>
                    <div class="tot-row">
                      <span class="tot-label">IVA Ecuador (${settings.ivaRate}%):</span>
                      <span class="tot-val n">${formatMoney(pricing.iva)}</span>
                    </div>
                    <div class="tot-row grand-total">
                      <span class="tot-label">TOTAL PRESUPUESTO (USD):</span>
                      <span class="tot-val n">${formatMoney(pricing.total)}</span>
                    </div>
                  </div>
                </section>

                <!-- FIRMAS FORMALES -->
                <section class="signatures-section">
                  <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-title">Elaborado por (Ingeniería / Ventas)</div>
                    <div class="sig-name">${this.escapeHtml(quote.ingeniero || quote.vendedor || 'EMASESOR Climatización')}</div>
                    <div class="sig-role">Departamento de Ingeniería HVAC</div>
                  </div>
                  <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-title">Revisado &amp; Aprobado (Gerencia)</div>
                    <div class="sig-name">EMASESOR Soluciones Integrales</div>
                    <div class="sig-role">Gerencia de Operaciones Técnicas</div>
                  </div>
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return this.open(htmlBody, `Informe Detallado — ${quote.code}`, true);
  }

  /**
   * Genera e imprime la Propuesta Técnico-Comercial oficial para entrega al cliente.
   */
  printFinal(quote: Quote, settings: QuoteSettings): boolean {
    const pricing = computePricing(quote, settings);
    const groups = this.groupQuoteElements(quote.elements ?? []);
    const issueDate = this.formatDate(quote.fecha);
    const tableRows = this.buildGroupedTableRows(groups);

    const htmlBody = `
      <div class="print-container">
        <table class="report-layout-table">
          <!-- CABECERA REPETIBLE EN TODAS LAS PÁGINAS -->
          <thead>
            <tr>
              <td>
                <header class="doc-header">
                  <div class="brand-section">
                    <div class="brand-logo">
                      <span class="brand-name">EMASESOR</span>
                      <span class="brand-pill">HVAC</span>
                    </div>
                    <div class="brand-tagline">Climatización &amp; Ventilación Mecánica — Ecuador</div>
                    <div class="brand-contact">RUC: 1792182749001 | PBX: (02) 299-0000 | Quito, Ecuador | info@emasesor.com</div>
                  </div>
                  <div class="doc-badge-section">
                    <div class="doc-type-badge commercial">PROPUESTA TÉCNICO-COMERCIAL</div>
                    <div class="doc-code">${this.escapeHtml(quote.code)}</div>
                    <div class="doc-meta-item"><b>Fecha de Emisión:</b> ${issueDate}</div>
                    <div class="doc-meta-item"><b>Validez:</b> ${settings.offerValidityDays} días calendario</div>
                  </div>
                </header>
              </td>
            </tr>
          </thead>

          <!-- PIE DE PÁGINA REPETIBLE EN TODAS LAS PÁGINAS -->
          <tfoot>
            <tr>
              <td>
                <footer class="doc-footer">
                  <div class="footer-left">
                    <span class="footer-brand">EMASESOR HVAC Ecuador</span> &bull; RUC: 1792182749001 &bull; PBX: (02) 299-0000 &bull; info@emasesor.com &bull; Propuesta Comercial Confidencial
                  </div>
                  <div class="footer-right">
                    <span>Ref: ${this.escapeHtml(quote.code)}</span> &bull; <span class="page-indicator">Documento Oficial</span>
                  </div>
                </footer>
              </td>
            </tr>
          </tfoot>

          <!-- CUERPO PRINCIPAL DEL DOCUMENTO -->
          <tbody>
            <tr>
              <td>
                <!-- GRID DE METADATOS DEL CLIENTE -->
                <section class="meta-grid">
                  <div class="meta-card">
                    <span class="meta-label">CLIENTE / EMPRESA</span>
                    <span class="meta-value highlight">${this.escapeHtml(quote.cliente || '—')}</span>
                    <span class="meta-sub"><b>RUC/C.I.:</b> ${this.escapeHtml(quote.ruc || '—')}</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">PROYECTO</span>
                    <span class="meta-value">${this.escapeHtml(quote.name || '—')}</span>
                    <span class="meta-sub"><b>Ubicación:</b> Quito / Pichincha</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">TIPO DE SOLUCIÓN</span>
                    <span class="meta-value">${this.escapeHtml(quote.tipo || '—')} ${quote.subtipo ? '• ' + this.escapeHtml(quote.subtipo) : ''}</span>
                    <span class="meta-sub"><b>Referencia:</b> Climatización Confort &amp; Comercial</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">ASESOR RESPONSABLE</span>
                    <span class="meta-value">${this.escapeHtml(quote.vendedor || 'Asesor Comercial')}</span>
                    <span class="meta-sub"><b>Ing. Proyecto:</b> ${this.escapeHtml(quote.ingeniero || quote.asignado || 'EMASESOR')}</span>
                  </div>
                </section>

                <!-- TABLA AGRUPADA POR CATEGORÍAS -->
                <section class="table-section">
                  <div class="section-title">DETALLE DE SUMINISTRO E INSTALACIÓN</div>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th style="width: 46%;">Descripción del Ítem</th>
                        <th style="width: 12%; text-align: center;">Cantidad</th>
                        <th style="width: 12%; text-align: center;">Unidad</th>
                        <th style="width: 15%; text-align: right;">P. Unitario</th>
                        <th style="width: 15%; text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tableRows}
                    </tbody>
                  </table>
                </section>

                <!-- BLOQUE DE TOTALES Y CONDICIONES -->
                <section class="financial-block">
                  <div class="financial-notes">
                    <div class="notes-title">Términos y Condiciones Comerciales:</div>
                    <ul class="terms-list">
                      <li><b>Moneda:</b> Valores expresados en Dólares de los Estados Unidos de América (USD).</li>
                      <li><b>Impuestos:</b> Precios incluyen IVA vigente en Ecuador (${settings.ivaRate}%).</li>
                      <li><b>Forma de Pago:</b> 50% de anticipo a la confirmación del pedido y 50% contra entrega e instalación a conformidad.</li>
                      <li><b>Garantía:</b> Equipos con garantía de fábrica de 1 a 5 años. Instalación y mano de obra con garantía de 12 meses.</li>
                      <li><b>Validez:</b> La presente oferta tiene una vigencia de ${settings.offerValidityDays} días a partir de su emisión.</li>
                    </ul>
                  </div>
                  <div class="totals-card">
                    <div class="tot-row">
                      <span class="tot-label">Subtotal (Base Imponible):</span>
                      <span class="tot-val n">${formatMoney(pricing.base)}</span>
                    </div>
                    <div class="tot-row">
                      <span class="tot-label">IVA (${settings.ivaRate}%):</span>
                      <span class="tot-val n">${formatMoney(pricing.iva)}</span>
                    </div>
                    <div class="tot-row grand-total">
                      <span class="tot-label">TOTAL PROPUESTA (USD):</span>
                      <span class="tot-val n">${formatMoney(pricing.total)}</span>
                    </div>
                  </div>
                </section>

                <!-- FIRMAS FORMALES -->
                <section class="signatures-section">
                  <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-title">Elaborado y Presentado por:</div>
                    <div class="sig-name">${this.escapeHtml(quote.vendedor || 'EMASESOR HVAC')}</div>
                    <div class="sig-role">División Comercial &amp; Proyectos</div>
                  </div>
                  <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-title">Aceptación y Aprobación del Cliente:</div>
                    <div class="sig-name">${this.escapeHtml(quote.cliente || 'Firma de Conformidad')}</div>
                    <div class="sig-role">RUC / C.I.: ${this.escapeHtml(quote.ruc || '________________')}</div>
                  </div>
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return this.open(htmlBody, `Propuesta Comercial — ${quote.code}`, true);
  }

  /**
   * Genera e imprime el comprobante formal de Solicitud de Cotización.
   */
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
    const today = this.formatDate(new Date().toISOString());
    const fileItems =
      payload.files.length > 0
        ? payload.files
            .map(
              (f) => `
            <li class="file-item">
              <span class="file-icon">📄</span>
              <span class="file-name">${this.escapeHtml(f.name)}</span>
              <span class="file-size">${this.escapeHtml(f.sizeStr)}</span>
            </li>
          `,
            )
            .join('')
        : '<li class="file-item empty">Sin documentación o planos adjuntos</li>';

    const htmlBody = `
      <div class="print-container">
        <table class="report-layout-table">
          <!-- CABECERA REPETIBLE EN TODAS LAS PÁGINAS -->
          <thead>
            <tr>
              <td>
                <header class="doc-header">
                  <div class="brand-section">
                    <div class="brand-logo">
                      <span class="brand-name">EMASESOR</span>
                      <span class="brand-pill">HVAC</span>
                    </div>
                    <div class="brand-tagline">Climatización &amp; Ventilación Mecánica — Ecuador</div>
                    <div class="brand-contact">RUC: 1792182749001 | PBX: (02) 299-0000 | Quito, Ecuador | info@emasesor.com</div>
                  </div>
                  <div class="doc-badge-section">
                    <div class="doc-type-badge request">SOLICITUD DE COTIZACIÓN</div>
                    <div class="doc-code">REQUERIMIENTO TÉCNICO</div>
                    <div class="doc-meta-item"><b>Fecha de Registro:</b> ${today}</div>
                  </div>
                </header>
              </td>
            </tr>
          </thead>

          <!-- PIE DE PÁGINA REPETIBLE EN TODAS LAS PÁGINAS -->
          <tfoot>
            <tr>
              <td>
                <footer class="doc-footer">
                  <div class="footer-left">
                    <span class="footer-brand">EMASESOR HVAC Ecuador</span> &bull; RUC: 1792182749001 &bull; info@emasesor.com &bull; Comprobante de Recepción
                  </div>
                  <div class="footer-right">
                    <span>Cliente: ${this.escapeHtml(payload.cliente || 'Cliente')}</span> &bull; <span class="page-indicator">Documento Oficial</span>
                  </div>
                </footer>
              </td>
            </tr>
          </tfoot>

          <!-- CUERPO PRINCIPAL DEL DOCUMENTO -->
          <tbody>
            <tr>
              <td>
                <!-- GRID DE METADATOS DE LA SOLICITUD -->
                <section class="meta-grid">
                  <div class="meta-card">
                    <span class="meta-label">CLIENTE / EMPRESA SOLICITANTE</span>
                    <span class="meta-value highlight">${this.escapeHtml(payload.cliente || '—')}</span>
                    <span class="meta-sub"><b>RUC/C.I.:</b> ${this.escapeHtml(payload.ruc || '—')}</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">PROYECTO A COTIZAR</span>
                    <span class="meta-value">${this.escapeHtml(payload.proyecto || '—')}</span>
                    <span class="meta-sub"><b>Ubicación:</b> Quito / Pichincha</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">TIPO DE SERVICIO SOLICITADO</span>
                    <span class="meta-value">${this.escapeHtml(payload.tipo || '—')}</span>
                    <span class="meta-sub"><b>Estado:</b> Recepción para Ingeniería</span>
                  </div>
                  <div class="meta-card">
                    <span class="meta-label">PRIORIDAD ASIGNADA</span>
                    <span class="meta-value priority-badge">${this.escapeHtml(payload.prio || 'Normal')}</span>
                    <span class="meta-sub"><b>Tiempo resp.:</b> Según SLA</span>
                  </div>
                </section>

                <!-- ALCANCE Y OBSERVACIONES TÉCNICAS -->
                <section class="content-box">
                  <div class="box-header">ALCANCE Y OBSERVACIONES DEL REQUERIMIENTO</div>
                  <div class="box-body">
                    <p class="obs-text">${this.escapeHtml(payload.observaciones || 'Sin observaciones registradas.')}</p>
                  </div>
                </section>

                <!-- DOCUMENTACIÓN Y PLANOS ADJUNTOS -->
                <section class="content-box">
                  <div class="box-header">DOCUMENTOS Y PLANOS ADJUNTOS (${payload.files.length})</div>
                  <div class="box-body">
                    <ul class="files-list">
                      ${fileItems}
                    </ul>
                  </div>
                </section>

                <!-- AVISO LEGAL Y PROCEDIMIENTO -->
                <section class="info-banner">
                  <b>Nota Informativa:</b> Este documento certifica la recepción del requerimiento para dimensionamiento y cotización preliminar. No constituye una propuesta económica formal ni factura comercial. Tasa de IVA aplicable en cotización: ${payload.ivaRate}%.
                </section>

                <!-- FIRMAS DE RECEPCIÓN -->
                <section class="signatures-section">
                  <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-title">Solicitado por:</div>
                    <div class="sig-name">${this.escapeHtml(payload.cliente || 'Cliente Solicitante')}</div>
                    <div class="sig-role">Contacto Autorizado</div>
                  </div>
                  <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-title">Recibido en EMASESOR:</div>
                    <div class="sig-name">Dpto. de Ventas e Ingeniería</div>
                    <div class="sig-role">Gestión Comercial HVAC</div>
                  </div>
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return this.open(htmlBody, `Solicitud de Cotización — ${payload.cliente || 'Cliente'}`, false);
  }

  /**
   * Agrupa los elementos de la cotización por categorías estándar y calcula subtotales.
   */
  private groupQuoteElements(elements: QuoteLine[]): CategoryGroup[] {
    const categoryDefs: Array<{
      id: ProductCategory;
      name: string;
      badge: string;
      badgeClass: string;
    }> = [
      {
        id: ProductCategory.Equipos,
        name: 'Suministro de Equipos HVAC',
        badge: 'Equipos',
        badgeClass: 'cat-equipos',
      },
      {
        id: ProductCategory.Insumos,
        name: 'Materiales e Insumos de Instalación',
        badge: 'Insumos',
        badgeClass: 'cat-insumos',
      },
      {
        id: ProductCategory.ManoDeObra,
        name: 'Mano de Obra & Servicios Técnicos',
        badge: 'Mano de Obra',
        badgeClass: 'cat-mo',
      },
      {
        id: ProductCategory.Logistica,
        name: 'Logística, Transporte y Grúas',
        badge: 'Logística',
        badgeClass: 'cat-logistica',
      },
    ];

    const result: CategoryGroup[] = [];

    // Categorías estándar
    for (const def of categoryDefs) {
      const filtered = elements.filter((e) => e.cat === def.id);
      if (filtered.length > 0) {
        const subtotal = filtered.reduce((acc, e) => acc + (e.qty || 0) * (e.pvp || 0), 0);
        result.push({
          id: def.id,
          name: def.name,
          badge: def.badge,
          badgeClass: def.badgeClass,
          elements: filtered,
          subtotal,
        });
      }
    }

    // Elementos con categoría no estándar o personalizada (si existieren)
    const standardIds = new Set<string>(categoryDefs.map((d) => d.id));
    const others = elements.filter((e) => !standardIds.has(e.cat));
    if (others.length > 0) {
      const subtotal = others.reduce((acc, e) => acc + (e.qty || 0) * (e.pvp || 0), 0);
      result.push({
        id: 'Otros',
        name: 'Otros Suministros y Servicios',
        badge: 'Otros',
        badgeClass: 'cat-otros',
        elements: others,
        subtotal,
      });
    }

    return result;
  }

  /**
   * Construye las filas HTML de la tabla con encabezados de sección y subtotales por categoría.
   */
  private buildGroupedTableRows(groups: CategoryGroup[]): string {
    if (groups.length === 0) {
      return `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 24px;">No hay ítems registrados en la cotización.</td></tr>`;
    }

    return groups
      .map((group) => {
        const headerRow = `
        <tr class="category-header-row">
          <td colspan="5">
            <div class="cat-header-content">
              <span class="category-badge ${group.badgeClass}">${this.escapeHtml(group.badge)}</span>
              <span class="category-title">${this.escapeHtml(group.name)}</span>
              <span class="category-count">(${group.elements.length} ítem${group.elements.length === 1 ? '' : 's'})</span>
            </div>
          </td>
        </tr>
      `;

        const itemRows = group.elements
          .map((line) => {
            const lineTotal = (line.qty || 0) * (line.pvp || 0);
            return `
            <tr class="item-row">
              <td class="col-desc">
                <div class="item-name">${this.escapeHtml(line.name)}</div>
                ${line.code ? `<div class="item-code">Cód: ${this.escapeHtml(line.code)}</div>` : ''}
              </td>
              <td class="col-qty n">${line.qty}</td>
              <td class="col-unit">${this.escapeHtml(line.unit || 'und')}</td>
              <td class="col-price n">${formatMoney(line.pvp)}</td>
              <td class="col-total n">${formatMoney(lineTotal)}</td>
            </tr>
          `;
          })
          .join('');

        const subtotalRow = `
        <tr class="category-subtotal-row">
          <td colspan="4" class="subtotal-label">Subtotal ${this.escapeHtml(group.name)}:</td>
          <td class="subtotal-value n">${formatMoney(group.subtotal)}</td>
        </tr>
      `;

        return headerRow + itemRows + subtotalRow;
      })
      .join('');
  }

  /**
   * Abre la ventana de impresión con los estilos CSS de nivel Enterprise SaaS.
   */
  private open(body: string, title: string, wide: boolean): boolean {
    const popup = window.open('', '_blank');
    if (!popup) {
      return false;
    }

    const max = wide ? '880px' : '780px';

    popup.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
    /* RESET & TIPOGRAFÍA ENTERPRISE */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.45;
      font-size: 12px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .n {
      font-family: 'JetBrains Mono', 'IBM Plex Mono', 'Cascadia Code', Menlo, Consolas, monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }

    .print-container {
      max-width: ${max};
      margin: 0 auto;
      padding: 24px 32px;
    }

    /* ESTRUCTURA SEMÁNTICA PARA REPETICIÓN DE ENCABEZADO Y PIE MULTI-PÁGINA */
    .report-layout-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin: 0;
      padding: 0;
    }

    .report-layout-table > thead {
      display: table-header-group;
    }

    .report-layout-table > tfoot {
      display: table-footer-group;
    }

    .report-layout-table > tbody {
      display: table-row-group;
    }

    .report-layout-table > thead > tr > td,
    .report-layout-table > tfoot > tr > td,
    .report-layout-table > tbody > tr > td {
      padding: 0;
      border: none;
      background: transparent;
      vertical-align: top;
    }

    /* HEADER CORPORATIVO (REPETIDO EN CADA PÁGINA) */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
      background: #ffffff;
    }

    .brand-section {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-name {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #0f172a;
    }

    .brand-pill {
      font-size: 11px;
      font-weight: 700;
      background: #0f172a;
      color: #ffffff;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .brand-tagline {
      font-size: 11.5px;
      font-weight: 600;
      color: #334155;
      letter-spacing: 0.01em;
    }

    .brand-contact {
      font-size: 10.5px;
      color: #64748b;
    }

    .doc-badge-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }

    .doc-type-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 0.04em;
      margin-bottom: 3px;
    }

    .doc-type-badge.commercial {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .doc-type-badge.detailed {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .doc-type-badge.request {
      background: #faf5ff;
      color: #6b21a8;
      border: 1px solid #e9d5ff;
    }

    .doc-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .doc-meta-item {
      font-size: 11px;
      color: #475569;
    }

    /* FOOTER CORPORATIVO (REPETIDO EN CADA PÁGINA) */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      padding-bottom: 4px;
      margin-top: 18px;
      font-size: 9.5px;
      color: #64748b;
      background: #ffffff;
    }

    .doc-footer .footer-left {
      color: #64748b;
    }

    .doc-footer .footer-brand {
      font-weight: 700;
      color: #0f172a;
    }

    .doc-footer .footer-right {
      color: #475569;
      font-family: 'JetBrains Mono', monospace;
    }

    /* GRID DE METADATOS */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .meta-value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    .meta-value.highlight {
      color: #0f172a;
      font-weight: 700;
    }

    .meta-sub {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }

    .priority-badge {
      display: inline-block;
      font-weight: 700;
      color: #b45309;
    }

    /* RESUMEN EJECUTIVO DETALLADO */
    .executive-summary {
      margin-bottom: 20px;
    }

    .summary-hero {
      background: #0f172a;
      color: #ffffff;
      border-radius: 6px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .hero-text {
      display: flex;
      flex-direction: column;
    }

    .hero-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    .hero-total {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin: 2px 0;
    }

    .hero-note {
      font-size: 10.5px;
      color: #cbd5e1;
    }

    .hero-specs {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: right;
    }

    .spec-chip {
      font-size: 11px;
      background: rgba(255, 255, 255, 0.12);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 9px 12px;
      text-align: center;
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
    }

    .kpi-value {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 2px 0;
    }

    .kpi-meta {
      font-size: 10px;
      color: #94a3b8;
    }

    /* SECCIÓN DE TABLAS */
    .table-section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }

    .data-table thead {
      display: table-header-group;
    }

    .data-table tbody {
      display: table-row-group;
    }

    .data-table thead th {
      background: #0f172a;
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 9px 12px;
      border-bottom: 1px solid #0f172a;
      text-align: left;
    }

    /* ENCABEZADOS DE CATEGORÍA */
    .category-header-row td {
      background: #f1f5f9;
      padding: 8px 12px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
    }

    .cat-header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-badge {
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .category-badge.cat-equipos {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .category-badge.cat-insumos {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .category-badge.cat-mo {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .category-badge.cat-logistica {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }

    .category-badge.cat-otros {
      background: #e2e8f0;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    .category-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
    }

    .category-count {
      font-size: 10.5px;
      color: #64748b;
      font-weight: normal;
    }

    /* FILAS DE ÍTEMS */
    .item-row td {
      padding: 7px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11.5px;
      vertical-align: middle;
    }

    .item-row:nth-child(even) td {
      background-color: #fafafa;
    }

    .col-desc {
      text-align: left;
    }

    .item-name {
      font-weight: 600;
      color: #1e293b;
    }

    .item-code {
      font-size: 10px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      margin-top: 1px;
    }

    .col-qty {
      text-align: center;
      font-weight: 600;
      color: #0f172a;
    }

    .col-unit {
      text-align: center;
      color: #64748b;
      font-size: 10.5px;
    }

    .col-price {
      text-align: right;
      color: #334155;
    }

    .col-total {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
    }

    /* SUBTOTAL DE CATEGORÍA */
    .category-subtotal-row td {
      background: #f8fafc;
      padding: 6px 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .subtotal-label {
      text-align: right;
      font-size: 10.5px;
      font-weight: 600;
      color: #475569;
    }

    .subtotal-value {
      text-align: right;
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
    }

    /* BLOQUE FINANCIERO Y TOTALES */
    .financial-block {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 18px;
      margin-bottom: 22px;
    }

    .financial-notes {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
    }

    .notes-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }

    .notes-text {
      font-size: 11px;
      color: #475569;
      line-height: 1.45;
    }

    .terms-list {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .terms-list li {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.35;
      position: relative;
      padding-left: 12px;
    }

    .terms-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #0f172a;
      font-weight: bold;
    }

    .totals-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tot-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: #334155;
      padding: 3px 0;
    }

    .tot-label {
      font-weight: 500;
    }

    .tot-val {
      font-weight: 600;
      color: #0f172a;
    }

    .subtotal-divider {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 2px;
      font-weight: 600;
    }

    .grand-total {
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      margin-top: 4px;
    }

    .grand-total .tot-label {
      font-size: 12.5px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.02em;
    }

    .grand-total .tot-val {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
    }

    /* CAJAS DE CONTENIDO SOLICITUD */
    .content-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .box-header {
      background: #f8fafc;
      padding: 8px 14px;
      font-size: 10.5px;
      font-weight: 700;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      letter-spacing: 0.04em;
    }

    .box-body {
      padding: 12px 14px;
    }

    .obs-text {
      font-size: 12px;
      color: #1e293b;
      white-space: pre-line;
      line-height: 1.5;
    }

    .files-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      padding: 6px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }

    .file-item.empty {
      color: #64748b;
      font-style: italic;
    }

    .file-name {
      font-weight: 600;
      color: #0f172a;
      flex-grow: 1;
    }

    .file-size {
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      font-size: 10.5px;
    }

    .info-banner {
      background: #f1f5f9;
      border-left: 3px solid #0f172a;
      padding: 10px 14px;
      font-size: 10.5px;
      color: #334155;
      margin-bottom: 22px;
      border-radius: 0 4px 4px 0;
    }

    /* SECCIÓN DE FIRMAS FORMALES */
    .signatures-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 36px;
      margin-top: 32px;
      padding-top: 14px;
    }

    .sig-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .sig-line {
      width: 100%;
      max-width: 220px;
      border-bottom: 1.5px solid #0f172a;
      margin-bottom: 8px;
      height: 36px;
    }

    .sig-title {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    .sig-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }

    .sig-role {
      font-size: 10.5px;
      color: #64748b;
    }

    /* REGLAS PROFESIONALES DE IMPRESIÓN MULTI-PÁGINA */
    @page {
      size: letter portrait;
      margin: 10mm 12mm 10mm 12mm;
      @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-size: 8.5pt;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #64748b;
      }
    }

    @media print {
      html, body {
        background: #ffffff !important;
        font-size: 11px;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .print-container {
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }

      .report-layout-table {
        width: 100% !important;
        border-collapse: collapse !important;
      }

      .report-layout-table > thead {
        display: table-header-group !important;
      }

      .report-layout-table > tfoot {
        display: table-footer-group !important;
      }

      .report-layout-table > tbody {
        display: table-row-group !important;
      }

      .data-table {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }

      .data-table thead {
        display: table-header-group !important;
      }

      .data-table tbody {
        display: table-row-group !important;
      }

      tr, .data-table tr, .item-row, .category-header-row, .category-subtotal-row {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      .meta-grid, .meta-card, .executive-summary, .summary-hero, .kpi-card,
      .financial-block, .totals-card, .financial-notes,
      .content-box, .info-banner,
      .signatures-section, .sig-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  ${body}
  <script>
    setTimeout(function() {
      window.print();
    }, 450);
  </script>
</body>
</html>`);
    popup.document.close();
    return true;
  }

  /**
   * Formatea una fecha ISO o string a formato legible en español.
   */
  private formatDate(isoOrString?: string | null): string {
    if (!isoOrString) {
      return new Date().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    const d = new Date(isoOrString);
    if (isNaN(d.getTime())) {
      return isoOrString;
    }
    return d.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Escapa caracteres HTML para evitar inyección en la vista de impresión.
   */
  private escapeHtml(text: string | null | undefined): string {
    if (!text) {
      return '';
    }
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
