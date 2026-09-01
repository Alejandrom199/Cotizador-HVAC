import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PillBadgeTone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral' | 'accent';

/**
 * Componente PillBadge con dimensión fija y centrado perfecto para estados y etiquetas de disponibilidad.
 */
@Component({
  selector: 'app-pill-badge, pill-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pill-badge" [class]="'pill-badge--' + tone()">
      <ng-content>{{ label() }}</ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    .pill-badge {
      width: 112px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: 9999px;
      white-space: nowrap;
      box-sizing: border-box;
      padding: 0 8px;
      letter-spacing: 0.01em;
      line-height: 1;
    }
    .pill-badge--ok {
      background: #dcfce7;
      color: #047857;
      border: 1px solid #bbf7d0;
    }
    .pill-badge--warn {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .pill-badge--bad {
      background: #ffe4e6;
      color: #be123c;
      border: 1px solid #fecdd3;
    }
    .pill-badge--info {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }
    .pill-badge--accent {
      background: #ede9fe;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
    }
    .pill-badge--neutral {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
  `],
})
export class PillBadge {
  readonly tone = input<PillBadgeTone | string>('neutral');
  readonly label = input<string>('');
}
