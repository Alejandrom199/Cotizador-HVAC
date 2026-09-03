import { Routes } from '@angular/router';
import { ShellLayout } from './layout/shell-layout';
import { roleChildGuard } from './core/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayout,
    canActivateChild: [roleChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'solicitudes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/solicitudes/pages/solicitudes-page/solicitudes-page').then(
                (m) => m.SolicitudesPage,
              ),
          },
          {
            path: 'nueva',
            loadComponent: () =>
              import('./features/solicitudes/pages/new-request-page/new-request-page').then(
                (m) => m.NewRequestPage,
              ),
          },
        ],
      },
      {
        path: 'cotizaciones/:id',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/quote/pages/quote-workspace-page/quote-workspace-page').then(
                (m) => m.QuoteWorkspacePage,
              ),
          },
          {
            path: 'catalogo',
            loadComponent: () =>
              import('./features/quote/pages/quote-catalog-page/quote-catalog-page').then(
                (m) => m.QuoteCatalogPage,
              ),
          },
        ],
      },
      {
        path: 'productos',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/catalog/pages/catalog-page/catalog-page').then((m) => m.CatalogPage),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/catalog/pages/product-form-page/product-form-page').then(
                (m) => m.ProductFormPage,
              ),
          },
          {
            path: ':code',
            loadComponent: () =>
              import('./features/catalog/pages/product-form-page/product-form-page').then(
                (m) => m.ProductFormPage,
              ),
          },
        ],
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/clients/pages/clients-page/clients-page').then((m) => m.ClientsPage),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/clients/pages/client-form-page/client-form-page').then(
                (m) => m.ClientFormPage,
              ),
          },
          {
            path: ':ruc',
            loadComponent: () =>
              import('./features/clients/pages/client-form-page/client-form-page').then(
                (m) => m.ClientFormPage,
              ),
          },
        ],
      },
      {
        path: 'plantillas',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/templates/pages/templates-page/templates-page').then((m) => m.TemplatesPage),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/templates/pages/template-form-page/template-form-page').then(
                (m) => m.TemplateFormPage,
              ),
          },
          {
            path: ':code',
            loadComponent: () =>
              import('./features/templates/pages/template-form-page/template-form-page').then(
                (m) => m.TemplateFormPage,
              ),
          },
        ],
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./features/warehouse/pages/warehouse-page/warehouse-page').then((m) => m.WarehousePage),
      },
      {
        path: 'analitica',
        loadComponent: () =>
          import('./features/analytics/pages/analytics-page/analytics-page').then((m) => m.AnalyticsPage),
      },
      {
        path: 'bandeja',
        loadComponent: () =>
          import('./features/inbox/pages/inbox-page/inbox-page').then((m) => m.InboxPage),
      },
      {
        path: 'rendimiento',
        loadComponent: () =>
          import('./features/performance/pages/performance-page/performance-page').then(
            (m) => m.PerformancePage,
          ),
      },
      {
        path: 'finalizados',
        loadComponent: () =>
          import('./features/quote/pages/finalized-page/finalized-page').then((m) => m.FinalizedPage),
      },
      {
        path: 'aprobacion',
        loadComponent: () =>
          import('./features/approval/pages/approval-page/approval-page').then((m) => m.ApprovalPage),
      },
      {
        path: 'parametros',
        loadComponent: () =>
          import('./features/settings/pages/discount-settings-page/discount-settings-page').then(
            (m) => m.DiscountSettingsPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
