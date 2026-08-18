import { MerchantKind } from './marketplace.model';

export type Vehicle = 'moto' | 'auto' | 'camioneta';

export interface Driver {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly photo?: string;
  readonly plate: string;
  readonly vehicle: Vehicle;
  readonly city: string;
  readonly zones: readonly string[];
  readonly rating: number;
  readonly ridesDone: number;
  readonly onTimePct: number;
  readonly available: boolean;
  readonly ratePerRideBob: number;
  readonly account: string;
}

export type RideKind = 'comida' | 'recojo-encomienda';

export type RideState = 'ofrecida' | 'aceptada' | 'recogida' | 'entregada' | 'rechazada';

export interface Stop {
  readonly label: string;
  readonly address: string;
  readonly city: string;
}

export interface Ride {
  readonly id: string;
  readonly kind: RideKind;
  readonly driverId?: string;
  readonly merchantSlug?: string;
  readonly orderCode?: string;
  readonly guia?: string;
  readonly pickup: Stop;
  readonly dropoff: Stop;
  readonly earnBob: number;
  readonly state: RideState;
  readonly beforeAt: string;
  readonly photoTaken: boolean;
  readonly distanceKm: number;
}

export interface Payout {
  readonly day: string;
  readonly label: string;
  readonly rides: number;
  readonly earnBob: number;
}

export type OfferState = 'pendiente' | 'aceptada' | 'rechazada' | 'vencida';

export interface HiringOffer {
  readonly id: string;
  readonly businessSlug: string;
  readonly businessName: string;
  readonly businessKind: MerchantKind;
  readonly driverId: string;
  readonly rides: number;
  readonly ridesUsed: number;
  readonly perRideBob: number;
  readonly totalBob: number;
  readonly validUntil: string;
  readonly state: OfferState;
  readonly message?: string;
  readonly sentAt: string;
}
