import { TruckLoad } from './loads.model';
import { Milestone, MilestoneKind, Order, OrderScenario, OrderTimeline } from './orders.model';

export const TIMELINE_TEMPLATES: Record<OrderScenario, readonly MilestoneKind[]> = {
  restaurante: ['pedido', 'aceptado', 'preparado', 'rider-asignado', 'recogido', 'entregado'],
  'importadora-local': [
    'pedido',
    'aceptado',
    'preparado',
    'rider-asignado',
    'recogido',
    'entregado',
  ],
  'interurbano-sucursal': [
    'pedido',
    'aceptado',
    'preparado',
    'carga-en-espera',
    'ruta-interurbana',
    'en-sucursal-destino',
    'entregado',
  ],
  'interurbano-domicilio': [
    'pedido',
    'aceptado',
    'preparado',
    'carga-en-espera',
    'ruta-interurbana',
    'en-sucursal-destino',
    'rider-local-asignado',
    'entregado',
  ],
};

const LABELS: Record<MilestoneKind, string> = {
  pedido: 'Pedido hecho',
  aceptado: 'La sucursal aceptó',
  preparado: 'Listo para salir',
  'rider-asignado': 'Rider asignado',
  recogido: 'Recogido, va en camino',
  'carga-en-espera': 'En espera a más pedidos',
  'ruta-interurbana': 'En ruta a tu ciudad',
  'en-sucursal-destino': 'Llegó a la sucursal de tu ciudad',
  'rider-local-asignado': 'Rider local asignado',
  entregado: 'Entregado',
};

const UNTRACKED: readonly MilestoneKind[] = ['pedido', 'aceptado', 'preparado', 'carga-en-espera'];

export function labelOfMilestone(kind: MilestoneKind): string {
  return LABELS[kind];
}

export function isTracked(kind: MilestoneKind): boolean {
  return !UNTRACKED.includes(kind);
}

export function timelineOf(order: Order, load?: TruckLoad): OrderTimeline {
  const template = TIMELINE_TEMPLATES[order.scenario];
  const reached = reachedCount(order, template);

  const milestones: readonly Milestone[] = template.map((kind, index) => ({
    kind,
    label: LABELS[kind],
    at: index < reached ? stampOf(order, kind, index) : undefined,
    place: placeOf(order, kind),
    note: index === reached ? noteOf(kind, load) : undefined,
    tracked: isTracked(kind),
  }));

  const currentKind = reached < template.length ? template[reached] : undefined;

  return {
    scenario: order.scenario,
    milestones,
    currentKind,
    mapLive: order.assignments.length > 0 && order.scannedAt === undefined,
    waiting: waitingOf(order, load),
    etaAt:
      order.state === 'entregado' || order.state === 'rechazado' ? undefined : order.promisedAt,
  };
}

function reachedCount(order: Order, template: readonly MilestoneKind[]): number {
  const index = template.indexOf(furthestOf(order));

  return index < 0 ? 0 : index + 1;
}

function furthestOf(order: Order): MilestoneKind {
  switch (order.state) {
    case 'nuevo':
      return 'pedido';
    case 'rechazado':
    case 'aceptado':
      return 'aceptado';
    case 'preparando':
      return 'aceptado';
    case 'esperando-rider':
    case 'esperando-carga':
      return 'preparado';
    case 'en-camino':
      return 'recogido';
    case 'en-ruta-interurbana':
      return 'ruta-interurbana';
    case 'en-sucursal-destino':
    case 'listo-para-recojo':
      return 'en-sucursal-destino';
    case 'reparto-local':
      return 'rider-local-asignado';
    case 'entregado':
      return 'entregado';
  }
}

function stampOf(order: Order, kind: MilestoneKind, index: number): string {
  if (kind === 'pedido') {
    return order.placedAt;
  }

  if (kind === 'entregado' && order.scannedAt) {
    return order.scannedAt;
  }

  const assignment =
    kind === 'rider-local-asignado'
      ? order.assignments.find((one) => one.leg === 'local')
      : order.assignments[0];

  if ((kind === 'rider-asignado' || kind === 'rider-local-asignado') && assignment) {
    return assignment.assignedAt;
  }

  return order.custody.since === '' ? order.placedAt : shiftFrom(order.placedAt, index);
}

function shiftFrom(placedAt: string, index: number): string {
  const minutes = Number(placedAt.slice(14, 16)) + index * 6;
  const hours = Number(placedAt.slice(11, 13)) + Math.floor(minutes / 60);

  return `${placedAt.slice(0, 11)}${pad(hours % 24)}:${pad(minutes % 60)}:00`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function placeOf(order: Order, kind: MilestoneKind): string | undefined {
  if (kind === 'en-sucursal-destino' || kind === 'rider-local-asignado') {
    return order.destinationBranchId;
  }

  if (kind === 'carga-en-espera' || kind === 'preparado' || kind === 'aceptado') {
    return order.originBranchId;
  }

  return undefined;
}

function noteOf(kind: MilestoneKind, load?: TruckLoad): string | undefined {
  if (kind === 'carga-en-espera' && load) {
    const missing = Math.max(0, load.capacity - load.orderCodes.length);

    return missing > 0
      ? `Tu pedido espera en la sucursal a que salga el camión. Faltan ${missing} pedidos para completar la carga.`
      : 'La carga está completa y sale en la próxima salida.';
  }

  if (kind === 'rider-asignado' || kind === 'rider-local-asignado') {
    return 'La sucursal todavía no asignó un rider.';
  }

  return undefined;
}

function waitingOf(order: Order, load?: TruckLoad): 'rider' | 'carga' | undefined {
  if (order.state === 'esperando-carga') {
    return load?.state === 'acumulando' ? 'carga' : undefined;
  }

  if (order.state === 'esperando-rider' || order.state === 'en-sucursal-destino') {
    return 'rider';
  }

  return undefined;
}
