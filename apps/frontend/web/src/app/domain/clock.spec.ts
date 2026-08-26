import { NOW, minutesBetween, minutesSince, minutesUntil } from './clock';

describe('clock', () => {
  it('holds a literal instant so the server and the first client render agree', () => {
    expect(NOW).toBe('2026-08-15T13:20:00');
  });

  it('counts the minutes between two instants on the same day', () => {
    expect(minutesBetween('2026-08-15T13:00:00', '2026-08-15T13:20:00')).toBe(20);
  });

  it('counts across a day boundary', () => {
    expect(minutesBetween('2026-08-14T23:50:00', '2026-08-15T00:10:00')).toBe(20);
  });

  it('reads a past instant as elapsed and a future one as remaining', () => {
    expect(minutesSince('2026-08-15T13:00:00')).toBe(20);
    expect(minutesUntil('2026-08-15T13:45:00')).toBe(25);
  });

  it('answers a negative count when the order is reversed', () => {
    expect(minutesBetween('2026-08-15T13:20:00', '2026-08-15T13:00:00')).toBe(-20);
  });
});
