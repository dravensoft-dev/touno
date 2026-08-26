import { GeoPoint } from '../domain/geography.model';

export const MAP_PADDING = 14;

export const MAP_RATIO = 1.5;

export function frameOf(points: readonly GeoPoint[]): string {
  const left = Math.min(...points.map((one) => one.x)) - MAP_PADDING;
  const right = Math.max(...points.map((one) => one.x)) + MAP_PADDING;
  const top = Math.min(...points.map((one) => one.y)) - MAP_PADDING;
  const bottom = Math.max(...points.map((one) => one.y)) + MAP_PADDING;

  let width = right - left;
  let height = bottom - top;
  let x = left;
  let y = top;

  if (width / height < MAP_RATIO) {
    const grown = height * MAP_RATIO;
    x -= (grown - width) / 2;
    width = grown;
  } else {
    const grown = width / MAP_RATIO;
    y -= (grown - height) / 2;
    height = grown;
  }

  return `${round(x)} ${round(y)} ${round(width)} ${round(height)}`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
