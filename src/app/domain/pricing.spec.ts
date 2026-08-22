import { PLATFORM } from './platform.data';
import { FareInput, distanceFeeOf, fareOf, round2, unitsBetween, weatherFeeOf } from './pricing';

function input(change: Partial<FareInput> = {}): FareInput {
  return {
    productsBob: 100,
    delivery: 'domicilio',
    baseFeeBob: 8,
    cityUnits: 0,
    interurbanUnits: 0,
    adverseWeather: false,
    weatherFeeBob: PLATFORM.weatherFeeBob,
    config: PLATFORM,
    ...change,
  };
}

describe('pricing', () => {
  it('charges the commission on the products alone, and always', () => {
    expect(fareOf(input()).commissionBob).toBe(15);
    expect(fareOf(input({ delivery: 'sucursal' })).commissionBob).toBe(15);
  });

  it('adds the four terms into the total the buyer pays', () => {
    const fare = fareOf(input({ cityUnits: 20, adverseWeather: true }));

    expect(fare.distanceBob).toBe(13);
    expect(fare.weatherBob).toBe(5);
    expect(fare.totalBob).toBe(100 + 15 + 13 + 5);
  });

  it('charges no distance and no weather when the buyer collects at the counter', () => {
    const fare = fareOf(input({ delivery: 'sucursal', cityUnits: 40, adverseWeather: true }));

    expect(fare.distanceBob).toBe(0);
    expect(fare.weatherBob).toBe(0);
    expect(fare.totalBob).toBe(115);
  });

  it('charges the weather only where the weather is against the rider', () => {
    expect(weatherFeeOf(input({ adverseWeather: false }))).toBe(0);
    expect(weatherFeeOf(input({ adverseWeather: true }))).toBe(5);
  });

  it('never charges a distance below what Touno set as the floor', () => {
    expect(distanceFeeOf(input({ baseFeeBob: 2 }))).toBe(PLATFORM.minDeliveryFeeBob);
    expect(distanceFeeOf(input({ baseFeeBob: 12 }))).toBe(12);
  });

  it('pays the interurban leg its own rate, because the two planes have no shared scale', () => {
    const near = distanceFeeOf(input({ cityUnits: 10 }));
    const far = distanceFeeOf(input({ cityUnits: 10, interurbanUnits: 56 }));

    expect(far).toBeGreaterThan(near);
    expect(round2(far - near)).toBe(round2(56 * PLATFORM.interurbanRateBob));
  });

  it('measures a distance in plane units and never in kilometres', () => {
    expect(unitsBetween({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('keeps every figure to the two decimals a boliviano has', () => {
    const fare = fareOf(input({ productsBob: 33.33, cityUnits: 7 }));

    expect(fare.commissionBob).toBe(5);
    expect(Number.isInteger(fare.totalBob * 100)).toBe(true);
  });
});
