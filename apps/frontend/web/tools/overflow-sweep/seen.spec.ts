import { SeenPages } from './seen';

describe('SeenPages', () => {
  it('lets a signature through the first time it is claimed', () => {
    const seen = new SeenPages();

    expect(seen.claim('abc', 'p-rider /rider/encargos/to-1001')).toBeUndefined();
    expect(seen.size).toBe(1);
  });

  it('names where a repeated signature was first drawn', () => {
    const seen = new SeenPages();

    seen.claim('abc', 'p-rider /rider/encargos/to-1001');

    expect(seen.claim('abc', 'p-rider /rider/encargos/to-1002')).toBe(
      'p-rider /rider/encargos/to-1001',
    );
    expect(seen.size).toBe(1);
  });

  it('counts one entry per distinct page across every profile', () => {
    const seen = new SeenPages();

    seen.claim('abc', 'p-rider /rider/cargas/l-1');
    seen.claim('def', 'p-rider-camion /rider/cargas/l-1');
    seen.claim('abc', 'p-rider-camion /rider/cargas/l-2');

    expect(seen.size).toBe(2);
    expect(seen.repeats).toBe(1);
  });
});
