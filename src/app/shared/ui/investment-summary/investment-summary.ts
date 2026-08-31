import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PricingResult } from '@app/domain/models/results.model';
import { formatMoney } from '@app/domain/calculators/quote-metrics';

@Component({
  selector: 'app-investment-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './investment-summary.html',
  styleUrl: './investment-summary.scss',
})
export class InvestmentSummary {
  readonly pricing = input.required<PricingResult>();
  readonly iva = input.required<number>();
  readonly margenMin = input(0);

  money(n: number): string {
    return formatMoney(n);
  }

  marginBar(margen: number): number {
    return Math.min(100, Math.max(0, margen));
  }
}
