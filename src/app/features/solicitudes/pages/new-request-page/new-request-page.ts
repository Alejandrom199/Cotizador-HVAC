import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { PrintService } from '@app/application/print.service';
import { ToastService } from '@app/core/toast.service';
import { QuoteKind, InstallationSubtype, MaintenanceSubtype, Priority, ClientType } from '@app/domain/enums';
import { Client } from '@app/domain/models/client.model';
import { Icon, IconName } from '@app/shared/ui/icon';

interface DraftFile {
  id: string;
  name: string;
  size: number;
  sizeStr: string;
  ext: string;
}

@Component({
  selector: 'app-new-request-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon],
  templateUrl: './new-request-page.html',
})
export class NewRequestPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly printer = inject(PrintService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly ruc = signal('1791234567001');
  readonly cliente = signal('Afecor Cía. Ltda.');
  readonly selectedRuc = signal<string | null>('1791234567001');
  readonly proyecto = signal('Cotización de Climatización Afecor');
  readonly tipo = signal<QuoteKind>(QuoteKind.Instalacion);
  readonly subtipo = signal<string>(InstallationSubtype.Materiales);
  readonly prio = signal<Priority>(Priority.Media);
  readonly observaciones = signal(
    'Oficinas administrativas planta Quito. Se requieren 4 cassettes 36k BTU en open space y 2 splits 24k en salas de reunión.',
  );
  readonly files = signal<DraftFile[]>([
    { id: 'mf1', name: 'Plano_arquitectonico_Afecor.pdf', size: 2457600, sizeStr: '2.4 MB', ext: 'PDF' },
    { id: 'mf2', name: 'Layout_oficinas_planta1.dwg', size: 1843200, sizeStr: '1.8 MB', ext: 'DWG' },
  ]);
  readonly showNewCli = signal(false);
  readonly ncRuc = signal('');
  readonly ncName = signal('');
  readonly ncMail = signal('');
  readonly ncDir = signal('');
  readonly ncCity = signal('Quito');
  readonly ncPhone = signal('+593 ');
  readonly QuoteKind = QuoteKind;
  readonly Priority = Priority;
  readonly installOptions: Array<{ id: InstallationSubtype; label: string; icon: IconName }> = [
    { id: InstallationSubtype.Materiales, label: 'Materiales', icon: 'hexagon' },
    { id: InstallationSubtype.Equipos, label: 'Equipos', icon: 'products' },
    { id: InstallationSubtype.Completa, label: 'Completa (Materiales + Equipos)', icon: 'link' },
  ];
  readonly maintainOptions: Array<{ id: MaintenanceSubtype; label: string; icon: IconName }> = [
    { id: MaintenanceSubtype.Preventivo, label: 'Preventivo', icon: 'time' },
    { id: MaintenanceSubtype.Correctivo, label: 'Correctivo', icon: 'maintain' },
    { id: MaintenanceSubtype.Integral, label: 'Integral', icon: 'link' },
  ];
  readonly currentOptions = computed(() =>
    this.tipo() === QuoteKind.Instalacion ? this.installOptions : this.maintainOptions,
  );

  readonly hits = computed(() => {
    const q = this.cliente().trim().toLowerCase();
    if (this.selectedRuc() || q.length < 2) {
      return [];
    }
    return this.workspace.clients().filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  });

  readonly rucOk = computed(() => this.ruc().length === 13 && !!this.selectedRuc());
  readonly noHit = computed(
    () =>
      !this.selectedRuc() &&
      ((this.cliente().trim().length >= 2 && this.hits().length === 0) ||
        (this.ruc().length === 13 && !this.selectedRuc())),
  );

  onRuc(value: string): void {
    const ruc = value.replace(/\D/g, '').slice(0, 13);
    const hit = this.workspace.findClient(ruc);
    this.ruc.set(ruc);
    if (hit) {
      this.selectedRuc.set(hit.ruc);
      this.cliente.set(hit.name);
      this.proyecto.set(this.workspace.suggestProject(hit.name, this.tipo()));
    } else {
      this.selectedRuc.set(null);
    }
  }

  onCliente(value: string): void {
    this.cliente.set(value);
    const hit = this.workspace.clients().find((c) => c.name.toLowerCase() === value.trim().toLowerCase());
    if (hit) {
      this.pick(hit);
    } else {
      this.selectedRuc.set(null);
    }
  }

  pick(client: Client): void {
    this.ruc.set(client.ruc);
    this.cliente.set(client.name);
    this.selectedRuc.set(client.ruc);
    this.proyecto.set(this.workspace.suggestProject(client.name, this.tipo()));
  }

  setTipo(tipo: QuoteKind): void {
    this.tipo.set(tipo);
    if (tipo === QuoteKind.Mantenimiento) {
      this.files.set([]);
    }
    this.subtipo.set(
      tipo === QuoteKind.Mantenimiento
        ? 'Correctivo'
        : this.subtipo() === 'Correctivo' || this.subtipo() === 'Preventivo'
          ? InstallationSubtype.Materiales
          : this.subtipo(),
    );
    this.proyecto.set(this.workspace.suggestProject(this.cliente(), tipo));
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.tipo() === QuoteKind.Mantenimiento) {
      this.toast.show('Los servicios de mantenimiento no requieren planos');
      input.value = '';
      return;
    }
    const incoming = [...(input.files ?? [])];
    const add: DraftFile[] = [];
    incoming.forEach((file) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!['pdf', 'dwg', 'jpg', 'jpeg', 'png'].includes(ext)) {
        this.toast.show('Formato no permitido: ' + file.name);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.toast.show('Máximo 10 MB: ' + file.name);
        return;
      }
      add.push({
        id: Math.random().toString(36).slice(2, 8),
        name: file.name,
        size: file.size,
        sizeStr: this.formatFileSize(file.size),
        ext: ext.toUpperCase(),
      });
    });
    if (add.length) {
      this.files.update((list) => [...list, ...add]);
    }
    input.value = '';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) {
      return '0 KB';
    }
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return (Math.round(mb * 10) / 10).toFixed(1).replace(/\.0$/, '') + ' MB';
    }
    const kb = bytes / 1024;
    return kb.toFixed(0) + ' KB';
  }

  saveClient(): void {
    const ruc = this.ncRuc().replace(/\D/g, '');
    const err = this.workspace.registerClient({
      ruc,
      name: this.ncName().trim(),
      city: this.ncCity().trim() || '—',
      direccion: this.ncDir().trim() || this.ncCity().trim() || '—',
      mail: this.ncMail().trim() || '—',
      phone: this.ncPhone().trim() || '—',
      type: ClientType.Juridica,
    });
    if (err) {
      return;
    }
    this.ruc.set(ruc);
    this.cliente.set(this.ncName().trim());
    this.selectedRuc.set(ruc);
    this.showNewCli.set(false);
  }

  submit(): void {
    if (!this.selectedRuc()) {
      this.showNewCli.set(true);
      this.ncRuc.set(this.ruc());
      this.ncName.set(this.cliente());
      this.toast.show('El cliente no está registrado. Complétalo para continuar.');
      return;
    }
    const isMaint = this.tipo() === QuoteKind.Mantenimiento;
    const created = this.workspace.createFromRequest({
      ruc: this.selectedRuc()!,
      cliente: this.cliente(),
      proyecto: this.proyecto(),
      tipo: this.tipo(),
      subtipo: this.subtipo(),
      prio: this.prio(),
      observaciones: this.observaciones(),
      adjuntos: isMaint ? [] : this.files().map((f) => ({ name: f.name, size: f.size, ext: f.ext })),
    });
    if (created) {
      void this.router.navigateByUrl('/solicitudes');
    }
  }

  exportPdf(): void {
    const isMaint = this.tipo() === QuoteKind.Mantenimiento;
    const ok = this.printer.printRequest({
      cliente: this.cliente(),
      ruc: this.ruc(),
      proyecto: this.proyecto(),
      tipo: this.tipo() + (this.tipo() === QuoteKind.Instalacion ? ' - ' + this.subtipo() : ''),
      prio: this.prio(),
      observaciones: this.observaciones(),
      files: isMaint ? [] : this.files(),
      ivaRate: this.workspace.settings.ivaRate,
    });
    this.toast.show(ok ? 'Generando PDF de la solicitud...' : 'Permite ventanas emergentes para exportar');
  }

  back(): void {
    void this.router.navigateByUrl('/solicitudes');
  }
}
