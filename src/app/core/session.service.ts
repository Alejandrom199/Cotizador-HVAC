import { Injectable, signal } from '@angular/core';
import { UserRole } from '../domain/enums/user-role.enum';

export interface SessionProfile {
  role: UserRole;
  name: string;
  label: string;
}

const PROFILES: Record<UserRole, SessionProfile> = {
  [UserRole.Ingenieria]: { role: UserRole.Ingenieria, name: 'Ing. Paredes', label: 'Ingeniería' },
  [UserRole.Ventas]: { role: UserRole.Ventas, name: 'M. Coello', label: 'Ventas' },
  [UserRole.Gerencia]: { role: UserRole.Gerencia, name: 'D. Andrade', label: 'Gerencia' },
};

const ROLE_STORAGE_KEY = 'emasesor.hvac.role';

function readStoredRole(): UserRole {
  try {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === UserRole.Ventas || saved === UserRole.Gerencia || saved === UserRole.Ingenieria) {
      return saved;
    }
  } catch {
    /* storage no disponible */
  }
  return UserRole.Ingenieria;
}

/**
 * Sesión mock. El hueco de AuthService de Front-core: mañana JWT, hoy switch de rol.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly role = signal<UserRole>(readStoredRole());

  profile(): SessionProfile {
    return PROFILES[this.role()];
  }

  initials(): string {
    return this.profile()
      .name.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2);
  }

  isSales(): boolean {
    return this.role() === UserRole.Ventas;
  }

  setRole(role: UserRole): void {
    this.role.set(role);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch {
      /* storage no disponible */
    }
  }
}
