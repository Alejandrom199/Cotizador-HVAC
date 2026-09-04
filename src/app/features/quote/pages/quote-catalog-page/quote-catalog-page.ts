import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { ProductCategory } from '@app/domain/enums/product-category.enum';
import { stockClass } from '@app/shared/ui/presentation';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-quote-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon, Breadcrumb],
  templateUrl: './quote-catalog-page.html',
})
export class QuoteCatalogPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly stockClass = stockClass;

  readonly quoteId = toSignal(
    (this.route.parent ?? this.route).paramMap.pipe(map((p) => p.get('id') ?? '')),
    {
      initialValue:
        this.route.parent?.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id') ?? '',
    },
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const q = this.workspace.quote(this.quoteId());
    return [
      { label: 'Cotizaciones', url: '/solicitudes' },
      { label: q ? q.code : 'Cotización', url: ['/cotizaciones', this.quoteId()] },
      { label: `Catálogo de ${this.cat()}` },
    ];
  });

  readonly cat = signal<ProductCategory>(
    (this.route.snapshot.queryParamMap.get('cat') as ProductCategory) || ProductCategory.Insumos,
  );
  readonly query = signal('');
  readonly draft = signal<Record<string, number>>({});

  constructor() {
    const catFromQuery = toSignal(
      this.route.queryParamMap.pipe(
        map((p) => (p.get('cat') as ProductCategory) || ProductCategory.Insumos),
      ),
      {
        initialValue:
          (this.route.snapshot.queryParamMap.get('cat') as ProductCategory) || ProductCategory.Insumos,
      },
    );
    effect(() => {
      const cat = catFromQuery();
      this.cat.set(cat);
      const quote = this.workspace.quote(this.quoteId());
      if (!quote) {
        return;
      }
      const seed: Record<string, number> = {};
      quote.elements.filter((e) => e.cat === cat).forEach((e) => {
        seed[e.code] = e.qty;
      });
      this.draft.set(seed);
    });
  }

  readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.workspace.activeProducts().filter((p) => {
      if (p.cat !== this.cat()) {
        return false;
      }
      return !q || (p.name + p.code + p.spec + p.cat).toLowerCase().includes(q);
    });
  });

  money(n: number): string {
    return this.workspace.money(n);
  }

  qty(code: string): number {
    return this.draft()[code] ?? 0;
  }

  selected(code: string): boolean {
    return this.qty(code) > 0;
  }

  setQty(code: string, value: number): void {
    const next = Math.max(0, value || 0);
    this.draft.update((m) => ({ ...m, [code]: next }));
  }

  bump(code: string, delta: number): void {
    this.setQty(code, this.qty(code) + delta);
  }

  add(code: string): void {
    this.setQty(code, Math.max(1, this.qty(code)));
  }

  back(): void {
    void this.router.navigate(['/cotizaciones', this.quoteId()], { queryParams: { tab: 'elementos' } });
  }

  save(): void {
    const id = this.quoteId();
    const quote = this.workspace.quote(id);
    if (!quote) {
      return;
    }
    const inCat = quote.elements.filter((e) => e.cat === this.cat()).map((e) => e.code);
    const codes = new Set([...inCat, ...Object.keys(this.draft())]);
    codes.forEach((code) => this.workspace.setCatalogQty(id, code, this.draft()[code] ?? 0));
    this.workspace.quotes();
    this.back();
  }
}
