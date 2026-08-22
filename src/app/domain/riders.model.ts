import { Card, PayoutMethod } from './payments.model';

export type Vehicle = 'moto' | 'auto' | 'camion';

export type RiderRange = 'urbano' | 'interurbano';

export interface Rider {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly photo?: string;
  readonly plate: string;
  readonly vehicle: Vehicle;
  readonly cityId: string;
  readonly zones: readonly string[];
  readonly rating: number;
  readonly tripsDone: number;
  readonly onTimePct: number;
  readonly online: boolean;
  readonly ratePerTripBob: number;
  readonly account: string;
  readonly payoutMethod: PayoutMethod;
  readonly card?: Card;
  readonly phone: string;
}

export interface Payout {
  readonly day: string;
  readonly label: string;
  readonly trips: number;
  readonly earnBob: number;
}

export function rangeOf(vehicle: Vehicle): RiderRange {
  return vehicle === 'camion' ? 'interurbano' : 'urbano';
}

const VEHICLE_LABELS: Record<Vehicle, string> = {
  moto: 'Moto',
  auto: 'Auto',
  camion: 'Camión',
};

const VEHICLE_ICONS: Record<Vehicle, string> = {
  moto: 'ph-bold ph-motorcycle',
  auto: 'ph-bold ph-car',
  camion: 'ph-bold ph-truck',
};

export function vehicleLabel(vehicle: Vehicle): string {
  return VEHICLE_LABELS[vehicle];
}

export function vehicleIcon(vehicle: Vehicle): string {
  return VEHICLE_ICONS[vehicle];
}
