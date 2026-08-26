import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
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
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Tracking } from '../../../domain/tracking';
import { minutesUntil } from '../../../domain/clock';
import { copyText } from '../../../domain/clipboard';
import { bs, fechaHora, restante } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { CustodyCard } from '../../../shared/custody-card/custody-card';
import { fareRows } from '../../../shared/fare-rows';
import { OrderChat } from '../../../shared/order-chat/order-chat';
import { OrderCode } from '../../../shared/order-code/order-code';
import { OrderTimelineView } from '../../../shared/order-timeline/order-timeline';
import { RouteMap } from '../../../shared/route-map/route-map';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-buyer-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaSection,
    ArenaAlert,
    ArenaKeyValue,
    ArenaButton,
    ArenaEmptyState,
    StateTag,
    RouteMap,
    OrderTimelineView,
    OrderChat,
    OrderCode,
    CustodyCard,
  ],
  templateUrl: './order-detail.html',
})
export class BuyerOrderDetail {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly riders = inject(Riders);
  private readonly loads = inject(Loads);
  private readonly tracking = inject(Tracking);
  private readonly notices = inject(Notices);

  protected readonly orders = inject(Orders);
  protected readonly chat = inject(Chat);

  readonly codigo = input('');

  protected readonly order = computed(() => this.orders.bySlug(this.codigo()));

  protected readonly timeline = computed(() => {
    const order = this.order();

    return order ? this.orders.timeline(order) : undefined;
  });

  protected readonly sheet = computed(() => {
    const order = this.order();

    return order ? this.orders.sheetOf(order) : undefined;
  });

  protected readonly thread = computed(() => {
    const order = this.order();

    return order ? this.chat.byId(order.threadId) : undefined;
  });

  protected readonly placeNames = computed<Record<string, string>>(() =>
    Object.fromEntries(this.businesses.branches().map((one) => [one.id, one.name])),
  );

  protected readonly track = computed(() => {
    const order = this.order();

    return order ? this.tracking.ofOrder(order.code) : undefined;
  });

  protected readonly showMap = computed(() => this.timeline()?.mapLive === true && !!this.track());

  protected readonly stale = computed(() => {
    const order = this.order();

    return order ? this.tracking.isStale(order.code) : false;
  });

  protected readonly mapCity = computed(() => {
    const order = this.order();
    const leg = order && this.movingLegOf(order.state);

    if (!order || !leg) {
      return '';
    }

    return leg === 'interurbano' ? '' : order.buyerCityId;
  });

  protected readonly streets = computed(() => this.tracking.streetsOf(this.mapCity()));

  protected readonly carrier = computed(() => {
    const order = this.order();

    return order?.custody.riderId ? this.riders.byId(order.custody.riderId) : undefined;
  });

  protected readonly mapLabel = computed(() => {
    const rider = this.carrier();

    return rider
      ? `Recorrido de ${rider.name} hacia tu dirección`
      : 'Recorrido de tu pedido en el mapa';
  });

  protected readonly load = computed(() => {
    const order = this.order();

    return order?.loadId ? this.loads.byId(order.loadId) : undefined;
  });

  protected readonly missing = computed(() => {
    const load = this.load();

    return load ? this.loads.missing(load.id) : 0;
  });

  protected readonly eta = computed(() => {
    const at = this.timeline()?.etaAt;

    return at ? restante(minutesUntil(at)) : '';
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const order = this.order();

    if (!order) {
      return [];
    }

    const rows: ArenaKeyValueRow[] = [
      { term: 'Hecho', value: fechaHora(order.placedAt), numeric: true },
      ...fareRows({
        productsBob: order.subtotalBob,
        commissionBob: order.commissionBob,
        distanceBob: order.distanceBob,
        weatherBob: order.weatherBob,
        discountBob: order.discountBob,
        totalBob: order.totalBob,
      }),
    ];

    if (order.address) {
      rows.splice(1, 0, { term: 'Va a', value: order.address });
    } else {
      rows.splice(1, 0, {
        term: 'Recoges en',
        value: this.businesses.branchById(order.destinationBranchId ?? '')?.address ?? '',
      });
    }

    if (order.scannedAt) {
      rows.push({ term: 'Entregado', value: fechaHora(order.scannedAt), numeric: true });
    }

    return rows;
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: bs(this.order()?.totalBob ?? 0),
    numeric: true,
  }));

  protected readonly cityName = computed(() =>
    this.geography.nameOf(this.order()?.buyerCityId ?? ''),
  );

  protected async copy(code: string): Promise<void> {
    if (await copyText(code)) {
      this.notices.codeCopied(code);
    } else {
      this.notices.codeNotCopied();
    }
  }

  protected send(body: string): void {
    const order = this.order();

    if (order) {
      this.chat.send(order.threadId, body, 'comprador', order.buyer.name);
      this.notices.messageSent();
    }
  }

  protected back(): void {
    void this.router.navigateByUrl('/mis-pedidos');
  }

  private movingLegOf(state: string): string | undefined {
    if (state === 'en-camino') {
      return 'origen';
    }

    if (state === 'en-ruta-interurbana') {
      return 'interurbano';
    }

    if (state === 'reparto-local') {
      return 'local';
    }

    return undefined;
  }
}
