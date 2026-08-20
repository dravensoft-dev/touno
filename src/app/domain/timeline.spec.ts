import { TestBed } from '@angular/core/testing';
import { Loads } from './loads';
import { Orders } from './orders';
import { TIMELINE_TEMPLATES, isTracked, timelineOf } from './timeline';
import { Order, OrderScenario } from './orders.model';

describe('timeline', () => {
  let orders: Orders;
  let loads: Loads;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    orders = TestBed.inject(Orders);
    loads = TestBed.inject(Loads);
  });

  function timeline(code: string) {
    const order = orders.byCode(code) as Order;

    return timelineOf(order, order.loadId ? loads.byId(order.loadId) : undefined);
  }

  it('draws the milestones its scenario calls for, in that order', () => {
    for (const order of orders.all()) {
      const drawn = orders.timeline(order).milestones.map((one) => one.kind);

      expect(drawn).toEqual([...TIMELINE_TEMPLATES[order.scenario]]);
    }
  });

  it('gives an interurban order the two milestones a local one does not have', () => {
    for (const scenario of ['interurbano-domicilio', 'interurbano-sucursal'] as OrderScenario[]) {
      expect(TIMELINE_TEMPLATES[scenario]).toContain('carga-en-espera');
      expect(TIMELINE_TEMPLATES[scenario]).toContain('ruta-interurbana');
    }

    expect(TIMELINE_TEMPLATES['restaurante']).not.toContain('carga-en-espera');
  });

  it('adds the local rider only when the parcel is coming to the door', () => {
    expect(TIMELINE_TEMPLATES['interurbano-domicilio']).toContain('rider-local-asignado');
    expect(TIMELINE_TEMPLATES['interurbano-sucursal']).not.toContain('rider-local-asignado');
  });

  it('stamps a reached prefix and never a milestone after an unreached one', () => {
    for (const order of orders.all()) {
      const stamped = orders.timeline(order).milestones.map((one) => one.at !== undefined);
      const firstGap = stamped.indexOf(false);

      if (firstGap >= 0) {
        expect(stamped.slice(firstGap).every((one) => !one)).toBe(true);
      }
    }
  });

  it('runs the map from the first assignment until the code is scanned', () => {
    expect(timeline('TO-1043').mapLive).toBe(true);
    expect(timeline('TO-2205').mapLive).toBe(true);
    expect(timeline('TO-1042').mapLive).toBe(false);
    expect(timeline('TO-2203').mapLive).toBe(false);
    expect(timeline('TO-1045').mapLive).toBe(false);
    expect(timeline('TO-2207').mapLive).toBe(false);
  });

  it('waits on a rider when the sucursal has not picked one', () => {
    expect(timeline('TO-1042').waiting).toBe('rider');
    expect(timeline('TO-2201').waiting).toBe('rider');
  });

  it('waits on the load while the truck is still filling', () => {
    expect(timeline('TO-2203').waiting).toBe('carga');
    expect(timeline('TO-2204').waiting).toBeUndefined();
  });

  it('says how many parcels the truck is still short of, rather than a mute wait', () => {
    const note = timeline('TO-2203').milestones.find((one) => one.kind === 'carga-en-espera')?.note;

    expect(note).toContain('Faltan');
    expect(note).toContain('para completar la carga');
  });

  it('marks the waiting milestone as the one with no map, and the moving ones as tracked', () => {
    expect(isTracked('carga-en-espera')).toBe(false);
    expect(isTracked('pedido')).toBe(false);
    expect(isTracked('ruta-interurbana')).toBe(true);
    expect(isTracked('recogido')).toBe(true);
  });

  it('drops the promise once the order is closed, one way or the other', () => {
    expect(timeline('TO-1043').etaAt).toBeDefined();
    expect(timeline('TO-1045').etaAt).toBeUndefined();
    expect(timeline('TO-1046').etaAt).toBeUndefined();
  });

  it('names every milestone it draws', () => {
    for (const order of orders.all()) {
      for (const milestone of orders.timeline(order).milestones) {
        expect(milestone.label).not.toBe('');
      }
    }
  });
});
