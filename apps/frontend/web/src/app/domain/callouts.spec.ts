import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { Callouts } from './callouts';
import { CALLOUTS, CUPO_CLAIMS } from './callouts.data';
import { BRANCHES } from './businesses.data';
import { Platform } from './platform';
import { Reputation } from './reputation';
import { RIDERS } from './riders.data';
import { CalloutState, ClaimState, cuposLeft, stateOf } from './callouts.model';

describe('the llamados a fixtures carry', () => {
  it('names a sucursal and an empresa that own each other in every row', () => {
    const branches = new Map(BRANCHES.map((one) => [one.id, one]));

    for (const callout of CALLOUTS) {
      expect(branches.get(callout.branchId)?.companyId).toBe(callout.companyId);
    }
  });

  it('claims a cupo of a llamado that exists, for a rider that exists', () => {
    const calls = new Set(CALLOUTS.map((one) => one.id));
    const riders = new Set(RIDERS.map((one) => one.id));

    for (const claim of CUPO_CLAIMS) {
      expect(calls.has(claim.calloutId)).toBe(true);
      expect(riders.has(claim.riderId)).toBe(true);
    }
  });

  it('reaches every state a llamado and a cupo can be in, so each is walkable', () => {
    const calls = new Set(CALLOUTS.map((one) => stateOf(one, CUPO_CLAIMS)));
    const claims = new Set(CUPO_CLAIMS.map((one) => one.state));

    for (const state of ['abierto', 'lleno', 'cerrado'] as CalloutState[]) {
      expect(calls.has(state)).toBe(true);
    }

    for (const state of ['en-camino', 'trabajando', 'terminado', 'abandonado'] as ClaimState[]) {
      expect(claims.has(state)).toBe(true);
    }
  });

  it('carries a rider bound to nobody, and one of them already on a cupo', () => {
    const agreements = TestBed.inject(Agreements);
    const loose = RIDERS.filter((one) => agreements.ofRider(one.id).length === 0);
    const working = CUPO_CLAIMS.filter((one) => one.state === 'trabajando');

    expect(loose.length).toBeGreaterThan(1);
    expect(loose.some((one) => working.some((two) => two.riderId === one.id))).toBe(true);
    expect(loose.some((one) => !working.some((two) => two.riderId === one.id))).toBe(true);
  });
});

describe('Callouts', () => {
  let callouts: Callouts;
  let agreements: Agreements;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    callouts = TestBed.inject(Callouts);
    agreements = TestBed.inject(Agreements);
  });

  function loose(): string {
    const rider = RIDERS.find(
      (one) => agreements.ofRider(one.id).length === 0 && callouts.holdingOf(one.id) === undefined,
    );

    expect(rider).toBeDefined();

    return rider!.id;
  }

  function draft(change: Record<string, unknown> = {}) {
    return {
      branchId: 'b-copacabana-sopocachi',
      companyId: 'c-copacabana',
      originBranchId: 'b-copacabana-sopocachi',
      cupos: 2,
      fixedBob: 10,
      ...change,
    };
  }

  it('opens a llamado only for the sucursal that opened it', () => {
    expect(() => callouts.publish(draft({ originBranchId: 'b-copacabana-miraflores' }))).toThrow();
    expect(() => callouts.publish(draft({ originBranchId: undefined }))).toThrow();
  });

  it('refuses a llamado with no cupo, because a llamado with none is a closed door', () => {
    expect(() => callouts.publish(draft({ cupos: 0 }))).toThrow();
  });

  it('refuses a fija below what Touno pays an agente libre', () => {
    const floor = TestBed.inject(Platform).riderBaseBob()['agente-libre'];

    expect(() => callouts.publish(draft({ fixedBob: floor - 1 }))).toThrow();
    expect(() => callouts.publish(draft({ fixedBob: floor }))).not.toThrow();
  });

  it('stops offering a llamado once its cupos are taken', () => {
    const published = callouts.publish(draft({ cupos: 1 }));
    const rider = loose();

    expect(callouts.open().some((one) => one.id === published.id)).toBe(true);

    callouts.claim(published.id, rider, true);

    expect(cuposLeft(published, callouts.claimsOf(published.id))).toBe(0);
    expect(callouts.open().some((one) => one.id === published.id)).toBe(false);
  });

  it('refuses a cupo to a rider who still owes carreras somewhere', () => {
    const published = callouts.publish(draft());

    expect(agreements.runsPendingOf('r-marco')).toBeGreaterThan(0);
    expect(() => callouts.claim(published.id, 'r-marco', false)).toThrow();
  });

  it('refuses a second cupo to a rider who is already holding one', () => {
    const published = callouts.publish(draft());
    const other = callouts.publish(draft({ cupos: 1 }));
    const rider = loose();

    callouts.claim(published.id, rider, true);

    expect(() => callouts.claim(other.id, rider, true)).toThrow();
  });

  it('lets a rider under Touno reputation floor take a cupo, which is his way back', () => {
    const reputation = TestBed.inject(Reputation);
    const published = callouts.publish(draft());

    expect(reputation.clears('r-rene')).toBe(false);
    expect(agreements.runsPendingOf('r-rene')).toBe(0);
    expect(() => callouts.claim(published.id, 'r-rene', true)).not.toThrow();
  });

  it('ends the trato with one sucursal without ending the free agent himself', () => {
    const published = callouts.publish(draft());
    const rider = loose();
    const claim = callouts.claim(published.id, rider, true);

    callouts.arrive(claim.id);

    expect(callouts.holdingOf(rider)?.state).toBe('trabajando');

    callouts.leave(claim.id);

    expect(callouts.holdingOf(rider)).toBeUndefined();
    expect(() => callouts.claim(published.id, rider, true)).not.toThrow();
  });

  it('counts a cupo left behind as broken, and a cupo left after working as neither', () => {
    const published = callouts.publish(draft());
    const rider = loose();
    const claim = callouts.claim(published.id, rider, true);

    callouts.abandon(claim.id);

    expect(callouts.claimById(claim.id)?.state).toBe('abandonado');
  });
});
