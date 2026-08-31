import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { UserRole } from '@app/domain/enums/user-role.enum';
import { QuoteStatus } from '@app/domain/enums/quote-status.enum';
import { QuoteKind, InstallationSubtype } from '@app/domain/enums/quote-kind.enum';
import { Priority } from '@app/domain/enums/priority.enum';
import { RoomKind } from '@app/domain/enums/room-kind.enum';
import { isPendingApproval, isPendingSend } from '@app/core/role-access';
import { MOCK_PROVIDERS } from '@app/infrastructure/mock/mock.providers';
import { ICON_PROVIDERS } from '@app/shared/ui/icon';

describe('E2E Flujo Completo: Ventas -> Ingeniería -> Gerencia -> Envío al Cliente', () => {
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

  it('debe ejecutar el ciclo de vida completo: creación por Ventas, llenado por Ingeniería, aprobación por Gerencia y envío final por Ventas', () => {
    // =========================================================================
    // PASO 1: VENTAS CREA LA SOLICITUD
    // =========================================================================
    session.setRole(UserRole.Ventas);
    expect(session.role()).toBe(UserRole.Ventas);
    expect(session.isSales()).toBe(true);

    const client = workspace.findClient('1791234567001');
    expect(client).toBeDefined();

    const createdQuote = workspace.createFromRequest({
      ruc: client!.ruc,
      cliente: client!.name,
      proyecto: 'Climatización Oficinas Corporativas Quito',
      tipo: QuoteKind.Instalacion,
      subtipo: InstallationSubtype.Completa,
      prio: Priority.Alta,
      observaciones: 'Instalación de sistema VRF/Splits en 2 plantas y sala de reuniones',
      adjuntos: [
        { name: 'Planos_Arquitectonicos_v1.pdf', size: 1024000, ext: 'PDF' },
      ],
    });

    expect(createdQuote).toBeTruthy();
    const quoteId = createdQuote!.id;

    // Verificar estado inicial tras creación por Ventas
    let currentQuote = workspace.quote(quoteId);
    expect(currentQuote).toBeDefined();
    expect(currentQuote?.estado).toBe(QuoteStatus.Solicitud);
    expect(currentQuote?.vendedor).toBe('M. Coello');
    expect(currentQuote?.ingeniero).toBeNull();
    expect(currentQuote?.elements.length).toBe(0);

    // =========================================================================
    // PASO 2: INGENIERÍA TOMA LA SOLICITUD Y LA LLENA TÉCNICAMENTE
    // =========================================================================
    session.setRole(UserRole.Ingenieria);
    expect(session.role()).toBe(UserRole.Ingenieria);

    // 2.1 Ingeniería toma la solicitud
    workspace.takeRequest(quoteId);
    currentQuote = workspace.quote(quoteId);
    expect(currentQuote?.estado).toBe(QuoteStatus.Elaboracion);
    expect(currentQuote?.ingeniero).toBe('Ing. Paredes');

    // 2.2 Ingeniería dimensiona los ambientes térmicos
    workspace.addRoom(quoteId);
    workspace.addRoom(quoteId);
    currentQuote = workspace.quote(quoteId);
    expect(currentQuote?.rooms.length).toBe(2);

    const firstRoom = currentQuote!.rooms[0];
    const secondRoom = currentQuote!.rooms[1];

    workspace.patchRoom(quoteId, firstRoom.id, {
      name: 'Open Space Oficinas',
      area: 45,
      tipo: RoomKind.Comercial,
      n: 1,
    });

    workspace.patchRoom(quoteId, secondRoom.id, {
      name: 'Sala de Directorio',
      area: 25,
      tipo: RoomKind.Critico,
      n: 1,
    });

    // 2.3 Selección de plantilla técnica y aplicación de líneas
    workspace.patchQuote(quoteId, { plantilla: 'PL-02' });
    workspace.applyTemplate(quoteId);

    currentQuote = workspace.quote(quoteId);
    expect(currentQuote?.elements.length).toBeGreaterThan(0);

    // 2.4 Agregar productos adicionales del catálogo
    const activeProducts = workspace.activeProducts();
    expect(activeProducts.length).toBeGreaterThan(0);
    const equip = activeProducts[0];
    workspace.addProduct(quoteId, equip.code, 2);

    // 2.5 Validar cálculos de pricing y margen
    const pricing = workspace.pricing(currentQuote!);
    expect(pricing.subtotal).toBeGreaterThan(0);
    expect(pricing.iva).toBeGreaterThan(0);
    expect(pricing.total).toBeGreaterThan(pricing.subtotal);
    expect(pricing.margen).toBeGreaterThan(0);

    // 2.6 Ingeniería finaliza el cálculo y lo envía a validación de Gerencia
    workspace.finalizeQuote(quoteId);
    currentQuote = workspace.quote(quoteId);
    expect(currentQuote?.estado).toBe(QuoteStatus.Validacion);
    expect(isPendingApproval(currentQuote!.estado)).toBe(true);

    // =========================================================================
    // PASO 3: GERENCIA REVISA Y APRUEBA LA SOLICITUD
    // =========================================================================
    // 3.1 Seguridad: Ventas no puede aprobar cotizaciones
    session.setRole(UserRole.Ventas);
    workspace.approveQuote(quoteId);
    expect(workspace.quote(quoteId)?.estado).toBe(QuoteStatus.Validacion);

    // 3.2 Seguridad: Ventas no puede enviar una cotización que aún no ha sido aprobada
    workspace.sendQuote(quoteId);
    expect(workspace.quote(quoteId)?.estado).toBe(QuoteStatus.Validacion);

    // 3.3 Gerencia inicia sesión y aprueba la solicitud
    session.setRole(UserRole.Gerencia);
    expect(session.role()).toBe(UserRole.Gerencia);

    workspace.approveQuote(quoteId);
    currentQuote = workspace.quote(quoteId);
    expect(currentQuote?.estado).toBe(QuoteStatus.Aprobada);
    expect(isPendingSend(currentQuote!.estado)).toBe(true);

    // =========================================================================
    // PASO 4: VENTAS ENVÍA LA COTIZACIÓN AL CLIENTE
    // =========================================================================
    // 4.1 Seguridad: Ingeniería no envía cotizaciones finales de ventas
    session.setRole(UserRole.Ingenieria);
    workspace.sendQuote(quoteId);
    expect(workspace.quote(quoteId)?.estado).toBe(QuoteStatus.Aprobada);

    // 4.2 Ventas toma el control y realiza el envío oficial
    session.setRole(UserRole.Ventas);
    workspace.sendQuote(quoteId);

    currentQuote = workspace.quote(quoteId);
    expect(currentQuote?.estado).toBe(QuoteStatus.Enviada);
    expect(currentQuote?.log.length).toBeGreaterThan(0);
    expect(currentQuote?.log.some((entry) => entry.m.includes('Enviada a'))).toBe(true);
  });
});
