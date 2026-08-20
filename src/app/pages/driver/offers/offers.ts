import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaAlert,
  ArenaButton,
  ArenaCard,
  ArenaEmptyState,
  ArenaPageHead,
  ArenaTag,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Hiring } from '../../../domain/hiring';
import { Notices } from '../../../layout/notices';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';
import { OfferState } from '../../../domain/drivers.model';

const TONES: Record<OfferState, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
  pendiente: 'warning',
  aceptada: 'success',
  rechazada: 'danger',
  vencida: 'neutral',
};

@Component({
  selector: 'app-driver-offers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaAlert,
    ArenaCard,
    ArenaAction,
    ArenaTag,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './offers.html',
})
export class DriverOffers {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly hiring = inject(Hiring);
  private readonly session = inject(Session);
  private readonly notices = inject(Notices);

  protected readonly me = computed(
    () =>
      this.drivers.bySlug(this.session.profile()?.slug ?? 'marco-quispe') ?? this.drivers.all()[0],
  );

  protected readonly offers = computed(() =>
    this.hiring.ofDriver(this.me().id).map((one) => ({
      ...one,
      total: bs(one.totalBob),
      rate: bs(one.perRideBob),
      tone: TONES[one.state],
    })),
  );

  protected readonly pending = computed(() => this.hiring.pendingOfDriver(this.me().id));

  protected open(id: string): void {
    void this.router.navigateByUrl(`/conductor/ofertas/${id}`);
  }

  protected accept(id: string): void {
    this.hiring.accept(id, this.me().id);
    this.notices.offerAccepted(this.businessOf(id));
  }

  protected reject(id: string): void {
    this.hiring.reject(id, this.me().id);
    this.notices.offerRejected(this.businessOf(id));
  }

  private businessOf(id: string): string {
    return this.offers().find((one) => one.id === id)?.businessName ?? 'el comercio';
  }
}
