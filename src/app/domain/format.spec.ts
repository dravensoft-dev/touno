import { bs, codeOf, fecha, fechaHora, hhmm, restante, slugOfCode } from './format';

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

  it('lowercases an order code into its route segment, and back', () => {
    expect(slugOfCode('TO-1042')).toBe('to-1042');
    expect(codeOf('to-1042')).toBe('TO-1042');
  });

  it('says what is left in words a person would use', () => {
    expect(restante(0)).toBe('Debería estar llegando');
    expect(restante(-4)).toBe('Debería estar llegando');
    expect(restante(18)).toBe('Faltan 18 min');
    expect(restante(120)).toBe('Faltan 2 h');
    expect(restante(95)).toBe('Faltan 1 h 35 min');
  });
});
