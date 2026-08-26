import { WorkMode } from './agreements.model';
import { PLATFORM } from './platform.data';
import {
  FareInput,
  RiderPayInput,
  distanceFeeOf,
  fareOf,
  riderPayOf,
  riderRatesOf,
  round2,
  unitsBetween,
  weatherFeeOf,
} from './pricing';

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

function pay(change: Partial<RiderPayInput> = {}): RiderPayInput {
  return {
    rates: riderRatesOf('normal', PLATFORM),
    cityUnits: 0,
    interurbanUnits: 0,
    adverseWeather: false,
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

  it('pays a free agent less than a recruited rider for the same carrera', () => {
    const trip = { cityUnits: 12, interurbanUnits: 0, adverseWeather: false };
    const under = (mode: WorkMode) =>
      riderPayOf(pay({ ...trip, rates: riderRatesOf(mode, PLATFORM) })).totalBob;

    expect(under('agente-libre')).toBeLessThan(under('normal'));
    expect(under('normal')).toBeLessThan(under('hora-pico'));
  });

  it('never pays a fixed below what Touno set for that way of working', () => {
    const paid = riderPayOf(pay({ rates: riderRatesOf('normal', PLATFORM, { baseBob: 1 }) }));

    expect(paid.baseBob).toBe(PLATFORM.riderBaseBob.normal);
  });

  it('pays the fixed a sucursal raised, because a raise is the only edit allowed', () => {
    const paid = riderPayOf(pay({ rates: riderRatesOf('normal', PLATFORM, { baseBob: 40 }) }));

    expect(paid.baseBob).toBe(40);
  });

  it('pays the per-unit rate a sucursal raised, and not the floor it raised it from', () => {
    const paid = riderPayOf(
      pay({ rates: riderRatesOf('normal', PLATFORM, { cityRateBob: 0.9 }), cityUnits: 10 }),
    );

    expect(paid.distanceBob).toBe(9);
  });

  it('pays the weather extra a sucursal raised, on the same terms as the rest', () => {
    const paid = riderPayOf(
      pay({ rates: riderRatesOf('normal', PLATFORM, { weatherFeeBob: 12 }), adverseWeather: true }),
    );

    expect(paid.weatherBob).toBe(12);
  });

  it('adds the distance and the weather on top of the fixed', () => {
    const paid = riderPayOf(
      pay({
        rates: riderRatesOf('normal', PLATFORM, { baseBob: 20 }),
        cityUnits: 12,
        adverseWeather: true,
      }),
    );

    expect(paid.distanceBob).toBe(round2(12 * PLATFORM.cityRateBob));
    expect(paid.weatherBob).toBe(PLATFORM.weatherFeeBob);
    expect(paid.totalBob).toBe(round2(20 + paid.distanceBob + paid.weatherBob));
  });

  it('measures the rider distance in plane units, at the rate of the plane it crossed', () => {
    const city = riderPayOf(pay({ cityUnits: 10 }));
    const far = riderPayOf(pay({ cityUnits: 10, interurbanUnits: 10 }));

    expect(round2(far.distanceBob - city.distanceBob)).toBe(
      round2(10 * PLATFORM.interurbanRateBob),
    );
  });

  it('reads Touno floors when neither the sucursal nor the empresa raised one', () => {
    const floors = riderRatesOf('normal', PLATFORM);

    expect(floors.cityRateBob).toBe(PLATFORM.cityRateBob);
    expect(floors.baseBob).toBe(PLATFORM.riderBaseBob.normal);
  });

  it('keeps the best raise the rider was promised, whichever level promised it', () => {
    const both = riderRatesOf('normal', PLATFORM, { cityRateBob: 0.9 }, { baseBob: 30 });
    const undercut = riderRatesOf('normal', PLATFORM, { baseBob: 14 }, { baseBob: 30 });

    expect(both.cityRateBob).toBe(0.9);
    expect(both.baseBob).toBe(30);
    expect(undercut.baseBob).toBe(30);
  });

  it('refuses to read an offer below the floor as a cut', () => {
    const cut = riderRatesOf('hora-pico', PLATFORM, { cityRateBob: 0.01, baseBob: 1 }, undefined);

    expect(cut.cityRateBob).toBe(PLATFORM.cityRateBob);
    expect(cut.baseBob).toBe(PLATFORM.riderBaseBob['hora-pico']);
  });
});
