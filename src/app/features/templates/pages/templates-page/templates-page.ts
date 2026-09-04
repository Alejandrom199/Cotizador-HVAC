import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteWorkspaceService } from '@app/application/quote-workspace.service';
import { Icon } from '@app/shared/ui/icon';
import { Breadcrumb, BreadcrumbItem } from '@app/shared/ui/breadcrumb';

@Component({
  selector: 'app-templates-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb],
  templateUrl: './templates-page.html',
})
export class TemplatesPage {
  readonly breadcrumbs: BreadcrumbItem[] = [{ label: 'Plantillas HVAC' }];
  private readonly workspace = inject(QuoteWorkspaceService);
  private readonly router = inject(Router);
  readonly rows = computed(() => this.workspace.templates());

  create(): void {
    void this.router.navigateByUrl('/plantillas/nuevo');
  }

  edit(code: string): void {
    void this.router.navigate(['/plantillas', code]);
  }

  clone(code: string): void {
    const copy = this.workspace.cloneTemplate(code);
    if (copy) {
      void this.router.navigate(['/plantillas', copy.code]);
    }
  }

  loadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    void file.text().then((text) => {
      try {
        const loaded = this.workspace.importTemplate(JSON.parse(text));
        if (loaded) {
          void this.router.navigate(['/plantillas', loaded.code]);
        }
      } catch {
        this.workspace.importTemplate(null);
      }
    });
  }
}
