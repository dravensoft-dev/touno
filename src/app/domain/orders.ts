import { Injectable, computed, signal } from '@angular/core';
import { Coupon, Order, OrderState, Settlement } from './orders.model';
import { COUPONS, ORDERS, SETTLEMENTS } from './orders.data';

const LIVE: readonly OrderState[] = ['nuevo', 'aceptado', 'preparando', 'listo', 'en-camino'];

@Injectable({ providedIn: 'root' })
export class Orders {
  private readonly orders = signal<readonly Order[]>(ORDERS);
  private readonly coupons = signal<readonly Coupon[]>(COUPONS);

  readonly all = this.orders.asReadonly();

  readonly settlements: readonly Settlement[] = SETTLEMENTS;

  readonly live = computed(() => this.all().filter((one) => LIVE.includes(one.state)));

  ofMerchant(slug: string): readonly Order[] {
    return this.all().filter((one) => one.merchantSlug === slug);
  }

  liveOf(slug: string): readonly Order[] {
    return this.ofMerchant(slug).filter((one) => LIVE.includes(one.state));
  }

  historyOf(slug: string): readonly Order[] {
    return this.ofMerchant(slug).filter((one) => !LIVE.includes(one.state));
  }

  ofBuyer(phone: string): readonly Order[] {
    return this.all().filter((one) => one.buyer.phone === phone);
  }

  bySlug(slug: string): Order | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  inState(slug: string, state: OrderState): readonly Order[] {
    return this.ofMerchant(slug).filter((one) => one.state === state);
  }

  reviewsOf(slug: string): readonly Order[] {
    return this.ofMerchant(slug).filter((one) => one.review !== undefined);
  }

  couponsOf(slug: string): readonly Coupon[] {
    return this.coupons().filter((one) => one.merchantSlug === slug);
  }

  settlementsOf(slug: string): readonly Settlement[] {
    return this.settlements.filter((one) => one.merchantSlug === slug);
  }

  salesToday(slug: string): number {
    return this.ofMerchant(slug)
      .filter((one) => one.state !== 'rechazado')
      .reduce((sum, one) => sum + one.totalBob, 0);
  }

  averageTicket(slug: string): number {
    const paid = this.ofMerchant(slug).filter((one) => one.state !== 'rechazado');

    return paid.length === 0 ? 0 : Math.round(this.salesToday(slug) / paid.length);
  }

  advance(slug: string, state: OrderState): void {
    this.orders.update((list) => list.map((one) => (one.slug === slug ? { ...one, state } : one)));
  }

  toggleCoupon(code: string): void {
    this.coupons.update((list) =>
      list.map((one) => (one.code === code ? { ...one, active: !one.active } : one)),
    );
  }

  reply(slug: string, text: string): void {
    this.orders.update((list) =>
      list.map((one) =>
        one.slug === slug && one.review ? { ...one, review: { ...one.review, reply: text } } : one,
      ),
    );
  }
}
