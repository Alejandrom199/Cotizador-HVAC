import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { QuoteWorkspaceService } from '../application/quote-workspace.service';
import { CreateFlowService } from '../application/create-flow.service';
import { UserRole } from '../domain/enums/user-role.enum';
import { QuoteStatus } from '../domain/enums/quote-status.enum';
import { Icon, IconName } from '../shared/ui/icon';
import { canAccessPath, isPendingApproval, isPendingSend, navForRole } from '../core/role-access';

@Component({
  selector: 'app-shell-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Icon],
  templateUrl: './shell-layout.html',
})
export class ShellLayout {
  readonly session = inject(SessionService);
  readonly toast = inject(ToastService);
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly createFlow = inject(CreateFlowService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly showRoleMenu = signal(false);

  readonly profilesList = [
    { id: UserRole.Ingenieria, name: 'Ing. Paredes', label: 'Ingeniería', initials: 'IP', desc: 'Cálculos y diseño HVAC' },
    { id: UserRole.Ventas, name: 'M. Coello', label: 'Ventas', initials: 'MC', desc: 'Solicitudes y clientes' },
    { id: UserRole.Gerencia, name: 'D. Andrade', label: 'Gerencia', initials: 'DA', desc: 'Aprobación y analítica' },
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }

  toggleRoleMenu(): void {
    this.showRoleMenu.update((v) => !v);
  }

  selectRole(role: UserRole): void {
    this.setRole(role);
    this.showRoleMenu.set(false);
  }

  readonly nav = computed(() => navForRole(this.session.role()));

  readonly solCount = computed(
    () =>
      this.workspace.quotes().filter(
        (q) => q.estado !== QuoteStatus.Aprobada && q.estado !== QuoteStatus.Perdida && q.estado !== QuoteStatus.Enviada,
      ).length,
  );
  readonly poolCount = computed(() => this.workspace.quotes().filter((q) => !q.ingeniero).length);
  readonly approvalCount = computed(
    () => this.workspace.quotes().filter((q) => isPendingApproval(q.estado)).length,
  );
  readonly sendCount = computed(
    () => this.workspace.quotes().filter((q) => isPendingSend(q.estado)).length,
  );
  readonly iva = computed(() => this.workspace.settings.ivaRate);
  readonly profile = computed(() => this.session.profile());
  readonly initials = computed(() => this.session.initials());

  isOn(path: string): boolean {
    const url = this.url().split('?')[0];
    if (path === '/inicio') {
      return url === '/inicio' || url === '/';
    }
    return url === path || url.startsWith(path + '/');
  }

  go(event: Event, url: string): void {
    event.preventDefault();
    void this.router.navigateByUrl(url);
  }

  setRole(role: UserRole): void {
    if (this.session.role() === role) {
      return;
    }
    this.session.setRole(role);
    if (this.createFlow.adaptToRole()) {
      return;
    }
    const url = this.router.url.split('?')[0];
    if (!canAccessPath(role, url)) {
      void this.router.navigateByUrl('/inicio');
    }
  }
}
