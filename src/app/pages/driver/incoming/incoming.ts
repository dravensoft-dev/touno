import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaButton,
  ArenaEmptyState,
  ArenaFallback,
  ArenaFigure,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaProgressBar,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Session } from '../../../domain/session';
import { bs, hhmm } from '../../../domain/format';

@Component({
  selector: 'app-driver-incoming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaFigure,
    ArenaFallback,
    ArenaStatCard,
    ArenaKeyValue,
    ArenaProgressBar,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './incoming.html',
})
export class DriverIncoming {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly session = inject(Session);

  protected readonly me = computed(
    () =>
      this.drivers.bySlug(this.session.profile()?.slug ?? 'marco-quispe') ?? this.drivers.all()[0],
  );

  protected readonly ride = computed(() => this.drivers.offered()[0]);

  protected readonly earn = computed(() => bs(this.ride()?.earnBob ?? 0));

  protected readonly stops = computed<readonly ArenaKeyValueRow[]>(() => {
    const ride = this.ride();

    if (!ride) {
      return [];
    }

    return [
      { term: 'Recojo', value: `${ride.pickup.label} · ${ride.pickup.address}` },
      { term: 'Entrega', value: `${ride.dropoff.label} · ${ride.dropoff.address}` },
      { term: 'Distancia', value: `${ride.distanceKm} km`, numeric: true },
      { term: 'Antes de', value: hhmm(ride.beforeAt), numeric: true },
    ];
  });

  protected accept(): void {
    const ride = this.ride();

    if (ride) {
      this.drivers.advanceRide(ride.id, 'aceptada');
      void this.router.navigateByUrl(`/conductor/carreras/${ride.id}/recojo`);
    }
  }

  protected reject(): void {
    const ride = this.ride();

    if (ride) {
      this.drivers.advanceRide(ride.id, 'rechazada');
    }
  }
}
