export const AppRoutes = {
  Inicio: '/inicio',
  Solicitudes: '/solicitudes',
  NuevaSolicitud: '/solicitudes/nueva',
  Cotizaciones: '/cotizaciones',
  Bandeja: '/bandeja',
  Aprobacion: '/aprobacion',
  Aprobaciones: '/aprobacion',
  Productos: '/productos',
  Catalogo: '/productos',
  NuevoProducto: '/productos/nuevo',
  Clientes: '/clientes',
  NuevoCliente: '/clientes/nuevo',
  Plantillas: '/plantillas',
  NuevaPlantilla: '/plantillas/nueva',
  Rendimiento: '/rendimiento',
  Metricas: '/rendimiento',
  Compras: '/compras',
  Parametros: '/parametros',
} as const;

export type AppRoutes = (typeof AppRoutes)[keyof typeof AppRoutes];
