import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
  ArenaStatCard,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Reputation } from '../../../domain/reputation';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { movingLeg } from '../../../domain/orders.model';
import { rangeOf, vehicleLabel } from '../../../domain/riders.model';
import { bs } from '../../../domain/format';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-rider-shift',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaSwitch,
    ArenaAlert,
    ArenaButton,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './shift.html',
})
export class RiderShift {
  private readonly router = inject(Router);
  private readonly reputation = inject(Reputation);
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly loads = inject(Loads);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly riders = inject(Riders);

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly rider = computed(() => this.riders.byId(this.riderId()));

  protected readonly online = computed(() => this.rider()?.online === true);

  protected readonly range = computed(() => rangeOf(this.rider()?.vehicle ?? 'moto'));

  protected readonly vehicle = computed(() => vehicleLabel(this.rider()?.vehicle ?? 'moto'));

  protected readonly branches = computed(() =>
    this.agreements.branchesFor(this.riderId()).flatMap((id) => {
      const branch = this.businesses.branchById(id);

      return branch ? [branch] : [];
    }),
  );

  protected readonly companies = computed(
    () => new Set(this.agreements.activeFor(this.riderId()).map((one) => one.companyId)).size,
  );

  protected readonly waitingOnMe = computed(() =>
    this.agreements.awaiting('rider', this.riderId()),
  );

  protected readonly running = computed(() =>
    this.orders
      .ofRider(this.riderId())
      .filter((one) => movingLeg(one.state) !== undefined)
      .filter((one) => this.orders.legOf(one, movingLeg(one.state)!)?.riderId === this.riderId()),
  );

  protected readonly load = computed(() =>
    this.loads.ofRider(this.riderId()).find((one) => one.state !== 'descargado'),
  );

  protected readonly earnings = computed(() => bs(this.riders.weekEarnings()));

  protected readonly standing = computed(() => this.reputation.of(this.riderId()));

  protected readonly breakdown = computed(() => this.reputation.breakdownOf(this.riderId()));

  protected readonly deliveries = computed(() => this.standing().totalCount.toString());

  protected cityOf(cityId: string): string {
    return this.geography.nameOf(cityId);
  }

  protected toggle(): void {
    this.riders.setOnline(this.riderId(), !this.online());
  }

  protected toJobs(): void {
    void this.router.navigateByUrl('/rider/encargos');
  }

  protected toAgreements(): void {
    void this.router.navigateByUrl('/rider/acuerdos');
  }

  protected toLoad(id: string): void {
    void this.router.navigateByUrl(`/rider/cargas/${id}`);
  }
}
