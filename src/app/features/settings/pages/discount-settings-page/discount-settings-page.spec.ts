import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DiscountSettingsPage } from './discount-settings-page';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { UserRole, DiscountCategory } from '@app/domain/enums';
import { MOCK_PROVIDERS } from '@app/infrastructure/mock/mock.providers';
import { ICON_PROVIDERS } from '@app/shared/ui/icon';

describe('DiscountSettingsPage - Matriz de Parametrización de Reajustes para Gerencia', () => {
  let fixture: ComponentFixture<DiscountSettingsPage>;
  let component: DiscountSettingsPage;
  let workspace: QuoteWorkspaceService;
  let session: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountSettingsPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...ICON_PROVIDERS,
        ...MOCK_PROVIDERS,
      ],
    }).compileComponents();

    session = TestBed.inject(SessionService);
    workspace = TestBed.inject(QuoteWorkspaceService);

    session.setRole(UserRole.Gerencia);
    fixture = TestBed.createComponent(DiscountSettingsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe cargar los parámetros de reajuste iniciales de Insumos, Equipos y Mano de Obra', () => {
    const list = component.params();
    expect(list.length).toBe(3);

    const insumos = list.find((p) => p.category === DiscountCategory.Insumos);
    const equipos = list.find((p) => p.category === DiscountCategory.Equipos);
    const mo = list.find((p) => p.category === DiscountCategory.ManoDeObra);

    expect(insumos?.maxDiscountPct).toBe(30);
    expect(equipos?.maxDiscountPct).toBe(15);
    expect(mo?.maxDiscountPct).toBe(35);
  });

  it('debe permitir a Gerencia actualizar los límites de descuento y guardarlos', () => {
    component.params.update((list) =>
      list.map((p) =>
        p.category === DiscountCategory.Equipos ? { ...p, maxDiscountPct: 20, maxSurchargePct: 35 } : p,
      ),
    );

    component.save();

    expect(workspace.maxDiscountFor(DiscountCategory.Equipos)).toBe(20);
    expect(workspace.maxSurchargeFor(DiscountCategory.Equipos)).toBe(35);
  });

  it('debe restaurar los valores por defecto al presionar resetDefaults', () => {
    component.params.update((list) =>
      list.map((p) => ({ ...p, maxDiscountPct: 5, maxSurchargePct: 5 })),
    );
    component.save();

    component.resetDefaults();

    expect(workspace.maxDiscountFor(DiscountCategory.Insumos)).toBe(30);
    expect(workspace.maxDiscountFor(DiscountCategory.Equipos)).toBe(15);
    expect(workspace.maxDiscountFor(DiscountCategory.ManoDeObra)).toBe(35);
  });
});
