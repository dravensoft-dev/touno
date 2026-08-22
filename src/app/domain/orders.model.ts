import { BusinessType } from './businesses.model';
import { Custody } from './chat.model';

export type OrderScenario =
  'restaurante' | 'importadora-local' | 'interurbano-domicilio' | 'interurbano-sucursal';

export type DeliveryChoice = 'domicilio' | 'sucursal';

export type OrderState =
  | 'nuevo'
  | 'aceptado'
  | 'preparando'
  | 'esperando-rider'
  | 'en-camino'
  | 'esperando-carga'
  | 'en-ruta-interurbana'
  | 'en-sucursal-destino'
  | 'listo-para-recojo'
  | 'reparto-local'
  | 'entregado'
  | 'rechazado';

export type AssignmentLeg = 'origen' | 'interurbano' | 'local';

export type MilestoneKind =
  | 'pedido'
  | 'aceptado'
  | 'preparado'
  | 'rider-asignado'
  | 'recogido'
  | 'carga-en-espera'
  | 'ruta-interurbana'
  | 'en-sucursal-destino'
  | 'rider-local-asignado'
  | 'entregado';

export interface Contact {
  readonly name: string;
  readonly phone: string;
  readonly ci?: string;
}

export interface OrderLine {
  readonly productId: string;
  readonly name: string;
  readonly qty: number;
  readonly unitBob: number;
  readonly options: readonly string[];
}

export interface Assignment {
  readonly leg: AssignmentLeg;
  readonly riderId: string;
  readonly branchId: string;
  readonly assignedAt: string;
}

export interface Milestone {
  readonly kind: MilestoneKind;
  readonly label: string;
  readonly at?: string;
  readonly place?: string;
  readonly note?: string;
  readonly tracked: boolean;
}

export interface Review {
  readonly stars: 1 | 2 | 3 | 4 | 5;
  readonly text: string;
  readonly at: string;
  readonly reply?: string;
}

export interface Order {
  readonly code: string;
  readonly slug: string;
  readonly scenario: OrderScenario;
  readonly type: BusinessType;
  readonly companyId: string;
  readonly originBranchId: string;
  readonly destinationBranchId?: string;
  readonly buyer: Contact;
  readonly buyerCityId: string;
  readonly address?: string;
  readonly delivery: DeliveryChoice;
  readonly lines: readonly OrderLine[];
  readonly zoneName?: string;
  readonly subtotalBob: number;
  readonly commissionBob: number;
  readonly distanceBob: number;
  readonly weatherBob: number;
  readonly totalBob: number;
  readonly state: OrderState;
  readonly placedAt: string;
  readonly promisedAt: string;
  readonly assignments: readonly Assignment[];
  readonly custody: Custody;
  readonly loadId?: string;
  readonly threadId: string;
  readonly scannedAt?: string;
  readonly scannedBy?: string;
  readonly review?: Review;
}

export type SheetPartyRole = 'sucursal-origen' | 'rider-origen' | 'sucursal-local' | 'rider-local';

export interface OrderSheetParty {
  readonly role: SheetPartyRole;
  readonly title: string;
  readonly subtitle: string;
  readonly meta?: string;
  readonly icon: string;
}

export interface OrderSheet {
  readonly code: string;
  readonly scenario: OrderScenario;
  readonly parties: readonly OrderSheetParty[];
}

export interface OrderTimeline {
  readonly scenario: OrderScenario;
  readonly milestones: readonly Milestone[];
  readonly currentKind?: MilestoneKind;
  readonly mapLive: boolean;
  readonly waiting?: 'rider' | 'carga';
  readonly etaAt?: string;
}

export interface Coupon {
  readonly code: string;
  readonly companyId: string;
  readonly label: string;
  readonly discountBob: number;
  readonly uses: number;
  readonly limit: number;
  readonly active: boolean;
  readonly until: string;
}

export interface Settlement {
  readonly id: string;
  readonly companyId: string;
  readonly branchId: string;
  readonly period: string;
  readonly orders: number;
  readonly grossBob: number;
  readonly commissionBob: number;
  readonly netBob: number;
  readonly paidAt?: string;
}

export function isInterurban(scenario: OrderScenario): boolean {
  return scenario === 'interurbano-domicilio' || scenario === 'interurbano-sucursal';
}

export function legOf(
  assignments: readonly Assignment[],
  leg: AssignmentLeg,
): Assignment | undefined {
  return assignments.find((one) => one.leg === leg);
}

export function movingLeg(state: OrderState): AssignmentLeg | undefined {
  switch (state) {
    case 'en-camino':
      return 'origen';
    case 'en-ruta-interurbana':
      return 'interurbano';
    case 'reparto-local':
      return 'local';
    default:
      return undefined;
  }
}
