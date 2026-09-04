import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { WorkspaceTab } from '@app/domain/enums';
import { Icon } from '@app/shared/ui/icon';
import { statusClass } from '@app/shared/ui/presentation';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-inbox-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './inbox-page.html',
})
export class InboxPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Bandeja Técnica de Ingeniería' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly statusClass = statusClass;
  readonly pool = computed(() => this.workspace.quotes().filter((q) => !q.ingeniero));
  readonly mine = computed(() =>
    this.workspace.quotes().filter((q) => q.ingeniero === this.session.profile().name),
  );

  open(id: string): void {
    void this.router.navigate(['/cotizaciones', id], { queryParams: { tab: WorkspaceTab.Resumen } });
  }

  take(id: string): void {
    this.workspace.takeRequest(id);
    void this.router.navigate(['/cotizaciones', id], { queryParams: { tab: WorkspaceTab.Calculo } });
  }

  openMine(id: string): void {
    void this.router.navigate(['/cotizaciones', id], { queryParams: { tab: WorkspaceTab.Calculo } });
  }

  sla(id: string): string {
    const q = this.workspace.quote(id);
    return q ? this.workspace.hoursLabel(this.workspace.complexity(q).slaHours) : '—';
  }

  tier(id: string): string {
    const q = this.workspace.quote(id);
    return q ? this.workspace.complexity(q).tier : '';
  }
}
