import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import {
  UserRole,
  QuoteStatus,
  QuoteKind,
  InstallationSubtype,
  Priority,
  RoomKind,
  ClientType,
  DiscountCategory,
  ProductCode,
} from '@app/domain/enums';
import { isPendingApproval, isPendingSend } from '@app/core/role-access';
import { MOCK_PROVIDERS } from '@app/infrastructure/mock/mock.providers';
import { ICON_PROVIDERS } from '@app/shared/ui/icon';

describe('E2E Flujo Integral HVAC: Ventas -> Ingeniería -> Gerencia -> Cierre Comercial -> Bodega', () => {
  let workspace: QuoteWorkspaceService;
  let session: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...ICON_PROVIDERS,
        ...MOCK_PROVIDERS,
      ],
    });

    workspace = TestBed.inject(QuoteWorkspaceService);
    session = TestBed.inject(SessionService);
  });

  it('debe ejecutar el ciclo de vida completo para el cliente Saul Maldonado (RUC 0010930674288 - Guayaquil)', () => {
    // =========================================================================
    // PASO 1: VENTAS REGISTRA CLIENTE Y CREA SOLICITUD
    // =========================================================================
    session.setRole(UserRole.Ventas);
    expect(session.role()).toBe(UserRole.Ventas);
    expect(session.isSales()).toBe(true);

    const client = workspace.findClient('0010930674288');
    expect(client).toBeDefined();
    expect(client?.name).toBe('Saul Maldonado');
    expect(client?.city).toBe('Guayaquil');
    expect(client?.type).toBe(ClientType.Juridica);

    const createdQuote = workspace.createFromRequest({
      ruc: client!.ruc,
      cliente: client!.name,
      proyecto: 'Sistema Climatización Edificio Corporativo Orellana',
      tipo: QuoteKind.Instalacion,
      subtipo: InstallationSubtype.Completa,
      prio: Priority.Alta,
      observaciones: 'Instalación centralizada de climatización por conductos en 3 ambientes de Guayaquil',
      adjuntos: [
        { name: 'Planos_HVAC_Orellana_v1.dwg', size: 2048000, ext: 'DWG' },
        { name: 'Especificaciones_Termicas.pdf', size: 512000, ext: 'PDF' },
      ],
    });

    expect(createdQuote).toBeTruthy();
    const quoteId = createdQuote!.id;

    // Verificar estado inicial en bandeja de solicitudes
    let quote = workspace.quote(quoteId);
    expect(quote).toBeDefined();
    expect(quote?.estado).toBe(QuoteStatus.Solicitud);
    expect(quote?.vendedor).toBe('M. Coello');
    expect(quote?.ingeniero).toBeNull();
    expect(quote?.elements.length).toBe(0);

    // =========================================================================
    // PASO 2: INGENIERÍA TOMA LA SOLICITUD, DIMENSIONA Y CALCULA HVAC
    // =========================================================================
    session.setRole(UserRole.Ingenieria);
    expect(session.role()).toBe(UserRole.Ingenieria);

    // 2.1 Toma la solicitud
    workspace.takeRequest(quoteId);
    quote = workspace.quote(quoteId);
    expect(quote?.estado).toBe(QuoteStatus.Elaboracion);
    expect(quote?.ingeniero).toBe('Ing. Paredes');

    // 2.2 Dimensionamiento térmico de ambientes (Guayaquil)
    workspace.addRoom(quoteId);
    workspace.addRoom(quoteId);
    workspace.addRoom(quoteId);
    quote = workspace.quote(quoteId);
    expect(quote?.rooms.length).toBe(3);

    const [r1, r2, r3] = quote!.rooms;
    workspace.patchRoom(quoteId, r1.id, {
      name: 'Área Operativa & Ventas',
      area: 85,
      tipo: RoomKind.Comercial,
      n: 1,
    });
    workspace.patchRoom(quoteId, r2.id, {
      name: 'Gerencia General',
      area: 32,
      tipo: RoomKind.Comercial,
      n: 1,
    });
    workspace.patchRoom(quoteId, r3.id, {
      name: 'Data Center / Racks',
      area: 18,
      tipo: RoomKind.Critico,
      n: 1,
    });

    // 2.3 Selección de plantilla paramétrica y aplicación
    workspace.patchQuote(quoteId, { plantilla: 'PL-02' });
    workspace.applyTemplate(quoteId);

    quote = workspace.quote(quoteId);
    expect(quote?.elements.length).toBeGreaterThan(0);

    // Verificar que los insumos y equipos estándar fueron calculados
    expect(quote?.elements.some((e) => e.code === ProductCode.InDuct)).toBe(true);
    expect(quote?.elements.some((e) => e.code === ProductCode.InCu12)).toBe(true);
    expect(quote?.elements.some((e) => e.code === ProductCode.MoInst)).toBe(true);

    // 2.4 Registro de tiempos técnicos SLA y avance de etapas
    workspace.closeStage(quoteId, 1.5); // Revisión
    workspace.closeStage(quoteId, 4.0); // Planos
    workspace.closeStage(quoteId, 6.5); // Cálculos

    // 2.5 Ingeniería finaliza y remite a Gerencia
    workspace.finalizeQuote(quoteId);
    quote = workspace.quote(quoteId);
    expect(quote?.estado).toBe(QuoteStatus.Validacion);
    expect(isPendingApproval(quote!.estado)).toBe(true);

    // =========================================================================
    // PASO 3: GERENCIA AUDITA MÁRGENES, AUTORIZA REAJUSTE Y APRUEBA
    // =========================================================================
    session.setRole(UserRole.Gerencia);
    expect(session.role()).toBe(UserRole.Gerencia);

    // 3.1 Auditoría de pricing inicial
    let pricing = workspace.pricing(quote!);
    expect(pricing.total).toBeGreaterThan(0);
    expect(pricing.margen).toBeGreaterThan(quote!.margenMin);

    // 3.2 Aplicar reajuste comercial negociado con Saul Maldonado
    workspace.setDiscount(quoteId, DiscountCategory.Insumos, -5);
    workspace.setDiscount(quoteId, DiscountCategory.Equipos, -5);
    workspace.logAdjustment(quoteId);

    quote = workspace.quote(quoteId);
    expect(quote?.descInsumos).toBe(-5);
    expect(quote?.descEquipos).toBe(-5);
    expect(quote?.log.length).toBeGreaterThan(0);

    // 3.3 Aprobación gerencial
    workspace.approveQuote(quoteId);
    quote = workspace.quote(quoteId);
    expect(quote?.estado).toBe(QuoteStatus.Aprobada);
    expect(isPendingSend(quote!.estado)).toBe(true);

    // =========================================================================
    // PASO 4: VENTAS ENVÍA PROPUESTA AL CLIENTE
    // =========================================================================
    session.setRole(UserRole.Ventas);
    expect(session.isSales()).toBe(true);

    workspace.sendQuote(quoteId);
    quote = workspace.quote(quoteId);
    expect(quote?.estado).toBe(QuoteStatus.Enviada);
    expect(quote?.log.some((l) => l.m.includes('Enviada a'))).toBe(true);

    // =========================================================================
    // PASO 5: BODEGA / COMPRAS VERIFICA DISPONIBILIDAD Y GENERA OC
    // =========================================================================
    const approvedQuotes = workspace.quotes().filter((q) => q.estado === QuoteStatus.Aprobada || q.estado === QuoteStatus.Enviada);
    expect(approvedQuotes.some((q) => q.id === quoteId)).toBe(true);

    workspace.generatePurchaseOrder();
    // Validación de integridad y persistencia
    expect(workspace.findClient('0010930674288')?.mail).toBe('smaldonado@emasesor.ec');
  });
});
