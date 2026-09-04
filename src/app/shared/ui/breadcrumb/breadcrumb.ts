import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../icon';

export interface BreadcrumbItem {
  label: string;
  url?: string | any[];
  icon?: IconName;
  current?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <nav class="breadcrumb-nav" aria-label="Navegación de migas de pan">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <a [routerLink]="['/inicio']" class="breadcrumb-link breadcrumb-home" title="Inicio">
            <app-icon name="home" />
            <span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;">Inicio</span>
          </a>
          <span class="breadcrumb-sep" aria-hidden="true">/</span>
        </li>
        @for (item of items(); track $index; let last = $last) {
          <li class="breadcrumb-item" [class.active]="last || item.current">
            @if (!last && item.url) {
              <a [routerLink]="item.url" class="breadcrumb-link">
                @if (item.icon) {
                  <app-icon [name]="item.icon" class="breadcrumb-icon" />
                }
                <span>{{ item.label }}</span>
              </a>
              <span class="breadcrumb-sep" aria-hidden="true">/</span>
            } @else {
              <span class="breadcrumb-current" aria-current="page">
                @if (item.icon) {
                  <app-icon [name]="item.icon" class="breadcrumb-icon" />
                }
                <span>{{ item.label }}</span>
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumb {
  readonly items = input.required<BreadcrumbItem[]>();
}
