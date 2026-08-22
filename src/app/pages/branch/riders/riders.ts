import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaGrid,
  ArenaInput,
  ArenaPageHead,
  ArenaSection,
  ArenaSelect,
  ArenaSelectOption,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Platform } from '../../../domain/platform';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { rangeOf, vehicleLabel } from '../../../domain/riders.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { RiderPicker } from '../../../shared/rider-picker/rider-picker';

@Component({
  selector: 'app-branch-riders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaAlert,
    ArenaInput,
    ArenaSelect,
    ArenaButton,
    ArenaEmptyState,
    RiderPicker,
  ],
  templateUrl: './riders.html',
})
export class BranchRiders {
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);
  private readonly riders = inject(Riders);
  private readonly session = inject(Session);

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly working = computed(() => this.agreements.ridersOf(this.branchId()));

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

  protected readonly chosen = signal('');

  protected readonly rate = signal('');

  protected readonly points = signal('');

  protected readonly minPoints = computed(() => this.platform.minCareerPoints());

  protected readonly pointsBob = computed(() =>
    this.points() === '' ? this.minPoints() : Number(this.points()),
  );

  protected readonly candidates = computed(() =>
    this.riders
      .inCity(this.branch()?.cityId ?? '')
      .filter((one) => rangeOf(one.vehicle) === 'urbano')
      .filter((one) => !this.agreements.covers(one.id, this.branchId())),
  );

  protected readonly options = computed<readonly ArenaSelectOption[]>(() =>
    this.candidates().map((one) => ({
      value: one.id,
      label: `${one.name} · ${vehicleLabel(one.vehicle)} · pide ${bs(one.ratePerTripBob)}`,
    })),
  );

  protected readonly reason = computed(() =>
    this.chosen() === ''
      ? undefined
      : this.agreements.reasonFor(this.chosen(), {
          companyId: this.branch()?.companyId ?? '',
          branchIds: [this.branchId()],
          originBranchId: this.branchId(),
        }),
  );

  protected readonly ready = computed(
    () =>
      this.chosen() !== '' &&
      Number(this.rate()) > 0 &&
      this.pointsBob() >= this.minPoints() &&
      this.reason() === undefined,
  );

  protected pickRider(value: string): void {
    this.chosen.set(value);
  }

  protected onRate(value: string): void {
    this.rate.set(value);
  }

  protected onPoints(value: string): void {
    this.points.set(value);
  }

  protected recruit(): void {
    if (!this.ready()) {
      return;
    }

    this.agreements.propose({
      riderId: this.chosen(),
      companyId: this.branch()?.companyId ?? '',
      branchIds: [this.branchId()],
      initiatedBy: 'empresa',
      originBranchId: this.branchId(),
      kind: 'hora-pico',
      perTripBob: Number(this.rate()),
      points: this.pointsBob(),
    });

    this.chosen.set('');
    this.rate.set('');
    this.points.set('');
    this.notices.agreementSent();
  }
}
