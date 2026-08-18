import { Contact } from './orders.model';

export type ShipmentState =
  | 'esperando-recojo'
  | 'sin-conductor'
  | 'en-camino-a-sucursal'
  | 'recibido'
  | 'sellado'
  | 'en-bus'
  | 'listo-para-recoger'
  | 'entregado'
  | 'incidencia';

export type MilestoneKind =
  'recogido' | 'sellado' | 'manifiesto' | 'en-ruta' | 'llegada' | 'entregado';

export interface Milestone {
  readonly kind: MilestoneKind;
  readonly label: string;
  readonly at?: string;
  readonly place?: string;
  readonly note?: string;
  readonly live: boolean;
}

export interface BranchRef {
  readonly branchId: string;
  readonly city: string;
}

export interface Branch {
  readonly id: string;
  readonly carrierId: string;
  readonly city: string;
  readonly name: string;
  readonly address: string;
  readonly window: string;
  readonly desk: string;
}

export interface Carrier {
  readonly id: string;
  readonly name: string;
  readonly departures: readonly string[];
  readonly branches: readonly string[];
}

export interface Tariff {
  readonly fromCity: string;
  readonly toCity: string;
  readonly carrierId: string;
  readonly maxKg: number;
  readonly freightBob: number;
  readonly pickupBob: number;
  readonly hours: number;
}

export interface Manifest {
  readonly id: string;
  readonly carrierId: string;
  readonly branchId: string;
  readonly departure: string;
  readonly plate: string;
  readonly route: string;
  readonly sealed: number;
  readonly missing: number;
  readonly guias: readonly string[];
}

export interface Shipment {
  readonly guia: string;
  readonly slug: string;
  readonly importerSlug: string;
  readonly recipient: Contact;
  readonly origin: BranchRef;
  readonly destination: BranchRef;
  readonly content: string;
  readonly weightKg: number;
  readonly carrierId: string;
  readonly departure: string;
  readonly pickupBob: number;
  readonly freightBob: number;
  readonly totalBob: number;
  readonly payer: 'remitente' | 'destinatario';
  readonly paid: boolean;
  readonly state: ShipmentState;
  readonly createdAt: string;
  readonly etaAt: string;
  readonly pickupCode: string;
  readonly driverId?: string;
  readonly publicTracking: boolean;
  readonly voucherPhoto?: string;
  readonly milestones: readonly Milestone[];
}
