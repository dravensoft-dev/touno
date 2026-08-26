import { WorkMode } from './agreements.model';
import { GeoPoint } from './geography.model';
import { DeliveryChoice } from './orders.model';
import { PlatformConfig, atLeast } from './platform.model';
import { Promotion, RiderLeg, promotionRefusal } from './promotions.model';

export interface Fare {
  readonly productsBob: number;
  readonly commissionBob: number;
  readonly distanceBob: number;
  readonly weatherBob: number;
  readonly discountBob: number;
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
  readonly companyId?: string;
  readonly promotion?: Promotion;
  readonly buyerPct?: number;
}

export const EMPTY_FARE: Fare = {
  productsBob: 0,
  commissionBob: 0,
  distanceBob: 0,
  weatherBob: 0,
  discountBob: 0,
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

function capped(amount: number, capBob: number | undefined): number {
  return capBob === undefined ? amount : Math.min(amount, capBob);
}

export function discountOf(input: FareInput): number {
  const promotion = input.promotion;
  const discount = promotion?.discount;

  if (!promotion || !discount) {
    return 0;
  }

  const refusal = promotionRefusal(promotion, {
    companyIds: input.companyId ? [input.companyId] : [],
    delivery: input.delivery,
    buyerPct: input.buyerPct,
  });

  if (refusal) {
    return 0;
  }

  const products = round2(input.productsBob);

  if (discount.kind === 'amount') {
    return round2(Math.min(discount.value, products));
  }

  if (discount.kind === 'percent') {
    return round2(capped((products * discount.value) / 100, discount.capBob));
  }

  const distance = distanceFeeOf(input);

  return round2(capped((distance * discount.value) / 100, discount.capBob));
}

export function fareOf(input: FareInput): Fare {
  const commissionBob = commissionOf(input.productsBob, input.config);
  const distanceBob = distanceFeeOf(input);
  const weatherBob = weatherFeeOf(input);
  const discountBob = discountOf(input);

  return {
    productsBob: round2(input.productsBob),
    commissionBob,
    distanceBob,
    weatherBob,
    discountBob,
    totalBob: round2(
      round2(input.productsBob) + commissionBob + distanceBob + weatherBob - discountBob,
    ),
  };
}

export interface RiderOffer {
  readonly baseBob?: number;
  readonly cityRateBob?: number;
  readonly interurbanRateBob?: number;
  readonly weatherFeeBob?: number;
}

export interface RiderRates {
  readonly baseBob: number;
  readonly cityRateBob: number;
  readonly interurbanRateBob: number;
  readonly weatherFeeBob: number;
}

export interface RiderPay {
  readonly baseBob: number;
  readonly distanceBob: number;
  readonly weatherBob: number;
  readonly totalBob: number;
}

export interface RiderPayInput {
  readonly rates: RiderRates;
  readonly cityUnits: number;
  readonly interurbanUnits: number;
  readonly adverseWeather: boolean;
}

function raised(floor: number, ...offers: readonly (number | undefined)[]): number {
  return offers
    .filter((one): one is number => one !== undefined)
    .reduce((best, one) => atLeast(one, best), floor);
}

export function riderRatesOf(
  mode: WorkMode,
  config: PlatformConfig,
  branch?: RiderOffer,
  company?: RiderOffer,
): RiderRates {
  return {
    baseBob: raised(config.riderBaseBob[mode], branch?.baseBob, company?.baseBob),
    cityRateBob: raised(config.cityRateBob, branch?.cityRateBob, company?.cityRateBob),
    interurbanRateBob: raised(
      config.interurbanRateBob,
      branch?.interurbanRateBob,
      company?.interurbanRateBob,
    ),
    weatherFeeBob: raised(config.weatherFeeBob, branch?.weatherFeeBob, company?.weatherFeeBob),
  };
}

export function riderDistanceOf(input: RiderPayInput): number {
  return round2(
    input.cityUnits * input.rates.cityRateBob +
      input.interurbanUnits * input.rates.interurbanRateBob,
  );
}

export function riderWeatherOf(input: RiderPayInput): number {
  return input.adverseWeather ? round2(input.rates.weatherFeeBob) : 0;
}

export function riderPayOf(input: RiderPayInput): RiderPay {
  const baseBob = round2(input.rates.baseBob);
  const distanceBob = riderDistanceOf(input);
  const weatherBob = riderWeatherOf(input);

  return {
    baseBob,
    distanceBob,
    weatherBob,
    totalBob: round2(baseBob + distanceBob + weatherBob),
  };
}

export interface RiderLegInput {
  readonly leg: RiderLeg;
  readonly ordinaryPerTripBob: number;
  readonly runs: number;
}

export interface RiderLegPay {
  readonly ordinaryBob: number;
  readonly promotionBob: number;
  readonly guaranteedBob: number;
  readonly paidBob: number;
  readonly bonusEarned: boolean;
  readonly bonusAtRuns: number;
}

export function legUnderFloor(leg: RiderLeg, config: PlatformConfig): boolean {
  return leg.perTripBob < config.riderBaseBob[leg.mode];
}

export function riderLegPayOf(input: RiderLegInput): RiderLegPay {
  const bonusEarned = input.runs >= input.leg.bonusAfterRuns;
  const promotionBob = round2(
    input.runs * input.leg.perTripBob + (bonusEarned ? input.leg.bonusBob : 0),
  );

  return {
    ordinaryBob: round2(input.runs * input.ordinaryPerTripBob),
    promotionBob,
    guaranteedBob: round2(input.leg.guaranteedBob),
    paidBob: round2(Math.max(promotionBob, input.leg.guaranteedBob)),
    bonusEarned,
    bonusAtRuns: input.leg.bonusAfterRuns,
  };
}
