import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { Icon } from '@app/shared/ui/icon';

@Component({
  selector: 'app-clients-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './clients-page.html',
})
export class ClientsPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly router = inject(Router);
  readonly query = signal('');
  readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.workspace.clients().filter((c) => !q || (c.name + c.ruc + c.city + c.mail).toLowerCase().includes(q));
  });

  create(): void {
    void this.router.navigateByUrl('/clientes/nuevo');
  }

  edit(ruc: string): void {
    void this.router.navigate(['/clientes', ruc]);
  }
}
