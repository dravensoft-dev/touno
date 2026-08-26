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
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { Order, movingLeg } from '../../../domain/orders.model';
import { rangeOf } from '../../../domain/riders.model';
import { bs, hhmm } from '../../../domain/format';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-rider-jobs',
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
  templateUrl: './jobs.html',
})
export class RiderJobs {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly orders = inject(Orders);
  private readonly riders = inject(Riders);
  private readonly session = inject(Session);

  protected readonly loads = inject(Loads);

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly rider = computed(() => this.riders.byId(this.riderId()));

  protected readonly online = computed(() => this.rider()?.online === true);

  protected readonly range = computed(() => rangeOf(this.rider()?.vehicle ?? 'moto'));

  protected readonly mine = computed(() =>
    this.orders.ofRider(this.riderId()).filter((one) => {
      const leg = movingLeg(one.state);

      return leg !== undefined && this.orders.legOf(one, leg)?.riderId === this.riderId();
    }),
  );

  protected readonly done = computed(() =>
    this.orders
      .ofRider(this.riderId())
      .filter((one) => one.state === 'entregado' && one.scannedBy === this.riderId()),
  );

  protected readonly myLoads = computed(() =>
    this.loads.ofRider(this.riderId()).filter((one) => one.state !== 'descargado'),
  );

  protected card(order: Order): {
    from: string;
    to: string;
    when: string;
    earn: string;
    long: boolean;
  } {
    const leg = movingLeg(order.state);
    const assignment = leg ? this.orders.legOf(order, leg) : undefined;
    const from = this.businesses.branchById(assignment?.branchId ?? '');

    return {
      from: from?.name ?? '',
      to: order.address ?? this.businesses.branchById(order.destinationBranchId ?? '')?.name ?? '',
      when: hhmm(order.promisedAt),
      earn: bs(this.rider()?.ratePerTripBob ?? 0),
      long: leg === 'interurbano',
    };
  }

  protected cityOf(cityId: string): string {
    return this.geography.nameOf(cityId);
  }

  protected branchName(id: string): string {
    return this.businesses.branchById(id)?.name ?? '';
  }

  protected open(order: Order): void {
    void this.router.navigateByUrl(`/rider/encargos/${order.slug}`);
  }

  protected openLoad(id: string): void {
    void this.router.navigateByUrl(`/rider/cargas/${id}`);
  }
}
