import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaEmptyState,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { Order, isInterurban } from '../../../domain/orders.model';
import { bs, fechaHora } from '../../../domain/format';
import { StateTag } from '../../../shared/state-tag/state-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Sale de' },
  { header: 'Estado' },
  { header: 'Hecho', align: 'right' },
  { header: 'Total', align: 'right' },
];

const FILTERS: readonly ArenaSegmentOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'En curso' },
  { value: 'cerrados', label: 'Cerrados' },
];

const CLOSED = ['entregado', 'rechazado'];

@Component({
  selector: 'app-buyer-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSegmentedControl,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './orders.html',
})
export class BuyerOrders {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;

  protected readonly filter = signal('todos');

  protected readonly mine = computed(() => {
    const phone = this.session.buyerPhone();

    return phone ? this.orders.ofBuyer(phone) : [];
  });

  protected readonly rows = computed(() =>
    this.mine()
      .filter((one) => {
        const closed = CLOSED.includes(one.state);

        return (
          this.filter() === 'todos' ||
          (this.filter() === 'cerrados' && closed) ||
          (this.filter() === 'activos' && !closed)
        );
      })
      .map((order) => ({
        order,
        origin: this.businesses.branchById(order.originBranchId)?.name ?? '',
        placed: fechaHora(order.placedAt),
        total: bs(order.totalBob),
        travels: isInterurban(order.scenario),
      })),
  );

  protected pick(value: string): void {
    this.filter.set(value);
  }

  protected open(order: Order): void {
    void this.router.navigateByUrl(`/mis-pedidos/${order.slug}`);
  }
}
