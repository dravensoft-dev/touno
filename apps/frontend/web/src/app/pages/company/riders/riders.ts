import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaInput,
  ArenaPageHead,
  ArenaPeopleList,
  ArenaPersonRow,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Reputation } from '../../../domain/reputation';
import { Geography } from '../../../domain/geography';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { RiderAgreement } from '../../../domain/agreements.model';
import { Rider, rangeOf, vehicleLabel } from '../../../domain/riders.model';
import { bs, porcentaje } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-company-riders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaPeopleList,
    ArenaPersonRow,
    ArenaAction,
    ArenaButton,
    ArenaInput,
    ArenaAlert,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './riders.html',
})
export class CompanyRiders {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly reputation = inject(Reputation);
  private readonly geography = inject(Geography);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly agreements = inject(Agreements);
  protected readonly riders = inject(Riders);

  protected readonly term = signal('');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly cities = computed(() => this.businesses.citiesOf(this.companyId()));

  protected readonly applications = computed(() =>
    this.agreements.awaiting('empresa', this.companyId()),
  );

  protected readonly invited = computed(() =>
    this.agreements
      .ofCompany(this.companyId())
      .filter((one) => one.state === 'pendiente' && one.initiatedBy === 'empresa'),
  );

  protected readonly working = computed(() =>
    this.agreements.ofCompany(this.companyId()).filter((one) => one.state === 'activo'),
  );

  protected readonly available = computed(() =>
    this.riders
      .search(this.term())
      .filter((one) => this.cities().includes(one.cityId))
      .filter((one) => this.agreements.between(one.id, this.companyId()) === undefined),
  );

  protected riderOf(agreement: RiderAgreement): Rider | undefined {
    return this.riders.byId(agreement.riderId);
  }

  protected scope(agreement: RiderAgreement): string {
    const names = agreement.branchIds.map((id) => this.businesses.branchById(id)?.name ?? '');

    return names.length === 1 ? names[0] : `${names.length} sucursales`;
  }

  protected line(agreement: RiderAgreement): string {
    return `${this.scope(agreement)} · ${bs(agreement.perTripBob)}`;
  }

  protected profile(rider: Rider): string {
    const standing = this.reputation.of(rider.id);
    const made =
      standing.totalCount === 0
        ? 'sin historial'
        : `${standing.keptCount} de ${standing.totalCount}`;

    return `${vehicleLabel(rider.vehicle)} · ${this.geography.nameOf(rider.cityId)} · ${made}`;
  }

  protected figureOf(rider: Rider | undefined): string {
    const standing = this.reputation.of(rider?.id ?? '');

    return standing.totalCount === 0 ? '—' : porcentaje(standing.pct);
  }

  protected rangeOf(rider: Rider): string {
    return rangeOf(rider.vehicle) === 'interurbano' ? 'Interurbano' : 'Reparto en ciudad';
  }

  protected onTerm(value: string): void {
    this.term.set(value);
  }

  protected open(riderId: string): void {
    const rider = this.riders.byId(riderId);

    if (rider) {
      void this.router.navigateByUrl(`/empresa/riders/${rider.slug}`);
    }
  }

  protected accept(agreement: RiderAgreement): void {
    this.agreements.accept(agreement.id, 'empresa', this.companyId());
    this.notices.agreementAccepted();
  }

  protected reject(agreement: RiderAgreement): void {
    this.agreements.reject(agreement.id, 'empresa', this.companyId());
    this.notices.agreementRejected();
  }
}
