import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaActions,
  ArenaButton,
  ArenaCard,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaProgressBar,
  ArenaSelect,
  ArenaSelectOption,
  ArenaSpinner,
  ArenaStatCard,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Hiring } from '../../../domain/hiring';
import { Session } from '../../../domain/session';
import { bs, hhmm } from '../../../domain/format';

@Component({
  selector: 'app-driver-shift',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaAction,
    ArenaSwitch,
    ArenaGrid,
    ArenaStatCard,
    ArenaCard,
    ArenaProgressBar,
    ArenaSelect,
    ArenaEmptyState,
    ArenaSpinner,
    ArenaButton,
  ],
  templateUrl: './shift.html',
})
export class DriverShift {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly hiring = inject(Hiring);
  private readonly session = inject(Session);

  protected readonly zone = signal('Miraflores');

  protected readonly me = computed(
    () =>
      this.drivers.bySlug(this.session.profile()?.slug ?? 'marco-quispe') ?? this.drivers.all()[0],
  );

  protected readonly zones = computed<readonly ArenaSelectOption[]>(() =>
    this.me().zones.map((one) => ({ value: one, label: one })),
  );

  protected readonly today = computed(() => bs(this.drivers.payouts[0]?.earnBob ?? 0));

  protected readonly ridesToday = computed(() => String(this.drivers.payouts[0]?.rides ?? 0));

  protected readonly rating = computed(() => this.me().rating.toString());

  protected readonly running = computed(() =>
    this.drivers
      .ridesOf(this.me().id)
      .find((one) => one.state === 'aceptada' || one.state === 'recogida'),
  );

  protected readonly pendingOffers = computed(() => this.hiring.pendingOfDriver(this.me().id));

  protected readonly before = computed(() => {
    const ride = this.running();

    return ride ? hhmm(ride.beforeAt) : '';
  });

  protected toggle(): void {
    this.drivers.setAvailable(this.me().id, !this.me().available);
  }

  protected continueRide(): void {
    const ride = this.running();

    if (ride) {
      const step = ride.state === 'aceptada' ? 'recojo' : 'entrega';
      void this.router.navigateByUrl(`/conductor/carreras/${ride.id}/${step}`);
    }
  }

  protected toOffers(): void {
    void this.router.navigateByUrl('/conductor/ofertas');
  }
}
