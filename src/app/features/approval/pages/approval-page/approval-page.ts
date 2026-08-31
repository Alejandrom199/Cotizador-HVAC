import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { isPendingApproval } from '@app/core/role-access';
import { Quote } from '@app/domain/models/quote.model';
import { statusClass } from '@app/shared/ui/presentation';
import { Icon } from '@app/shared/ui/icon';

@Component({
  selector: 'app-approval-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './approval-page.html',
})
export class ApprovalPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly router = inject(Router);
  readonly statusClass = statusClass;

  readonly rows = computed(() => this.workspace.quotes().filter((q) => isPendingApproval(q.estado)));

  money(q: Quote): string {
    return this.workspace.money(this.workspace.pricing(q).total);
  }

  open(id: string): void {
    void this.router.navigate(['/cotizaciones', id], { queryParams: { tab: 'informe' } });
  }

  approve(id: string): void {
    this.workspace.approveQuote(id);
  }
}
