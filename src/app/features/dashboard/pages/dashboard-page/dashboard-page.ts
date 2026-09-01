import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { CreateFlowService } from '@app/application/create-flow.service';
import { homeListPath, isPendingApproval, isPendingSend } from '@app/core/role-access';
import { SessionService } from '@app/core/session.service';
import { UserRole } from '@app/domain/enums/user-role.enum';
import { QuoteStatus } from '@app/domain/enums/quote-status.enum';
import { Quote } from '@app/domain/models/quote.model';
import { kindTag, statusClass } from '@app/shared/ui/presentation';
import { Icon, IconName } from '@app/shared/ui/icon';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly session = inject(SessionService);
  private readonly createFlow = inject(CreateFlowService);
  private readonly router = inject(Router);

  readonly kindTag = kindTag;
  readonly statusClass = statusClass;

  readonly vm = computed(() => this.build());

  open(id: string): void {
    void this.router.navigate(['/cotizaciones', id]);
  }

  openList(event: Event): void {
    event.preventDefault();
    void this.router.navigateByUrl(homeListPath(this.session.role()));
  }

  startNew(): void {
    this.createFlow.openNew();
  }

  private build() {
    const role = this.session.role();
    const quotes = this.workspace.quotes();
    const won = quotes.filter((q) => q.estado === QuoteStatus.Aprobada);
    const lost = quotes.filter((q) => q.estado === QuoteStatus.Perdida);
    const active = quotes.filter((q) => q.estado !== QuoteStatus.Perdida);
    const totalVal = quotes.reduce((a, q) => a + this.workspace.pricing(q).total, 0);
    const conv = Math.round((won.length / Math.max(1, won.length + lost.length)) * 100);
    const avgMargin = quotes.length
      ? (quotes.reduce((a, q) => a + this.workspace.pricing(q).margen, 0) / quotes.length).toFixed(0)
      : '0';
    const money = (n: number) => this.workspace.money(n);

    let kpis: Array<{ label: string; value: string | number; sub: string; chip?: string; icon: IconName }>;
    let greetKicker = '';
    let greetTitle = '';
    let dashListTitle = '';
    let sidePanelTitle = '';
    let insightKicker = '';
    let insightBody = '';
    let dashQuotes: Quote[] = [];
    let funnel: Array<{ label: string; count: number; pct: string; color: string }> = [];

    if (role === UserRole.Gerencia) {
      greetKicker = 'Gerencia';
      greetTitle = 'Inicio';
      kpis = [
        { label: 'Por aprobar', value: quotes.filter((x) => isPendingApproval(x.estado)).length, sub: 'finalizadas por ingeniería', icon: 'approve' },
        { label: 'Tasa de conversión', value: conv + '%', sub: won.length + ' ganadas / ' + lost.length + ' perdidas', chip: 'línea base', icon: 'percent' },
        { label: 'Ticket promedio', value: money(totalVal / Math.max(1, quotes.length)), sub: 'por cotización', icon: 'money' },
        { label: 'Margen promedio', value: avgMargin + '%', sub: 'sobre venta - meta 25%', icon: 'percent' },
      ];
      dashListTitle = 'Pendientes de aprobación';
      sidePanelTitle = 'Motivo de pérdida';
      insightKicker = 'Flujo';
      insightBody = 'Ventas crea la solicitud, Ingeniería la llena y Gerencia aprueba. Después Ventas envía la cotización al cliente.';
      dashQuotes = quotes.filter((x) => isPendingApproval(x.estado)).slice(0, 5);
      const motivos: Record<string, number> = {};
      lost.forEach((x) => {
        const key = x.motivo || 'Sin motivo';
        motivos[key] = (motivos[key] || 0) + 1;
      });
      const mx = Math.max(1, ...Object.values(motivos), 1);
      funnel = Object.entries(motivos).map(([k, v]) => ({
        label: k, count: v, pct: Math.round((v / mx) * 100) + '%', color: '#0f4c81',
      }));
      if (!funnel.length) {
        funnel = [{ label: 'Sin pérdidas', count: 0, pct: '0%', color: '#8d8d8d' }];
      }
    } else if (role === UserRole.Ventas) {
      greetKicker = 'Ventas';
      greetTitle = 'Inicio';
      kpis = [
        { label: 'Solicitudes activas', value: active.length, sub: 'en curso', icon: 'requests' },
        { label: 'Por enviar', value: quotes.filter((x) => isPendingSend(x.estado)).length, sub: 'aprobadas por gerencia', icon: 'send' },
        { label: 'Enviadas', value: quotes.filter((x) => x.estado === QuoteStatus.Enviada).length, sub: 'esperan respuesta', icon: 'send' },
        { label: 'En reajuste', value: quotes.filter((x) => x.estado === QuoteStatus.Reajuste).length, sub: 'negociación', icon: 'adjust' },
      ];
      dashListTitle = 'Mis solicitudes';
      sidePanelTitle = 'Embudo comercial';
      insightKicker = 'Trazabilidad';
      insightBody = 'Usted crea la solicitud. Ingeniería arma el cálculo, Gerencia aprueba y usted envía la cotización al cliente.';
      dashQuotes = quotes.slice(0, 5);
      const stages: Array<[string, (q: Quote) => boolean, string]> = [
        ['Solicitud / Elaboración', (x) => ['Solicitud', 'Elaboración'].includes(x.estado), '#0f4c81'],
        ['Cálculos / Validación', (x) => ['Cálculos', 'Validación'].includes(x.estado), '#0f4c81'],
        ['Enviada', (x) => x.estado === QuoteStatus.Enviada, '#0f4c81'],
        ['Aprobada', (x) => x.estado === QuoteStatus.Aprobada, '#0f4c81'],
      ];
      funnel = stages.map(([label, pred, color]) => {
        const c = quotes.filter(pred).length;
        return { label, count: c, pct: Math.round((c / Math.max(1, quotes.length)) * 100) + '%', color };
      });
    } else {
      greetKicker = 'Ingeniería';
      greetTitle = 'Inicio';
      const asignadas = quotes.filter((x) => !['Aprobada', 'Perdida', 'Enviada'].includes(x.estado));
      kpis = [
        { label: 'Asignadas a mí', value: asignadas.length, sub: 'pendientes', icon: 'inbox' },
        { label: 'En cálculo', value: quotes.filter((x) => x.estado === QuoteStatus.Calculos).length, sub: 'motor HVAC', icon: 'calc' },
        { label: 'Ahorro de tiempo', value: '≈92%', sub: 'vs. cálculo manual', icon: 'time' },
        { label: 'Plantillas', value: this.workspace.templates().length, sub: 'paramétricas listas', icon: 'templates' },
      ];
      dashListTitle = 'Proyectos en mi bandeja';
      sidePanelTitle = 'Avance por etapa';
      insightKicker = 'Cálculo paramétrico';
      insightBody = 'Tome la solicitud en bandeja, complete el cálculo y finalice. Gerencia aprueba y Ventas envía al cliente.';
      dashQuotes = asignadas.slice(0, 5);
      const stages: Array<[string, number, string]> = [
        ['Revisión', 1, '#0f4c81'],
        ['Planos', 2, '#0f4c81'],
        ['Cálculos', 3, '#0f4c81'],
        ['Cotización', 4, '#0f4c81'],
      ];
      funnel = stages.map(([label, etapa, color]) => {
        const c = quotes.filter((x) => x.etapa >= etapa).length;
        return { label, count: c, pct: Math.round((c / Math.max(1, quotes.length)) * 100) + '%', color };
      });
    }

    return {
      role,
      kpis,
      greetKicker,
      greetTitle,
      dashListTitle,
      sidePanelTitle,
      insightKicker,
      insightBody,
      dashQuotes,
      funnel,
      newQuoteLabel: role === UserRole.Ventas ? 'Nueva solicitud' : '',
      listHref: homeListPath(role),
      money: (q: Quote) => money(this.workspace.pricing(q).total),
      area: (q: Quote) => {
        const a = this.workspace.areaOf(q);
        return a ? a.toFixed(0) + ' m²' : '—';
      },
    };
  }
}
