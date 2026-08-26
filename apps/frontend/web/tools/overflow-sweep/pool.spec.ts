import { inPool } from './pool';

describe('inPool', () => {
  it('returns results in the order of the items, not the order they finished', async () => {
    const delays = [40, 10, 30, 0];

    const result = await inPool(delays, 4, async (ms) => {
      await new Promise((resolve) => setTimeout(resolve, ms));

      return ms;
    });

    expect(result).toEqual(delays);
  });

  it('never runs more items at once than it was given workers', async () => {
    let running = 0;
    let peak = 0;

    await inPool([1, 2, 3, 4, 5, 6, 7, 8], 3, async () => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;

      return true;
    });

    expect(peak).toBe(3);
  });

  it('runs every item when there are fewer items than workers', async () => {
    const seen: number[] = [];

    await inPool([1, 2], 8, async (one) => {
      seen.push(one);

      return one;
    });

    expect(seen).toHaveLength(2);
  });

  it('surfaces the failure instead of resolving with a hole in the results', async () => {
    await expect(
      inPool([1, 2, 3], 2, async (one) => {
        if (one === 2) {
          throw new Error('el navegador se cayó');
        }

        return one;
      }),
    ).rejects.toThrow('el navegador se cayó');
  });
});
