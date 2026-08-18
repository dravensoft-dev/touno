import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaBarChart,
  ArenaChartCard,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaSeries,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

const WEEKS: readonly ArenaSegmentOption[] = [
  { value: 'actual', label: 'Esta semana' },
  { value: 'anterior', label: 'Anterior' },
];

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Día' },
  { header: 'Carreras', align: 'right' },
  { header: 'Ganancia', align: 'right' },
];

@Component({
  selector: 'app-driver-earnings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSegmentedControl,
    ArenaGrid,
    ArenaStatCard,
    ArenaChartCard,
    ArenaBarChart,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaKeyValue,
  ],
  templateUrl: './earnings.html',
})
export class DriverEarnings {
  private readonly drivers = inject(Drivers);
  private readonly session = inject(Session);

  protected readonly weeks = WEEKS;
  protected readonly week = signal('actual');
  protected readonly columns = COLUMNS;

  protected readonly me = computed(
    () =>
      this.drivers.bySlug(this.session.profile()?.slug ?? 'marco-quispe') ?? this.drivers.all()[0],
  );

  protected readonly total = computed(() => bs(this.drivers.weekEarnings()));

  protected readonly rides = computed(() => String(this.drivers.weekRides()));

  protected readonly average = computed(() =>
    bs(Math.round(this.drivers.weekEarnings() / Math.max(1, this.drivers.weekRides()))),
  );

  protected readonly labels = computed(() => this.drivers.payouts.map((one) => one.label));

  protected readonly series = computed<readonly ArenaSeries[]>(() => [
    {
      label: 'Ganancia diaria en bolivianos',
      values: this.drivers.payouts.map((one) => one.earnBob),
      slot: 2,
    },
  ]);

  protected readonly rows = computed(() =>
    this.drivers.payouts.map((one) => ({ ...one, earn: bs(one.earnBob) })),
  );

  protected readonly account = computed<readonly ArenaKeyValueRow[]>(() => [
    { term: 'Cuenta de cobro', value: this.me().account },
    { term: 'Se paga', value: 'Lunes' },
  ]);
}
