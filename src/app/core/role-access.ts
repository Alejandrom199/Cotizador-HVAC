import { UserRole, QuoteStatus, AppRoutes } from '@app/domain/enums';
import { IconName } from '@app/shared/ui/icon';

export const NavBadgeType = {
  Solicitudes: 'sol',
  Pool: 'pool',
  Aprobaciones: 'appr',
  Enviadas: 'send',
} as const;

export type NavBadgeType = (typeof NavBadgeType)[keyof typeof NavBadgeType];

export interface NavItem {
  href: string;
  icon: IconName;
  label: string;
  badge?: NavBadgeType;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const INICIO: NavItem = { href: AppRoutes.Inicio, icon: 'home', label: 'Inicio' };

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  [UserRole.Ingenieria]: [
    {
      label: 'PRINCIPAL',
      items: [INICIO, { href: AppRoutes.Bandeja, icon: 'inbox', label: 'Bandeja técnica', badge: NavBadgeType.Pool }],
    },
    {
      label: 'CATÁLOGO',
      items: [
        { href: AppRoutes.Catalogo, icon: 'products', label: 'Productos' },
        { href: AppRoutes.Plantillas, icon: 'templates', label: 'Plantillas' },
      ],
    },
  ],
  [UserRole.Ventas]: [
    {
      label: 'PRINCIPAL',
      items: [
        INICIO,
        { href: AppRoutes.Solicitudes, icon: 'requests', label: 'Solicitudes', badge: NavBadgeType.Solicitudes },
        { href: AppRoutes.Metricas, icon: 'performance', label: 'Rendimiento' },
      ],
    },
    {
      label: 'CATÁLOGO',
      items: [
        { href: AppRoutes.Clientes, icon: 'clients', label: 'Clientes' },
        { href: AppRoutes.Plantillas, icon: 'templates', label: 'Plantillas' },
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
        { href: AppRoutes.Aprobaciones, icon: 'approve', label: 'Aprobación de solicitud', badge: NavBadgeType.Aprobaciones },
      ],
    },
  ],
};

const SHARED_PREFIXES = [AppRoutes.Inicio, AppRoutes.Cotizaciones];

export function navForRole(role: UserRole): NavGroup[] {
  return NAV_BY_ROLE[role];
}

export function homeListPath(role: UserRole): string {
  if (role === UserRole.Ingenieria) {
    return AppRoutes.Bandeja;
  }
  if (role === UserRole.Gerencia) {
    return AppRoutes.Aprobaciones;
  }
  return AppRoutes.Solicitudes;
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
  return status === QuoteStatus.Validacion || status === QuoteStatus.Reajuste;
}

export function isPendingSend(status: QuoteStatus | string): boolean {
  return status === QuoteStatus.Aprobada;
}
