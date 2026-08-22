import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaCard,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Session } from '../../../domain/session';
import { RiderAgreement, kindLabel } from '../../../domain/agreements.model';
import { bs } from '../../../domain/format';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-rider-agreements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaCard,
    ArenaButton,
    ArenaAlert,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './agreements.html',
})
export class RiderAgreements {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly session = inject(Session);

  protected readonly agreements = inject(Agreements);

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly invitations = computed(() =>
    this.agreements.awaiting('rider', this.riderId()),
  );

  protected readonly sent = computed(() =>
    this.agreements
      .ofRider(this.riderId())
      .filter((one) => one.state === 'pendiente' && one.initiatedBy === 'rider'),
  );

  protected readonly active = computed(() => this.agreements.activeFor(this.riderId()));

  protected readonly fulfilled = computed(() => this.agreements.fulfilledFor(this.riderId()));

  protected readonly pointsPending = computed(() =>
    this.agreements.pointsPendingOf(this.riderId()),
  );

  protected readonly peakHeld = computed(() =>
    this.agreements
      .ofRider(this.riderId())
      .some((one) => one.kind === 'hora-pico' && one.state === 'activo'),
  );

  protected readonly closed = computed(() =>
    this.agreements
      .ofRider(this.riderId())
      .filter(
        (one) => one.state !== 'pendiente' && one.state !== 'activo' && one.state !== 'cumplido',
      ),
  );

  protected companyName(agreement: RiderAgreement): string {
    return this.businesses.companyById(agreement.companyId)?.name ?? '';
  }

  protected scope(agreement: RiderAgreement): string {
    const names = agreement.branchIds
      .map((id) => this.businesses.branchById(id)?.name ?? '')
      .filter((one) => one !== '');

    return names.length === 1 ? names[0] : `${names.length} sucursales`;
  }

  protected rate(agreement: RiderAgreement): string {
    return `${bs(agreement.perTripBob)} por viaje`;
  }

  protected kindOf(agreement: RiderAgreement): string {
    return kindLabel(agreement.kind);
  }

  protected pointsOf(agreement: RiderAgreement): string {
    return `${agreement.pointsLeft} de ${agreement.points} puntos de carrera`;
  }

  protected open(agreement: RiderAgreement): void {
    void this.router.navigateByUrl(`/rider/acuerdos/${agreement.id}`);
  }
}
