import { computed, inject, Injectable } from '@angular/core';
import { Quote } from '../domain/models/quote.model';
import { QuoteLine } from '../domain/models/quote-line.model';
import { Room } from '../domain/models/room.model';
import { DuctSegment, DuctSegmentMetrics, DuctSystemSummary } from '../domain/models/duct-segment.model';
import { Client } from '../domain/models/client.model';
import { Product } from '../domain/models/product.model';
import { SystemTemplate } from '../domain/models/template.model';
import { QuoteSettings, DiscountCategoryParam } from '../domain/settings/quote-settings';
import {
  CLIENT_REPOSITORY,
  PRODUCT_REPOSITORY,
  QUOTE_REPOSITORY,
  QUOTE_SETTINGS,
  STAFF_REPOSITORY,
  TEMPLATE_REPOSITORY,
} from '../domain/ports/tokens';
import { computePricing } from '../domain/calculators/pricing.calculator';
import { computeComplexity } from '../domain/calculators/complexity.calculator';
import { computeRoomThermal } from '../domain/calculators/thermal.calculator';
import { computeStageTimes } from '../domain/calculators/stage-time.calculator';
import { applyTemplateLines } from '../domain/calculators/apply-template';
import {
  computeDuctSegmentMetrics,
  computeDuctSystemSummary,
} from '../domain/calculators/duct.calculator';
import {
  cycleHours,
  effectiveArea,
  formatMoney,
  hoursLabel,
  newId,
  newUid,
  promisedDate,
  promisedDateLabel,
  roomCount,
} from '../domain/calculators/quote-metrics';
import {
  QuoteStatus,
  QuoteKind,
  InstallationSubtype,
  Priority,
  ProductCategory,
  RoomKind,
  UserRole,
  DiscountCategory,
  ClientType,
  ProductCode,
} from '../domain/enums';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { PrintService } from './print.service';
import { isPendingApproval, isPendingSend } from '../core/role-access';

export interface CreateRequestInput {
  ruc: string;
  cliente: string;
  proyecto: string;
  tipo: QuoteKind;
  subtipo: string;
  prio: Priority;
  observaciones: string;
  adjuntos: Array<{ name: string; size: number; ext: string }>;
}

/**
 * Orquestador delgado: valida → obtiene → calcula → persiste mock → efecto.
 * No contiene fórmulas; llama a calculadoras de domain.
 */
@Injectable({ providedIn: 'root' })
export class QuoteWorkspaceService {
  private readonly quotesRepo = inject(QUOTE_REPOSITORY);
  private readonly productsRepo = inject(PRODUCT_REPOSITORY);
  private readonly clientsRepo = inject(CLIENT_REPOSITORY);
  private readonly templatesRepo = inject(TEMPLATE_REPOSITORY);
  private readonly staffRepo = inject(STAFF_REPOSITORY);
  readonly settings = inject(QUOTE_SETTINGS);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly printer = inject(PrintService);

  quotes(): Quote[] {
    return this.quotesRepo.list();
  }

  products() {
    return this.productsRepo.list();
  }

  /** Catálogo usable en cotización (excluye inactivos). */
  activeProducts() {
    return this.productsRepo.list().filter((p) => p.activo);
  }

  clients() {
    return this.clientsRepo.list();
  }

  templates() {
    return this.templatesRepo.list();
  }

  nextTemplateCode(): string {
    const nums = this.templatesRepo
      .list()
      .map((t) => Number((t.code.match(/(\d+)$/) || [])[1] || 0));
    return 'PL-' + String(Math.max(0, ...nums) + 1).padStart(2, '0');
  }

  saveTemplate(template: SystemTemplate, isNew = false): string | null {
    const code = template.code.trim();
    if (!code || !template.name.trim()) {
      this.toast.show('Código y nombre de la plantilla son obligatorios');
      return 'name';
    }
    if (isNew && this.templatesRepo.getByCode(code)) {
      this.toast.show('Ya existe una plantilla con ese código');
      return 'code';
    }
    this.templatesRepo.upsert({
      ...template,
      code,
      name: template.name.trim(),
      sub: template.sub.trim(),
      driver: template.driver.trim(),
      items: [...template.items],
    });
    this.toast.show(isNew ? 'Plantilla guardada' : 'Plantilla actualizada');
    return null;
  }

  importTemplate(raw: unknown): SystemTemplate | undefined {
    if (!raw || typeof raw !== 'object') {
      this.toast.show('El archivo no es una plantilla válida');
      return undefined;
    }
    const data = raw as Partial<SystemTemplate>;
    const code = String(data.code ?? '').trim() || this.nextTemplateCode();
    const items = Array.isArray(data.items)
      ? data.items.filter((item): item is string => typeof item === 'string' && !!item.trim())
      : [];
    const template: SystemTemplate = {
      code,
      name: String(data.name ?? '').trim(),
      sub: String(data.sub ?? '').trim(),
      driver: String(data.driver ?? '').trim(),
      factorBtu: Number(data.factorBtu) || 0,
      ducto: data.ducto === true,
      items,
    };
    const exists = !!this.templatesRepo.getByCode(code);
    const err = this.saveTemplate(template, !exists);
    return err ? undefined : this.templatesRepo.getByCode(code);
  }

  cloneTemplate(code: string): SystemTemplate | undefined {
    const src = this.templatesRepo.getByCode(code);
    if (!src) {
      this.toast.show('Plantilla no encontrada');
      return undefined;
    }
    const copy: SystemTemplate = {
      ...src,
      code: this.nextTemplateCode(),
      name: src.name + ' (copia)',
      items: [...src.items],
    };
    this.templatesRepo.upsert(copy);
    this.toast.show('Plantilla clonada como ' + copy.code);
    return copy;
  }

  quote(id: string): Quote | undefined {
    return this.quotesRepo.getById(id);
  }

  templateOf(quote: Quote) {
    return this.templatesRepo.getByCode(quote.plantilla);
  }

  pricing(quote: Quote) {
    return computePricing(quote, this.settings);
  }

  complexity(quote: Quote) {
    return computeComplexity(quote, this.templateOf(quote), this.settings);
  }

  thermal(room: Room, quote: Quote) {
    return computeRoomThermal(room, this.templateOf(quote), this.settings);
  }

  stageTimes(quote: Quote) {
    return computeStageTimes(quote, this.complexity(quote).slaHours, this.settings);
  }

  money(value: number): string {
    return formatMoney(value);
  }

  hoursLabel(hours: number | null): string {
    return hoursLabel(hours, this.settings.hoursPerBusinessDay);
  }

  promisedLabel(quote: Quote): string {
    return promisedDateLabel(
      promisedDate(this.complexity(quote).slaHours, this.settings.hoursPerBusinessDay),
    );
  }

  areaOf(quote: Quote): number {
    return effectiveArea(quote);
  }

  roomsOf(quote: Quote): number {
    return roomCount(quote);
  }

  cycleOf(quote: Quote): number | null {
    return cycleHours(quote);
  }

  slaCompliancePct(quotes: Quote[] = this.quotes()): number {
    let ok = 0;
    let evaluated = 0;
    quotes.forEach((quote) => {
      const cycle = cycleHours(quote);
      if (cycle == null) {
        return;
      }
      evaluated += 1;
      if (cycle <= this.complexity(quote).slaHours) {
        ok += 1;
      }
    });
    return evaluated ? Math.round((ok / evaluated) * 100) : 0;
  }

  averageCycleLabel(): string {
    const values = this.quotes()
      .map((q) => cycleHours(q))
      .filter((h): h is number => h != null);
    if (!values.length) {
      return '—';
    }
    return this.hoursLabel(values.reduce((a, b) => a + b, 0) / values.length);
  }

  takeRequest(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    const profile = this.session.profile();
    const isEngineer = this.staffRepo.engineers().some((e) => e.name === profile.name);
    const who = isEngineer ? profile.name : 'Ing. Paredes';
    this.quotesRepo.upsert({
      ...quote,
      ingeniero: who,
      asignado: who,
      estado: QuoteStatus.Elaboracion,
      etapa: Math.max(quote.etapa, 1),
      hrs: [0.5, null, null, null],
    });
    this.toast.show(who + ' tomó la solicitud — cronómetro de etapa iniciado');
  }

  closeStage(id: string, hours: number): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    const hrs = [...(quote.hrs || [null, null, null, null])];
    const index = hrs.filter((h) => h != null).length;
    if (index > 3) {
      return;
    }
    hrs[index] = hours;
    const nextStates = [
      QuoteStatus.Planos,
      QuoteStatus.Calculos,
      QuoteStatus.Cotizacion,
      QuoteStatus.Validacion,
    ];
    this.quotesRepo.upsert({
      ...quote,
      hrs,
      etapa: Math.min(4, index + 2),
      estado: nextStates[index] ?? quote.estado,
    });
    this.toast.show('Etapa cerrada - ' + hours + ' h registradas');
  }

  applyTemplate(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    const template = this.templateOf(quote);
    if (!template) {
      this.toast.show('Selecciona una plantilla');
      return;
    }
    const elements = applyTemplateLines(quote, template, this.activeProducts(), this.settings);
    const nextStatus =
      quote.estado === QuoteStatus.Solicitud || quote.estado === QuoteStatus.Elaboracion
        ? QuoteStatus.Calculos
        : quote.estado;
    this.quotesRepo.upsert({
      ...quote,
      elements,
      estado: nextStatus,
      etapa: Math.max(quote.etapa, 3),
    });
    this.toast.show('Plantilla aplicada - ' + elements.length + ' líneas generadas desde el cálculo');
  }

  sendQuote(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    if (this.session.role() !== UserRole.Ventas) {
      this.toast.show('Solo Ventas envía la cotización al cliente');
      return;
    }
    if (!isPendingSend(quote.estado)) {
      this.toast.show('Gerencia debe aprobar la solicitud antes del envío');
      return;
    }
    const client = this.clientsRepo.getByRuc(quote.ruc);
    const mail = client?.mail || 'correo del cliente';
    this.quotesRepo.upsert({
      ...quote,
      estado: QuoteStatus.Enviada,
      etapa: 4,
      log: [...quote.log, { t: new Date().toLocaleDateString('es-EC'), u: this.session.profile().name, m: 'Enviada a ' + mail }],
    });
    this.toast.show('Cotización marcada como enviada a ' + mail);
  }

  /**
   * Cierra el armado de elementos y pasa a validación comercial.
   */
  finalizeQuote(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    if (this.session.role() !== UserRole.Ingenieria) {
      this.toast.show('Solo Ingeniería finaliza el cálculo para enviarlo a Gerencia');
      return;
    }
    if (!quote.elements.length) {
      this.toast.show('Agrega al menos un elemento antes de finalizar');
      return;
    }
    this.quotesRepo.upsert({ ...quote, estado: QuoteStatus.Validacion, etapa: 4 });
    this.toast.show('Cotización finalizada — pendiente de aprobación de Gerencia');
  }

  approveQuote(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    if (this.session.role() !== UserRole.Gerencia) {
      this.toast.show('Solo Gerencia aprueba la solicitud');
      return;
    }
    if (!isPendingApproval(quote.estado)) {
      this.toast.show('Ingeniería debe finalizar el cálculo antes de aprobar');
      return;
    }
    this.quotesRepo.upsert({ ...quote, estado: QuoteStatus.Aprobada, etapa: 4 });
    this.toast.show('Solicitud aprobada — Ventas puede enviarla al cliente');
  }

  logAdjustment(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    const pricing = this.pricing(quote);
    const entry = {
      t: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }),
      u: this.session.profile().name,
      m:
        'Reajuste: insumos ' +
        this.discLabel(quote.descInsumos) +
        ', equipos ' +
        this.discLabel(quote.descEquipos) +
        ', M.O. ' +
        this.discLabel(quote.descMO) +
        '. Nuevo total ' +
        this.money(pricing.total) +
        ', margen ' +
        pricing.margen.toFixed(1) +
        '%.',
    };
    this.quotesRepo.upsert({
      ...quote,
      log: [entry, ...(quote.log || [])],
      estado: QuoteStatus.Reajuste,
    });
    this.toast.show('Reajuste registrado con trazabilidad');
  }

  cloneQuote(id: string): Quote | undefined {
    const src = this.quotesRepo.getById(id);
    if (!src) {
      return undefined;
    }
    const nid = newId('Q-');
    const clone: Quote = {
      ...src,
      id: nid,
      code: 'COT-2026-' + nid.slice(2),
      name: src.name + ' (copia)',
      estado: QuoteStatus.Elaboracion,
      etapa: 1,
      motivo: null,
      log: [],
      elements: src.elements.map((line) => ({ ...line, uid: newUid(line.code) })),
      rooms: (src.rooms || []).map((room) => ({ ...room, id: 'r' + Math.random().toString(36).slice(2, 5) })),
    };
    this.quotesRepo.upsert(clone);
    this.toast.show('Cotización clonada — biblioteca de proyectos');
    return clone;
  }

  createBlankQuote(): Quote {
    const nid = newId('Q-');
    const role = this.session.role();
    const name = this.session.profile().name;
    const quote: Quote = {
      id: nid,
      code: 'COT-2026-' + nid.slice(2),
      name: 'Nueva cotización',
      cliente: '—',
      ruc: '',
      tipo: QuoteKind.Instalacion,
      subtipo: 'Completa',
      plantilla: 'PL-02',
      area: 0,
      estado: QuoteStatus.Solicitud,
      prio: Priority.Media,
      asignado: name,
      vendedor: role === UserRole.Ventas ? name : null,
      ingeniero: role === UserRole.Ingenieria ? name : null,
      hrs: [null, null, null, null],
      fecha: 'hoy',
      etapa: 1,
      motivo: null,
      rooms: [],
      elements: [],
      descInsumos: 0,
      descEquipos: 0,
      descMO: 0,
      margenMin: this.settings.defaultMarginInstall,
      log: [],
    };
    this.quotesRepo.upsert(quote);
    this.toast.show('Cotización creada');
    return quote;
  }

  createFromRequest(input: CreateRequestInput): Quote | null {
    if (!input.ruc) {
      this.toast.show('El cliente no está registrado. Complétalo para continuar.');
      return null;
    }
    if (!input.proyecto.trim()) {
      this.toast.show('Ingresa el nombre del proyecto');
      return null;
    }
    const nid = newId('Q-');
    const plantilla =
      input.tipo === QuoteKind.Mantenimiento
        ? 'PL-04'
        : input.subtipo === InstallationSubtype.Equipos
          ? 'PL-01'
          : 'PL-02';
    const subtipo =
      input.tipo === QuoteKind.Mantenimiento
        ? 'Correctivo'
        : input.subtipo || InstallationSubtype.Completa;
    const adjuntos = input.tipo === QuoteKind.Mantenimiento ? [] : input.adjuntos;
    const quote: Quote = {
      id: nid,
      code: 'COT-2026-' + nid.slice(2),
      name: input.proyecto.trim(),
      cliente: input.cliente,
      ruc: input.ruc,
      tipo: input.tipo,
      subtipo,
      plantilla,
      area: 0,
      estado: QuoteStatus.Solicitud,
      prio: input.prio,
      asignado: null,
      vendedor: this.session.role() === UserRole.Ventas ? this.session.profile().name : 'M. Coello',
      ingeniero: null,
      hrs: [null, null, null, null],
      fecha: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }),
      etapa: 1,
      motivo: null,
      rooms: [],
      elements: [],
      descInsumos: 0,
      descEquipos: 0,
      descMO: 0,
      margenMin:
        input.tipo === QuoteKind.Mantenimiento
          ? this.settings.defaultMarginMaintenance
          : this.settings.defaultMarginInstall,
      log: [],
      observaciones: input.observaciones,
      adjuntos,
    };
    this.quotesRepo.upsert(quote);
    this.toast.show('Solicitud ' + quote.code + ' registrada');
    return quote;
  }

  registerClient(client: Client): string | null {
    if (client.ruc.replace(/\D/g, '').length !== 13) {
      this.toast.show('RUC debe tener 13 dígitos');
      return 'ruc';
    }
    if (!client.name.trim()) {
      this.toast.show('Ingresa la razón social');
      return 'name';
    }
    if (this.clientsRepo.getByRuc(client.ruc)) {
      this.toast.show('Ese RUC ya está registrado');
      return 'dup';
    }
    if (client.mail && client.mail !== '—' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.mail)) {
      this.toast.show('Correo inválido');
      return 'mail';
    }
    this.clientsRepo.upsert(client);
    this.toast.show('Cliente registrado');
    return null;
  }

  /**
   * Actualiza un cliente existente (mismo RUC).
   */
  updateClient(client: Client): string | null {
    if (!this.clientsRepo.getByRuc(client.ruc)) {
      return this.registerClient(client);
    }
    if (!client.name.trim()) {
      this.toast.show('Ingresa la razón social');
      return 'name';
    }
    if (client.mail && client.mail !== '—' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.mail)) {
      this.toast.show('Correo inválido');
      return 'mail';
    }
    this.clientsRepo.upsert(client);
    this.toast.show('Cliente actualizado');
    return null;
  }

  /**
   * Alta o edición de producto de catálogo.
   */
  saveProduct(product: Product, isNew: boolean): string | null {
    const code = product.code.trim().toUpperCase();
    if (!code) {
      this.toast.show('El código interno es obligatorio');
      return 'code';
    }
    if (!product.name.trim()) {
      this.toast.show('El nombre del producto es obligatorio');
      return 'name';
    }
    if (isNew && this.productsRepo.getByCode(code)) {
      this.toast.show('Ese código ya existe');
      return 'dup';
    }
    this.productsRepo.upsert({ ...product, code });
    this.toast.show(isNew ? 'Producto guardado' : 'Producto actualizado');
    return null;
  }

  setProductActive(code: string, activo: boolean): void {
    const product = this.productsRepo.getByCode(code);
    if (!product) {
      return;
    }
    this.productsRepo.upsert({ ...product, activo });
    this.toast.show(activo ? 'Producto activado' : 'Producto inactivado');
  }

  findClient(ruc: string): Client | undefined {
    return this.clientsRepo.getByRuc(ruc);
  }

  patchQuote(id: string, patch: Partial<Quote>): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    this.quotesRepo.upsert({ ...quote, ...patch });
  }

  readonly discountParams = computed(() => Object.values(this.settings.categoryDiscountParams));

  discountParam(category: DiscountCategory): DiscountCategoryParam {
    return (
      this.settings.categoryDiscountParams?.[category] ?? {
        category,
        name: category,
        maxDiscountPct: this.settings.maxDiscountPct,
        maxSurchargePct: this.settings.maxDiscountPct,
        description: '',
      }
    );
  }

  maxDiscountFor(category: DiscountCategory): number {
    return this.discountParam(category).maxDiscountPct;
  }

  maxSurchargeFor(category: DiscountCategory): number {
    return this.discountParam(category).maxSurchargePct;
  }

  updateDiscountParam(category: DiscountCategory, maxDiscountPct: number, maxSurchargePct: number): void {
    const current = this.discountParam(category);
    this.settings.categoryDiscountParams[category] = {
      ...current,
      maxDiscountPct: Math.max(0, maxDiscountPct),
      maxSurchargePct: Math.max(0, maxSurchargePct),
    };
    this.toast.show(`Parámetros de reajuste para ${current.name} actualizados`);
  }

  setDiscount(id: string, field: DiscountCategory, value: number): void {
    const param = this.discountParam(field);
    const min = -param.maxDiscountPct;
    const max = param.maxSurchargePct;
    const clamped = Math.max(min, Math.min(max, value || 0));
    this.patchQuote(id, { [field]: clamped });
  }

  discLabel(pct: number): string {
    if (!pct) {
      return '0%';
    }
    return (pct > 0 ? '+' : '') + pct + '%';
  }

  setQty(id: string, uid: string, qty: number): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    const next = Math.max(0, qty || 0);
    this.quotesRepo.upsert({
      ...quote,
      elements: quote.elements.map((line) => (line.uid === uid ? { ...line, qty: next } : line)),
    });
  }

  bumpQty(id: string, uid: string, delta: number): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    this.quotesRepo.upsert({
      ...quote,
      elements: quote.elements.map((line) =>
        line.uid === uid ? { ...line, qty: Math.max(0, +(line.qty + delta).toFixed(2)) } : line,
      ),
    });
  }

  removeLine(id: string, uid: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    this.quotesRepo.upsert({ ...quote, elements: quote.elements.filter((line) => line.uid !== uid) });
    this.toast.show('Elemento eliminado');
  }

  addProduct(id: string, code: string, qty = 1): void {
    const quote = this.quotesRepo.getById(id);
    const product = this.productsRepo.getByCode(code);
    if (!quote || !product || !product.activo) {
      return;
    }
    const existing = quote.elements.find((line) => line.code === code);
    const elements: QuoteLine[] = existing
      ? quote.elements.map((line) =>
          line.code === code ? { ...line, qty: +(line.qty + qty).toFixed(2) } : line,
        )
      : [
          ...quote.elements,
          {
            uid: newUid(code),
            code,
            name: product.name,
            cat: product.cat,
            unit: product.unit,
            costo: product.costo,
            pvp: product.pvp,
            qty: Math.max(0.01, qty),
          },
        ];
    this.quotesRepo.upsert({ ...quote, elements });
    this.toast.show(product.name + ' agregado');
  }

  /** Fija la cantidad de una línea por código; 0 la elimina. */
  setCatalogQty(id: string, code: string, qty: number): void {
    const quote = this.quotesRepo.getById(id);
    const product = this.productsRepo.getByCode(code);
    if (!quote || !product) {
      return;
    }
    const nextQty = Math.max(0, qty || 0);
    const existing = quote.elements.find((line) => line.code === code);
    if (nextQty === 0) {
      this.quotesRepo.upsert({ ...quote, elements: quote.elements.filter((line) => line.code !== code) });
      return;
    }
    if (existing) {
      this.quotesRepo.upsert({
        ...quote,
        elements: quote.elements.map((line) => (line.code === code ? { ...line, qty: nextQty } : line)),
      });
      return;
    }
    this.addProduct(id, code, nextQty);
  }

  addRoom(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    const room: Room = {
      id: 'r' + Math.random().toString(36).slice(2, 5),
      name: 'Ambiente ' + ((quote.rooms || []).length + 1),
      area: 20,
      tipo: RoomKind.Comercial,
    };
    this.quotesRepo.upsert({ ...quote, rooms: [...(quote.rooms || []), room] });
  }

  patchRoom(id: string, roomId: string, patch: Partial<Room>): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    this.quotesRepo.upsert({
      ...quote,
      rooms: quote.rooms.map((room) => (room.id === roomId ? { ...room, ...patch } : room)),
    });
  }

  removeRoom(id: string, roomId: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    this.quotesRepo.upsert({ ...quote, rooms: quote.rooms.filter((room) => room.id !== roomId) });
  }

  generatePurchaseOrder(): void {
    this.toast.show('Orden de compra generada y enviada a Bodega (sin re-teclear)');
  }

  exportQuotePdf(id: string): void {
    this.exportDetailedReport(id);
  }

  /** Informe detallado (desglose por categoría). */
  exportDetailedReport(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    if (!this.printer.printDetailed(quote, this.settings)) {
      this.toast.show('Permite ventanas emergentes para exportar');
      return;
    }
    this.toast.show('Generando informe detallado...');
  }

  /** Informe final (propuesta comercial). */
  exportFinalReport(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) {
      return;
    }
    if (!this.printer.printFinal(quote, this.settings)) {
      this.toast.show('Permite ventanas emergentes para exportar');
      return;
    }
    this.toast.show('Generando informe final...');
  }

  suggestProject(name: string, tipo: QuoteKind): string {
    const n = (name || '').trim() || 'cliente';
    return tipo === QuoteKind.Mantenimiento
      ? 'Cotización de Mantenimiento ' + n
      : 'Cotización de Climatización ' + n;
  }

  // --- Asistente de Tramos de Ductería (Formato R-D-003) ---

  ductSegments(quote: Quote): DuctSegment[] {
    return quote.ductSegments || [];
  }

  ductMetrics(segment: DuctSegment, isPiralu = true): DuctSegmentMetrics {
    return computeDuctSegmentMetrics(segment, isPiralu);
  }

  ductSummary(quote: Quote, isPiralu = true): DuctSystemSummary {
    return computeDuctSystemSummary(quote.ductSegments || [], 0.15, isPiralu);
  }

  addDuctSegment(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) return;
    const count = (quote.ductSegments || []).length + 1;
    const newSeg: DuctSegment = {
      id: 'd' + Math.random().toString(36).slice(2, 6),
      name: 'Tramo ' + count,
      aInches: 24,
      bInches: 12,
      lengthM: 6,
      flowCfm: 800,
    };
    this.quotesRepo.upsert({
      ...quote,
      ductSegments: [...(quote.ductSegments || []), newSeg],
    });
  }

  patchDuctSegment(id: string, segmentId: string, patch: Partial<DuctSegment>): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote || !quote.ductSegments) return;
    this.quotesRepo.upsert({
      ...quote,
      ductSegments: quote.ductSegments.map((s) => (s.id === segmentId ? { ...s, ...patch } : s)),
    });
  }

  removeDuctSegment(id: string, segmentId: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote || !quote.ductSegments) return;
    this.quotesRepo.upsert({
      ...quote,
      ductSegments: quote.ductSegments.filter((s) => s.id !== segmentId),
    });
  }

  transferDuctsToElements(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote) return;
    const summary = this.ductSummary(quote);
    if (summary.totalAreaM2 <= 0) {
      this.toast.show('Ingresa al menos un tramo de ducto con dimensiones válidas');
      return;
    }

    this.setCatalogQty(id, ProductCode.InDuct, summary.totalAreaM2);
    this.setCatalogQty(id, ProductCode.InCinta, Math.max(1, Math.ceil(summary.totalAreaM2 / 30)));
    this.setCatalogQty(id, ProductCode.InSop, Math.max(2, Math.ceil(summary.totalLengthM / 2)));
    this.setCatalogQty(id, ProductCode.MoDuct, Math.max(4, Math.round(summary.totalAreaM2 * 0.75)));

    this.toast.show(
      `Ductería transferida: ${summary.totalAreaM2} m² (${summary.piraluSheetsCount} planchas PIRALU) a la lista de materiales`,
    );
  }

  syncRoomsToDucts(id: string): void {
    const quote = this.quotesRepo.getById(id);
    if (!quote || !quote.rooms.length) {
      this.toast.show('No hay ambientes configurados para sincronizar');
      return;
    }

    const segments: DuctSegment[] = quote.rooms.map((r, idx) => {
      const th = this.thermal(r, quote);
      const cfm = th.cfm || 400;
      let a = 20;
      let b = 10;
      if (cfm >= 2000) {
        a = 32;
        b = 16;
      } else if (cfm >= 1400) {
        a = 28;
        b = 14;
      } else if (cfm >= 1000) {
        a = 24;
        b = 12;
      } else if (cfm >= 600) {
        a = 18;
        b = 10;
      } else {
        a = 14;
        b = 10;
      }

      return {
        id: 'd' + Math.random().toString(36).slice(2, 6),
        name: `Ramal ${r.name || 'Ambiente ' + (idx + 1)}`,
        aInches: a,
        bInches: b,
        lengthM: Number(Math.max(3, Math.sqrt(r.area)).toFixed(1)),
        flowCfm: cfm,
      };
    });

    this.quotesRepo.upsert({
      ...quote,
      ductSegments: segments,
    });
    this.toast.show(`Se generaron ${segments.length} tramos de ductos basados en los ambientes calculados`);
  }
}
