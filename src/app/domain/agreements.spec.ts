import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { Businesses } from './businesses';
import { Riders } from './riders';
import { AgreementState, otherSide } from './agreements.model';

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
      perTripBob: 19,
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
});
