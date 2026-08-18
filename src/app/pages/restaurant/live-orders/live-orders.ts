import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaActions,
  ArenaAlert,
  ArenaBoard,
  ArenaBoardColumn,
  ArenaConfirmDialog,
  ArenaPageHead,
  ArenaSelect,
  ArenaSelectOption,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { Order } from '../../../domain/orders.model';
import { OrderCard } from '../../../shared/order-card/order-card';

const PREP: readonly ArenaSelectOption[] = [
  { value: '15', label: '15 minutos' },
  { value: '25', label: '25 minutos' },
  { value: '40', label: '40 minutos' },
];

@Component({
  selector: 'app-restaurant-live-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaSwitch,
    ArenaSelect,
    ArenaAlert,
    ArenaBoard,
    ArenaBoardColumn,
    ArenaConfirmDialog,
    OrderCard,
  ],
  templateUrl: './live-orders.html',
})
export class RestaurantLiveOrders {
  private readonly orders = inject(Orders);
  private readonly marketplace = inject(Marketplace);
  protected readonly session = inject(Session);

  protected readonly prepOptions = PREP;
  protected readonly prep = signal('25');
  protected readonly rejecting = signal<Order | null>(null);

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly merchant = computed(() => this.marketplace.bySlug(this.slug()));

  protected readonly fresh = computed(() => this.orders.inState(this.slug(), 'nuevo'));
  protected readonly cooking = computed(() => [
    ...this.orders.inState(this.slug(), 'aceptado'),
    ...this.orders.inState(this.slug(), 'preparando'),
  ]);
  protected readonly ready = computed(() => this.orders.inState(this.slug(), 'listo'));
  protected readonly onRoute = computed(() => this.orders.inState(this.slug(), 'en-camino'));

  protected readonly waiting = computed(() => this.fresh().length);

  protected accept(order: Order): void {
    this.orders.advance(order.slug, 'preparando');
  }

  protected finish(order: Order): void {
    this.orders.advance(order.slug, 'listo');
  }

  protected dispatch(order: Order): void {
    this.orders.advance(order.slug, 'en-camino');
  }

  protected deliver(order: Order): void {
    this.orders.advance(order.slug, 'entregado');
  }

  protected askReject(order: Order): void {
    this.rejecting.set(order);
  }

  protected cancelReject(): void {
    this.rejecting.set(null);
  }

  protected confirmReject(): void {
    const order = this.rejecting();

    if (order) {
      this.orders.advance(order.slug, 'rechazado');
    }

    this.rejecting.set(null);
  }

  protected toggleOpen(): void {
    const merchant = this.merchant();

    if (merchant) {
      this.marketplace.setOpen(merchant.slug, !merchant.open);
    }
  }
}
