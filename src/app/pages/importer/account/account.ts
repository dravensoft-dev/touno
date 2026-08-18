import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaButton,
  ArenaChartCard,
  ArenaGrid,
  ArenaHorizontalBarChart,
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
import { Session } from '../../../domain/session';
import { Shipping } from '../../../domain/shipping';
import { bs, fecha } from '../../../domain/format';
import { StatusTag } from '../../../shared/status-tag/status-tag';

const PERIODS: readonly ArenaSegmentOption[] = [
  { value: 'mes', label: 'Este mes' },
  { value: 'anterior', label: 'Anterior' },
];

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Guía', mono: true },
  { header: 'Destino' },
  { header: 'Estado' },
  { header: 'Creado', align: 'right' },
  { header: 'Total', align: 'right' },
];

@Component({
  selector: 'app-importer-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSegmentedControl,
    ArenaGrid,
    ArenaStatCard,
    ArenaChartCard,
    ArenaHorizontalBarChart,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaButton,
    StatusTag,
  ],
  templateUrl: './account.html',
})
export class ImporterAccount {
  private readonly shipping = inject(Shipping);
  private readonly session = inject(Session);

  protected readonly periods = PERIODS;
  protected readonly period = signal('mes');
  protected readonly columns = COLUMNS;

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'importadora-ale');

  protected readonly mine = computed(() => this.shipping.ofImporter(this.slug()));

  protected readonly spent = computed(() =>
    bs(this.mine().reduce((sum, one) => sum + one.totalBob, 0)),
  );

  protected readonly toCollect = computed(() =>
    bs(
      this.mine()
        .filter((one) => one.payer === 'destinatario' && !one.paid)
        .reduce((sum, one) => sum + one.totalBob, 0),
    ),
  );

  protected readonly onTime = computed(() => {
    const delivered = this.mine().filter((one) => one.state === 'entregado');

    return delivered.length === 0
      ? '—'
      : `${Math.round((delivered.length / this.mine().length) * 100 + 60)} %`;
  });

  protected readonly tally = computed(() => this.shipping.destinationTally(this.slug()));

  protected readonly chartLabels = computed(() => this.tally().map((one) => one.city));

  protected readonly chartSeries = computed<readonly ArenaSeries[]>(() => [
    { label: 'Envíos', values: this.tally().map((one) => one.count), slot: 1 },
  ]);

  protected readonly rows = computed(() =>
    this.mine().map((one) => ({ ...one, created: fecha(one.createdAt), total: bs(one.totalBob) })),
  );

  protected readonly count = computed(() => String(this.mine().length));

  protected pick(value: string): void {
    this.period.set(value);
  }
}
