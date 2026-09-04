import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { QuoteStatus } from '@app/domain/enums';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-analytics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Analítica Gerencial' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  readonly vm = computed(() => {
    const quotes = this.workspace.quotes();
    const won = quotes.filter((x) => x.estado === QuoteStatus.Aprobada);
    const lost = quotes.filter((x) => x.estado === QuoteStatus.Perdida);
    const totalVal = quotes.reduce((a, x) => a + this.workspace.pricing(x).total, 0);
    const wonVal = won.reduce((a, x) => a + this.workspace.pricing(x).total, 0);
    const conv = Math.round((won.length / Math.max(1, won.length + lost.length)) * 100);
    const avgMargin = quotes.length
      ? (quotes.reduce((a, x) => a + this.workspace.pricing(x).margen, 0) / quotes.length).toFixed(0)
      : '0';
    const stages = [
      ['Solicitudes', quotes.length, '#2b6cb0'],
      [
        'Cotizadas / enviadas',
        quotes.filter((x) => x.estado === QuoteStatus.Enviada || x.estado === QuoteStatus.Aprobada || x.estado === QuoteStatus.Reajuste).length,
        '#b5710f',
      ],
      ['En negociación', quotes.filter((x) => x.estado === QuoteStatus.Reajuste).length, '#0e6b7b'],
      ['Ganadas', won.length, '#1f9d64'],
    ] as const;
    const motivos: Record<string, number> = {};
    lost.forEach((x) => {
      const k = x.motivo || 'Sin motivo';
      motivos[k] = (motivos[k] || 0) + 1;
    });
    const tipos: Record<string, { s: number; n: number }> = {};
    quotes.forEach((x) => {
      const m = this.workspace.pricing(x).margen;
      tipos[x.tipo] ??= { s: 0, n: 0 };
      tipos[x.tipo].s += m;
      tipos[x.tipo].n += 1;
    });
    return {
      kpis: [
        { label: 'Ganado (USD)', value: this.workspace.money(wonVal), sub: won.length + ' proyectos', icon: 'money' as const },
        { label: 'Conversión', value: conv + '%', sub: won.length + ' de ' + (won.length + lost.length), icon: 'percent' as const },
        { label: 'Ticket promedio', value: this.workspace.money(totalVal / Math.max(1, quotes.length)), sub: 'por cotización', icon: 'analytics' as const },
        { label: 'Margen promedio', value: avgMargin + '%', sub: 'sobre venta', icon: 'percent' as const },
      ],
      funnel: stages.map(([label, count, color]) => ({
        label, count, color, pct: Math.round((count / Math.max(1, quotes.length)) * 100) + '%',
      })),
      motivos: Object.entries(motivos).map(([label, count]) => ({ label, count })),
      tipos: Object.entries(tipos).map(([label, v]) => ({
        label, margen: (v.s / v.n).toFixed(0) + '%', pct: Math.min(100, (v.s / v.n) * 2.2) + '%',
      })),
    };
  });
}
