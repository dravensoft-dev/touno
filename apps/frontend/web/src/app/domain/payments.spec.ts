import { TestBed } from '@angular/core/testing';
import { Businesses } from './businesses';
import { Riders } from './riders';
import { cardLabel, completeCard, payoutRouteOf } from './payments.model';

describe('payments', () => {
  let businesses: Businesses;
  let riders: Riders;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    businesses = TestBed.inject(Businesses);
    riders = TestBed.inject(Riders);
  });

  it('pays to a card only when both sides registered one', () => {
    const marco = riders.byId('r-marco');
    const ale = businesses.companyById('c-ale');
    const copacabana = businesses.companyById('c-copacabana');

    expect(marco?.card).toBeDefined();
    expect(ale?.card).toBeDefined();
    expect(copacabana?.card).toBeUndefined();

    expect(payoutRouteOf('tarjeta', marco?.card, ale?.card)).toBe('tarjeta');
    expect(payoutRouteOf('tarjeta', marco?.card, copacabana?.card)).toBe('automatico');
  });

  it('never pays to a card for a rider who did not ask for it', () => {
    const ale = businesses.companyById('c-ale');

    expect(payoutRouteOf('automatico', riders.byId('r-marco')?.card, ale?.card)).toBe('automatico');
  });

  it('falls back to the deposit when the rider has no card of his own', () => {
    const ale = businesses.companyById('c-ale');

    expect(payoutRouteOf('tarjeta', undefined, ale?.card)).toBe('automatico');
  });

  it('holds four digits and never a whole number', () => {
    for (const rider of riders.all()) {
      if (rider.card) {
        expect(rider.card.last4).toMatch(/^\d{4}$/);
      }
    }

    expect(cardLabel({ brand: 'Visa', last4: '4471', holder: 'Marco', expires: '09/29' })).toBe(
      'Visa ···· 4471',
    );
  });

  it('refuses a card that is missing a half, so a form cannot save one', () => {
    expect(completeCard({ brand: 'Visa', last4: '4471', holder: 'M', expires: '09/29' })).toBe(
      true,
    );
    expect(completeCard({ brand: '', last4: '4471', holder: 'M', expires: '09/29' })).toBe(false);
    expect(completeCard({ brand: 'Visa', last4: '447', holder: 'M', expires: '09/29' })).toBe(
      false,
    );
    expect(completeCard({ brand: 'Visa', last4: '4471', holder: 'M', expires: '9/29' })).toBe(
      false,
    );
  });

  it('leaves every rider a way to be paid, whether or not he chose a card', () => {
    for (const rider of riders.all()) {
      expect(rider.account.length).toBeGreaterThan(0);

      if (rider.payoutMethod === 'tarjeta') {
        expect(rider.card).toBeDefined();
      }
    }
  });

  it('carries one business with a card and one without, so both answers are walkable', () => {
    const withCard = businesses.companies().filter((one) => one.card !== undefined);
    const without = businesses.companies().filter((one) => one.card === undefined);

    expect(withCard.length).toBeGreaterThan(0);
    expect(without.length).toBeGreaterThan(0);
  });
});
