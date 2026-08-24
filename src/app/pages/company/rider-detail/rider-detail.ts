import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaButton,
  ArenaCheckbox,
  ArenaEmptyState,
  ArenaGrid,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaSection,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Reputation } from '../../../domain/reputation';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Platform } from '../../../domain/platform';
import { Session } from '../../../domain/session';
import { Branch } from '../../../domain/businesses.model';
import { RecruitmentKind, kindLabel } from '../../../domain/agreements.model';
import { rangeOf, vehicleLabel } from '../../../domain/riders.model';
import { bs, porcentaje } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { ReputationFigure } from '../../../shared/reputation-figure/reputation-figure';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-company-rider-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaCheckbox,
    ArenaInput,
    ArenaRadioGroup,
    ArenaRadio,
    ArenaKeyValue,
    ArenaAlert,
    ArenaButton,
    ArenaEmptyState,
    StateTag,
    ReputationFigure,
  ],
  templateUrl: './rider-detail.html',
})
export class CompanyRiderDetail {
  private readonly router = inject(Router);
  private readonly reputation = inject(Reputation);
  private readonly geography = inject(Geography);
  private readonly orders = inject(Orders);
  private readonly platform = inject(Platform);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly agreements = inject(Agreements);
  protected readonly businesses = inject(Businesses);
  protected readonly riders = inject(Riders);

  readonly slug = input('');

  protected readonly chosen = signal<readonly string[]>([]);

  protected readonly rate = signal('');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly rider = computed(() => this.riders.bySlug(this.slug()));

  protected readonly range = computed(() => rangeOf(this.rider()?.vehicle ?? 'moto'));

  protected readonly agreement = computed(() => {
    const rider = this.rider();

    return rider ? this.agreements.between(rider.id, this.companyId()) : undefined;
  });

  protected readonly answerable = computed(() => {
    const agreement = this.agreement();

    return agreement?.state === 'pendiente' && agreement.initiatedBy === 'rider';
  });

  protected readonly waitingOnHim = computed(() => {
    const agreement = this.agreement();

    return agreement?.state === 'pendiente' && agreement.initiatedBy === 'empresa';
  });

  protected readonly reachable = computed<readonly Branch[]>(() =>
    this.businesses
      .branchesOf(this.companyId())
      .filter((one) => one.cityId === this.rider()?.cityId || this.range() === 'interurbano'),
  );

  protected readonly outOfReach = computed(() =>
    this.businesses
      .branchesOf(this.companyId())
      .filter((one) => !this.reachable().some((two) => two.id === one.id)),
  );

  protected readonly proposable = computed(
    () => this.agreement() === undefined && this.reachable().length > 0,
  );

  protected readonly kind = signal<RecruitmentKind>('normal');

  protected readonly runs = signal('');

  protected readonly minRuns = computed(() => this.platform.minRuns());

  protected readonly runsGiven = computed(() =>
    this.runs() === '' ? this.minRuns() : Number(this.runs()),
  );

  protected readonly peak = computed(() => this.kind() === 'hora-pico');

  protected readonly peakReason = computed(() => {
    const rider = this.rider();

    if (!rider) {
      return undefined;
    }

    return this.agreements.reasonFor(
      rider.id,
      this.reputation.gated(rider.id, {
        companyId: this.companyId(),
        branchIds: this.chosen(),
      }),
    );
  });

  protected readonly runsPending = computed(() =>
    this.agreements.runsPendingOf(this.rider()?.id ?? ''),
  );

  protected readonly ready = computed(() => {
    if (this.chosen().length === 0 || Number(this.rate()) <= 0) {
      return false;
    }

    if (this.runsGiven() < this.minRuns()) {
      return false;
    }

    return !this.peak() || this.peakReason() === undefined;
  });

  protected readonly delivered = computed(() => {
    const rider = this.rider();

    return rider ? this.orders.all().filter((one) => one.scannedBy === rider.id).length : 0;
  });

  protected readonly standing = computed(() => this.reputation.of(this.rider()?.id ?? ''));

  protected readonly figures = computed(() => this.reputation.ofByMode(this.rider()?.id ?? ''));

  protected readonly breakdown = computed(() =>
    this.reputation.breakdownOf(this.rider()?.id ?? ''),
  );

  protected readonly figure = computed(() => {
    const one = this.standing();

    return one.totalCount === 0 ? 'Sin historial' : porcentaje(one.pct);
  });

  protected readonly madeOf = computed(() => {
    const one = this.standing();

    return one.totalCount === 0
      ? 'Todavía no cerró ninguna entrega en Touno'
      : `${one.keptCount} de ${one.totalCount} compromisos cumplidos`;
  });

  protected readonly hisRate = computed(() => bs(this.rider()?.ratePerTripBob ?? 0));

  protected readonly scopeLine = computed(() => {
    const agreement = this.agreement();

    if (!agreement) {
      return '';
    }

    const names = agreement.branchIds.map((id) => this.businesses.branchById(id)?.name ?? '');

    return `${kindLabel(agreement.kind)}. Cubre ${names.join(', ')} a ${bs(
      agreement.perTripBob,
    )} por viaje, y le quedan ${agreement.runsLeft} de ${agreement.runs} carreras.`;
  });

  protected vehicleLabelOf(): string {
    return vehicleLabel(this.rider()?.vehicle ?? 'moto');
  }

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const rider = this.rider();

    if (!rider) {
      return [];
    }

    return [
      { term: 'Vehículo', value: vehicleLabel(rider.vehicle) },
      { term: 'Placa', value: rider.plate, numeric: true },
      { term: 'Ciudad', value: this.geography.nameOf(rider.cityId) },
      { term: 'Zonas', value: rider.zones.join(', ') },
      { term: 'Su tarifa', value: `${bs(rider.ratePerTripBob)} por viaje`, numeric: true },
      { term: 'Teléfono', value: rider.phone, numeric: true },
    ];
  });

  protected picked(branchId: string): boolean {
    return this.chosen().includes(branchId);
  }

  protected toggleBranch(branchId: string): void {
    this.chosen.update((list) =>
      list.includes(branchId) ? list.filter((one) => one !== branchId) : [...list, branchId],
    );
  }

  protected onRate(value: string): void {
    this.rate.set(value);
  }

  protected onPoints(value: string): void {
    this.runs.set(value);
  }

  protected pickKind(value: string): void {
    this.kind.set(value as RecruitmentKind);
  }

  protected kindOf(kind: RecruitmentKind): string {
    return kindLabel(kind);
  }

  protected cityOf(cityId: string): string {
    return this.geography.nameOf(cityId);
  }

  protected propose(): void {
    const rider = this.rider();

    if (!rider || !this.ready()) {
      return;
    }

    this.agreements.propose(
      this.reputation.gated(rider.id, {
        riderId: rider.id,
        companyId: this.companyId(),
        branchIds: this.chosen(),
        initiatedBy: 'empresa',
        kind: this.kind(),
        perTripBob: Number(this.rate()),
        runs: this.runsGiven(),
      }),
    );

    this.chosen.set([]);
    this.rate.set('');
    this.runs.set('');
    this.kind.set('normal');
    this.notices.agreementSent();
  }

  protected accept(): void {
    const agreement = this.agreement();

    if (agreement) {
      this.agreements.accept(agreement.id, 'empresa', this.companyId());
      this.notices.agreementAccepted();
    }
  }

  protected reject(): void {
    const agreement = this.agreement();

    if (agreement) {
      this.agreements.reject(agreement.id, 'empresa', this.companyId());
      this.notices.agreementRejected();
    }
  }

  protected end(): void {
    const agreement = this.agreement();

    if (agreement) {
      this.agreements.end(agreement.id);
    }
  }

  protected back(): void {
    void this.router.navigateByUrl('/empresa/riders');
  }
}
