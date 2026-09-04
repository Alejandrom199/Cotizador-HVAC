import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { QuoteStatus, WorkspaceTab } from '@app/domain/enums';
import { Quote } from '@app/domain/models/quote.model';
import { statusClass } from '@app/shared/ui/presentation';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-finalized-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './finalized-page.html',
})
export class FinalizedPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Histórico de Cotizaciones' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly router = inject(Router);
  readonly statusClass = statusClass;
  readonly rows = computed(() =>
    this.workspace
      .quotes()
      .filter((q) => q.estado === QuoteStatus.Enviada || q.estado === QuoteStatus.Aprobada),
  );

  money(q: Quote): string {
    return this.workspace.money(this.workspace.pricing(q).total);
  }

  mail(q: Quote): string {
    return this.workspace.findClient(q.ruc)?.mail ?? '—';
  }

  open(id: string): void {
    void this.router.navigate(['/cotizaciones', id], { queryParams: { tab: WorkspaceTab.Informe } });
  }

  send(id: string): void {
    this.workspace.sendQuote(id);
  }
}
