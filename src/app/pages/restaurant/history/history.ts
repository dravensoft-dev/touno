import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs, fechaHora } from '../../../domain/format';
import { StatusTag } from '../../../shared/status-tag/status-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Comprador' },
  { header: 'Estado' },
  { header: 'Recibido', align: 'right' },
  { header: 'Total', align: 'right' },
];

const FILTERS: readonly ArenaSegmentOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'rechazado', label: 'Rechazados' },
];

@Component({
  selector: 'app-restaurant-history',
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
  templateUrl: './history.html',
})
export class RestaurantHistory {
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;
  protected readonly filter = signal('todos');

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly rows = computed(() =>
    this.orders
      .historyOf(this.slug())
      .filter((one) => this.filter() === 'todos' || one.state === this.filter())
      .map((one) => ({ ...one, placed: fechaHora(one.placedAt), total: bs(one.totalBob) })),
  );
}
