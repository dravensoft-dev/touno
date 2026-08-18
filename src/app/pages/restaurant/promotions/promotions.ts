import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaAction,
  ArenaActions,
  ArenaButton,
  ArenaCard,
  ArenaDialog,
  ArenaEmptyState,
  ArenaFooter,
  ArenaGrid,
  ArenaInput,
  ArenaPageHead,
  ArenaProgressBar,
  ArenaSwitch,
  ArenaTag,
} from '@dravensoft/arena-angular';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

@Component({
  selector: 'app-restaurant-promotions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaAction,
    ArenaButton,
    ArenaGrid,
    ArenaCard,
    ArenaTag,
    ArenaSwitch,
    ArenaProgressBar,
    ArenaDialog,
    ArenaFooter,
    ArenaInput,
    ArenaEmptyState,
  ],
  templateUrl: './promotions.html',
})
export class RestaurantPromotions {
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly creating = signal(false);
  protected readonly code = signal('');
  protected readonly amount = signal('10');

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly coupons = computed(() =>
    this.orders.couponsOf(this.slug()).map((one) => ({
      ...one,
      discount: bs(one.discountBob),
      usage: Math.round((one.uses / one.limit) * 100),
    })),
  );

  protected toggle(code: string): void {
    this.orders.toggleCoupon(code);
  }

  protected open(): void {
    this.creating.set(true);
  }

  protected close(): void {
    this.creating.set(false);
  }
}
