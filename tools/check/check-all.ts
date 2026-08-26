import { problems as agents } from './check-agents';
import { problems as citations } from './check-citations';
import { problems as docs } from './check-docs';
import { problems as vocabulary } from './check-vocabulary';

export interface Gate {
  readonly name: string;
  readonly claim: string;
  readonly run: () => string[];
}

export const GATES: Gate[] = [
  {
    name: 'check:agents',
    claim: 'every level is reachable by a chain of links from the router',
    run: agents,
  },
  {
    name: 'check:docs',
    claim:
      'a document fits its budget and punctuates as this tree does, and no source carries a comment',
    run: docs,
  },
  {
    name: 'check:citations',
    claim: 'every path and every member prose names is where prose says it is',
    run: citations,
  },
  {
    name: 'check:vocabulary',
    claim: 'every command a document tells a reader to run is a command this tree defines',
    run: vocabulary,
  },
];

export function report(gates = GATES): { failed: number; lines: string[] } {
  const lines: string[] = [];
  let failed = 0;
  for (const gate of gates) {
    const found = gate.run();
    if (found.length === 0) {
      lines.push(`  PASS  ${gate.name.padEnd(18)}${gate.claim}`);
      continue;
    }
    failed += 1;
    lines.push(`  FAIL  ${gate.name.padEnd(18)}${found.length} problem(s)`);
    for (const problem of found) lines.push(`          ${problem}`);
  }
  return { failed, lines };
}

export function summary(gates: Gate[], failed: number): string {
  return failed === 0
    ? `check-all: all ${gates.length} gate(s) passed`
    : `check-all: ${failed} of ${gates.length} gate(s) failed`;
}

export function main(): void {
  const { failed, lines } = report();
  for (const line of lines) console.log(line);
  console.log(summary(GATES, failed));
  if (failed > 0) process.exit(1);
}

if ((process.argv[1] ?? '').endsWith('check-all.ts')) main();
