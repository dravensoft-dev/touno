import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaGrid,
  ArenaInput,
  ArenaPageHead,
  ArenaSection,
  ArenaPeopleList,
  ArenaPersonRow,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaSelect,
  ArenaSelectOption,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Callouts } from '../../../domain/callouts';
import { Staffing } from '../../../domain/staffing';
import { Reputation } from '../../../domain/reputation';
import { ReputationFigure } from '../../../shared/reputation-figure/reputation-figure';
import { Businesses } from '../../../domain/businesses';
import { Platform } from '../../../domain/platform';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { RecruitmentKind } from '../../../domain/agreements.model';
import { rangeOf, vehicleLabel } from '../../../domain/riders.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { RiderPicker } from '../../../shared/rider-picker/rider-picker';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-branch-riders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ReputationFigure,
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaAlert,
    ArenaInput,
    ArenaSelect,
    ArenaButton,
    ArenaEmptyState,
    ArenaPeopleList,
    ArenaPersonRow,
    ArenaRadio,
    ArenaRadioGroup,
    RiderPicker,
    StateTag,
  ],
  templateUrl: './riders.html',
})
export class BranchRiders {
  private readonly agreements = inject(Agreements);
  private readonly staffing = inject(Staffing);
  private readonly reputation = inject(Reputation);
  private readonly businesses = inject(Businesses);
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);
  private readonly riders = inject(Riders);
  private readonly session = inject(Session);

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly callouts = inject(Callouts);

  protected readonly working = computed(() => this.staffing.ridersOf(this.branchId()));

  protected readonly online = computed(() => this.working().filter((one) => one.online));

  protected readonly urban = computed(() =>
    this.working().filter((one) => rangeOf(one.vehicle) === 'urbano'),
  );

  protected readonly longHaul = computed(() =>
    this.working().filter((one) => rangeOf(one.vehicle) === 'interurbano'),
  );

  protected readonly applying = computed(() =>
    this.agreements
      .pending()
      .filter((one) => one.initiatedBy === 'rider' && one.branchIds.includes(this.branchId())),
  );

  protected readonly kind = signal<RecruitmentKind>('hora-pico');

  protected readonly callout = computed(() => this.callouts.liveOf(this.branchId()));

  protected readonly cuposLeft = computed(() => {
    const callout = this.callout();

    return callout ? this.callouts.cuposLeft(callout) : 0;
  });

  protected readonly calloutState = computed(() => {
    const callout = this.callout();

    return callout && this.callouts.stateOf(callout);
  });

  protected readonly coming = computed(() => {
    const callout = this.callout();

    return callout
      ? this.callouts
          .claimsOf(callout.id)
          .filter((one) => one.state === 'en-camino' || one.state === 'trabajando')
      : [];
  });

  protected readonly cupos = signal('');

  protected readonly fixed = signal('');

  protected readonly baseFloor = computed(() => this.platform.riderBaseBob()['agente-libre']);

  protected readonly chosen = signal('');

  protected readonly rate = signal('');

  protected readonly runs = signal('');

  protected readonly minRuns = computed(() => this.platform.minRuns());

  protected readonly runsGiven = computed(() =>
    this.runs() === '' ? this.minRuns() : Number(this.runs()),
  );

  protected readonly candidates = computed(() =>
    this.riders
      .inCity(this.branch()?.cityId ?? '')
      .filter((one) => rangeOf(one.vehicle) === 'urbano')
      .filter((one) => !this.staffing.covers(one.id, this.branchId())),
  );

  protected readonly options = computed<readonly ArenaSelectOption[]>(() =>
    this.candidates().map((one) => ({
      value: one.id,
      label: `${one.name} · ${vehicleLabel(one.vehicle)} · pide ${bs(one.ratePerTripBob)}`,
    })),
  );

  protected readonly standing = computed(() => this.reputation.of(this.branchId()));

  protected readonly breakdown = computed(() => this.reputation.breakdownOf(this.branchId()));

  protected readonly canRecruit = computed(() => this.reputation.clears(this.branchId()));

  protected readonly reason = computed(() =>
    this.chosen() === '' || this.kind() === 'normal'
      ? undefined
      : this.agreements.reasonFor(
          this.chosen(),
          this.reputation.gated(this.chosen(), {
            companyId: this.branch()?.companyId ?? '',
            branchIds: [this.branchId()],
            originBranchId: this.branchId(),
          }),
        ),
  );

  protected readonly ready = computed(
    () =>
      this.chosen() !== '' &&
      Number(this.rate()) > 0 &&
      this.runsGiven() >= this.minRuns() &&
      this.reason() === undefined,
  );

  protected pickRider(value: string): void {
    this.chosen.set(value);
  }

  protected pickKind(value: string): void {
    this.kind.set(value === 'normal' ? 'normal' : 'hora-pico');
  }

  protected riderName(id: string): string {
    return this.riders.nameOf(id);
  }

  protected fixedOf(callout: { readonly fixedBob: number }): string {
    return bs(callout.fixedBob);
  }

  protected onCupos(value: string): void {
    this.cupos.set(value);
  }

  protected onFixed(value: string): void {
    this.fixed.set(value);
  }

  protected readonly calloutReady = computed(
    () => Number(this.cupos()) >= 1 && Number(this.fixed()) >= this.baseFloor(),
  );

  protected toggleCallout(): void {
    const live = this.callout();

    if (live) {
      this.callouts.close(live.id);

      return;
    }

    if (!this.calloutReady() || !this.canRecruit()) {
      return;
    }

    this.callouts.publish({
      branchId: this.branchId(),
      companyId: this.branch()?.companyId ?? '',
      originBranchId: this.branchId(),
      cupos: Number(this.cupos()),
      fixedBob: Number(this.fixed()),
    });

    this.cupos.set('');
    this.fixed.set('');
  }

  protected onRate(value: string): void {
    this.rate.set(value);
  }

  protected onPoints(value: string): void {
    this.runs.set(value);
  }

  protected recruit(): void {
    if (!this.ready()) {
      return;
    }

    this.agreements.propose(
      this.reputation.gated(this.chosen(), {
        riderId: this.chosen(),
        companyId: this.branch()?.companyId ?? '',
        branchIds: [this.branchId()],
        initiatedBy: 'empresa',
        originBranchId: this.branchId(),
        kind: this.kind(),
        perTripBob: Number(this.rate()),
        runs: this.runsGiven(),
      }),
    );

    this.chosen.set('');
    this.rate.set('');
    this.runs.set('');
    this.notices.agreementSent();
  }
}
