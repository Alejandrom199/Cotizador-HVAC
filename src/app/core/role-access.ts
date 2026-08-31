import { UserRole } from '@app/domain/enums/user-role.enum';
import { QuoteStatus } from '@app/domain/enums/quote-status.enum';
import { IconName } from '@app/shared/ui/icon';

export interface NavItem {
  href: string;
  icon: IconName;
  label: string;
  badge?: 'sol' | 'pool' | 'appr' | 'send';
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const INICIO: NavItem = { href: '/inicio', icon: 'home', label: 'Inicio' };

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  [UserRole.Ingenieria]: [
    {
      label: 'PRINCIPAL',
      items: [INICIO, { href: '/bandeja', icon: 'inbox', label: 'Bandeja técnica', badge: 'pool' }],
    },
    {
      label: 'CATÁLOGO',
      items: [
        { href: '/productos', icon: 'products', label: 'Productos' },
        { href: '/plantillas', icon: 'templates', label: 'Plantillas' },
      ],
    },
  ],
  [UserRole.Ventas]: [
    {
      label: 'PRINCIPAL',
      items: [
        INICIO,
        { href: '/solicitudes', icon: 'requests', label: 'Solicitudes', badge: 'sol' },
        { href: '/rendimiento', icon: 'performance', label: 'Rendimiento' },
      ],
    },
    {
      label: 'CATÁLOGO',
      items: [
        { href: '/clientes', icon: 'clients', label: 'Clientes' },
        { href: '/plantillas', icon: 'templates', label: 'Plantillas' },
      ],
    },
    {
      label: 'OPERACIÓN',
      items: [{ href: '/compras', icon: 'warehouse', label: 'Compras / Bodega' }],
    },
  ],
  [UserRole.Gerencia]: [
    {
      label: 'PRINCIPAL',
      items: [
        INICIO,
        { href: '/aprobacion', icon: 'approve', label: 'Aprobación de solicitud', badge: 'appr' },
      ],
    },
  ],
};

const SHARED_PREFIXES = ['/inicio', '/cotizaciones'];

export function navForRole(role: UserRole): NavGroup[] {
  return NAV_BY_ROLE[role];
}

export function homeListPath(role: UserRole): string {
  if (role === UserRole.Ingenieria) {
    return '/bandeja';
  }
  if (role === UserRole.Gerencia) {
    return '/aprobacion';
  }
  return '/solicitudes';
}

export function canAccessPath(role: UserRole, url: string): boolean {
  const path = url.split('?')[0];
  if (SHARED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
    return true;
  }
  return navForRole(role).some((g) =>
    g.items.some((item) => path === item.href || path.startsWith(item.href + '/')),
  );
}

export function isPendingApproval(status: QuoteStatus | string): boolean {
  return status === QuoteStatus.Validacion;
}

export function isPendingSend(status: QuoteStatus | string): boolean {
  return status === QuoteStatus.Aprobada;
}
