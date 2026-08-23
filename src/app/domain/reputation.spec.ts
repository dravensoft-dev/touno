import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { AGREEMENTS } from './agreements.data';
import { BRANCHES, COMPANIES } from './businesses.data';
import { ORDERS } from './orders.data';
import { Platform } from './platform';
import { Reputation } from './reputation';
import { REPUTATION_HISTORY } from './reputation.data';
import {
  EMPTY_STANDING,
  ReputationFact,
  ReputationGate,
  countsOf,
  factsOfAgreement,
  meetsFloor,
  mergeStandings,
  pctOf,
  standingOf,
  subjectOf,
  weightOf,
} from './reputation.model';
import { RIDERS } from './riders.data';

function counts(...pairs: readonly [ReputationFact, number][]) {
  return pairs.map(([fact, count]) => ({ fact, count }));
}

describe('reputation figures', () => {
  it('reads a percentage of promises kept, and never a score out of five', () => {
    expect(standingOf(counts(['entrega-a-tiempo', 3], ['entrega-tarde', 1])).pct).toBe(75);
  });

  it('never reads a hundred per cent while one promise is broken', () => {
    expect(pctOf(194, 195)).toBe(99);
    expect(pctOf(999, 1000)).toBe(99);
    expect(pctOf(195, 195)).toBe(100);
  });

  it('answers no figure at all for a subject with no history, rather than a zero out of zero', () => {
    expect(standingOf([])).toEqual(EMPTY_STANDING);
    expect(standingOf([]).totalCount).toBe(0);
  });

  it('says what the figure is made of, fact by fact, largest first', () => {
    const breakdown = countsOf(
      [
        { subjectId: 'r-x', fact: 'entrega-a-tiempo', count: 10 },
        { subjectId: 'r-x', fact: 'entrega-tarde', count: 2 },
      ],
      [{ id: 'one', subjectId: 'r-x', fact: 'entrega-a-tiempo', at: '2026-08-15T10:00:00' }],
    );

    expect(breakdown[0]).toEqual({ fact: 'entrega-a-tiempo', count: 11 });
    expect(breakdown[1]).toEqual({ fact: 'entrega-tarde', count: 2 });
  });

  it('aggregates out of the kept and the total, never out of an average of percentages', () => {
    const busy = standingOf(counts(['pedido-despachado', 400], ['pedido-rechazado', 100]));
    const quiet = standingOf(counts(['pedido-despachado', 4], ['pedido-rechazado', 0]));

    expect(busy.pct).toBe(80);
    expect(quiet.pct).toBe(100);
    expect(mergeStandings([busy, quiet]).pct).toBe(80);
  });

  it('gives every fact a subject and a weight, so a new one cannot be added in silence', () => {
    for (const tally of REPUTATION_HISTORY) {
      expect(subjectOf(tally.fact)).toBeDefined();
      expect(['cumplido', 'incumplido']).toContain(weightOf(tally.fact));
    }
  });

  it('clears the floor exactly at it, and falls under it one point below', () => {
    expect(
      meetsFloor(standingOf(counts(['entrega-a-tiempo', 80], ['entrega-tarde', 20])), 80),
    ).toBe(true);
    expect(
      meetsFloor(standingOf(counts(['entrega-a-tiempo', 79], ['entrega-tarde', 21])), 80),
    ).toBe(false);
  });

  it('lets a subject with no history through the floor, because no record is not a bad record', () => {
    expect(meetsFloor(EMPTY_STANDING, 80)).toBe(true);
  });
});

describe('the closed history', () => {
  it('names a rider, a sucursal or a comprador that exists in every row', () => {
    const riders = new Set(RIDERS.map((one) => one.id));
    const branches = new Set(BRANCHES.map((one) => one.id));
    const buyers = new Set(ORDERS.map((one) => one.buyer.phone));

    for (const tally of REPUTATION_HISTORY) {
      const known =
        subjectOf(tally.fact) === 'rider'
          ? riders
          : subjectOf(tally.fact) === 'sucursal'
            ? branches
            : buyers;

      expect(known.has(tally.subjectId)).toBe(true);
    }
  });

  it('carries no pedido of its own, because a live pedido derives its own facts', () => {
    const codes = new Set(ORDERS.map((one) => one.code));

    for (const tally of REPUTATION_HISTORY) {
      expect(codes.has(tally.subjectId)).toBe(false);
    }
  });

  it('writes no row with a count of zero, because absence is how it says there is no history', () => {
    for (const tally of REPUTATION_HISTORY) {
      expect(tally.count).toBeGreaterThan(0);
    }
  });

  it('states each fact once per subject, so nothing is counted twice', () => {
    const keys = REPUTATION_HISTORY.map((one) => `${one.subjectId}|${one.fact}`);

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Reputation', () => {
  let reputation: Reputation;
  let platform: Platform;

  beforeEach(() => {
    reputation = TestBed.inject(Reputation);
    platform = TestBed.inject(Platform);
  });

  it('gives the demo rider, the demo sucursal and the demo comprador a figure each', () => {
    expect(reputation.of('r-marco').totalCount).toBeGreaterThan(0);
    expect(reputation.of('b-copacabana-miraflores').totalCount).toBeGreaterThan(0);
    expect(reputation.of('7712 4408').totalCount).toBeGreaterThan(0);
  });

  it('keeps one rider under Touno floor, so the hora pico refusal is walkable', () => {
    expect(reputation.clears('r-rene')).toBe(false);
  });

  it('keeps one sucursal under Touno floor, so the refusal to recruit is walkable', () => {
    const under = BRANCHES.filter((one) => !reputation.clears(one.id));

    expect(under.length).toBeGreaterThan(0);
  });

  it('leaves one subject with no history at all, so the empty figure is walkable', () => {
    const blank = RIDERS.filter((one) => reputation.of(one.id).totalCount === 0);

    expect(blank.length).toBeGreaterThan(0);
    expect(reputation.clears(blank[0].id)).toBe(true);
  });

  it('keeps the two demo sucursales above the floor, or their panels refuse to recruit', () => {
    expect(reputation.clears('b-copacabana-miraflores')).toBe(true);
    expect(reputation.clears('b-ale-la-paz')).toBe(true);
  });

  it('builds an empresa out of its sucursales and nothing else', () => {
    for (const company of COMPANIES) {
      const branches = BRANCHES.filter((one) => one.companyId === company.id);
      const summed = branches.reduce((sum, one) => sum + reputation.of(one.id).totalCount, 0);

      expect(reputation.ofCompany(company.id).totalCount).toBe(summed);
    }
  });

  it('counts a live pedido once, however many times it is asked for', () => {
    const first = reputation.of('b-copacabana-miraflores').totalCount;

    expect(reputation.of('b-copacabana-miraflores').totalCount).toBe(first);
  });

  it('counts an agreement the rider simply refused as neither kept nor broken', () => {
    const refused = AGREEMENTS.filter((one) => one.state === 'rechazado');

    expect(refused.length).toBeGreaterThan(0);

    for (const one of refused) {
      expect(reputation.breakdownOf(one.riderId).map((count) => count.fact)).not.toContain(
        'reclutamiento-abandonado',
      );
    }
  });

  it('counts a reclutamiento left with carreras pending against the rider, from the fixtures', () => {
    const walked = AGREEMENTS.filter(
      (one) =>
        one.settledAt !== undefined &&
        one.runsLeft > 0 &&
        (one.state === 'terminado' || one.state === 'vencido'),
    );

    expect(walked.length).toBeGreaterThan(0);

    for (const one of walked) {
      expect(reputation.breakdownOf(one.riderId).map((count) => count.fact)).toContain(
        'reclutamiento-abandonado',
      );
    }
  });

  it('counts an expired invitation nobody ever accepted against nobody', () => {
    const never = AGREEMENTS.filter(
      (one) => one.state === 'vencido' && one.settledAt === undefined,
    );

    expect(never.length).toBeGreaterThan(0);

    for (const one of never) {
      expect(factsOfAgreement(one)).toEqual([]);
    }
  });

  it('gives the demo sucursal two urban riders of different figures, so the ordering is visible', () => {
    const working = TestBed.inject(Agreements)
      .ridersOf('b-copacabana-miraflores')
      .filter((one) => one.vehicle !== 'camion');

    expect(working.length).toBeGreaterThan(1);

    const figures = working.map((one) => reputation.of(one.id).pct);

    expect(new Set(figures).size).toBeGreaterThan(1);
  });

  it('feeds the gate the rider, the weakest sucursal asked for, and the floor of the day', () => {
    const ask = reputation.gated<ReputationGate>('r-rene', {
      branchIds: ['b-copacabana-miraflores', 'b-yungas-oruro'],
    });

    expect(ask.riderPct).toBe(reputation.of('r-rene').pct);
    expect(ask.proposerPct).toBe(reputation.of('b-yungas-oruro').pct);
    expect(ask.floorPct).toBe(platform.minReputationPct());
  });

  it('blocks on the spot when Touno raises the floor, because the floor is read at the question', () => {
    expect(reputation.clears('r-marco')).toBe(true);

    platform.patch({ minReputationPct: 99 });

    expect(reputation.clears('r-marco')).toBe(false);
  });
});
