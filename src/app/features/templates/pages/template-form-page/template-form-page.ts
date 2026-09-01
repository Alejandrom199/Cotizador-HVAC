import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SystemTemplate } from '@app/domain/models/template.model';
import { ProductCategory } from '@app/domain/enums/product-category.enum';
import { Icon } from '@app/shared/ui/icon';

export interface TemplateItemView {
  code: string;
  name: string;
  spec: string;
  cat: ProductCategory;
}

@Component({
  selector: 'app-template-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon],
  templateUrl: './template-form-page.html',
})
export class TemplateFormPage {
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly ProductCategory = ProductCategory;
  readonly cats: ProductCategory[] = [
    ProductCategory.Equipos,
    ProductCategory.Insumos,
    ProductCategory.ManoDeObra,
    ProductCategory.Logistica,
  ];

  readonly isNew = !this.route.snapshot.paramMap.get('code');
  readonly codeLocked = signal(!this.isNew);

  readonly code = signal(this.route.snapshot.paramMap.get('code') ?? this.workspace.nextTemplateCode());
  readonly name = signal('');
  readonly sub = signal('');
  readonly driver = signal('');
  readonly factorBtu = signal(0);
  readonly ducto = signal(false);
  readonly items = signal<string[]>([]);

  readonly openCats = signal<Record<string, boolean>>({
    [ProductCategory.Equipos]: true,
    [ProductCategory.Insumos]: true,
    [ProductCategory.ManoDeObra]: true,
    [ProductCategory.Logistica]: true,
  });

  readonly addingCat = signal<ProductCategory | null>(null);
  readonly selectedCode = signal<string>('');

  readonly catalog = computed(() => this.workspace.activeProducts());

  constructor() {
    const existing = this.code() ? this.workspace.templates().find((t) => t.code === this.code()) : undefined;
    if (existing) {
      this.name.set(existing.name);
      this.sub.set(existing.sub);
      this.driver.set(existing.driver);
      this.factorBtu.set(existing.factorBtu);
      this.ducto.set(existing.ducto);
      this.items.set([...existing.items]);
    } else if (!this.isNew) {
      void this.router.navigateByUrl('/plantillas');
    }
  }

  toggleCat(cat: string): void {
    this.openCats.update((m) => ({ ...m, [cat]: !m[cat] }));
  }

  isCatOpen(cat: string): boolean {
    return this.openCats()[cat] === true;
  }

  itemsByCat(cat: ProductCategory): TemplateItemView[] {
    const activeProds = this.catalog();
    const used = this.items();
    const result: TemplateItemView[] = [];

    for (const code of used) {
      if (code === 'EQ-auto' && cat === ProductCategory.Equipos) {
        result.push({
          code: 'EQ-auto',
          name: 'Equipo automático (por cálculo térmico)',
          spec: 'Selección automática según BTU',
          cat: ProductCategory.Equipos,
        });
      } else {
        const prod = activeProds.find((p) => p.code === code);
        if (prod && prod.cat === cat) {
          result.push({
            code: prod.code,
            name: prod.name,
            spec: prod.spec || '',
            cat: prod.cat,
          });
        }
      }
    }

    return result;
  }

  availableByCat(cat: ProductCategory): Array<{ code: string; name: string }> {
    const used = new Set(this.items());
    const list: Array<{ code: string; name: string }> = [];
    if (cat === ProductCategory.Equipos && !used.has('EQ-auto')) {
      list.push({ code: 'EQ-auto', name: 'Equipo automático (por cálculo térmico)' });
    }
    const catProds = this.catalog()
      .filter((p) => p.cat === cat && !used.has(p.code))
      .map((p) => ({ code: p.code, name: p.name }));
    return [...list, ...catProds];
  }

  openAddForCat(cat: ProductCategory): void {
    const available = this.availableByCat(cat);
    this.addingCat.set(cat);
    this.selectedCode.set(available[0]?.code ?? '');
  }

  closeAdd(): void {
    this.addingCat.set(null);
    this.selectedCode.set('');
  }

  confirmAddItem(cat: ProductCategory): void {
    const code = this.selectedCode();
    if (!code || this.items().includes(code)) {
      return;
    }
    this.items.update((list) => [...list, code]);
    this.closeAdd();
  }

  removeItem(code: string): void {
    this.items.update((list) => list.filter((item) => item !== code));
  }

  cancel(): void {
    void this.router.navigateByUrl('/plantillas');
  }

  save(): void {
    const template: SystemTemplate = {
      code: this.code(),
      name: this.name(),
      sub: this.sub(),
      driver: this.driver(),
      factorBtu: +this.factorBtu() || 0,
      ducto: this.ducto(),
      items: [...this.items()],
    };
    const err = this.workspace.saveTemplate(template, this.isNew);
    if (!err) {
      void this.router.navigateByUrl('/plantillas');
    }
  }
}
