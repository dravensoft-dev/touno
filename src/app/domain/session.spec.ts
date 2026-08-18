import { PROFILES } from './session';

describe('Session profiles', () => {
  it('lands the buyer on the feed', () => {
    expect(PROFILES.find((one) => one.role === 'comprador')?.home).toBe('/feed');
  });

  it('lands every other profile on its own panel', () => {
    for (const profile of PROFILES.filter((one) => one.role !== 'comprador')) {
      expect(profile.home.startsWith(`/${profile.role}/`)).toBe(true);
    }
  });
});
