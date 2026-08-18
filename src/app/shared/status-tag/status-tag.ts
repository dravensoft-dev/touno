import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArenaTag, ArenaTagTone } from '@dravensoft/arena-angular';
import { OrderState } from '../../domain/orders.model';
import { ShipmentState } from '../../domain/shipping.model';

interface Look {
  readonly label: string;
  readonly tone: ArenaTagTone;
}

const SHIPMENT: Record<ShipmentState, Look> = {
  'esperando-recojo': { label: 'Esperando recojo', tone: 'warning' },
  'sin-conductor': { label: 'Sin conductor', tone: 'danger' },
  'en-camino-a-sucursal': { label: 'En camino', tone: 'primary' },
  recibido: { label: 'Recibido sin sellar', tone: 'warning' },
  sellado: { label: 'Sellado', tone: 'success' },
  'en-bus': { label: 'En bus', tone: 'neutral' },
  'listo-para-recoger': { label: 'Listo para recoger', tone: 'success' },
  entregado: { label: 'Entregado', tone: 'success' },
  incidencia: { label: 'Con incidencia', tone: 'danger' },
};

const ORDER: Record<OrderState, Look> = {
  nuevo: { label: 'Nuevo', tone: 'warning' },
  aceptado: { label: 'Aceptado', tone: 'primary' },
  preparando: { label: 'Preparando', tone: 'primary' },
  listo: { label: 'Listo', tone: 'success' },
  'en-camino': { label: 'En camino', tone: 'primary' },
  entregado: { label: 'Entregado', tone: 'success' },
  rechazado: { label: 'Rechazado', tone: 'danger' },
};

@Component({
  selector: 'app-status-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaTag],
  template: `<arena-tag [tone]="look().tone">{{ look().label }}</arena-tag>`,
})
export class StatusTag {
  readonly shipment = input<ShipmentState>();
  readonly order = input<OrderState>();

  protected readonly look = computed<Look>(() => {
    const shipment = this.shipment();

    if (shipment) {
      return SHIPMENT[shipment];
    }

    const order = this.order();

    if (order) {
      return ORDER[order];
    }

    throw new Error('StatusTag needs either a shipment state or an order state');
  });
}

export function shipmentLabel(state: ShipmentState): string {
  return SHIPMENT[state].label;
}

export function orderLabel(state: OrderState): string {
  return ORDER[state].label;
}
