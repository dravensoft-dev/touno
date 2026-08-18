import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ArenaActions,
  ArenaActivityFeed,
  ArenaActivityItem,
  ArenaAlert,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Orders } from '../../../domain/orders';
import { Shipping } from '../../../domain/shipping';
import { bs, fechaHora, hhmm } from '../../../domain/format';
import { PickupCode } from '../../../shared/pickup-code/pickup-code';
import { ShipmentTimeline } from '../../../shared/shipment-timeline/shipment-timeline';
import { StatusTag } from '../../../shared/status-tag/status-tag';

@Component({
  selector: 'app-buyer-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaKeyValue,
    ArenaActivityFeed,
    ArenaAlert,
    ShipmentTimeline,
    PickupCode,
    StatusTag,
  ],
  templateUrl: './order-detail.html',
})
export class BuyerOrderDetail {
  private readonly orders = inject(Orders);
  private readonly marketplace = inject(Marketplace);
  private readonly shipping = inject(Shipping);

  readonly codigo = input.required<string>();

  protected readonly order = computed(() => {
    const order = this.orders.bySlug(this.codigo());

    if (!order) {
      throw new Error(`Unknown order: ${this.codigo()}`);
    }

    return order;
  });

  protected readonly merchant = computed(() => this.marketplace.bySlug(this.order().merchantSlug));

  protected readonly shipment = computed(() => {
    const guia = this.order().shipmentGuia;

    return guia ? this.shipping.byGuia(guia) : undefined;
  });

  protected readonly arrived = computed(() =>
    ['listo-para-recoger', 'entregado'].includes(this.shipment()?.state ?? ''),
  );

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const order = this.order();

    return [
      { term: 'Comercio', value: this.merchant()?.name ?? order.merchantSlug },
      { term: 'Dirección', value: order.address },
      { term: 'Productos', value: bs(order.subtotalBob), numeric: true },
      { term: 'Envío', value: bs(order.deliveryBob), numeric: true },
      ...(order.shipmentGuia
        ? [{ term: 'Guía', value: order.shipmentGuia, numeric: true }]
        : [{ term: 'Promete', value: hhmm(order.promisedAt), numeric: true }]),
    ];
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: bs(this.order().totalBob),
    numeric: true,
  }));

  protected readonly feed = computed<readonly ArenaActivityItem[]>(() => {
    const order = this.order();

    return [
      {
        id: 'hecho',
        actor: 'Tú',
        action: 'hiciste el pedido',
        target: order.code,
        time: fechaHora(order.placedAt),
        tone: 'neutral',
      },
      {
        id: 'aceptado',
        actor: this.merchant()?.name ?? 'El comercio',
        action: 'aceptó el pedido',
        time: hhmm(order.placedAt),
        tone: 'accent',
      },
      ...(order.state === 'en-camino' || order.state === 'entregado'
        ? [
            {
              id: 'camino',
              actor: 'Un conductor',
              action: 'salió con tu pedido',
              time: hhmm(order.promisedAt),
              tone: 'gold' as const,
            },
          ]
        : []),
      ...(order.state === 'entregado'
        ? [
            {
              id: 'entregado',
              actor: 'Tu pedido',
              action: 'fue entregado',
              time: hhmm(order.promisedAt),
              tone: 'success' as const,
            },
          ]
        : []),
    ];
  });
}
