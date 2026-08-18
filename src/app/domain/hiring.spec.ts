import { TestBed } from '@angular/core/testing';
import { Hiring } from './hiring';

describe('Hiring', () => {
  let hiring: Hiring;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    hiring = TestBed.inject(Hiring);
  });

  it('refuses an offer answered by a driver it was not addressed to', () => {
    const offer = hiring.pending()[0];

    expect(() => hiring.accept(offer.id, 'd-noemi')).toThrow();
    expect(hiring.byId(offer.id)?.state).toBe('pendiente');
  });

  it('moves a pending offer to accepted when its own driver answers', () => {
    const offer = hiring.pending()[0];

    hiring.accept(offer.id, offer.driverId);

    expect(hiring.byId(offer.id)?.state).toBe('aceptada');
  });

  it('refuses to answer an offer that is no longer pending', () => {
    const settled = hiring.all().find((one) => one.state === 'vencida');

    expect(settled).toBeDefined();
    expect(() => hiring.accept(settled!.id, settled!.driverId)).toThrow();
  });

  it('never lets a contract spend more rides than it bought', () => {
    for (const offer of hiring.all()) {
      expect(offer.ridesUsed).toBeLessThanOrEqual(offer.rides);
      expect(hiring.remaining(offer.id)).toBe(offer.rides - offer.ridesUsed);
    }
  });

  it('sends a new offer as pending, priced from the rides it asks for', () => {
    const created = hiring.send({
      businessSlug: 'importadora-ale',
      businessName: 'Importadora Ale',
      businessKind: 'importadora',
      driverId: 'd-lucia',
      rides: 10,
      perRideBob: 13,
      validUntil: '2026-09-01',
      sentAt: '2026-08-18T09:00:00',
    });

    expect(created.state).toBe('pendiente');
    expect(created.totalBob).toBe(130);
    expect(hiring.byId(created.id)).toBeDefined();
  });
});
