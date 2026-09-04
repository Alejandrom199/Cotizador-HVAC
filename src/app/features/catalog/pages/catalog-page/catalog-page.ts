import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { ProductCategory } from '@app/domain/enums/product-category.enum';
import { stockClass } from '@app/shared/ui/presentation';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './catalog-page.html',
})
export class CatalogPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Catálogo de Productos' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly router = inject(Router);
  readonly filter = signal('Todas');
  readonly query = signal('');
  readonly stockClass = stockClass;
  readonly cats = ['Todas', ...Object.values(ProductCategory)];
  readonly rows = computed(() => {
    const f = this.filter();
    const q = this.query().trim().toLowerCase();
    return this.workspace.products().filter((p) => {
      const catOk = f === 'Todas' || p.cat === f;
      const text = (p.name + p.code + p.spec).toLowerCase();
      return catOk && (!q || text.includes(q));
    });
  });
  readonly counts = computed(() => {
    const products = this.workspace.products();
    return this.cats.map((c) => ({
      label: c,
      count: c === 'Todas' ? products.length : products.filter((p) => p.cat === c).length,
    }));
  });

  money(n: number): string {
    return this.workspace.money(n);
  }

  create(): void {
    void this.router.navigateByUrl('/productos/nuevo');
  }

  edit(code: string): void {
    void this.router.navigate(['/productos', code]);
  }

  toggle(code: string, activo: boolean): void {
    this.workspace.setProductActive(code, !activo);
  }
}
