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
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { minutesUntil } from '../../../domain/clock';
import { Order, isInterurban } from '../../../domain/orders.model';
import { Rider } from '../../../domain/riders.model';
import { bs, fechaHora, restante } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { CustodyCard } from '../../../shared/custody-card/custody-card';
import { OrderChat } from '../../../shared/order-chat/order-chat';
import { OrderTimelineView } from '../../../shared/order-timeline/order-timeline';
import { RiderPicker } from '../../../shared/rider-picker/rider-picker';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-branch-order-detail',
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
    RiderPicker,
    OrderTimelineView,
    OrderChat,
    CustodyCard,
  ],
  templateUrl: './order-detail.html',
})
export class BranchOrderDetail {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly loads = inject(Loads);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly orders = inject(Orders);
  protected readonly chat = inject(Chat);

  readonly codigo = input('');

  private readonly found = computed(() => this.orders.bySlug(this.codigo()));

  protected readonly order = computed(() => {
    const order = this.found();
    const branchId = this.branchId();

    return order && (order.originBranchId === branchId || order.destinationBranchId === branchId)
      ? order
      : undefined;
  });

  protected readonly elsewhere = computed(() => this.found() !== undefined && !this.order());

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

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

  protected readonly weHoldIt = computed(() => {
    const order = this.order();

    return order?.custody.kind === 'sucursal' && order.custody.branchId === this.branchId();
  });

  protected readonly placeNames = computed<Record<string, string>>(() =>
    Object.fromEntries(this.businesses.branches().map((one) => [one.id, one.name])),
  );

  protected readonly leg = computed(() => {
    const order = this.order();

    if (!order) {
      return 'origen' as const;
    }

    if (order.state === 'en-sucursal-destino') {
      return 'local' as const;
    }

    return isInterurban(order.scenario) ? ('interurbano' as const) : ('origen' as const);
  });

  protected readonly needsRider = computed(() => {
    const order = this.order();

    return order?.state === 'esperando-rider' || order?.state === 'en-sucursal-destino';
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

    return [
      { term: 'Comprador', value: order.buyer.name },
      { term: 'Teléfono', value: order.buyer.phone, numeric: true },
      { term: 'Hecho', value: fechaHora(order.placedAt), numeric: true },
      { term: 'Prometido', value: fechaHora(order.promisedAt), numeric: true },
      {
        term: order.address ? 'Va a' : 'Recoge en',
        value:
          order.address ?? this.businesses.branchById(order.destinationBranchId ?? '')?.name ?? '',
      },
      { term: 'Productos', value: bs(order.subtotalBob), numeric: true },
    ];
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: bs(this.order()?.totalBob ?? 0),
    numeric: true,
  }));

  protected readonly buyerCity = computed(() =>
    this.geography.nameOf(this.order()?.buyerCityId ?? ''),
  );

  protected assign(rider: Rider): void {
    const order = this.order();

    if (!order) {
      return;
    }

    this.orders.assign(order.slug, this.leg(), rider.id, this.branchId());
    this.chat.handOver(
      order.threadId,
      { kind: 'rider', riderId: rider.id, since: order.placedAt },
      rider.name,
      `${rider.name} recogió tu pedido en ${this.businesses.branchById(this.branchId())?.name ?? ''}. Ahora hablas con él.`,
    );
    this.notices.riderAssigned(rider.name);
  }

  protected send(body: string): void {
    const order = this.order();

    if (order) {
      this.chat.send(
        order.threadId,
        body,
        'sucursal',
        this.businesses.branchById(this.branchId())?.managerName ?? 'Sucursal',
      );
      this.notices.messageSent();
    }
  }

  protected back(): void {
    void this.router.navigateByUrl('/sucursal/pedidos');
  }

  protected labelOf(order: Order): string {
    return order.address ? 'Entrega a domicilio' : 'Recojo en sucursal';
  }
}
