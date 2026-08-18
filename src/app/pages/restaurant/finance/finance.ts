import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaButton,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Periodo' },
  { header: 'Pedidos', align: 'right' },
  { header: 'Bruto', align: 'right' },
  { header: 'Comisión', align: 'right' },
  { header: 'Neto', align: 'right' },
  { header: 'Pagado', align: 'right' },
];

@Component({
  selector: 'app-restaurant-finance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaGrid,
    ArenaStatCard,
    ArenaKeyValue,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaButton,
  ],
  templateUrl: './finance.html',
})
export class RestaurantFinance {
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly settlements = computed(() =>
    this.orders.settlementsOf(this.slug()).map((one) => ({
      ...one,
      gross: bs(one.grossBob),
      commission: bs(one.commissionBob),
      net: bs(one.netBob),
      paid: one.paidAt ?? 'Pendiente',
    })),
  );

  protected readonly current = computed(() => this.orders.settlementsOf(this.slug())[0]);

  protected readonly breakdown = computed<readonly ArenaKeyValueRow[]>(() => {
    const current = this.current();

    if (!current) {
      return [];
    }

    return [
      { term: 'Cobrado por la app', value: bs(current.grossBob), numeric: true },
      { term: 'Comisión de Touno', value: `– ${bs(current.commissionBob)}`, numeric: true },
      { term: 'Recojos a conductores', value: '– Bs 0,00', numeric: true },
    ];
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'A transferir',
    value: bs(this.current()?.netBob ?? 0),
    numeric: true,
  }));

  protected readonly gross = computed(() => bs(this.current()?.grossBob ?? 0));

  protected readonly commission = computed(() => bs(this.current()?.commissionBob ?? 0));

  protected readonly net = computed(() => bs(this.current()?.netBob ?? 0));
}
