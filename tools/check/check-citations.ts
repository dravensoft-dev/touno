import {
  codeSpans,
  exists,
  GENERATED_INFIX,
  markdownFiles,
  packageRootOf,
  proseLines,
  read,
  ROOT,
  underSkippedRoot,
} from './tree';

export const OUTSIDE_THE_TREE = new Map<string, string>([
  [
    'apps/frontend/web/public/sitemap.xml',
    'a build product. generate-sitemap.ts writes it into a git-ignored path, so a fresh clone ' +
      'carries none and a gate demanding it would fail before the first build.',
  ],
  [
    '404/index.html',
    'a build product, inside dist/. It is where Angular prerenders the not-found route, and ' +
      'emit-404.ts names it to lift it to the host root.',
  ],
  [
    'bin/style-plugin-rules.mjs',
    'a file inside the installed @dravensoft/arena-angular package rather than in this tree. ' +
      'The style kernel names it because it is what would refuse a plugin, not because ' +
      'anything here may edit it.',
  ],
]);

export const EXTENSION = /\.[A-Za-z0-9]{1,6}$/;

export const PATH_LIKE = /^[A-Za-z0-9_.@-]+(?:\/[A-Za-z0-9_.@-]+)+$/;

export const MEMBER = /^([A-Za-z0-9_./@-]+\.[a-z]{2,4}):([A-Za-z_$][\w$]*)/;

export const METAVARIABLE = /[<>*]/;

export function isPathClaim(span: string): boolean {
  const clean = span.replace(/[.,;:)]+$/, '');
  if (clean === '' || METAVARIABLE.test(clean)) return false;
  if (clean.startsWith('/') || /^[a-z][a-z0-9+.-]*:\/\//i.test(clean)) return false;
  if (clean.includes(GENERATED_INFIX)) return false;
  if (underSkippedRoot(clean)) return false;
  if (!PATH_LIKE.test(clean)) return false;
  return EXTENSION.test(clean);
}

export function pathClaims(text: string): { claim: string; number: number }[] {
  return proseLines(text).flatMap(({ line, number }) =>
    codeSpans(line)
      .map((span) => span.split(':')[0] as string)
      .filter(isPathClaim)
      .map((claim) => ({ claim: claim.replace(/[.,;:)]+$/, ''), number })),
  );
}

export function memberClaims(text: string): { path: string; member: string; number: number }[] {
  return proseLines(text).flatMap(({ line, number }) =>
    codeSpans(line).flatMap((span) => {
      const match = MEMBER.exec(span);
      if (match === null) return [];
      const path = match[1] as string;
      if (METAVARIABLE.test(path) || !PATH_LIKE.test(path) || underSkippedRoot(path)) return [];
      return [{ path, member: match[2] as string, number }];
    }),
  );
}

export function claimSpellings(rel: string, claim: string): string[] {
  const directory = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
  const root = packageRootOf(rel);
  return [
    claim,
    directory === '' ? claim : `${directory}/${claim}`,
    root === '' ? claim : `${root}/${claim}`,
  ];
}

export function resolveClaim(rel: string, claim: string): string | null {
  return claimSpellings(rel, claim).find((spelling) => exists(spelling)) ?? null;
}

export function exemptionFor(rel: string, claim: string): string | null {
  return claimSpellings(rel, claim).find((spelling) => OUTSIDE_THE_TREE.has(spelling)) ?? null;
}

export const LINK = /\]\(([^)\s]+)/g;

export function linkTargets(text: string): { target: string; number: number }[] {
  return text.split('\n').flatMap((line, index) =>
    [...line.matchAll(LINK)]
      .map((match) => (match[1] ?? '').split('#')[0] ?? '')
      .filter((target) => target !== '' && !target.startsWith('/'))
      .filter((target) => !/^[a-z][a-z0-9+.-]*:/i.test(target))
      .map((target) => ({ target, number: index + 1 })),
  );
}

export function resolveTarget(rel: string, target: string): string {
  const directory = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
  const joined = directory === '' ? target : `${directory}/${target}`;
  const parts: string[] = [];

  for (const part of joined.split('/')) {
    if (part === '.' || part === '') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }

  return parts.join('/');
}

export function linkProblems(documents: string[], readPage = read): string[] {
  return documents.flatMap((rel) =>
    linkTargets(readPage(rel))
      .map(({ target, number }) => ({ resolved: resolveTarget(rel, target), target, number }))
      .filter(({ resolved }) => !OUTSIDE_THE_TREE.has(resolved) && !exists(resolved))
      .map(
        ({ target, resolved, number }) =>
          `${rel}:${number}: links to "${target}", which resolves to ${resolved} and is not in the ` +
          'tree. A link a reader follows to nothing is worse than no link, because it reads as a ' +
          'page that exists',
      ),
  );
}

export function pathProblems(documents: string[], readPage = read): string[] {
  return documents.flatMap((rel) =>
    pathClaims(readPage(rel))
      .filter(({ claim }) => exemptionFor(rel, claim) === null && resolveClaim(rel, claim) === null)
      .map(
        ({ claim, number }) =>
          `${rel}:${number}: names "${claim}", which is not at the root of this tree, beside this ` +
          'page, or under the package that holds it. A path in prose is a claim about where ' +
          'something is',
      ),
  );
}

export function memberProblems(documents: string[], readPage = read): string[] {
  return documents.flatMap((rel) =>
    memberClaims(readPage(rel)).flatMap(({ path, member, number }) => {
      if (exemptionFor(rel, path) !== null) return [];
      const resolved = resolveClaim(rel, path);
      if (resolved === null) {
        return [`${rel}:${number}: cites "${path}:${member}()" and that file is not in the tree`];
      }
      const source = readPage(resolved);
      if (new RegExp(`\\b${member}\\b`).test(source)) return [];
      return [
        `${rel}:${number}: cites "${path}:${member}()" and ${resolved} does not declare ` +
          `${member}. A citation naming the wrong file with the right member sends a reader ` +
          'somewhere confident and empty, and nothing about the sentence carrying it looks wrong',
      ];
    }),
  );
}

export function citedPaths(documents: string[], readPage = read): Set<string> {
  return new Set(
    documents.flatMap((rel) =>
      pathClaims(readPage(rel)).flatMap(({ claim }) => claimSpellings(rel, claim)),
    ),
  );
}

export function staleExemptProblems(documents: string[], readPage = read): string[] {
  const cited = citedPaths(documents, readPage);
  return [...OUTSIDE_THE_TREE.keys()]
    .filter((rel) => !cited.has(rel))
    .map(
      (rel) =>
        `OUTSIDE_THE_TREE names ${rel} and no document cites it any more. An exemption that ` +
        'outlived what it was written for is the shape this map exists to refuse',
    );
}

export function zeroProblems(documents: string[], readPage = read): string[] {
  if (documents.length === 0) {
    return ['found 0 document(s), so every citation resolves over a tree this gate never opened'];
  }

  const links = documents.flatMap((rel) => linkTargets(readPage(rel)));

  return links.length === 0
    ? [
        'found 0 relative link(s) across every document, so the rule that a link resolves passes ' +
          'by following nothing',
      ]
    : [];
}

export function problems(documents = markdownFiles(ROOT), readPage = read): string[] {
  const zero = zeroProblems(documents, readPage);
  if (zero.length > 0) return zero;
  return [
    ...pathProblems(documents, readPage),
    ...linkProblems(documents, readPage),
    ...memberProblems(documents, readPage),
    ...staleExemptProblems(documents, readPage),
  ];
}

export function main(): void {
  const found = problems();
  for (const problem of found) console.log(`check:citations  ${problem}`);
  console.log(`check:citations  ${found.length} problem(s)`);
  if (found.length > 0) process.exit(1);
}

if ((process.argv[1] ?? '').endsWith('check-citations.ts')) main();
