import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaBarChart,
  ArenaChartCard,
  ArenaSeries,
  ArenaEmptyState,
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
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { bs, fecha } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Día' },
  { header: 'Viajes', align: 'right' },
  { header: 'Ganancia', align: 'right' },
];

@Component({
  selector: 'app-rider-earnings',
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
  templateUrl: './earnings.html',
})
export class RiderEarnings {
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly riders = inject(Riders);

  protected readonly columns = COLUMNS;

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly rider = computed(() => this.riders.byId(this.riderId()));

  protected readonly payouts = computed(() => this.riders.payouts);

  protected readonly total = computed(() => bs(this.riders.weekEarnings()));

  protected readonly trips = computed(() => this.riders.weekTrips());

  protected readonly average = computed(() =>
    bs(this.trips() === 0 ? 0 : Math.round(this.riders.weekEarnings() / this.trips())),
  );

  protected readonly labels = computed(() => this.payouts().map((one) => one.label));

  protected readonly series = computed<readonly ArenaSeries[]>(() => [
    { label: 'Ganancia', values: this.payouts().map((one) => one.earnBob) },
  ]);

  protected readonly byCompany = computed<readonly ArenaKeyValueRow[]>(() =>
    this.agreements.activeFor(this.riderId()).map((one) => ({
      term: this.businesses.companyById(one.companyId)?.name ?? '',
      value: `${bs(one.perTripBob)} por viaje`,
      numeric: true,
    })),
  );

  protected readonly delivered = computed(
    () => this.orders.all().filter((one) => one.scannedBy === this.riderId()).length,
  );

  protected dayOf(day: string): string {
    return fecha(`${day}T00:00:00`);
  }

  protected money(value: number): string {
    return bs(value);
  }
}
