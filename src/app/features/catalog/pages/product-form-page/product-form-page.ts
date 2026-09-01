import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { ProductCategory, AppRoutes } from '@app/domain/enums';
import { Product } from '@app/domain/models/product.model';
import { Icon } from '@app/shared/ui/icon';

@Component({
  selector: 'app-product-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon],
  templateUrl: './product-form-page.html',
})
export class ProductFormPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly cats = Object.values(ProductCategory);
  readonly isNew = !this.route.snapshot.paramMap.get('code');
  readonly codeLocked = signal(!this.isNew);

  readonly code = signal(this.route.snapshot.paramMap.get('code') ?? '');
  readonly cat = signal<ProductCategory>(ProductCategory.Insumos);
  readonly name = signal('');
  readonly unit = signal('Unidad');
  readonly costo = signal(0);
  readonly pvp = signal(0);
  readonly stock = signal<number | null>(0);
  readonly spec = signal('');
  readonly activo = signal(true);
  readonly imagenUrl = signal('');

  constructor() {
    const existing = this.code() ? this.workspace.products().find((p) => p.code === this.code()) : undefined;
    if (existing) {
      this.cat.set(existing.cat);
      this.name.set(existing.name);
      this.unit.set(existing.unit);
      this.costo.set(existing.costo);
      this.pvp.set(existing.pvp);
      this.stock.set(existing.stock);
      this.spec.set(existing.spec);
      this.activo.set(existing.activo);
      this.imagenUrl.set(existing.imagenUrl ?? '');
    }
  }

  onImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.imagenUrl.set('mock://' + file.name);
  }

  cancel(): void {
    void this.router.navigateByUrl(AppRoutes.Productos);
  }

  save(): void {
    const product: Product = {
      code: this.code(),
      cat: this.cat(),
      name: this.name(),
      unit: this.unit(),
      costo: +this.costo() || 0,
      pvp: +this.pvp() || 0,
      stock: this.stock(),
      spec: this.spec(),
      activo: this.activo(),
      imagenUrl: this.imagenUrl() || undefined,
    };
    const err = this.workspace.saveProduct(product, this.isNew);
    if (!err) {
      void this.router.navigateByUrl(AppRoutes.Productos);
    }
  }
}
