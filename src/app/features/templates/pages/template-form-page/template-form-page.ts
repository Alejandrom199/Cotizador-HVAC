import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { SystemTemplate } from '@app/domain/models/template.model';
import { Icon } from '@app/shared/ui/icon';

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

  readonly isNew = !this.route.snapshot.paramMap.get('code');
  readonly codeLocked = signal(!this.isNew);

  readonly code = signal(this.route.snapshot.paramMap.get('code') ?? this.workspace.nextTemplateCode());
  readonly name = signal('');
  readonly sub = signal('');
  readonly driver = signal('');
  readonly factorBtu = signal(0);
  readonly ducto = signal(false);
  readonly items = signal<string[]>([]);
  readonly pickCode = signal('');

  readonly catalog = computed(() => this.workspace.activeProducts());
  readonly available = computed(() => {
    const used = new Set(this.items());
    const extras = used.has('EQ-auto') ? [] : [{ code: 'EQ-auto', name: 'Equipo automático (por cálculo)' }];
    return [
      ...extras,
      ...this.catalog()
        .filter((p) => !used.has(p.code))
        .map((p) => ({ code: p.code, name: p.name })),
    ];
  });

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
    const first = this.available()[0];
    if (first) {
      this.pickCode.set(first.code);
    }
  }

  itemLabel(code: string): string {
    if (code === 'EQ-auto') {
      return 'Equipo automático (por cálculo)';
    }
    return this.catalog().find((p) => p.code === code)?.name || code;
  }

  addItem(): void {
    const code = this.pickCode();
    if (!code || this.items().includes(code)) {
      return;
    }
    this.items.update((list) => [...list, code]);
    this.pickCode.set(this.available().find((p) => p.code !== code)?.code ?? '');
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
