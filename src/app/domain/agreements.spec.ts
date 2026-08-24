import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { Businesses } from './businesses';
import { Riders } from './riders';
import { Platform } from './platform';
import { Reputation } from './reputation';
import { AgreementDraft, AgreementState, otherSide } from './agreements.model';

describe('Agreements', () => {
  let agreements: Agreements;
  let businesses: Businesses;
  let riders: Riders;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    agreements = TestBed.inject(Agreements);
    businesses = TestBed.inject(Businesses);
    riders = TestBed.inject(Riders);
  });

  function pendingFrom(side: 'empresa' | 'rider') {
    const agreement = agreements.pending().find((one) => one.initiatedBy === side);

    expect(agreement).toBeDefined();

    return agreement!;
  }

  it('names a rider, an empresa and sucursales that all exist', () => {
    for (const agreement of agreements.all()) {
      expect(riders.byId(agreement.riderId)).toBeDefined();
      expect(businesses.companyById(agreement.companyId)).toBeDefined();
      expect(agreement.branchIds.length).toBeGreaterThan(0);

      for (const branchId of agreement.branchIds) {
        expect(businesses.branchById(branchId)?.companyId).toBe(agreement.companyId);
      }
    }
  });

  it('scopes an agreement to sucursales, not to a whole empresa', () => {
    const scoped = agreements
      .active()
      .find((one) => one.branchIds.length < businesses.branchesOf(one.companyId).length);

    expect(scoped).toBeDefined();
  });

  it('carries an agreement of one sucursal and one of a group', () => {
    expect(agreements.active().some((one) => one.branchIds.length === 1)).toBe(true);
    expect(agreements.active().some((one) => one.branchIds.length > 1)).toBe(true);
  });

  it('reaches every state, and is proposed from both sides', () => {
    const states = new Set(agreements.all().map((one) => one.state));

    for (const state of [
      'pendiente',
      'activo',
      'rechazado',
      'terminado',
      'vencido',
    ] as AgreementState[]) {
      expect(states.has(state)).toBe(true);
    }

    expect(agreements.all().some((one) => one.initiatedBy === 'empresa')).toBe(true);
    expect(agreements.all().some((one) => one.initiatedBy === 'rider')).toBe(true);
    expect(agreements.pending().some((one) => one.initiatedBy === 'empresa')).toBe(true);
    expect(agreements.pending().some((one) => one.initiatedBy === 'rider')).toBe(true);
  });

  for (const side of ['empresa', 'rider'] as const) {
    it(`lets the ${otherSide(side)} answer what the ${side} proposed`, () => {
      const agreement = pendingFrom(side);
      const answering = otherSide(side);
      const actor = answering === 'rider' ? agreement.riderId : agreement.companyId;

      agreements.accept(agreement.id, answering, actor);

      expect(agreements.byId(agreement.id)?.state).toBe('activo');
      expect(agreements.byId(agreement.id)?.settledAt).toBeDefined();
    });

    it(`refuses to let the ${side} accept its own proposal`, () => {
      const agreement = pendingFrom(side);
      const actor = side === 'rider' ? agreement.riderId : agreement.companyId;

      expect(() => agreements.accept(agreement.id, side, actor)).toThrow();
      expect(agreements.byId(agreement.id)?.state).toBe('pendiente');
    });
  }

  it('refuses an answer from a party the agreement does not name', () => {
    const agreement = pendingFrom('empresa');

    expect(() => agreements.accept(agreement.id, 'rider', 'r-no-invitado')).toThrow();
    expect(agreements.byId(agreement.id)?.state).toBe('pendiente');
  });

  it('only transitions an agreement that is still pendiente', () => {
    const agreement = pendingFrom('empresa');

    agreements.reject(agreement.id, 'rider', agreement.riderId);

    expect(agreements.byId(agreement.id)?.state).toBe('rechazado');
    expect(() => agreements.accept(agreement.id, 'rider', agreement.riderId)).toThrow();
  });

  it('throws for an agreement that is not there', () => {
    expect(() => agreements.accept('ag-no-existe', 'rider', 'r-marco')).toThrow();
  });

  it('proposes from either side and leaves it waiting on the other', () => {
    const agreement = agreements.propose({
      riderId: 'r-ivan',
      companyId: 'c-illimani',
      branchIds: ['b-illimani-san-miguel'],
      initiatedBy: 'empresa',
      kind: 'normal',
      perTripBob: 19,
      runs: 20,
    });

    expect(agreement.state).toBe('pendiente');
    expect(agreements.awaiting('rider', 'r-ivan').map((one) => one.id)).toContain(agreement.id);
    expect(agreements.awaiting('empresa', 'c-illimani').map((one) => one.id)).not.toContain(
      agreement.id,
    );
  });

  it('binds a rider to a sucursal only through an active agreement', () => {
    expect(agreements.covers('r-marco', 'b-copacabana-miraflores')).toBe(true);
    expect(agreements.covers('r-marco', 'b-oriental-norte')).toBe(false);
    expect(agreements.covers('r-ivan', 'b-copacabana-miraflores')).toBe(false);
  });

  it('lists the riders a sucursal may assign, and only those', () => {
    const working = agreements.ridersOf('b-copacabana-miraflores').map((one) => one.id);

    expect(working).toContain('r-marco');

    for (const id of working) {
      expect(agreements.covers(id, 'b-copacabana-miraflores')).toBe(true);
    }
  });

  it('lets a rider hold agreements with more than one empresa at a time', () => {
    const companies = agreements.activeFor('r-marco').map((one) => one.companyId);

    expect(new Set(companies).size).toBeGreaterThan(1);
  });

  it('ends an active agreement and drops the rider from that sucursal', () => {
    const agreement = agreements.active()[0];
    const branchId = agreement.branchIds[0];

    agreements.end(agreement.id);

    expect(agreements.byId(agreement.id)?.state).toBe('terminado');
    expect(agreements.covers(agreement.riderId, branchId)).toBe(false);
  });

  it('calls a rider free only when he owes nobody and nothing', () => {
    expect(agreements.activeFor('r-marco').length).toBeGreaterThan(0);
    expect(agreements.freeToRoam('r-marco')).toBe(false);
    expect(agreements.freeToRoam('r-tania')).toBe(true);
  });

  it('stops calling a rider free the moment he accepts a reclutamiento', () => {
    const invitation = agreements.propose({
      riderId: 'r-tania',
      companyId: 'c-copacabana',
      branchIds: ['b-copacabana-miraflores'],
      initiatedBy: 'empresa',
      kind: 'normal',
      perTripBob: 16,
      runs: 8,
    });

    expect(agreements.freeToRoam('r-tania')).toBe(true);

    agreements.accept(invitation.id, 'rider', 'r-tania');

    expect(agreements.freeToRoam('r-tania')).toBe(false);
  });

  function peakDraft(change: Partial<AgreementDraft> = {}): AgreementDraft {
    return {
      riderId: 'r-ivan',
      companyId: 'c-copacabana',
      branchIds: ['b-copacabana-miraflores'],
      initiatedBy: 'empresa',
      kind: 'hora-pico',
      perTripBob: 25,
      runs: 10,
      ...change,
    };
  }

  it('refuses a sucursal that scopes any reclutamiento beyond itself', () => {
    const beyond = {
      originBranchId: 'b-copacabana-miraflores',
      branchIds: ['b-copacabana-miraflores', 'b-copacabana-sopocachi'],
    };

    expect(() => agreements.propose(peakDraft({ kind: 'normal', ...beyond }))).toThrow();
    expect(() => agreements.propose(peakDraft({ kind: 'hora-pico', ...beyond }))).toThrow();
  });

  it('lets a sucursal recruit normal for itself, which is the whole of its reach', () => {
    const own = agreements.propose(
      peakDraft({
        kind: 'normal',
        riderId: 'r-noemi',
        originBranchId: 'b-copacabana-sopocachi',
        branchIds: ['b-copacabana-sopocachi'],
      }),
    );

    expect(own.kind).toBe('normal');
    expect(own.originBranchId).toBe('b-copacabana-sopocachi');
  });

  it('refuses a fixed below what Touno pays that clase, which is what orders the margins', () => {
    const floors = TestBed.inject(Platform).riderBaseBob();

    expect(() =>
      agreements.propose(peakDraft({ kind: 'normal', perTripBob: floors.normal - 1 })),
    ).toThrow();
    expect(() =>
      agreements.propose(peakDraft({ kind: 'hora-pico', perTripBob: floors.normal })),
    ).toThrow();
  });

  it('refuses a reclutamiento that gives less than the minimum Touno set', () => {
    const minimum = TestBed.inject(Platform).minRuns();

    expect(() => agreements.propose(peakDraft({ kind: 'normal', runs: minimum - 1 }))).toThrow();
    expect(() => agreements.propose(peakDraft({ kind: 'normal', runs: minimum }))).not.toThrow();
  });

  it('refuses hora pico to a rider under Touno reputation floor, and says which refusal it is', () => {
    const reputation = TestBed.inject(Reputation);

    expect(reputation.clears('r-rene')).toBe(false);
    expect(agreements.runsPendingOf('r-rene')).toBe(0);

    const ask = reputation.gated('r-rene', {
      companyId: 'c-copacabana',
      branchIds: ['b-copacabana-miraflores'],
    });

    expect(agreements.refusalFor('r-rene', ask)).toBe('reputacion-baja');
    expect(() => agreements.propose(peakDraft({ riderId: 'r-rene', ...ask }))).toThrow();
  });

  it('reports the reputation refusal before the carreras pendientes one', () => {
    const ask = {
      companyId: 'c-copacabana',
      branchIds: ['b-copacabana-miraflores'],
      riderPct: 40,
      floorPct: 80,
    };

    expect(agreements.runsPendingOf('r-marco')).toBeGreaterThan(0);
    expect(agreements.refusalFor('r-marco', ask)).toBe('reputacion-baja');
  });

  it('refuses a reclutamiento proposed by a sucursal under the floor, whatever its clase', () => {
    const reputation = TestBed.inject(Reputation);

    expect(reputation.clears('b-yungas-oruro')).toBe(false);

    const draft = reputation.gated('r-ivan', {
      ...peakDraft({ kind: 'normal', companyId: 'c-yungas', branchIds: ['b-yungas-oruro'] }),
    });

    expect(() => agreements.propose(draft)).toThrow();
  });

  it('refuses one an empresa scopes through a good sucursal to carry a bad one', () => {
    const reputation = TestBed.inject(Reputation);

    const draft = reputation.gated('r-ivan', {
      ...peakDraft({
        kind: 'normal',
        companyId: 'c-yungas',
        branchIds: ['b-yungas-la-paz', 'b-yungas-oruro'],
      }),
    });

    expect(reputation.clears('b-yungas-la-paz')).toBe(true);
    expect(() => agreements.propose(draft)).toThrow();
  });

  it('lets a rider with no history at all take hora pico, because no record is not a bad record', () => {
    const reputation = TestBed.inject(Reputation);

    expect(reputation.of('r-elias').totalCount).toBe(0);
    expect(reputation.gated('r-elias', peakDraft()).riderPct).toBeUndefined();
  });

  it('lets a rider hold many reclutamientos normales at once', () => {
    expect(agreements.activeFor('r-marco').length).toBeGreaterThan(1);

    for (const one of agreements.activeFor('r-marco')) {
      expect(one.kind).toBe('normal');
    }
  });

  it('refuses hora pico to a rider who still owes runs somewhere', () => {
    expect(agreements.runsPendingOf('r-marco')).toBeGreaterThan(0);
    expect(() => agreements.propose(peakDraft({ riderId: 'r-marco' }))).toThrow();
    expect(
      agreements.refusalFor('r-marco', {
        companyId: 'c-copacabana',
        branchIds: ['b-copacabana-miraflores'],
      }),
    ).toBe('carreras-pendientes');
  });

  it('refuses a second hora pico, whoever offers it', () => {
    expect(agreements.runsPendingOf('r-alvaro')).toBeGreaterThan(0);

    const held = agreements.ofRider('r-alvaro').find((one) => one.kind === 'hora-pico');

    expect(held?.state).toBe('activo');
    expect(() => agreements.propose(peakDraft({ riderId: 'r-alvaro' }))).toThrow();
  });

  it('refuses a second hora pico from the empresa that already recruited him, even once cumplido', () => {
    expect(agreements.runsPendingOf('r-rosario')).toBe(0);

    expect(
      agreements.refusalFor('r-rosario', {
        companyId: 'c-yungas',
        branchIds: ['b-yungas-oruro'],
      }),
    ).toBe('empresa-repetida');

    expect(
      agreements.refusalFor('r-rosario', {
        companyId: 'c-andes',
        branchIds: ['b-andes-santa-cruz'],
      }),
    ).toBeUndefined();
  });

  it('lets a sucursal recruit in hora pico only for itself', () => {
    expect(() =>
      agreements.propose(
        peakDraft({
          originBranchId: 'b-copacabana-miraflores',
          branchIds: ['b-copacabana-miraflores', 'b-copacabana-sopocachi'],
        }),
      ),
    ).toThrow();

    expect(() =>
      agreements.propose(
        peakDraft({
          originBranchId: 'b-copacabana-miraflores',
          branchIds: ['b-copacabana-miraflores'],
        }),
      ),
    ).not.toThrow();
  });

  it('lets the gerente de empresa cover two sucursales in hora pico', () => {
    expect(() =>
      agreements.propose(
        peakDraft({ branchIds: ['b-copacabana-miraflores', 'b-copacabana-sopocachi'] }),
      ),
    ).not.toThrow();
  });

  it('checks the hora pico rules again when the rider answers, not only when it is sent', () => {
    const peak = agreements.propose(peakDraft());

    agreements.propose({
      riderId: 'r-ivan',
      companyId: 'c-illimani',
      branchIds: ['b-illimani-san-miguel'],
      initiatedBy: 'rider',
      kind: 'normal',
      perTripBob: 18,
      runs: 20,
    });

    const normal = agreements
      .ofRider('r-ivan')
      .find((one) => one.companyId === 'c-illimani' && one.state === 'pendiente');

    agreements.accept(normal?.id ?? '', 'empresa', 'c-illimani');

    expect(agreements.runsPendingOf('r-ivan')).toBeGreaterThan(0);
    expect(() => agreements.accept(peak.id, 'rider', 'r-ivan')).toThrow();
  });

  it('spends a point per scan and closes the reclutamiento as cumplido on the last one', () => {
    const before = agreements.byId('ag-516');

    expect(before?.state).toBe('activo');
    expect(before?.runsLeft).toBe(1);
    expect(agreements.covers('r-marco', 'b-ale-la-paz')).toBe(true);

    const after = agreements.spend('r-marco', 'b-ale-la-paz');

    expect(after?.id).toBe('ag-516');
    expect(after?.state).toBe('cumplido');
    expect(after?.runsLeft).toBe(0);
    expect(agreements.covers('r-marco', 'b-ale-la-paz')).toBe(false);
    expect(agreements.ridersOf('b-ale-la-paz').map((one) => one.id)).not.toContain('r-marco');
  });

  it('charges the hora pico before anything else, because it has to be cleared first', () => {
    const peak = agreements.propose(
      peakDraft({ riderId: 'r-ivan', branchIds: ['b-copacabana-miraflores'] }),
    );

    agreements.accept(peak.id, 'rider', 'r-ivan');
    agreements.propose({
      riderId: 'r-ivan',
      companyId: 'c-illimani',
      branchIds: ['b-copacabana-miraflores'],
      initiatedBy: 'empresa',
      kind: 'normal',
      perTripBob: 18,
      runs: 20,
    });

    const normal = agreements
      .ofRider('r-ivan')
      .find((one) => one.companyId === 'c-illimani' && one.state === 'pendiente');

    agreements.accept(normal?.id ?? '', 'rider', 'r-ivan');

    expect(agreements.spend('r-ivan', 'b-copacabana-miraflores')?.id).toBe(peak.id);
  });

  it('spends nothing for a rider who covers that sucursal through no reclutamiento', () => {
    expect(agreements.spend('r-ivan', 'b-oriental-norte')).toBeUndefined();
  });

  it('carries every kind and every state the screens have to draw', () => {
    const states = new Set(agreements.all().map((one) => one.state));
    const kinds = new Set(agreements.all().map((one) => one.kind));

    for (const state of ['pendiente', 'activo', 'cumplido', 'rechazado', 'terminado', 'vencido']) {
      expect(states.has(state as AgreementState)).toBe(true);
    }

    expect(kinds.has('normal')).toBe(true);
    expect(kinds.has('hora-pico')).toBe(true);
  });
});
