import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { CreateFlowService } from '@app/application/create-flow.service';
import { SessionService } from '@app/core/session.service';
import { UserRole, QuoteStatus } from '@app/domain/enums';
import { Quote } from '@app/domain/models/quote.model';
import { kindTag, priorityClass, statusClass } from '@app/shared/ui/presentation';
import { Icon } from '@app/shared/ui/icon';

import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

const FILTERS = [
  'Todas',
  QuoteStatus.Elaboracion,
  QuoteStatus.Calculos,
  QuoteStatus.Enviada,
  QuoteStatus.Aprobada,
  QuoteStatus.Reajuste,
  QuoteStatus.Perdida,
];

@Component({
  selector: 'app-solicitudes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './solicitudes-page.html',
})
export class SolicitudesPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Solicitudes' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly session = inject(SessionService);
  private readonly createFlow = inject(CreateFlowService);
  private readonly router = inject(Router);

  readonly filter = signal('Todas');
  readonly filters = FILTERS;
  readonly kindTag = kindTag;
  readonly statusClass = statusClass;
  readonly priorityClass = priorityClass;

  readonly rows = computed(() => {
    const current = this.filter();
    return this.workspace.quotes().filter((q) => current === 'Todas' || q.estado === current);
  });

  readonly counts = computed(() => {
    const quotes = this.workspace.quotes();
    return FILTERS.map((label) => ({
      label,
      count: label === 'Todas' ? quotes.length : quotes.filter((q) => q.estado === label).length,
    }));
  });

  readonly newLabel = computed(() =>
    this.session.role() === UserRole.Ventas ? 'Nueva solicitud' : 'Nueva cotización',
  );

  money(q: Quote): string {
    return this.workspace.money(this.workspace.pricing(q).total);
  }

  area(q: Quote): string {
    const a = this.workspace.areaOf(q);
    return a ? a.toFixed(0) + ' m²' : '—';
  }

  open(id: string): void {
    void this.router.navigate(['/cotizaciones', id]);
  }

  startNew(): void {
    this.createFlow.openNew();
  }
}
