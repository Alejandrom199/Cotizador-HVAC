import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { QuoteWorkspacePage } from './quote-workspace-page';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { UserRole, QuoteStatus, WorkspaceTab } from '@app/domain/enums';
import { MOCK_PROVIDERS } from '@app/infrastructure/mock/mock.providers';
import { ICON_PROVIDERS } from '@app/shared/ui/icon';

describe('QuoteWorkspacePage - Regla de Asignación y Ficha Informativa para Ingeniería', () => {
  let fixture: ComponentFixture<QuoteWorkspacePage>;
  let component: QuoteWorkspacePage;
  let workspace: QuoteWorkspaceService;
  let session: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteWorkspacePage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'Q-016' })),
            snapshot: {
              paramMap: convertToParamMap({ id: 'Q-016' }),
              queryParamMap: convertToParamMap({ tab: 'resumen' }),
            },
            queryParamMap: of(convertToParamMap({ tab: 'resumen' })),
          },
        },
        ...ICON_PROVIDERS,
        ...MOCK_PROVIDERS,
      ],
    }).compileComponents();

    session = TestBed.inject(SessionService);
    workspace = TestBed.inject(QuoteWorkspaceService);
    router = TestBed.inject(Router);

    session.setRole(UserRole.Ingenieria);
    fixture = TestBed.createComponent(QuoteWorkspacePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe detectar cotización sin asignar para el rol de Ingeniería', () => {
    expect(session.isEngineering()).toBe(true);
    const quote = component.quote();
    expect(quote).toBeDefined();
    expect(quote?.ingeniero).toBeNull();
    expect(quote?.estado).toBe(QuoteStatus.Solicitud);
    expect(component.isEngineeringUnassigned()).toBe(true);
  });

  it('debe mostrar la Ficha Informativa del Proyecto con todos los datos requeridos y aviso informativo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent || '';

    // Datos del proyecto
    expect(text).toContain('Ficha Informativa del Proyecto / Solicitud');
    expect(text).toContain('Ventilación subsuelos Hipermarket');
    expect(text).toContain('COT-2026-016');
    expect(text).toContain('Constructora Aluxa S.A.');
    expect(text).toContain('0992345678001');
    expect(text).toContain('Guayaquil');
    expect(text).toContain('R. Tapia');

    // Aviso informativo
    expect(text).toContain(
      'Esta solicitud se encuentra en la bandeja técnica sin asignar. Para iniciar el dimensionamiento térmico y cálculo HVAC, debes tomar la solicitud.',
    );

    // Botón destacado para tomar solicitud
    const takeButtons = compiled.querySelectorAll('button');
    const takeBtn = Array.from(takeButtons).find((b) => b.textContent?.includes('Tomar solicitud para editar'));
    expect(takeBtn).toBeTruthy();
  });

  it('debe proteger las pestañas de edición técnica (Cálculo HVAC) mientras no se tome la solicitud', async () => {
    component.setTab(WorkspaceTab.Calculo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isEngineeringUnassigned()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Modo Informativo — Solicitud sin asignar');

    // Botón ambiente debe estar deshabilitado
    const addRoomBtn = Array.from(compiled.querySelectorAll('button')).find((b) => b.textContent?.includes('Ambiente'));
    expect(addRoomBtn?.hasAttribute('disabled')).toBe(true);

    // Botón aplicar plantilla debe estar deshabilitado
    const applyTplBtn = Array.from(compiled.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Aplicar plantilla'),
    );
    expect(applyTplBtn?.hasAttribute('disabled')).toBe(true);
  });

  it('debe desbloquear la edición y asignar al ingeniero cuando se ejecuta take()', async () => {
    expect(component.isEngineeringUnassigned()).toBe(true);

    component.take();
    fixture.detectChanges();
    await fixture.whenStable();

    const quote = component.quote();
    expect(quote?.ingeniero).toBe('Ing. Paredes');
    expect(quote?.estado).toBe(QuoteStatus.Elaboracion);
    expect(component.isEngineeringUnassigned()).toBe(false);
    expect(component.tab()).toBe(WorkspaceTab.Calculo);

    // Ahora en la pestaña de cálculo las acciones están habilitadas
    const compiled = fixture.nativeElement as HTMLElement;
    const addRoomBtn = Array.from(compiled.querySelectorAll('button')).find((b) => b.textContent?.includes('Ambiente'));
    expect(addRoomBtn?.hasAttribute('disabled')).toBe(false);
  });

  it('no debe mostrar modo no-asignado si el usuario es de Ventas o Gerencia', () => {
    session.setRole(UserRole.Ventas);
    fixture.detectChanges();

    expect(component.isEngineering()).toBe(false);
    expect(component.isEngineeringUnassigned()).toBe(false);

    session.setRole(UserRole.Gerencia);
    fixture.detectChanges();

    expect(component.isEngineering()).toBe(false);
    expect(component.isEngineeringUnassigned()).toBe(false);
  });

  it('debe mostrar el Asistente de Tramos de Ductería (R-D-003) para plantillas con red de ductos (PL-02)', async () => {
    // Tomar solicitud para desbloquear
    component.take();
    component.setTab(WorkspaceTab.Calculo);
    component.goToDucts();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isDuctTemplate()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dimensionamiento Aerodinámico de Conductos');
    expect(compiled.textContent).toContain('Formato R-D-003');

    // Tramos cargados en Q-016
    const segs = component.ductSegments();
    expect(segs.length).toBeGreaterThan(0);
    expect(segs[0].name).toBe('Troncal Principal Subsuelos');

    // Resumen consolidado
    const summary = component.ductSummary();
    expect(summary).toBeDefined();
    expect(summary!.totalAreaM2).toBeGreaterThan(0);
    expect(summary!.piraluSheetsCount).toBeGreaterThan(0);
  });

  it('debe permitir agregar un tramo y transferir el cálculo a la lista de materiales', async () => {
    component.take();
    component.setTab(WorkspaceTab.Calculo);
    fixture.detectChanges();
    await fixture.whenStable();

    const initialCount = component.ductSegments().length;
    component.addDuctSegment();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.ductSegments().length).toBe(initialCount + 1);

    // Transferir ductos a materiales
    component.transferDuctsToElements();
    fixture.detectChanges();

    const quote = component.quote();
    const ductLine = quote?.elements.find((e) => e.code === 'IN-DUCT');
    expect(ductLine).toBeDefined();
    expect(ductLine!.qty).toBeGreaterThan(0);
  });
});

