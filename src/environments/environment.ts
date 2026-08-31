/**
 * Configuración de runtime. El front habla con puertos; `useMocks` elige el adaptador.
 * Cuando exista API, `useMocks` pasa a false y se registra Http*Repository.
 */
export const environment = {
  production: true,
  useMocks: true,
  apiUrl: '/api',
};
