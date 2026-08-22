import { GeoPoint } from './geography.model';
import { DeliveryChoice } from './orders.model';
import { PlatformConfig, atLeast } from './platform.model';

export interface Fare {
  readonly productsBob: number;
  readonly commissionBob: number;
  readonly distanceBob: number;
  readonly weatherBob: number;
  readonly totalBob: number;
}

export interface FareInput {
  readonly productsBob: number;
  readonly delivery: DeliveryChoice;
  readonly baseFeeBob: number;
  readonly cityUnits: number;
  readonly interurbanUnits: number;
  readonly adverseWeather: boolean;
  readonly weatherFeeBob: number;
  readonly config: PlatformConfig;
}

export const EMPTY_FARE: Fare = {
  productsBob: 0,
  commissionBob: 0,
  distanceBob: 0,
  weatherBob: 0,
  totalBob: 0,
};

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function unitsBetween(from: GeoPoint, to: GeoPoint): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function commissionOf(productsBob: number, config: PlatformConfig): number {
  return round2((productsBob * config.commissionPct) / 100);
}

export function baseFeeOf(branchFeeBob: number, config: PlatformConfig): number {
  return atLeast(branchFeeBob, config.minDeliveryFeeBob);
}

export function distanceFeeOf(input: FareInput): number {
  if (input.delivery !== 'domicilio') {
    return 0;
  }

  return round2(
    baseFeeOf(input.baseFeeBob, input.config) +
      input.cityUnits * input.config.cityRateBob +
      input.interurbanUnits * input.config.interurbanRateBob,
  );
}

export function weatherFeeOf(input: FareInput): number {
  if (input.delivery !== 'domicilio' || !input.adverseWeather) {
    return 0;
  }

  return round2(atLeast(input.weatherFeeBob, input.config.weatherFeeBob));
}

export function fareOf(input: FareInput): Fare {
  const commissionBob = commissionOf(input.productsBob, input.config);
  const distanceBob = distanceFeeOf(input);
  const weatherBob = weatherFeeOf(input);

  return {
    productsBob: round2(input.productsBob),
    commissionBob,
    distanceBob,
    weatherBob,
    totalBob: round2(round2(input.productsBob) + commissionBob + distanceBob + weatherBob),
  };
}
