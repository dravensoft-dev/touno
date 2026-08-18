import { bs, fecha, fechaHora, hhmm, slugOfGuia } from './format';

describe('format', () => {
  it('writes bolivianos with a comma decimal and dotted thousands', () => {
    expect(bs(65)).toBe('Bs 65,00');
    expect(bs(2730)).toBe('Bs 2.730,00');
    expect(bs(39780.5)).toBe('Bs 39.780,50');
    expect(bs(0)).toBe('Bs 0,00');
  });

  it('reads a timestamp without inventing a timezone', () => {
    expect(hhmm('2026-08-15T14:22:00')).toBe('14:22');
    expect(fecha('2026-08-15T14:22:00')).toBe('15 ago');
    expect(fechaHora('2026-08-15T14:22:00')).toBe('15 ago · 14:22');
  });

  it('lowercases a waybill into its route segment', () => {
    expect(slugOfGuia('TY-4471')).toBe('ty-4471');
  });
});
