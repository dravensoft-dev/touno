import { TestBed } from '@angular/core/testing';
import { Businesses } from './businesses';
import { Orders } from './orders';
import { Riders } from './riders';
import { Session, profilesOfRole } from './session';
import { Role } from './session';

describe('Session', () => {
  let session: Session;
  let businesses: Businesses;
  let riders: Riders;
  let orders: Orders;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    session = TestBed.inject(Session);
    businesses = TestBed.inject(Businesses);
    riders = TestBed.inject(Riders);
    orders = TestBed.inject(Orders);
  });

  it('carries seven profiles over four roles', () => {
    expect(session.profiles.length).toBe(7);
    expect(new Set(session.profiles.map((one) => one.role)).size).toBe(4);
    expect(new Set(session.profiles.map((one) => one.id)).size).toBe(7);
  });

  it('carries a rider of each range under one role, because the vehicle decides', () => {
    const both = profilesOfRole('rider');

    expect(both.length).toBe(2);
    expect(both.map((one) => riders.byId(one.riderId ?? '')?.vehicle)).toEqual(['moto', 'camion']);
  });

  it('gives both management levels to both verticals', () => {
    for (const role of ['gerente-empresa', 'gerente-sucursal'] as Role[]) {
      const types = profilesOfRole(role).map((one) => one.businessType);

      expect(types).toContain('restaurante');
      expect(types).toContain('importadora');
    }
  });

  it('points every profile at a record that exists', () => {
    for (const profile of session.profiles) {
      if (profile.companyId) {
        expect(businesses.companyById(profile.companyId)).toBeDefined();
      }

      if (profile.branchId) {
        expect(businesses.branchById(profile.branchId)?.companyId).toBe(profile.companyId);
      }

      if (profile.riderId) {
        expect(riders.byId(profile.riderId)).toBeDefined();
      }

      if (profile.buyerPhone) {
        expect(orders.ofBuyer(profile.buyerPhone).length).toBeGreaterThan(0);
      }
    }
  });

  it('sends each profile home under its own prefix', () => {
    const homes = Object.fromEntries(session.profiles.map((one) => [one.id, one.home]));

    expect(homes['p-comprador']).toBe('/feed');
    expect(homes['p-rider'].startsWith('/rider/')).toBe(true);
    expect(homes['p-empresa-restaurante'].startsWith('/empresa/')).toBe(true);
    expect(homes['p-empresa-importadora'].startsWith('/empresa/')).toBe(true);
    expect(homes['p-sucursal-restaurante'].startsWith('/sucursal/')).toBe(true);
    expect(homes['p-sucursal-importadora'].startsWith('/sucursal/')).toBe(true);
  });

  it('sends both verticals of one level to the very same screen', () => {
    expect(session.profiles.find((one) => one.id === 'p-empresa-restaurante')?.home).toBe(
      session.profiles.find((one) => one.id === 'p-empresa-importadora')?.home,
    );
  });

  it('starts with nobody signed in, and never persists who was', () => {
    expect(session.profileId()).toBeNull();
    expect(session.role()).toBeNull();
    expect(session.businessType()).toBeUndefined();
  });

  it('reads the role and the vertical off the profile that entered', () => {
    session.enter('p-sucursal-importadora');

    expect(session.is('gerente-sucursal')).toBe(true);
    expect(session.is('gerente-empresa')).toBe(false);
    expect(session.businessType()).toBe('importadora');
    expect(session.branchId()).toBe('b-ale-la-paz');
    expect(session.companyId()).toBe('c-ale');
  });

  it('gives the two management verticals the same role, which is what a blind panel needs', () => {
    session.enter('p-empresa-restaurante');

    expect(session.is('gerente-empresa')).toBe(true);

    session.enter('p-empresa-importadora');

    expect(session.is('gerente-empresa')).toBe(true);
    expect(session.businessType()).toBe('importadora');
  });

  it('leaves nothing behind on the way out', () => {
    session.enter('p-rider');
    session.leave();

    expect(session.profile()).toBeUndefined();
    expect(session.role()).toBeNull();
  });
});
