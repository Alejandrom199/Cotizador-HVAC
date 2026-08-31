/** Rol de sesión. En mock se conmuta desde el header; el hueco de Auth queda igual. */
export const UserRole = {
  Ingenieria: 'ingenieria',
  Ventas: 'ventas',
  Gerencia: 'gerencia',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
