import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaChartCard,
  ArenaDoughnutChart,
  ArenaGrid,
  ArenaHorizontalBarChart,
  ArenaLineChart,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaSeries,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

const RANGES: readonly ArenaSegmentOption[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const SALES = [4210, 3980, 4460, 5120, 6380, 7240, 5890];

@Component({
  selector: 'app-restaurant-metrics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSegmentedControl,
    ArenaGrid,
    ArenaStatCard,
    ArenaChartCard,
    ArenaLineChart,
    ArenaHorizontalBarChart,
    ArenaDoughnutChart,
  ],
  templateUrl: './metrics.html',
})
export class RestaurantMetrics {
  private readonly orders = inject(Orders);
  private readonly marketplace = inject(Marketplace);
  private readonly session = inject(Session);

  protected readonly ranges = RANGES;
  protected readonly range = signal('semana');
  protected readonly days = DAYS;

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly sales = computed(() => bs(this.orders.salesToday(this.slug())));

  protected readonly ticket = computed(() => bs(this.orders.averageTicket(this.slug())));

  protected readonly count = computed(() => String(this.orders.ofMerchant(this.slug()).length));

  protected readonly rating = computed(
    () => this.marketplace.bySlug(this.slug())?.rating.toString() ?? '—',
  );

  protected readonly salesSeries: readonly ArenaSeries[] = [
    { label: 'Ventas en bolivianos', values: SALES, slot: 1 },
  ];

  protected readonly top = computed(() => this.marketplace.topSellers(this.slug(), 5));

  protected readonly topLabels = computed(() => this.top().map((one) => one.name));

  protected readonly topSeries = computed<readonly ArenaSeries[]>(() => [
    { label: 'Unidades vendidas', values: this.top().map((one) => one.soldThisMonth), slot: 3 },
  ]);

  protected readonly mixLabels = computed(() => this.marketplace.categoriesOf(this.slug()));

  protected readonly mixSeries = computed<readonly ArenaSeries[]>(() => [
    {
      label: 'Ventas por categoría',
      values: this.mixLabels().map((category) =>
        this.marketplace
          .catalogOf(this.slug())
          .filter((one) => one.category === category)
          .reduce((sum, one) => sum + one.soldThisMonth, 0),
      ),
      slots: this.mixLabels().map((_, index) => index + 1),
    },
  ]);
}
