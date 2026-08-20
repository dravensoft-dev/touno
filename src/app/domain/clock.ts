export const NOW = '2026-08-15T13:20:00';

function minutesOf(iso: string): number {
  const day = Number(iso.slice(8, 10));
  const hour = Number(iso.slice(11, 13));
  const minute = Number(iso.slice(14, 16));

  return day * 24 * 60 + hour * 60 + minute;
}

export function minutesBetween(from: string, to: string): number {
  return minutesOf(to) - minutesOf(from);
}

export function minutesSince(iso: string): number {
  return minutesBetween(iso, NOW);
}

export function minutesUntil(iso: string): number {
  return minutesBetween(NOW, iso);
}
