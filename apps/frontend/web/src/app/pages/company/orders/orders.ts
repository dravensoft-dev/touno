import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSelect,
  ArenaSelectOption,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs, fechaHora } from '../../../domain/format';
import { StateTag } from '../../../shared/state-tag/state-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Sucursal' },
  { header: 'Comprador' },
  { header: 'Estado' },
  { header: 'Hecho', align: 'right' },
  { header: 'Total', align: 'right' },
];

@Component({
  selector: 'app-company-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaGrid,
    ArenaStatCard,
    ArenaSelect,
    ArenaAlert,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './orders.html',
})
export class CompanyOrders {
  private readonly router = inject(Router);
  private readonly geography = inject(Geography);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);
  protected readonly orders = inject(Orders);

  protected readonly columns = COLUMNS;

  protected readonly branchFilter = signal('todas');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly branches = computed(() => this.businesses.branchesOf(this.companyId()));

  protected readonly options = computed<readonly ArenaSelectOption[]>(() => [
    { value: 'todas', label: 'Todas las sucursales' },
    ...this.branches().map((one) => ({ value: one.id, label: one.name })),
  ]);

  protected readonly mine = computed(() => this.orders.ofCompany(this.companyId()));

  protected readonly live = computed(() =>
    this.mine().filter((one) => one.state !== 'entregado' && one.state !== 'rechazado'),
  );

  protected readonly waiting = computed(() =>
    this.live().filter(
      (one) => one.state === 'esperando-rider' || one.state === 'en-sucursal-destino',
    ),
  );

  protected readonly takings = computed(() =>
    bs(
      this.mine()
        .filter((one) => one.state !== 'rechazado')
        .reduce((sum, two) => sum + two.totalBob, 0),
    ),
  );

  protected readonly rows = computed(() =>
    this.mine()
      .filter(
        (one) =>
          this.branchFilter() === 'todas' ||
          one.originBranchId === this.branchFilter() ||
          one.destinationBranchId === this.branchFilter(),
      )
      .map((order) => ({
        order,
        branch: this.businesses.branchById(order.originBranchId)?.name ?? '',
        city: this.geography.nameOf(order.buyerCityId),
        placed: fechaHora(order.placedAt),
        total: bs(order.totalBob),
      })),
  );

  protected pick(value: string): void {
    this.branchFilter.set(value);
  }

  protected open(slug: string): void {
    void this.router.navigateByUrl(`/sucursal/pedidos/${slug}`);
  }
}
