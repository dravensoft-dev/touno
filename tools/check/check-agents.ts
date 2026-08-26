import { dirname, join, normalize, sep } from 'node:path';
import { markdownFiles, read, ROOT } from './tree';

export const ROUTER = 'AGENTS.md';

export const SURVIVORS = new Map([
  [
    'README.md',
    'the door, and the page a host shows. It names what Touno is and routes into the tree, ' +
      'so it belongs to no level and carries no rule of its own.',
  ],
  [
    'TOUNO_STRUC.md',
    'the product, written in Spanish for the business that will use Touno rather than for ' +
      'whoever builds it. It is what a change is argued against, not a level of this tree.',
  ],
  [
    'GENERATED.md',
    'which half of a file is yours to edit, asked before an edit and reached from the router.',
  ],
  [
    'TOUNO_DINERO.md',
    'the money, written in Spanish beside the product for the same reason: what Touno charges, ' +
      'who funds a promotion and what a plan sells. It is a sibling of the product document and ' +
      'not a level of this tree, and it is its own page because the product document has no ' +
      'budget left to hold it.',
  ],
  ['DOUBTS.md', 'what counts as a debt here and where the records that are not prose live.'],
]);

export const LINK = /\]\(([^)\s]+)/g;

export function isRouter(rel: string): boolean {
  return rel === ROUTER || rel.endsWith(`/${ROUTER}`);
}

export function resolveLink(fromDirectory: string, target: string): string | null {
  const clean = (target.split('#')[0] ?? '').trim();
  if (clean === '' || clean.startsWith('/')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean)) return null;
  return normalize(join(fromDirectory, clean)).split(sep).join('/');
}

export function linksFrom(rel: string, text: string): string[] {
  const from = dirname(rel) === '.' ? '' : dirname(rel);
  return [...text.matchAll(LINK)]
    .map((match) => resolveLink(from, match[1] ?? ''))
    .filter((path): path is string => path !== null);
}

export function reachable(pages: string[], readPage = read): Set<string> {
  const known = new Set(pages);
  const seen = new Set<string>();
  const queue = [ROUTER];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (seen.has(current)) continue;
    seen.add(current);
    if (!known.has(current)) continue;
    for (const target of linksFrom(current, readPage(current))) {
      if (known.has(target) && !seen.has(target)) queue.push(target);
    }
  }
  return seen;
}

export function zeroProblems(pages: string[]): string[] {
  return pages.length === 0
    ? [
        `found 0 file(s) named ${ROUTER}, and an empty result set reports every level linked ` +
          'over a tree this gate never opened',
      ]
    : [];
}

export function rootProblems(pages: string[]): string[] {
  return pages.includes(ROUTER)
    ? []
    : [
        `no ${ROUTER} at the repository root, which is the one placement the convention requires: ` +
          'an agent starting anywhere walks up to it, and a tree without it hands every reader ' +
          'whatever page happens to be nearest',
      ];
}

export function unreachableProblems(pages: string[], readPage = read): string[] {
  const found = reachable(pages, readPage);
  return pages
    .filter((rel) => !found.has(rel))
    .map(
      (rel) =>
        `${rel}: no chain of links from ${ROUTER} reaches it. Proximity hands an agent the ` +
        'nearest page and hands a reader nothing, so a level nobody links is a level only half ' +
        'the readers of this tree can be sent to',
    );
}

export function strayProblems(documents: string[]): string[] {
  return documents
    .filter((rel) => rel.endsWith('README.md') || SURVIVORS.has(rel))
    .filter((rel) => !SURVIVORS.has(rel))
    .map(
      (rel) =>
        `${rel}: a README.md on this branch. Every level is an ${ROUTER}; rename it, or record ` +
        'it in SURVIVORS with the reason it belongs to no level',
    );
}

export function staleSurvivorProblems(documents: string[]): string[] {
  return [...SURVIVORS.keys()]
    .filter((rel) => !documents.includes(rel))
    .map(
      (rel) =>
        `SURVIVORS names ${rel}, which is not in the tree. A stale entry outlives what it was written for`,
    );
}

export function problems(documents = markdownFiles(ROOT), readPage = read): string[] {
  const pages = documents.filter(isRouter);
  const zero = zeroProblems(pages);
  if (zero.length > 0) return zero;
  return [
    ...rootProblems(pages),
    ...unreachableProblems(pages, readPage),
    ...strayProblems(documents),
    ...staleSurvivorProblems(documents),
  ];
}

export function main(): void {
  const found = problems();
  for (const problem of found) console.log(`check:agents  ${problem}`);
  console.log(`check:agents  ${found.length} problem(s)`);
  if (found.length > 0) process.exit(1);
}

if ((process.argv[1] ?? '').endsWith('check-agents.ts')) main();
