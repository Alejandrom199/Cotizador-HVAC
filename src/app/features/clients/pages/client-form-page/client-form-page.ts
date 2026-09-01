import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { Client } from '@app/domain/models/client.model';
import { ClientType, AppRoutes } from '@app/domain/enums';
import { Icon } from '@app/shared/ui/icon';

@Component({
  selector: 'app-client-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon],
  templateUrl: './client-form-page.html',
})
export class ClientFormPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isNew = !this.route.snapshot.paramMap.get('ruc');
  readonly rucLocked = signal(!this.isNew);
  readonly ruc = signal(this.route.snapshot.paramMap.get('ruc') ?? '');
  readonly name = signal('');
  readonly mail = signal('');
  readonly phone = signal('+593 ');
  readonly city = signal('Quito');
  readonly direccion = signal('');
  readonly type = signal<ClientType>(ClientType.Juridica);

  constructor() {
    const existing = this.ruc() ? this.workspace.findClient(this.ruc()) : undefined;
    if (existing) {
      this.name.set(existing.name);
      this.mail.set(existing.mail);
      this.phone.set(existing.phone);
      this.city.set(existing.city);
      this.direccion.set(existing.direccion);
      this.type.set(existing.type);
    }
  }

  cancel(): void {
    void this.router.navigateByUrl(AppRoutes.Clientes);
  }

  save(): void {
    const client: Client = {
      ruc: this.ruc().replace(/\D/g, ''),
      name: this.name().trim(),
      mail: this.mail().trim(),
      phone: this.phone().trim() || '—',
      city: this.city().trim() || '—',
      direccion: this.direccion().trim() || this.city().trim() || '—',
      type: this.type(),
    };
    const err = this.isNew ? this.workspace.registerClient(client) : this.workspace.updateClient(client);
    if (!err) {
      void this.router.navigateByUrl(AppRoutes.Clientes);
    }
  }
}
