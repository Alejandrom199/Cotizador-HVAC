import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SessionService } from '@app/core/session.service';
import { STAFF_REPOSITORY } from '@app/domain/ports/tokens';
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
  private readonly staff = inject(STAFF_REPOSITORY);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly statusClass = statusClass;
  readonly pool = computed(() => this.workspace.quotes().filter((q) => !q.ingeniero));
  readonly mine = computed(() =>
    this.workspace.quotes().filter((q) => q.ingeniero === this.session.profile().name),
  );
  readonly engineers = computed(() => {
    const quotes = this.workspace.quotes();
    return this.staff.engineers().map((eng) => {
      const assigned = quotes.filter((q) => q.ingeniero === eng.name);
      const cycles = assigned.map((q) => this.workspace.cycleOf(q)).filter((h): h is number => h != null);
      const avg = cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : null;
      return {
        ...eng,
        tomadas: assigned.length,
        pct: Math.round((assigned.length / Math.max(1, quotes.length)) * 100),
        avgStr: avg != null ? this.workspace.hoursLabel(avg) : '—',
      };
    });
  });

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
