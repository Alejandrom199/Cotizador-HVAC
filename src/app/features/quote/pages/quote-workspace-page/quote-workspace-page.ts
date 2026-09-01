import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { homeListPath, isPendingApproval, isPendingSend } from '@app/core/role-access';
import { WorkspaceTab, ProductCategory, RoomKind, UserRole, DiscountCategory } from '@app/domain/enums';
import { statusClass, stockClass } from '@app/shared/ui/presentation';
import { Icon } from '@app/shared/ui/icon';
import { InvestmentSummary } from '@app/shared/ui/investment-summary/investment-summary';

@Component({
  selector: 'app-quote-workspace-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon, InvestmentSummary],
  templateUrl: './quote-workspace-page.html',
})
export class QuoteWorkspacePage {
  readonly workspace = inject(QuoteWorkspaceService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statusClass = statusClass;
  readonly stockClass = stockClass;
  readonly cats: ProductCategory[] = [
    ProductCategory.Equipos,
    ProductCategory.Insumos,
    ProductCategory.ManoDeObra,
    ProductCategory.Logistica,
  ];
  readonly RoomKind = RoomKind;
  readonly WorkspaceTab = WorkspaceTab;
  readonly DiscountCategory = DiscountCategory;

  readonly id = toSignal(
    (this.route.parent ?? this.route).paramMap.pipe(map((p) => p.get('id') ?? '')),
    {
      initialValue:
        this.route.parent?.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id') ?? '',
    },
  );
  readonly tab = signal<WorkspaceTab>(WorkspaceTab.Resumen);

  /**
   * Flag de control para mostrar/ocultar la pestaña de Elementos en cotizaciones.
   * (Poner en true para volver a activarla).
   */
  readonly showElementsTab = signal(false);

  readonly availableTabs = computed(() => [
    { id: WorkspaceTab.Resumen, l: 'Resumen' },
    { id: WorkspaceTab.Calculo, l: 'Cálculo HVAC' },
    ...(this.showElementsTab() ? [{ id: WorkspaceTab.Elementos, l: 'Elementos' }] : []),
    { id: WorkspaceTab.Tiempos, l: 'Tiempos / SLA' },
    { id: WorkspaceTab.Reajuste, l: 'Reajuste' },
    { id: WorkspaceTab.Informe, l: 'Informe final' },
  ]);

  readonly openCats = signal<Record<string, boolean>>({
    [ProductCategory.Equipos]: true,
    [ProductCategory.Insumos]: true,
    [ProductCategory.ManoDeObra]: false,
    [ProductCategory.Logistica]: false,
  });

  constructor() {
    const tabFromQuery = toSignal(
      this.route.queryParamMap.pipe(map((p) => p.get('tab') as WorkspaceTab | null)),
      { initialValue: this.route.snapshot.queryParamMap.get('tab') as WorkspaceTab | null },
    );
    effect(() => {
      const next = tabFromQuery();
      if (next) {
        this.tab.set(next);
      }
    });
  }

  readonly quote = computed(() => this.workspace.quote(this.id()));
  readonly pricing = computed(() => {
    const q = this.quote();
    return q ? this.workspace.pricing(q) : null;
  });
  readonly complexity = computed(() => {
    const q = this.quote();
    return q ? this.workspace.complexity(q) : null;
  });
  readonly stages = computed(() => {
    const q = this.quote();
    return q ? this.workspace.stageTimes(q) : [];
  });
  readonly template = computed(() => {
    const q = this.quote();
    return q ? this.workspace.templateOf(q) : undefined;
  });
  readonly templates = computed(() => this.workspace.templates());
  readonly slaView = computed(() => {
    const q = this.quote();
    const cx = this.complexity();
    if (!q || !cx) {
      return null;
    }
    const cycle = this.workspace.cycleOf(q);
    const perDay = this.workspace.settings.hoursPerBusinessDay;
    const days = cx.slaHours / perDay;
    return {
      cycle,
      cycleLabel: cycle == null ? 'sin registro' : this.hours(cycle),
      slaLabel: this.hours(cx.slaHours),
      daysLabel: days.toFixed(1) + ' d (' + Math.round(days) + ' días hábiles)',
      onTime: cycle == null || cycle <= cx.slaHours,
      promised: this.workspace.promisedLabel(q),
    };
  });
  readonly calcTotals = computed(() => {
    const q = this.quote();
    if (!q) {
      return { area: 0, ton: 0, btu: 0, cfm: 0 };
    }
    return q.rooms.reduce(
      (acc, room) => {
        const th = this.workspace.thermal(room, q);
        acc.area += room.area || 0;
        acc.ton += th.ton;
        acc.btu += th.nominal;
        acc.cfm += th.cfm;
        return acc;
      },
      { area: 0, ton: 0, btu: 0, cfm: 0 },
    );
  });
  readonly iva = computed(() => this.workspace.settings.ivaRate);
  readonly maxDisc = computed(() => this.workspace.settings.maxDiscountPct);
  readonly validityDays = computed(() => this.workspace.settings.offerValidityDays);
  readonly canApprove = computed(() => {
    const q = this.quote();
    return this.session.role() === UserRole.Gerencia && !!q && isPendingApproval(q.estado);
  });
  readonly canSend = computed(() => {
    const q = this.quote();
    return this.session.role() === UserRole.Ventas && !!q && isPendingSend(q.estado);
  });
  readonly canFinalize = computed(() => this.session.role() === UserRole.Ingenieria);
  readonly listLabel = computed(() => {
    const role = this.session.role();
    if (role === UserRole.Ingenieria) {
      return 'Bandeja';
    }
    if (role === UserRole.Gerencia) {
      return 'Aprobación';
    }
    return 'Solicitudes';
  });

  money(n: number): string {
    return this.workspace.money(n);
  }

  hours(n: number | null): string {
    return this.workspace.hoursLabel(n);
  }

  back(): void {
    void this.router.navigateByUrl(homeListPath(this.session.role()));
  }

  clone(): void {
    const copy = this.workspace.cloneQuote(this.id());
    if (copy) {
      void this.router.navigate(['/cotizaciones', copy.id], { queryParams: { tab: 'elementos' } });
    }
  }

  setPlantilla(code: string): void {
    this.workspace.patchQuote(this.id(), { plantilla: code });
  }

  setTab(id: WorkspaceTab | string): void {
    this.tab.set(id as WorkspaceTab);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  applyTpl(): void {
    this.workspace.applyTemplate(this.id());
    this.tab.set(this.showElementsTab() ? 'elementos' : 'resumen');
  }

  closeCurrentStage(meta: number): void {
    const hours = +(meta * (0.8 + Math.random() * 0.6)).toFixed(1);
    this.workspace.closeStage(this.id(), hours);
  }

  toggleCat(cat: string): void {
    this.openCats.update((m) => ({ ...m, [cat]: !m[cat] }));
  }

  isCatOpen(cat: string): boolean {
    return this.openCats()[cat] === true;
  }

  openCatalog(cat: ProductCategory): void {
    void this.router.navigate(['/cotizaciones', this.id(), 'catalogo'], { queryParams: { cat } });
  }

  stageKind(index: number): 'done' | 'current' | 'pending' {
    const q = this.quote();
    const etapa = q?.etapa ?? 1;
    if (index < etapa) {
      return 'done';
    }
    if (index === etapa) {
      return 'current';
    }
    return 'pending';
  }

  lineSum(cat: string): number {
    const q = this.quote();
    if (!q) {
      return 0;
    }
    return q.elements.filter((e) => e.cat === cat).reduce((a, e) => a + e.qty * e.pvp, 0);
  }

  setLineQty(uid: string, value: number): void {
    this.workspace.setQty(this.id(), uid, value);
  }

  equipoName(code: string): string {
    return this.workspace.activeProducts().find((p) => p.code === code)?.name || code;
  }

  driverBar(pts: number): number {
    return Math.min(100, Math.max(0, (pts / 6) * 100));
  }

  stageStatus(stage: { done: boolean; activa: boolean }): string {
    if (stage.done) {
      return 'Cerrada';
    }
    return stage.activa ? 'En curso' : 'Pendiente';
  }

  desvioLabel(desvio: number | null): string {
    if (desvio == null) {
      return '—';
    }
    if (desvio === 0) {
      return 'en meta';
    }
    return (desvio > 0 ? '+' : '') + this.hours(Math.abs(desvio));
  }
}
