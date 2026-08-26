import { markdownFiles, read, relPosix, ROOT, walk } from './tree';

export const BUN_RUN = /\bbun run ([a-z][a-z0-9:-]*)/g;

export const MANIFEST = 'package.json';

export const ROUTER = 'AGENTS.md';

export const NOT_AN_ENTRY_POINT = new Map([
  [
    'ng',
    'the Angular CLI passthrough, which exists so a one-off ng invocation resolves the ' +
      'workspace binary. Nothing in this tree tells a reader to run it, and the commands that ' +
      'wrap it are named instead',
  ],
  [
    'prestart',
    'an npm lifecycle hook. It runs because npm runs it before start, never because a ' +
      'page told a reader to run it',
  ],
  [
    'prebuild',
    'an npm lifecycle hook. It runs because npm runs it before build, never because a ' +
      'page told a reader to run it',
  ],
  [
    'pretest',
    'an npm lifecycle hook. It runs because npm runs it before test, never because a ' +
      'page told a reader to run it',
  ],
  [
    'postbuild',
    'an npm lifecycle hook. It runs because npm runs it after build, never because a ' +
      'page told a reader to run it',
  ],
  [
    'watch',
    'a development rebuild loop, which is bun start with a different shape. A page that ' +
      'named both would be handing a reader a choice it has no advice about',
  ],
]);

export function directoryOf(rel: string): string {
  return rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
}

export function manifests(): string[] {
  return walk(ROOT)
    .map(relPosix)
    .filter((rel) => rel === MANIFEST || rel.endsWith(`/${MANIFEST}`))
    .sort();
}

export function scriptsOf(rel: string, readPage = read): string[] {
  const manifest = JSON.parse(readPage(rel)) as { scripts?: Record<string, string> };
  return Object.keys(manifest.scripts ?? {}).sort();
}

export function nearest(rel: string, found: string[]): string | null {
  const from = directoryOf(rel);
  return (
    found
      .filter((one) => {
        const at = directoryOf(one);
        return at === '' || at === from || from.startsWith(`${at}/`);
      })
      .sort((a, b) => directoryOf(b).length - directoryOf(a).length)[0] ?? null
  );
}

export function routerBeside(manifest: string): string {
  const at = directoryOf(manifest);
  return at === '' ? ROUTER : `${at}/${ROUTER}`;
}

export function allScripts(found = manifests(), readPage = read): string[] {
  return [...new Set(found.flatMap((rel) => scriptsOf(rel, readPage)))].sort();
}

export function entryPoints(names: string[]): string[] {
  return names.filter((name) => !name.includes(':') && !NOT_AN_ENTRY_POINT.has(name)).sort();
}

export function staleEntryProblems(names: string[]): string[] {
  return [...NOT_AN_ENTRY_POINT.keys()]
    .filter((name) => !names.includes(name))
    .map(
      (name) =>
        `NOT_AN_ENTRY_POINT names "${name}", which no ${MANIFEST} in this tree declares. An ` +
        'exemption outliving what it was written for is the shape this map exists to refuse',
    );
}

export function commandsIn(text: string): { name: string; number: number }[] {
  const found: { name: string; number: number }[] = [];
  text.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(BUN_RUN)) {
      found.push({ name: match[1] as string, number: index + 1 });
    }
  });
  return found;
}

export function zeroProblems(found: string[]): string[] {
  if (found.length === 0) {
    return [
      `found 0 ${MANIFEST} file(s), so the rule that every command a document names is a real ` +
        'one passes over a tree this gate never opened',
    ];
  }
  return found
    .filter((rel) => scriptsOf(rel).length === 0)
    .map(
      (rel) =>
        `${rel}: declares 0 script(s). A manifest with nothing in it answers every command a ` +
        'page under it names with the same silence',
    );
}

export function commandProblems(
  documents: string[],
  scriptsFor: (rel: string) => string[],
  readPage = read,
): string[] {
  return documents.flatMap((rel) => {
    const known = new Set(scriptsFor(rel));
    return commandsIn(readPage(rel))
      .filter((command) => !known.has(command.name))
      .map(
        (command) =>
          `${rel}:${command.number}: names "bun run ${command.name}", which the nearest ` +
          `${MANIFEST} does not define. A command a page lists is a command an agent runs ` +
          'because the page listed it',
      );
  });
}

export function routerNamesEntryPoints(text: string, entries: string[]): string[] {
  return entries
    .filter((name) => !new RegExp(`\\bbun (run )?${name}\\b`).test(text))
    .map(
      (name) =>
        `${ROUTER}: does not name the entry point "${name}". A colon-free script is a way into ` +
        'this tree, and one the router never mentions is one nobody is told to run',
    );
}

export function manifestProblems(found: string[], documents: string[], readPage = read): string[] {
  return found.flatMap((rel) => {
    const page = routerBeside(rel);
    const entries = entryPoints(scriptsOf(rel, readPage));
    if (entries.length === 0) return [];
    if (!documents.includes(page)) {
      return [
        `${rel}: declares ${entries.length} entry point(s) and no ${page} names them. A ` +
          'manifest without a page beside it is a way into this tree nobody is sent through',
      ];
    }
    return routerNamesEntryPoints(readPage(page), entries).map((problem) =>
      problem.replace(`${ROUTER}:`, `${page}:`),
    );
  });
}

export function problems(documents = markdownFiles(ROOT), readPage = read): string[] {
  const found = manifests();
  const zero = zeroProblems(found);
  if (zero.length > 0) return zero;
  const scriptsFor = (rel: string): string[] => {
    const manifest = nearest(rel, found);
    return manifest === null ? [] : scriptsOf(manifest, readPage);
  };
  return [
    ...commandProblems(documents, scriptsFor, readPage),
    ...manifestProblems(found, documents, readPage),
    ...staleEntryProblems(allScripts(found, readPage)),
  ];
}

export function main(): void {
  const found = problems();
  for (const problem of found) console.log(`check:vocabulary  ${problem}`);
  console.log(`check:vocabulary  ${found.length} problem(s)`);
  if (found.length > 0) process.exit(1);
}

if ((process.argv[1] ?? '').endsWith('check-vocabulary.ts')) main();
