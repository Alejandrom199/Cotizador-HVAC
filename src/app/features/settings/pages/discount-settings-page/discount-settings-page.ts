import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { DiscountCategory } from '@app/domain/enums';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

interface EditableParam {
  category: DiscountCategory;
  name: string;
  maxDiscountPct: number;
  maxSurchargePct: number;
  description: string;
}

@Component({
  selector: 'app-discount-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon, Breadcrumb],
  templateUrl: './discount-settings-page.html',
})
export class DiscountSettingsPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Parámetros & Descuentos' }];
  readonly workspace = inject(QuoteWorkspaceService);

  readonly params = signal<EditableParam[]>(
    this.workspace.discountParams().map((p) => ({ ...p })),
  );

  save(): void {
    for (const p of this.params()) {
      this.workspace.updateDiscountParam(p.category, p.maxDiscountPct, p.maxSurchargePct);
    }
  }

  resetDefaults(): void {
    const defaults: Record<string, { maxDiscountPct: number; maxSurchargePct: number }> = {
      [DiscountCategory.Insumos]: { maxDiscountPct: 30, maxSurchargePct: 40 },
      [DiscountCategory.Equipos]: { maxDiscountPct: 15, maxSurchargePct: 30 },
      [DiscountCategory.ManoDeObra]: { maxDiscountPct: 35, maxSurchargePct: 50 },
    };
    this.params.update((list) =>
      list.map((item) => ({
        ...item,
        maxDiscountPct: defaults[item.category]?.maxDiscountPct ?? 25,
        maxSurchargePct: defaults[item.category]?.maxSurchargePct ?? 35,
      })),
    );
    this.save();
  }
}
