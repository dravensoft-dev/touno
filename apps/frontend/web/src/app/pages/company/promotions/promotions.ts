import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Orders } from '../../../domain/orders';
import { Promotions } from '../../../domain/promotions';
import { Session } from '../../../domain/session';
import { limitsOf, withoutLimit } from '../../../domain/businesses.model';
import { Promotion, live } from '../../../domain/promotions.model';
import { bs } from '../../../domain/format';
import { PromotionAudience, PromotionTable } from '../../../shared/promotion-table/promotion-table';
import { Notices } from '../../../layout/notices';

@Component({
  selector: 'app-company-promotions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaGrid, ArenaStatCard, ArenaAlert, ArenaEmptyState, PromotionTable],
  templateUrl: './promotions.html',
})
export class CompanyPromotions {
  private readonly businesses = inject(Businesses);
  private readonly notices = inject(Notices);
  private readonly orders = inject(Orders);
  private readonly router = inject(Router);
  private readonly session = inject(Session);

  protected readonly promotions = inject(Promotions);

  readonly audience = input.required<PromotionAudience>();

  protected readonly refused = signal<string | undefined>(undefined);

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly company = computed(() => this.businesses.companyById(this.companyId()));

  protected readonly plan = computed(() => limitsOf(this.company()?.plan ?? 'basico'));

  protected readonly forRiders = computed(() => this.audience() === 'riders');

  protected readonly mine = computed(() =>
    this.promotions
      .ofCompany(this.companyId())
      .filter((one) => (this.forRiders() ? one.riderLeg : one.discount) !== undefined),
  );

  protected readonly running = computed(() => this.mine().filter((one) => live(one)));

  protected readonly funded = computed(() =>
    this.orders.settlementsOf(this.companyId()).reduce((sum, one) => sum + one.promotionsBob, 0),
  );

  protected readonly capLabel = computed(() => {
    const cap = this.plan().activePromotions;

    return withoutLimit(cap) ? 'Sin tope en tu plan' : `Tu plan admite ${cap} encendidas`;
  });

  protected readonly title = computed(() =>
    this.forRiders() ? 'Promociones para riders' : 'Promociones para compradores',
  );

  protected readonly subtitle = computed(() =>
    this.forRiders()
      ? 'Lo que le ofreces a un rider mientras dure, y lo que se lleva si el volumen no llega.'
      : 'Lo que descuentas tú, con la cifra de lo que te cuesta a la vista.',
  );

  protected readonly emptyMessage = computed(() =>
    this.forRiders()
      ? 'Ninguna de tus promociones compromete a un rider todavía. Una pata de rider se escribe desde Crear.'
      : 'Ninguna de tus promociones descuenta al comprador todavía. La primera se escribe desde Crear.',
  );

  protected money(amount: number): string {
    return bs(amount);
  }

  protected planLabel(): string {
    return this.plan().label;
  }

  protected open(promotion: Promotion): void {
    void this.router.navigateByUrl(`/empresa/promociones/${this.audience()}/${promotion.code}`);
  }

  protected toggle(promotion: Promotion): void {
    try {
      this.promotions.toggle(promotion.code);
      this.refused.set(undefined);
      this.notices.promotionToggled(promotion.code, !promotion.active);
    } catch (refusal) {
      this.refused.set(refusal instanceof Error ? refusal.message : '');
    }
  }
}
