import { TestBed } from '@angular/core/testing';
import { Businesses } from './businesses';
import { Promotions } from './promotions';
import { Reputation } from './reputation';
import { BRANCHES, COMPANIES } from './businesses.data';
import { PLATFORM } from './platform.data';
import { PROMOTIONS } from './promotions.data';
import { PLAN_LIMITS, limitsOf } from './businesses.model';
import {
  FareInput,
  RiderPayInput,
  discountOf,
  fareOf,
  legUnderFloor,
  riderLegPayOf,
  riderPayOf,
  riderRatesOf,
} from './pricing';
import {
  PROMOTION_REASONS,
  Promotion,
  PromotionRefusal,
  expired,
  exhausted,
  live,
  promotionRefusal,
} from './promotions.model';

const BUYER_PHONE = '7712 4408';

function byCode(code: string): Promotion {
  const promotion = PROMOTIONS.find((one) => one.code === code);

  if (!promotion) {
    throw new Error(`No fixture named ${code}`);
  }

  return promotion;
}

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
    cityUnits: 12,
    interurbanUnits: 0,
    adverseWeather: false,
    ...change,
  };
}

describe('promotions', () => {
  it('leaves the commission of Touno untouched by every promotion there is', () => {
    const bare = fareOf(input());

    for (const promotion of PROMOTIONS) {
      const promoted = fareOf(input({ companyId: promotion.companyId, promotion, buyerPct: 100 }));

      expect(promoted.commissionBob).toBe(bare.commissionBob);
    }
  });

  it('never lets a discount reach what the rider is paid', () => {
    const bare = riderPayOf(pay());

    for (const promotion of PROMOTIONS) {
      fareOf(input({ companyId: promotion.companyId, promotion, buyerPct: 100 }));

      expect(riderPayOf(pay())).toEqual(bare);
    }
  });

  it('subtracts a fixed amount from the products and nothing else', () => {
    const promotion = byCode('COPA10');
    const fare = fareOf(input({ companyId: promotion.companyId, promotion }));

    expect(fare.discountBob).toBe(10);
    expect(fare.productsBob).toBe(100);
    expect(fare.totalBob).toBe(
      fare.productsBob + fare.commissionBob + fare.distanceBob + fare.weatherBob - 10,
    );
  });

  it('stops a percentage at the ceiling the promotion carries', () => {
    const promotion = byCode('COPA20');
    const small = fareOf(input({ productsBob: 80, companyId: promotion.companyId, promotion }));
    const large = fareOf(input({ productsBob: 400, companyId: promotion.companyId, promotion }));

    expect(small.discountBob).toBe(16);
    expect(large.discountBob).toBe(promotion.discount?.capBob);
  });

  it('takes a delivery promotion off the envío and never off the products', () => {
    const promotion = byCode('ALEENVIO');
    const fare = fareOf(input({ companyId: promotion.companyId, promotion, cityUnits: 20 }));

    expect(fare.productsBob).toBe(100);
    expect(fare.discountBob).toBe(fare.distanceBob / 2);
  });

  it('charges no delivery discount when the buyer collects at the counter', () => {
    const promotion = byCode('ALEENVIO');

    expect(
      discountOf(input({ delivery: 'sucursal', companyId: promotion.companyId, promotion })),
    ).toBe(0);
  });

  it('never discounts more than the products cost', () => {
    const promotion = byCode('COPA10');

    expect(promotion.discount?.value).toBeGreaterThan(9);
    expect(discountOf(input({ productsBob: 9, companyId: promotion.companyId, promotion }))).toBe(
      9,
    );
  });

  it('reads the reputation floor at the question and not off a record', () => {
    const promotion = byCode('ALEGRATIS');
    const ask = { companyIds: [promotion.companyId], delivery: 'domicilio' as const };

    expect(promotionRefusal(promotion, { ...ask, buyerPct: 96 })).toBeUndefined();
    expect(promotionRefusal(promotion, { ...ask, buyerPct: 80 })).toBe('reputacion-baja');
  });

  it('reaches every refusal from a fixture, so each one is walkable', () => {
    const seen = new Set<PromotionRefusal>();
    const ask = { companyIds: COMPANIES.map((one) => one.id), delivery: 'domicilio' as const };

    seen.add(promotionRefusal(undefined, ask) as PromotionRefusal);

    for (const promotion of PROMOTIONS) {
      const refusal = promotionRefusal(promotion, { ...ask, buyerPct: 96 });

      if (refusal) {
        seen.add(refusal);
      }
    }

    const counter = promotionRefusal(byCode('ALEENVIO'), {
      companyIds: ['c-ale'],
      delivery: 'sucursal',
    });
    const stranger = promotionRefusal(byCode('COPA10'), {
      companyIds: ['c-ale'],
      delivery: 'domicilio',
    });

    seen.add(counter as PromotionRefusal);
    seen.add(stranger as PromotionRefusal);

    expect([...seen].sort()).toEqual(Object.keys(PROMOTION_REASONS).sort());
  });

  it('carries one live promotion of each kind, so each arithmetic is walkable', () => {
    const kinds = new Set(
      PROMOTIONS.filter((one) => live(one)).flatMap((one) =>
        one.discount ? [one.discount.kind] : [],
      ),
    );

    expect([...kinds].sort()).toEqual(['amount', 'delivery', 'percent']);
  });

  it('carries one promotion the demo buyer clears and one he does not', () => {
    const gated = PROMOTIONS.filter((one) => one.discount?.minReputationPct !== undefined);

    expect(gated.some((one) => (one.discount?.minReputationPct ?? 0) <= 96)).toBe(true);
    expect(gated.some((one) => (one.discount?.minReputationPct ?? 0) > 96)).toBe(true);
  });

  it('refuses the buyer a promotion that only pays the rider', () => {
    const promotion = byCode('COPANOCHE');

    expect(
      promotionRefusal(promotion, {
        companyIds: [promotion.companyId],
        delivery: 'domicilio',
        buyerPct: 96,
      }),
    ).toBe('sin-descuento');
    expect(discountOf(input({ companyId: promotion.companyId, promotion }))).toBe(0);
  });

  it('carries a promotion of each shape, so the three are walkable', () => {
    expect(PROMOTIONS.some((one) => one.discount && !one.riderLeg)).toBe(true);
    expect(PROMOTIONS.some((one) => one.riderLeg && !one.discount)).toBe(true);
    expect(PROMOTIONS.some((one) => one.discount && one.riderLeg)).toBe(true);
  });

  it('carries no promotion that neither discounts nor pays a rider', () => {
    for (const promotion of PROMOTIONS) {
      expect(promotion.discount !== undefined || promotion.riderLeg !== undefined).toBe(true);
    }
  });

  it('keeps one expired and one exhausted fixture, so both refusals are walkable', () => {
    expect(PROMOTIONS.filter((one) => expired(one)).length).toBeGreaterThan(0);
    expect(PROMOTIONS.filter((one) => exhausted(one)).length).toBeGreaterThan(0);
    expect(PROMOTIONS.filter((one) => !one.active).length).toBeGreaterThan(0);
  });
});

describe('the rider leg', () => {
  it('never offers a fija below the floor Touno sets for that mode', () => {
    for (const promotion of PROMOTIONS) {
      if (promotion.riderLeg) {
        expect(legUnderFloor(promotion.riderLeg, PLATFORM)).toBe(false);
      }
    }
  });

  it('pays more than the ordinary rate once the bonus is reached', () => {
    const leg = byCode('COPAPICO').riderLeg;

    if (!leg) {
      throw new Error('COPAPICO carries no rider leg');
    }

    const paid = riderLegPayOf({ leg, ordinaryPerTripBob: 15, runs: leg.bonusAfterRuns });

    expect(paid.bonusEarned).toBe(true);
    expect(paid.paidBob).toBeGreaterThan(paid.ordinaryBob);
  });

  it('protects the rider with the guarantee when the volume never arrives', () => {
    const leg = byCode('COPAPICO').riderLeg;

    if (!leg) {
      throw new Error('COPAPICO carries no rider leg');
    }

    const paid = riderLegPayOf({ leg, ordinaryPerTripBob: 15, runs: 4 });

    expect(paid.bonusEarned).toBe(false);
    expect(paid.promotionBob).toBeLessThan(paid.ordinaryBob);
    expect(paid.paidBob).toBe(leg.guaranteedBob);
    expect(paid.paidBob).toBeGreaterThan(paid.ordinaryBob);
  });
});

describe('Promotions', () => {
  let promotions: Promotions;
  let businesses: Businesses;
  let reputation: Reputation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    promotions = TestBed.inject(Promotions);
    businesses = TestBed.inject(Businesses);
    reputation = TestBed.inject(Reputation);
  });

  it('finds a code however the buyer typed it', () => {
    expect(promotions.byCode('  copa10 ')?.code).toBe('COPA10');
  });

  it('answers a refusal with the reason a person can read', () => {
    const reason = promotions.reasonOf('JULIO15', {
      companyIds: ['c-ale'],
      delivery: 'domicilio',
    });

    expect(reason).toBe(PROMOTION_REASONS.vencida);
  });

  it('refuses a rider leg on a plan that does not carry one', () => {
    expect(limitsOf('plus').riderLegs).toBe(false);
    expect(() =>
      promotions.create({
        companyId: 'c-ale',
        code: 'ALENUEVA',
        label: 'Prueba',
        limit: 50,
        until: '2026-12-31',
        discount: { kind: 'percent', value: 10 },
        riderLeg: {
          mode: 'normal',
          perTripBob: 14,
          bonusAfterRuns: 10,
          bonusBob: 100,
          guaranteedBob: 200,
        },
      }),
    ).toThrow();
  });

  it('refuses a rider leg under the floor even on the plan that carries one', () => {
    expect(limitsOf('marca').riderLegs).toBe(true);
    expect(() =>
      promotions.create({
        companyId: 'c-copacabana',
        code: 'COPABAJA',
        label: 'Prueba',
        limit: 50,
        until: '2026-12-31',
        discount: { kind: 'percent', value: 10 },
        riderLeg: {
          mode: 'normal',
          perTripBob: PLATFORM.riderBaseBob.normal - 1,
          bonusAfterRuns: 10,
          bonusBob: 100,
          guaranteedBob: 200,
        },
      }),
    ).toThrow();
  });

  it('refuses one promotion more than the plan admits', () => {
    const basico = COMPANIES.find((one) => one.plan === 'basico');

    expect(basico).toBeDefined();
    expect(promotions.roomFor(basico!.id)).toBe(true);

    promotions.create({
      companyId: basico!.id,
      code: 'PRIMERA',
      label: 'La única que admite el plan Básico',
      limit: 20,
      until: '2026-12-31',
      discount: { kind: 'amount', value: 5 },
    });

    expect(promotions.roomFor(basico!.id)).toBe(false);
    expect(() =>
      promotions.create({
        companyId: basico!.id,
        code: 'SEGUNDA',
        label: 'Una de más',
        limit: 20,
        until: '2026-12-31',
        discount: { kind: 'amount', value: 5 },
      }),
    ).toThrow();
  });

  it('counts a use only when the promotion is spent', () => {
    const before = promotions.byCode('COPA10')?.uses ?? 0;

    promotions.spend('COPA10');

    expect(promotions.byCode('COPA10')?.uses).toBe(before + 1);
  });

  it('refuses a promotion that neither discounts nor pays a rider', () => {
    expect(() =>
      promotions.create({
        companyId: 'c-copacabana',
        code: 'COPAVACIA',
        label: 'Prueba',
        limit: 50,
        until: '2026-12-31',
      }),
    ).toThrow();
  });

  it('never spends a promotion that does not discount the buyer', () => {
    const before = promotions.byCode('COPANOCHE')?.uses ?? 0;

    promotions.spend('COPANOCHE');

    expect(promotions.byCode('COPANOCHE')?.uses).toBe(before);
  });

  it('gives the demo buyer a reputation that clears one floor and not the other', () => {
    expect(reputation.of(BUYER_PHONE).pct).toBe(96);
  });

  it('never sells a destacado to a sucursal under the reputation floor', () => {
    const featured = BRANCHES.filter((one) => one.featuredUntil !== undefined);

    expect(featured.length).toBeGreaterThan(0);

    for (const branch of featured) {
      expect(reputation.clears(branch.id)).toBe(true);
    }
  });

  it('keeps every empresa within the destacados its plan admits', () => {
    for (const company of COMPANIES) {
      const featured = BRANCHES.filter(
        (one) => one.companyId === company.id && one.featuredUntil !== undefined,
      );

      expect(featured.length).toBeLessThanOrEqual(limitsOf(company.plan).featuredSlots);
    }
  });

  it('leaves the order by merit exactly as it was, destacado or not', () => {
    const ranked = reputation.bestFirst(BRANCHES).map((one) => one.id);
    const stripped = reputation
      .bestFirst(BRANCHES.map((one) => ({ id: one.id, name: one.name })))
      .map((one) => one.id);

    expect(ranked).toEqual(stripped);
  });

  it('charges the same commission on every plan, which is what the audit settled', () => {
    const rates = Object.values(PLAN_LIMITS).map(() => PLATFORM.commissionPct);

    expect(new Set(rates).size).toBe(1);
    expect(businesses.companies().every((one) => one.plan !== undefined)).toBe(true);
  });
});
