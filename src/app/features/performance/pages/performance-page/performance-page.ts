import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { STAFF_REPOSITORY } from '@app/domain/ports/tokens';
import { QuoteStatus } from '@app/domain/enums/quote-status.enum';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-performance-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './performance-page.html',
})
export class PerformancePage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Rendimiento Técnico' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly staff = inject(STAFF_REPOSITORY);

  readonly vm = computed(() => {
    const quotes = this.workspace.quotes();
    const won = quotes.filter((q) => q.estado === QuoteStatus.Aprobada);
    const sellers = this.staff.sellers().map((s) => {
      const mine = quotes.filter((q) => q.vendedor === s.name);
      const wonMine = mine.filter((q) => q.estado === QuoteStatus.Aprobada);
      const val = wonMine.reduce((a, q) => a + this.workspace.pricing(q).total, 0);
      return { ...s, n: mine.length, won: wonMine.length, val: this.workspace.money(val) };
    });
    const engineers = this.staff.engineers().map((e) => {
      const mine = quotes.filter((q) => q.ingeniero === e.name);
      let ok = 0;
      let ev = 0;
      mine.forEach((q) => {
        const t = this.workspace.cycleOf(q);
        if (t == null) {
          return;
        }
        ev += 1;
        if (t <= this.workspace.complexity(q).slaHours) {
          ok += 1;
        }
      });
      return { ...e, n: mine.length, sla: ev ? Math.round((ok / ev) * 100) + '%' : '—' };
    });
    const etapas = this.workspace.settings.stageWeights.map((stage, i) => {
      const vals = quotes.map((q) => (q.hrs || [])[i]).filter((h): h is number => h != null);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { name: stage.k, avg: this.workspace.hoursLabel(avg || null) };
    });
    return {
      kpis: [
        { label: 'Ciclo promedio', value: this.workspace.averageCycleLabel(), sub: 'de solicitud a cotización', icon: 'time' as const },
        { label: 'Solicitudes sin tomar', value: String(quotes.filter((q) => !q.ingeniero).length), sub: 'en la bolsa', icon: 'inbox' as const },
        { label: 'Cumplimiento SLA', value: this.workspace.slaCompliancePct() + '%', sub: 'dentro del plazo', icon: 'check' as const },
        { label: 'Ganadas', value: String(won.length), sub: 'proyectos', icon: 'done' as const },
      ],
      sellers,
      engineers,
      etapas,
    };
  });
}
