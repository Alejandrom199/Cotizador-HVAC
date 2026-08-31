import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { Icon } from '@app/shared/ui/icon';
import { statusClass } from '@app/shared/ui/presentation';

@Component({
  selector: 'app-inbox-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './inbox-page.html',
})
export class InboxPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly statusClass = statusClass;
  readonly pool = computed(() => this.workspace.quotes().filter((q) => !q.ingeniero));
  readonly mine = computed(() =>
    this.workspace.quotes().filter((q) => q.ingeniero === this.session.profile().name),
  );

  open(id: string): void {
    void this.router.navigate(['/cotizaciones', id], { queryParams: { tab: 'tiempos' } });
  }

  take(id: string): void {
    this.workspace.takeRequest(id);
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
