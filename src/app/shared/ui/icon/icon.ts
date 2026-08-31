import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ICON_ADAPTER } from './icon-adapter';
import { IconName } from './icon-name';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<i [class]="css()" aria-hidden="true"></i>`,
  host: {
    class: 'app-icon',
    '[class.app-icon--sm]': 'size() === "sm"',
    '[class.app-icon--lg]': 'size() === "lg"',
    '[attr.title]': 'label() || null',
  },
})
export class Icon {
  private readonly adapter = inject(ICON_ADAPTER);
  readonly name = input.required<IconName>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input<string | undefined>(undefined);

  readonly css = computed(() => this.adapter.className(this.name()));
}
