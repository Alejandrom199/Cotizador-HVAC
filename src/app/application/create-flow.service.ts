import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '@app/core/session.service';
import { homeListPath } from '@app/core/role-access';
import { Quote } from '@app/domain/models/quote.model';
import { QuoteWorkspaceService } from './quote-workspace.service';

/**
 * Alta de ventas. Ingeniería no crea: toma la solicitud en bandeja y la llena.
 */
@Injectable({ providedIn: 'root' })
export class CreateFlowService {
  private readonly session = inject(SessionService);
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly router = inject(Router);

  isDraftQuote(quote: Quote | undefined): boolean {
    return quote?.name === 'Nueva cotización' && quote.cliente === '—';
  }

  openNew(): void {
    if (this.session.isSales()) {
      void this.router.navigateByUrl('/solicitudes/nueva');
      return;
    }
    void this.router.navigateByUrl(homeListPath(this.session.role()));
  }

  /**
   * Si está en el alta de ventas, redirige al listado del nuevo rol.
   * @returns true si ya navegó
   */
  adaptToRole(): boolean {
    const url = this.currentPath();
    if (url === '/solicitudes/nueva' || this.draftIdFromUrl()) {
      this.openNew();
      return true;
    }
    return false;
  }

  private currentPath(): string {
    return this.router.url.split('?')[0];
  }

  private draftIdFromUrl(): string | null {
    const match = this.currentPath().match(/^\/cotizaciones\/([^/]+)$/);
    if (!match) {
      return null;
    }
    return this.isDraftQuote(this.workspace.quote(match[1])) ? match[1] : null;
  }
}
