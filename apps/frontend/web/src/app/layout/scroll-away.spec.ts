import { AT_TOP, REVEAL_ABOVE, SETTLE_PX, nextBarScroll } from './scroll-away';

describe('nextBarScroll', () => {
  it('keeps the bar in place while the reader is still near the top', () => {
    expect(nextBarScroll({ away: true, at: 400 }, REVEAL_ABOVE)).toEqual(AT_TOP);
    expect(nextBarScroll({ away: true, at: 400 }, 0)).toEqual(AT_TOP);
  });

  it('takes the bar away once the reader moves down past the settle', () => {
    const moved = nextBarScroll({ away: false, at: 200 }, 200 + SETTLE_PX + 1);

    expect(moved.away).toBe(true);
    expect(moved.at).toBe(200 + SETTLE_PX + 1);
  });

  it('brings the bar back the moment the reader moves up past the settle', () => {
    const moved = nextBarScroll({ away: true, at: 400 }, 400 - SETTLE_PX - 1);

    expect(moved.away).toBe(false);
    expect(moved.at).toBe(400 - SETTLE_PX - 1);
  });

  it('ignores a move smaller than the settle, so momentum never flickers the bar', () => {
    const held = { away: true, at: 400 };

    expect(nextBarScroll(held, 400 + SETTLE_PX)).toBe(held);
    expect(nextBarScroll(held, 400 - SETTLE_PX)).toBe(held);
  });

  it('is already at rest at the top, so a scroll of nothing writes nothing', () => {
    expect(nextBarScroll(AT_TOP, 0)).toBe(AT_TOP);
  });
});
