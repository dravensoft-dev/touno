import { TestBed } from '@angular/core/testing';
import { Platform } from './platform';
import { atLeast } from './platform.model';

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
});
