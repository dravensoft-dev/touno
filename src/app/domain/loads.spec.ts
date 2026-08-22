import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { Businesses } from './businesses';
import { Loads } from './loads';
import { Riders } from './riders';
import { LoadState } from './loads.model';
import { rangeOf } from './riders.model';

describe('Loads', () => {
  let loads: Loads;
  let businesses: Businesses;
  let riders: Riders;
  let agreements: Agreements;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    loads = TestBed.inject(Loads);
    businesses = TestBed.inject(Businesses);
    riders = TestBed.inject(Riders);
    agreements = TestBed.inject(Agreements);
  });

  it('puts a truck rider behind every load, never a moto', () => {
    for (const load of loads.all()) {
      const rider = riders.byId(load.riderId);

      expect(rider).toBeDefined();
      expect(rangeOf(rider?.vehicle ?? 'moto')).toBe('interurbano');
    }
  });

  it('runs a load between two sucursales of one empresa, in different cities', () => {
    for (const load of loads.all()) {
      const from = businesses.branchById(load.fromBranchId);
      const to = businesses.branchById(load.toBranchId);

      expect(from).toBeDefined();
      expect(to).toBeDefined();
      expect(from?.companyId).toBe(to?.companyId);
      expect(from?.cityId).not.toBe(to?.cityId);
    }
  });

  it('drives a load in progress only under an agreement that is active right now', () => {
    for (const load of loads.all().filter((one) => one.state !== 'descargado')) {
      expect(agreements.covers(load.riderId, load.fromBranchId)).toBe(true);
      expect(agreements.covers(load.riderId, load.toBranchId)).toBe(true);
    }
  });

  it('lets a finished load outlive the agreement that authorised it', () => {
    for (const load of loads.all().filter((one) => one.state === 'descargado')) {
      const held = agreements
        .ofRider(load.riderId)
        .filter((one) => one.state !== 'pendiente' && one.state !== 'rechazado');

      expect(held.some((one) => one.branchIds.includes(load.fromBranchId))).toBe(true);
      expect(held.some((one) => one.branchIds.includes(load.toBranchId))).toBe(true);
    }
  });

  it('never carries more than it holds, and never carries nothing', () => {
    for (const load of loads.all()) {
      expect(load.orderCodes.length).toBeGreaterThan(0);
      expect(load.orderCodes.length).toBeLessThanOrEqual(load.capacity);
      expect(new Set(load.orderCodes).size).toBe(load.orderCodes.length);
    }
  });

  it('reaches every load state, so every waiting screen is drawable', () => {
    const states = new Set(loads.all().map((one) => one.state));

    for (const state of ['acumulando', 'en-ruta', 'descargado'] as LoadState[]) {
      expect(states.has(state)).toBe(true);
    }
  });

  it('carries a load still short of leaving, which is what the buyer waits on', () => {
    const filling = loads.filling()[0];

    expect(filling).toBeDefined();
    expect(loads.missing(filling.id)).toBeGreaterThan(0);
    expect(loads.isFull(filling.id)).toBe(false);
  });

  it('counts nothing missing rather than a negative for a load that is not there', () => {
    expect(loads.missing('cg-no-existe')).toBe(0);
  });

  it('finds the load an order travels in', () => {
    expect(loads.ofOrder('TO-2203')?.id).toBe('cg-3301');
    expect(loads.ofOrder('TO-1043')).toBeUndefined();
  });

  it('adds an order only to a load still filling, and never twice', () => {
    const load = loads.filling()[0];
    const before = load.orderCodes.length;

    loads.add(load.id, 'TO-2299');
    loads.add(load.id, 'TO-2299');

    expect(loads.byId(load.id)?.orderCodes.length).toBe(before + 1);

    const gone = loads.all().find((one) => one.state === 'descargado');

    loads.add(gone?.id ?? '', 'TO-2299');

    expect(loads.byId(gone?.id ?? '')?.orderCodes).not.toContain('TO-2299');
  });

  it('fills up and then leaves, stamping the departure', () => {
    const load = loads.filling()[0];

    while (!loads.isFull(load.id)) {
      loads.add(load.id, `TO-99${loads.byId(load.id)?.orderCodes.length}`);
    }

    expect(loads.isFull(load.id)).toBe(true);

    loads.depart(load.id);

    expect(loads.byId(load.id)?.state).toBe('en-ruta');
  });

  it('lists what leaves a sucursal and what is coming to it', () => {
    expect(loads.leaving('b-ale-la-paz').map((one) => one.id)).toContain('cg-3301');
    expect(loads.arriving('b-tecno-la-paz').map((one) => one.id)).toContain('cg-3302');
    expect(loads.arriving('b-ale-santa-cruz')).toEqual([]);
  });

  it('gives every carga a reception code of its own, never an order code', () => {
    const codes = loads.all().map((one) => one.receiptCode);

    expect(new Set(codes).size).toBe(codes.length);

    for (const code of codes) {
      expect(code.startsWith('RC-')).toBe(true);
      expect(code.startsWith('TO-')).toBe(false);
    }
  });

  it('finds a carga by the code the destination sucursal shows', () => {
    expect(loads.byReceiptCode('RC-3306')?.id).toBe('cg-3306');
    expect(loads.byReceiptCode('RC-nada')).toBeUndefined();
  });

  it('receives only a carga that is actually on the road', () => {
    loads.receive('cg-3301');
    expect(loads.byId('cg-3301')?.state).toBe('acumulando');

    loads.receive('cg-3306');
    expect(loads.byId('cg-3306')?.state).toBe('descargado');
    expect(loads.byId('cg-3306')?.receivedAt).toBeDefined();
  });

  it('has a carga arriving at the sucursal the demo profile answers for', () => {
    expect(loads.arriving('b-ale-la-paz').map((one) => one.id)).toContain('cg-3306');
  });
});
