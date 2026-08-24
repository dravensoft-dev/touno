import { RiderAgreement, WorkMode } from './agreements.model';
import { CupoClaim } from './callouts.model';
import { minutesSince } from './clock';
import { TruckLoad } from './loads.model';
import { Order } from './orders.model';

export type ReputationSubject = 'rider' | 'sucursal' | 'comprador';

export type ReputationFact =
  | 'entrega-a-tiempo'
  | 'entrega-tarde'
  | 'carga-entregada'
  | 'reclutamiento-cumplido'
  | 'reclutamiento-abandonado'
  | 'cupo-cumplido'
  | 'cupo-abandonado'
  | 'pedido-despachado'
  | 'pedido-rechazado'
  | 'pedido-sin-rider'
  | 'carga-despachada'
  | 'carga-sin-salir'
  | 'recibido-a-la-primera'
  | 'recojo-a-tiempo'
  | 'recojo-abandonado'
  | 'direccion-incorrecta';

export type FactWeight = 'cumplido' | 'incumplido';

export interface ReputationEvent {
  readonly id: string;
  readonly subjectId: string;
  readonly fact: ReputationFact;
  readonly at: string;
  readonly orderCode?: string;
  readonly mode?: WorkMode;
}

export interface ReputationTally {
  readonly subjectId: string;
  readonly fact: ReputationFact;
  readonly count: number;
  readonly mode?: WorkMode;
}

export interface FactCount {
  readonly fact: ReputationFact;
  readonly count: number;
}

export interface ModeStanding {
  readonly byMode: Record<WorkMode, Standing>;
  readonly total: Standing;
}

export interface Standing {
  readonly keptCount: number;
  readonly brokenCount: number;
  readonly totalCount: number;
  readonly pct: number;
}

export const COLLECTION_WINDOW_MINUTES = 2880;

export interface ReputationGate {
  readonly branchIds: readonly string[];
  readonly originBranchId?: string;
  readonly riderPct?: number;
  readonly proposerPct?: number;
  readonly floorPct?: number;
}

export const EMPTY_STANDING: Standing = {
  keptCount: 0,
  brokenCount: 0,
  totalCount: 0,
  pct: 0,
};

const FACT_SUBJECTS: Record<ReputationFact, ReputationSubject> = {
  'entrega-a-tiempo': 'rider',
  'entrega-tarde': 'rider',
  'carga-entregada': 'rider',
  'reclutamiento-cumplido': 'rider',
  'reclutamiento-abandonado': 'rider',
  'cupo-cumplido': 'rider',
  'cupo-abandonado': 'rider',
  'pedido-despachado': 'sucursal',
  'pedido-rechazado': 'sucursal',
  'pedido-sin-rider': 'sucursal',
  'carga-despachada': 'sucursal',
  'carga-sin-salir': 'sucursal',
  'recibido-a-la-primera': 'comprador',
  'recojo-a-tiempo': 'comprador',
  'recojo-abandonado': 'comprador',
  'direccion-incorrecta': 'comprador',
};

const FACT_WEIGHTS: Record<ReputationFact, FactWeight> = {
  'entrega-a-tiempo': 'cumplido',
  'entrega-tarde': 'incumplido',
  'carga-entregada': 'cumplido',
  'reclutamiento-cumplido': 'cumplido',
  'reclutamiento-abandonado': 'incumplido',
  'cupo-cumplido': 'cumplido',
  'cupo-abandonado': 'incumplido',
  'pedido-despachado': 'cumplido',
  'pedido-rechazado': 'incumplido',
  'pedido-sin-rider': 'incumplido',
  'carga-despachada': 'cumplido',
  'carga-sin-salir': 'incumplido',
  'recibido-a-la-primera': 'cumplido',
  'recojo-a-tiempo': 'cumplido',
  'recojo-abandonado': 'incumplido',
  'direccion-incorrecta': 'incumplido',
};

const FACT_LABELS: Record<ReputationFact, string> = {
  'entrega-a-tiempo': 'Entregas cerradas dentro de la hora prometida',
  'entrega-tarde': 'Entregas cerradas después de la hora prometida',
  'carga-entregada': 'Cargas descargadas en la sucursal de destino',
  'reclutamiento-cumplido': 'Reclutamientos cumplidos hasta la última carrera',
  'reclutamiento-abandonado': 'Reclutamientos dejados con carreras pendientes',
  'cupo-cumplido': 'Llamados de agente libre atendidos en la sucursal que los abrió',
  'cupo-abandonado': 'Llamados de agente libre tomados sin llegar nunca',
  'pedido-despachado': 'Pedidos despachados y entregados',
  'pedido-rechazado': 'Pedidos rechazados',
  'pedido-sin-rider': 'Pedidos que pasaron su hora sin rider asignado',
  'carga-despachada': 'Cargas que salieron hacia la sucursal de destino',
  'carga-sin-salir': 'Cargas que pasaron su hora de salida sin llenarse',
  'recibido-a-la-primera': 'Pedidos recibidos en la puerta al primer intento',
  'recojo-a-tiempo': 'Pedidos recogidos en el mostrador dentro del plazo',
  'recojo-abandonado': 'Pedidos que se quedaron esperando en el mostrador',
  'direccion-incorrecta': 'Entregas con la dirección o la zona equivocada',
};

export const REPUTATION_FACTS = Object.keys(FACT_SUBJECTS) as readonly ReputationFact[];

export function subjectOf(fact: ReputationFact): ReputationSubject {
  return FACT_SUBJECTS[fact];
}

export function weightOf(fact: ReputationFact): FactWeight {
  return FACT_WEIGHTS[fact];
}

export function factLabel(fact: ReputationFact): string {
  return FACT_LABELS[fact];
}

export function pctOf(kept: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return kept === total ? 100 : Math.min(99, Math.floor((kept / total) * 100));
}

export function countsOf(
  tallies: readonly ReputationTally[],
  events: readonly ReputationEvent[],
): readonly FactCount[] {
  const totals = new Map<ReputationFact, number>();

  for (const one of tallies) {
    totals.set(one.fact, (totals.get(one.fact) ?? 0) + one.count);
  }

  for (const one of events) {
    totals.set(one.fact, (totals.get(one.fact) ?? 0) + 1);
  }

  return [...totals.entries()]
    .map(([fact, count]) => ({ fact, count }))
    .sort((left, right) => right.count - left.count || left.fact.localeCompare(right.fact));
}

export function standingOf(counts: readonly FactCount[]): Standing {
  const totalCount = counts.reduce((sum, one) => sum + one.count, 0);

  if (totalCount === 0) {
    return EMPTY_STANDING;
  }

  const keptCount = counts
    .filter((one) => weightOf(one.fact) === 'cumplido')
    .reduce((sum, one) => sum + one.count, 0);

  return {
    keptCount,
    brokenCount: totalCount - keptCount,
    totalCount,
    pct: pctOf(keptCount, totalCount),
  };
}

export function mergeStandings(list: readonly Standing[]): Standing {
  const kept = list.reduce((sum, one) => sum + one.keptCount, 0);
  const total = list.reduce((sum, one) => sum + one.totalCount, 0);

  return total === 0
    ? EMPTY_STANDING
    : {
        keptCount: kept,
        brokenCount: total - kept,
        totalCount: total,
        pct: pctOf(kept, total),
      };
}

export function modeStandingOf(
  tallies: readonly ReputationTally[],
  events: readonly ReputationEvent[],
  total: Standing,
): ModeStanding {
  const of = (mode: WorkMode): Standing =>
    standingOf(
      countsOf(
        tallies.filter((one) => one.mode === mode),
        events.filter((one) => one.mode === mode),
      ),
    );

  return {
    byMode: {
      'agente-libre': of('agente-libre'),
      normal: of('normal'),
      'hora-pico': of('hora-pico'),
    },
    total,
  };
}

export function meetsFloor(standing: Standing, floorPct: number): boolean {
  return standing.totalCount === 0 || standing.pct >= floorPct;
}

export function factsOfOrder(order: Order): readonly ReputationEvent[] {
  if (order.state === 'rechazado') {
    return [event(order.originBranchId, 'pedido-rechazado', order.placedAt, order.code)];
  }

  if (order.state === 'esperando-rider' && minutesSince(order.promisedAt) > 0) {
    return [event(order.originBranchId, 'pedido-sin-rider', order.promisedAt, order.code)];
  }

  if (order.state === 'listo-para-recojo') {
    return minutesSince(order.promisedAt) > COLLECTION_WINDOW_MINUTES
      ? [event(order.buyer.phone, 'recojo-abandonado', order.promisedAt, order.code)]
      : [];
  }

  if (order.state !== 'entregado' || order.scannedAt === undefined) {
    return [];
  }

  const closedBy = order.assignments.find((one) => one.riderId === order.scannedBy);
  const late = minutesSince(order.promisedAt) > 0 && order.scannedAt > order.promisedAt;

  return [
    event(order.originBranchId, 'pedido-despachado', order.scannedAt, order.code),
    ...(closedBy
      ? [
          event(
            closedBy.riderId,
            late ? 'entrega-tarde' : 'entrega-a-tiempo',
            order.scannedAt,
            order.code,
            undefined,
            closedBy.mode,
          ),
        ]
      : []),
    event(
      order.buyer.phone,
      order.delivery === 'domicilio' ? 'recibido-a-la-primera' : 'recojo-a-tiempo',
      order.scannedAt,
      order.code,
    ),
  ];
}

export function factsOfAgreement(agreement: RiderAgreement): readonly ReputationEvent[] {
  if (agreement.state === 'cumplido') {
    return [
      event(
        agreement.riderId,
        'reclutamiento-cumplido',
        agreement.settledAt ?? agreement.sentAt,
        undefined,
        agreement.id,
        agreement.kind,
      ),
    ];
  }

  const walkedAway =
    agreement.settledAt !== undefined &&
    agreement.runsLeft > 0 &&
    (agreement.state === 'terminado' || agreement.state === 'vencido');

  return walkedAway
    ? [
        event(
          agreement.riderId,
          'reclutamiento-abandonado',
          agreement.settledAt ?? agreement.sentAt,
          undefined,
          agreement.id,
          agreement.kind,
        ),
      ]
    : [];
}

export function factsOfClaim(claim: CupoClaim): readonly ReputationEvent[] {
  if (claim.state === 'abandonado') {
    return [
      event(claim.riderId, 'cupo-abandonado', claim.claimedAt, undefined, claim.id, 'agente-libre'),
    ];
  }

  if (claim.state !== 'terminado' || claim.arrivedAt === undefined) {
    return [];
  }

  return [
    event(
      claim.riderId,
      'cupo-cumplido',
      claim.leftAt ?? claim.arrivedAt,
      undefined,
      claim.id,
      'agente-libre',
    ),
  ];
}

export function factsOfLoad(load: TruckLoad): readonly ReputationEvent[] {
  if (load.state === 'acumulando') {
    return minutesSince(load.departsAt) > 0
      ? [event(load.fromBranchId, 'carga-sin-salir', load.departsAt, undefined, load.id)]
      : [];
  }

  return [
    event(load.fromBranchId, 'carga-despachada', load.departsAt, undefined, load.id),
    ...(load.state === 'descargado' && load.receivedAt !== undefined
      ? [event(load.riderId, 'carga-entregada', load.receivedAt, undefined, load.id, load.mode)]
      : []),
  ];
}

function event(
  subjectId: string,
  fact: ReputationFact,
  at: string,
  orderCode?: string,
  key?: string,
  mode?: WorkMode,
): ReputationEvent {
  return { id: `${key ?? orderCode ?? subjectId}-${fact}`, subjectId, fact, at, orderCode, mode };
}
