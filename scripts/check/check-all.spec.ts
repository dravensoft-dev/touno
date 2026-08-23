import { describe, expect, it } from 'vitest';
import { GATES, report, summary } from './check-all';

describe('the registry', () => {
  it('names every gate beside this file', () => {
    expect(GATES.map((gate) => gate.name).sort()).toEqual([
      'check:agents',
      'check:citations',
      'check:docs',
      'check:vocabulary',
    ]);
  });

  it('gives every gate a claim rather than a bare name', () => {
    for (const gate of GATES) expect(gate.claim.length, gate.name).toBeGreaterThan(30);
  });
});

describe('reporting', () => {
  it('runs every gate rather than stopping at the first failure', () => {
    const ran: string[] = [];
    const gates = ['a', 'b', 'c'].map((name) => ({
      name,
      claim: 'a claim long enough to say something useful about the tree',
      run: () => {
        ran.push(name);
        return [`${name} failed`];
      },
    }));
    const { failed } = report(gates);
    expect(ran).toEqual(['a', 'b', 'c']);
    expect(failed).toBe(3);
  });

  it('never collapses the count of what ran', () => {
    expect(summary(GATES, 0)).toContain(String(GATES.length));
    expect(summary(GATES, 1)).toContain(`1 of ${GATES.length}`);
  });
});

describe('the tree as it stands', () => {
  it('passes every gate', () => {
    const { failed, lines } = report();
    expect(failed, lines.join('\n')).toBe(0);
  });
});
