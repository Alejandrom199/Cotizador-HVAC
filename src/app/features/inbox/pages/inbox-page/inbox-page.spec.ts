import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { InboxPage } from './inbox-page';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { UserRole, QuoteStatus, WorkspaceTab } from '@app/domain/enums';
import { MOCK_PROVIDERS } from '@app/infrastructure/mock/mock.providers';
import { ICON_PROVIDERS } from '@app/shared/ui/icon';

describe('InboxPage - Bandeja Técnica con Ver (Ficha) y Tomar (Desbloqueo)', () => {
  let fixture: ComponentFixture<InboxPage>;
  let component: InboxPage;
  let workspace: QuoteWorkspaceService;
  let session: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboxPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...ICON_PROVIDERS,
        ...MOCK_PROVIDERS,
      ],
    }).compileComponents();

    session = TestBed.inject(SessionService);
    workspace = TestBed.inject(QuoteWorkspaceService);
    router = TestBed.inject(Router);

    session.setRole(UserRole.Ingenieria);
    fixture = TestBed.createComponent(InboxPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe listar cotizaciones sin asignar en el pool', () => {
    const unassigned = component.pool();
    expect(unassigned.length).toBeGreaterThan(0);
    expect(unassigned.every((q) => !q.ingeniero)).toBe(true);
  });

  it('el botón "Ver" debe abrir la ficha informativa del proyecto en la pestaña resumen', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as never);
    const unassigned = component.pool();
    const firstQuote = unassigned[0];

    component.open(firstQuote.id);

    expect(navSpy).toHaveBeenCalledWith(['/cotizaciones', firstQuote.id], {
      queryParams: { tab: WorkspaceTab.Resumen },
    });
  });

  it('el botón "Tomar" debe asignar directamente y desbloquear el editor técnico en la pestaña calculo', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as never);
    const unassigned = component.pool();
    const targetQuote = unassigned[0];

    component.take(targetQuote.id);

    const updatedQuote = workspace.quote(targetQuote.id);
    expect(updatedQuote?.ingeniero).toBe('Ing. Paredes');
    expect(updatedQuote?.estado).toBe(QuoteStatus.Elaboracion);

    expect(navSpy).toHaveBeenCalledWith(['/cotizaciones', targetQuote.id], {
      queryParams: { tab: WorkspaceTab.Calculo },
    });
  });

  it('el botón "Abrir" de mis cotizaciones debe abrir directamente la pestaña calculo', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true as never);
    const myQuotes = component.mine();
    if (myQuotes.length > 0) {
      component.openMine(myQuotes[0].id);
      expect(navSpy).toHaveBeenCalledWith(['/cotizaciones', myQuotes[0].id], {
        queryParams: { tab: WorkspaceTab.Calculo },
      });
    }
  });
});
