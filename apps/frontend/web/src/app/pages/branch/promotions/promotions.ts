import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ArenaAlert, ArenaEmptyState, ArenaPageHead } from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Promotions } from '../../../domain/promotions';
import { Session } from '../../../domain/session';
import { PromotionAudience, PromotionTable } from '../../../shared/promotion-table/promotion-table';

@Component({
  selector: 'app-branch-promotions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaAlert, ArenaEmptyState, PromotionTable],
  templateUrl: './promotions.html',
})
export class BranchPromotions {
  private readonly businesses = inject(Businesses);
  private readonly promotions = inject(Promotions);
  private readonly session = inject(Session);

  readonly audience = input.required<PromotionAudience>();

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly company = computed(() => this.businesses.companyOfBranch(this.branchId()));

  protected readonly forRiders = computed(() => this.audience() === 'riders');

  protected readonly mine = computed(() =>
    this.promotions
      .ofCompany(this.company()?.id ?? '')
      .filter((one) => (this.forRiders() ? one.riderLeg : one.discount) !== undefined),
  );

  protected readonly title = computed(() =>
    this.forRiders() ? 'Promociones para riders' : 'Promociones para compradores',
  );

  protected readonly subtitle = computed(
    () => `Las que corren en ${this.company()?.name ?? 'tu marca'}, y que tu sucursal honra.`,
  );

  protected readonly emptyMessage = computed(() =>
    this.forRiders()
      ? 'Tu marca no tiene ninguna promoción que comprometa a un rider ahora mismo.'
      : 'Tu marca no tiene ninguna promoción que descuente al comprador ahora mismo.',
  );
}
