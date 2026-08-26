import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaBarChart,
  ArenaChartCard,
  ArenaEmptyState,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSeries,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs, fecha } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Periodo' },
  { header: 'Sucursal' },
  { header: 'Pedidos', align: 'right' },
  { header: 'Bruto', align: 'right' },
  { header: 'Comisión', align: 'right' },
  { header: 'Neto', align: 'right' },
  { header: 'Pagado', align: 'right' },
];

@Component({
  selector: 'app-company-finance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaGrid,
    ArenaStatCard,
    ArenaChartCard,
    ArenaBarChart,
    ArenaKeyValue,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
  ],
  templateUrl: './finance.html',
})
export class CompanyFinance {
  private readonly businesses = inject(Businesses);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly branches = computed(() => this.businesses.branchesOf(this.companyId()));

  protected readonly settlements = computed(() => this.orders.settlementsOf(this.companyId()));

  protected readonly gross = computed(() =>
    this.settlements().reduce((sum, one) => sum + one.grossBob, 0),
  );

  protected readonly commission = computed(() =>
    this.settlements().reduce((sum, one) => sum + one.commissionBob, 0),
  );

  protected readonly net = computed(() =>
    this.settlements().reduce((sum, one) => sum + one.netBob, 0),
  );

  protected readonly pending = computed(() =>
    this.settlements()
      .filter((one) => one.paidAt === undefined)
      .reduce((sum, one) => sum + one.netBob, 0),
  );

  protected readonly labels = computed(() => this.branches().map((one) => one.name));

  protected readonly series = computed<readonly ArenaSeries[]>(() => [
    {
      label: 'Vendido',
      values: this.branches().map((one) => this.orders.salesOf(one.id)),
    },
  ]);

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() => [
    { term: 'Bruto liquidado', value: bs(this.gross()), numeric: true },
    { term: 'Comisión de Touno', value: bs(this.commission()), numeric: true },
    { term: 'Por cobrar', value: bs(this.pending()), numeric: true },
  ]);

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Neto',
    value: bs(this.net()),
    numeric: true,
  }));

  protected branchName(id: string): string {
    return this.businesses.branchById(id)?.name ?? '';
  }

  protected money(value: number): string {
    return bs(value);
  }

  protected paid(at?: string): string {
    return at ? fecha(`${at}T00:00:00`) : 'Por cobrar';
  }
}
