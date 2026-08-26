import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ArenaAlert, ArenaSelect, ArenaSelectOption } from '@dravensoft/arena-angular';
import { Company } from '../../domain/businesses.model';
import { Promotions } from '../../domain/promotions';
import { Promotion, usesLeft } from '../../domain/promotions.model';
import { fecha, porcentaje } from '../../domain/format';
import { discountLabel } from '../discount-label';

@Component({
  selector: 'app-promotion-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaSelect, ArenaAlert],
  templateUrl: './promotion-picker.html',
})
export class PromotionPicker {
  private readonly promotions = inject(Promotions);

  readonly company = input.required<Company>();

  protected readonly picked = signal('');

  protected readonly offers = computed(() =>
    this.promotions.liveOfCompany(this.company().id).filter((one) => one.discount !== undefined),
  );

  protected readonly options = computed<readonly ArenaSelectOption[]>(() => [
    { value: '', label: 'Mira lo que hay' },
    ...this.offers().map((one) => ({ value: one.code, label: `${one.code} · ${one.label}` })),
  ]);

  protected readonly chosen = computed<Promotion | undefined>(() =>
    this.offers().find((one) => one.code === this.picked()),
  );

  protected readonly detail = computed(() => {
    const promotion = this.chosen();

    if (!promotion) {
      return '';
    }

    const gate = promotion.discount?.minReputationPct;
    const asks =
      gate === undefined
        ? 'La puede usar cualquiera.'
        : `Pide ${porcentaje(gate)} de cumplimiento, que se sube cumpliendo y no gastando.`;

    return `${discountLabel(promotion.discount)}. Corre hasta el ${fecha(promotion.until)} y le quedan ${usesLeft(promotion)} usos. ${asks}`;
  });

  protected pick(code: string): void {
    this.picked.set(code);
  }
}
