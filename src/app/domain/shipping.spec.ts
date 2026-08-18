import { TestBed } from '@angular/core/testing';
import { Shipping } from './shipping';

describe('Shipping', () => {
  let shipping: Shipping;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    shipping = TestBed.inject(Shipping);
  });

  it('keeps every waybill unique and its slug the lowercase form', () => {
    const guias = shipping.all().map((one) => one.guia);

    expect(new Set(guias).size).toBe(guias.length);

    for (const shipment of shipping.all()) {
      expect(shipment.slug).toBe(shipment.guia.toLowerCase());
    }
  });

  it('splits the list into active and delivered without losing one', () => {
    expect(shipping.active().every((one) => one.state !== 'entregado')).toBe(true);
    expect(shipping.delivered().every((one) => one.state === 'entregado')).toBe(true);
    expect(shipping.active().length + shipping.delivered().length).toBe(shipping.all().length);
  });

  it('says out loud, on every shipment, where the live map stops', () => {
    for (const shipment of shipping.all()) {
      const dark = shipment.milestones.filter((one) => !one.live);

      expect(dark.length).toBe(1);
      expect(dark[0].kind).toBe('en-ruta');
      expect(dark[0].note).toBeTruthy();
    }
  });

  it('never stamps a milestone that sits after an unreached one', () => {
    for (const shipment of shipping.all()) {
      const reached = shipment.milestones.map((one) => one.at !== undefined);
      const firstPending = reached.indexOf(false);

      if (firstPending !== -1) {
        expect(reached.slice(firstPending).some(Boolean)).toBe(false);
      }
    }
  });

  it('resolves a shipment by its slug and by its waybill', () => {
    expect(shipping.bySlug('ty-4471')?.guia).toBe('TY-4471');
    expect(shipping.byGuia('TY-4471')?.slug).toBe('ty-4471');
    expect(shipping.bySlug('ty-0000')).toBeUndefined();
  });
});
