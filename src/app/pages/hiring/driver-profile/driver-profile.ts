import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ArenaActions,
  ArenaAvatar,
  ArenaBarChart,
  ArenaChartCard,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSeries,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Hiring } from '../../../domain/hiring';
import { Session } from '../../../domain/session';
import { bs, porcentaje } from '../../../domain/format';

@Component({
  selector: 'app-driver-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaAvatar,
    ArenaGrid,
    ArenaStatCard,
    ArenaKeyValue,
    ArenaChartCard,
    ArenaBarChart,
  ],
  templateUrl: './driver-profile.html',
})
export class DriverProfile {
  private readonly drivers = inject(Drivers);
  private readonly hiring = inject(Hiring);
  private readonly session = inject(Session);

  readonly id = input.required<string>();

  protected readonly driver = computed(() => {
    const driver = this.drivers.bySlug(this.id());

    if (!driver) {
      throw new Error(`Unknown driver: ${this.id()}`);
    }

    return driver;
  });

  protected readonly offer = computed(() =>
    this.hiring.activeWith(this.session.profile()?.slug ?? '', this.driver().id),
  );

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const driver = this.driver();
    const offer = this.offer();

    return [
      { term: 'Vehículo', value: `${driver.vehicle} · ${driver.plate}` },
      { term: 'Zonas', value: driver.zones.join(', ') },
      { term: 'Tarifa por carrera', value: bs(driver.ratePerRideBob), numeric: true },
      { term: 'Disponible ahora', value: driver.available ? 'Sí' : 'No' },
      {
        term: 'Contratación vigente',
        value: offer ? `${offer.ridesUsed} de ${offer.rides} carreras` : 'Ninguna',
        numeric: offer !== undefined,
      },
    ];
  });

  protected readonly chartLabels = computed(() => this.drivers.payouts.map((one) => one.label));

  protected readonly chartSeries = computed<readonly ArenaSeries[]>(() => [
    { label: 'Carreras', values: this.drivers.payouts.map((one) => one.rides), slot: 2 },
  ]);

  protected readonly rating = computed(() => this.driver().rating.toString());

  protected readonly rides = computed(() => this.driver().ridesDone.toString());

  protected readonly onTime = computed(() => porcentaje(this.driver().onTimePct));
}
