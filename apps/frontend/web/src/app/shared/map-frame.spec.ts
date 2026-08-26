import { MAP_RATIO, frameOf } from './map-frame';

describe('the frame a schematic map draws itself into', () => {
  it('holds the same shape whatever the points it was given', () => {
    const wide = frameOf([
      { x: 0, y: 40 },
      { x: 90, y: 44 },
    ]);
    const tall = frameOf([
      { x: 40, y: 0 },
      { x: 44, y: 90 },
    ]);

    for (const box of [wide, tall]) {
      const [, , width, height] = box.split(' ').map(Number);

      expect(Math.round((width / height) * 100) / 100).toBe(MAP_RATIO);
    }
  });

  it('leaves air around every point, so nothing sits on the edge', () => {
    const [x, y, width, height] = frameOf([
      { x: 20, y: 20 },
      { x: 60, y: 50 },
    ])
      .split(' ')
      .map(Number);

    expect(x).toBeLessThan(20);
    expect(y).toBeLessThan(20);
    expect(x + width).toBeGreaterThan(60);
    expect(y + height).toBeGreaterThan(50);
  });

  it('still frames a single point, because a free agent alone is a map too', () => {
    const [, , width, height] = frameOf([{ x: 50, y: 50 }])
      .split(' ')
      .map(Number);

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});
