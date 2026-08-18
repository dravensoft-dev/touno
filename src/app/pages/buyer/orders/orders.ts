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
import { Marketplace } from '../../../domain/marketplace';
import { Orders } from '../../../domain/orders';
import { bs, fechaHora } from '../../../domain/format';
import { StatusTag } from '../../../shared/status-tag/status-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Comercio' },
  { header: 'Estado' },
  { header: 'Hecho', align: 'right' },
  { header: 'Total', align: 'right' },
];

const FILTERS: readonly ArenaSegmentOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'comida', label: 'Comida' },
  { value: 'encomienda', label: 'Encomiendas' },
];

const BUYER_PHONE = '7712 4408';

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
    StatusTag,
  ],
  templateUrl: './orders.html',
})
export class BuyerOrders {
  private readonly router = inject(Router);
  private readonly orders = inject(Orders);
  private readonly marketplace = inject(Marketplace);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;
  protected readonly filter = signal('todos');

  protected readonly rows = computed(() =>
    this.orders
      .ofBuyer(BUYER_PHONE)
      .filter((one) => this.filter() === 'todos' || one.vertical === this.filter())
      .map((one) => ({
        ...one,
        merchant: this.marketplace.bySlug(one.merchantSlug)?.name ?? one.merchantSlug,
        placed: fechaHora(one.placedAt),
        total: bs(one.totalBob),
      })),
  );

  protected open(slug: string): void {
    void this.router.navigateByUrl(`/mis-pedidos/${slug}`);
  }
}
