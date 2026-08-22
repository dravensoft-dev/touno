import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArenaTag, ArenaTagTone } from '@dravensoft/arena-angular';
import { AgreementState } from '../../domain/agreements.model';
import { LoadState } from '../../domain/loads.model';
import { OrderState } from '../../domain/orders.model';

interface Look {
  readonly label: string;
  readonly tone: ArenaTagTone;
}

const ORDER: Record<OrderState, Look> = {
  nuevo: { label: 'Nuevo', tone: 'warning' },
  aceptado: { label: 'Aceptado', tone: 'primary' },
  preparando: { label: 'Preparando', tone: 'primary' },
  'esperando-rider': { label: 'En espera de rider', tone: 'warning' },
  'en-camino': { label: 'En camino', tone: 'primary' },
  'esperando-carga': { label: 'En espera a más pedidos', tone: 'warning' },
  'en-ruta-interurbana': { label: 'En ruta a tu ciudad', tone: 'primary' },
  'en-sucursal-destino': { label: 'En sucursal de destino', tone: 'primary' },
  'listo-para-recojo': { label: 'Listo para recoger', tone: 'success' },
  'reparto-local': { label: 'En reparto', tone: 'primary' },
  entregado: { label: 'Entregado', tone: 'success' },
  rechazado: { label: 'Rechazado', tone: 'danger' },
};

const LOAD: Record<LoadState, Look> = {
  acumulando: { label: 'Esperando más pedidos', tone: 'warning' },
  'en-ruta': { label: 'En ruta', tone: 'primary' },
  descargado: { label: 'Descargada', tone: 'success' },
};

const AGREEMENT: Record<AgreementState, Look> = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  activo: { label: 'Activo', tone: 'success' },
  cumplido: { label: 'Cumplido', tone: 'success' },
  rechazado: { label: 'Rechazado', tone: 'danger' },
  terminado: { label: 'Terminado', tone: 'neutral' },
  vencido: { label: 'Vencido', tone: 'neutral' },
};

export function orderLabel(state: OrderState): string {
  return ORDER[state].label;
}

export function loadLabel(state: LoadState): string {
  return LOAD[state].label;
}

export function agreementLabel(state: AgreementState): string {
  return AGREEMENT[state].label;
}

@Component({
  selector: 'app-state-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaTag],
  template: `<arena-tag [tone]="look().tone">{{ look().label }}</arena-tag>`,
})
export class StateTag {
  readonly order = input<OrderState>();
  readonly load = input<LoadState>();
  readonly agreement = input<AgreementState>();

  protected readonly look = computed<Look>(() => {
    const order = this.order();
    const load = this.load();
    const agreement = this.agreement();

    if (order) {
      return ORDER[order];
    }

    if (load) {
      return LOAD[load];
    }

    if (agreement) {
      return AGREEMENT[agreement];
    }

    return { label: '', tone: 'neutral' };
  });
}
