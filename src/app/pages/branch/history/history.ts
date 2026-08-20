import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { Order } from '../../../domain/orders.model';
import { bs, fechaHora } from '../../../domain/format';
import { StateTag } from '../../../shared/state-tag/state-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Comprador' },
  { header: 'Cerrado' },
  { header: 'Cuándo', align: 'right' },
  { header: 'Total', align: 'right' },
];

const FILTERS: readonly ArenaSegmentOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'rechazado', label: 'Rechazados' },
];

@Component({
  selector: 'app-branch-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaGrid,
    ArenaStatCard,
    ArenaSegmentedControl,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './history.html',
})
export class BranchHistory {
  private readonly router = inject(Router);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;

  protected readonly filter = signal('todos');

  private readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly closed = computed(() =>
    this.orders
      .ofBranch(this.branchId())
      .filter((one) => one.state === 'entregado' || one.state === 'rechazado'),
  );

  protected readonly delivered = computed(() =>
    this.closed().filter((one) => one.state === 'entregado'),
  );

  protected readonly rejected = computed(() =>
    this.closed().filter((one) => one.state === 'rechazado'),
  );

  protected readonly takings = computed(() =>
    bs(this.delivered().reduce((sum, one) => sum + one.totalBob, 0)),
  );

  protected readonly rows = computed(() =>
    this.closed()
      .filter((one) => this.filter() === 'todos' || one.state === this.filter())
      .map((order) => ({
        order,
        when: fechaHora(order.scannedAt ?? order.placedAt),
        total: bs(order.totalBob),
      })),
  );

  protected pick(value: string): void {
    this.filter.set(value);
  }

  protected open(order: Order): void {
    void this.router.navigateByUrl(`/sucursal/pedidos/${order.slug}`);
  }
}
