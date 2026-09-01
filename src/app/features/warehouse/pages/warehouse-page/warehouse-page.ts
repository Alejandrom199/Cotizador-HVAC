import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { QuoteStatus, ProductCategory } from '@app/domain/enums';
import { Icon } from '@app/shared/ui/icon';
import { PillBadge, PillBadgeTone } from '@app/shared/ui/pill-badge';

@Component({
  selector: 'app-warehouse-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PillBadge],
  templateUrl: './warehouse-page.html',
})
export class WarehousePage {
  readonly workspace = inject(QuoteWorkspaceService);
  readonly rows = computed(() =>
    this.workspace
      .quotes()
      .filter((q) => q.estado === QuoteStatus.Aprobada || q.estado === QuoteStatus.Enviada),
  );

  itemsOf(quoteId: string) {
    const quote = this.workspace.quote(quoteId);
    if (!quote) {
      return [];
    }
    return quote.elements
      .filter((e) => e.cat === ProductCategory.Insumos || e.cat === ProductCategory.Equipos)
      .slice(0, 5)
      .map((e) => {
        const product = this.workspace.products().find((p) => p.code === e.code);
        const stock = product?.stock ?? null;
        const ok = stock != null && stock >= e.qty;
        const label = stock === 0 ? 'Importar' : ok ? 'En bodega' : 'Compra parcial';
        const tone: PillBadgeTone = stock === 0 ? 'bad' : ok ? 'ok' : 'warn';
        return { name: e.name, req: e.qty + ' ' + e.unit, stock: stock != null ? stock + ' u.' : '—', label, tone };
      });
  }
}
