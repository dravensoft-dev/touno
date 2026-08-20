import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Chat } from '../../../domain/chat';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { Tracking } from '../../../domain/tracking';
import { minutesUntil } from '../../../domain/clock';
import { movingLeg } from '../../../domain/orders.model';
import { bs, restante } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { OrderChat } from '../../../shared/order-chat/order-chat';
import { RouteMap } from '../../../shared/route-map/route-map';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-rider-job-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaAlert,
    ArenaKeyValue,
    ArenaButton,
    ArenaEmptyState,
    StateTag,
    RouteMap,
    OrderChat,
  ],
  templateUrl: './job-detail.html',
})
export class RiderJobDetail {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly riders = inject(Riders);
  private readonly tracking = inject(Tracking);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly orders = inject(Orders);
  protected readonly chat = inject(Chat);

  readonly codigo = input('');

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  private readonly found = computed(() => this.orders.bySlug(this.codigo()));

  protected readonly order = computed(() => {
    const order = this.found();

    return order && order.assignments.some((one) => one.riderId === this.riderId())
      ? order
      : undefined;
  });

  protected readonly notMine = computed(() => this.found() !== undefined && !this.order());

  protected readonly leg = computed(() => {
    const order = this.order();

    return order ? movingLeg(order.state) : undefined;
  });

  protected readonly carrying = computed(() => {
    const order = this.order();
    const leg = this.leg();

    return (
      order !== undefined &&
      leg !== undefined &&
      this.orders.legOf(order, leg)?.riderId === this.riderId()
    );
  });

  protected readonly thread = computed(() => {
    const order = this.order();

    return order ? this.chat.byId(order.threadId) : undefined;
  });

  protected readonly track = computed(() => {
    const order = this.order();

    return order ? this.tracking.ofOrder(order.code) : undefined;
  });

  protected readonly stale = computed(() => {
    const order = this.order();

    return order ? this.tracking.isStale(order.code) : false;
  });

  protected readonly streets = computed(() => {
    const order = this.order();

    return this.leg() === 'interurbano' ? [] : this.tracking.streetsOf(order?.buyerCityId ?? '');
  });

  protected readonly eta = computed(() => {
    const order = this.order();

    return order ? restante(minutesUntil(order.promisedAt)) : '';
  });

  protected readonly earn = computed(() =>
    bs(this.riders.byId(this.riderId())?.ratePerTripBob ?? 0),
  );

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const order = this.order();

    if (!order) {
      return [];
    }

    const leg = this.leg();
    const assignment = leg ? this.orders.legOf(order, leg) : undefined;

    return [
      {
        term: 'Recoges en',
        value: this.businesses.branchById(assignment?.branchId ?? '')?.address ?? '',
      },
      {
        term: 'Entregas en',
        value:
          order.address ??
          this.businesses.branchById(order.destinationBranchId ?? '')?.address ??
          '',
      },
      { term: 'Comprador', value: order.buyer.name },
      { term: 'Teléfono', value: order.buyer.phone, numeric: true },
      { term: 'Ciudad', value: this.geography.nameOf(order.buyerCityId) },
      { term: 'Ganas', value: this.earn(), numeric: true },
    ];
  });

  protected send(body: string): void {
    const order = this.order();

    if (order) {
      this.chat.send(order.threadId, body, 'rider', this.riders.nameOf(this.riderId()));
      this.notices.messageSent();
    }
  }

  protected toScan(): void {
    const order = this.order();

    if (order) {
      void this.router.navigateByUrl(`/rider/encargos/${order.slug}/escanear`);
    }
  }

  protected back(): void {
    void this.router.navigateByUrl('/rider/encargos');
  }
}
