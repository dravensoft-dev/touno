import { TestBed } from '@angular/core/testing';
import { Platform } from './platform';
import { atLeast, orderedBases } from './platform.model';

describe('Platform', () => {
  let platform: Platform;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    platform = TestBed.inject(Platform);
  });

  it('carries the values Touno sets for everyone', () => {
    expect(platform.commissionPct()).toBe(15);
    expect(platform.minDeliveryFeeBob()).toBeGreaterThan(0);
    expect(platform.weatherFeeBob()).toBeGreaterThan(0);
    expect(platform.minRuns()).toBeGreaterThan(0);
  });

  it('changes one value without disturbing the rest', () => {
    platform.patch({ weatherFeeBob: 9 });

    expect(platform.weatherFeeBob()).toBe(9);
    expect(platform.commissionPct()).toBe(15);
  });

  it('reads a value that fell under a raised floor as the floor', () => {
    expect(atLeast(4, 6)).toBe(6);
    expect(atLeast(9, 6)).toBe(9);
  });

  it('pays a fixed minimum that rises with what the rider commits', () => {
    const bases = platform.riderBaseBob();

    expect(bases['agente-libre']).toBeLessThan(bases.normal);
    expect(bases.normal).toBeLessThan(bases['hora-pico']);
  });

  it('refuses a write that would pay a free agent more than a recruited rider', () => {
    expect(() =>
      platform.patch({ riderBaseBob: { 'agente-libre': 30, normal: 12, 'hora-pico': 22 } }),
    ).toThrow();
    expect(platform.riderBaseBob()['agente-libre']).toBeLessThan(12);
  });

  it('reads the order of the three fixed minimums as a rule of its own', () => {
    expect(orderedBases({ 'agente-libre': 8, normal: 12, 'hora-pico': 22 })).toBe(true);
    expect(orderedBases({ 'agente-libre': 8, normal: 22, 'hora-pico': 12 })).toBe(false);
    expect(orderedBases({ 'agente-libre': 12, normal: 12, 'hora-pico': 22 })).toBe(false);
  });
});
