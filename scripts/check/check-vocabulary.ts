import { markdownFiles, read, ROOT } from './tree';

export const BUN_RUN = /\bbun run ([a-z][a-z0-9:-]*)/g;

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

export function declaredScripts(): string[] {
  const manifest = JSON.parse(read('package.json')) as { scripts?: Record<string, string> };
  return Object.keys(manifest.scripts ?? {}).sort();
}

export function entryPoints(names: string[]): string[] {
  return names.filter((name) => !name.includes(':') && !NOT_AN_ENTRY_POINT.has(name)).sort();
}

export function staleEntryProblems(names: string[]): string[] {
  return [...NOT_AN_ENTRY_POINT.keys()]
    .filter((name) => !names.includes(name))
    .map(
      (name) =>
        `NOT_AN_ENTRY_POINT names "${name}", which package.json no longer declares. An exemption ` +
        'outliving what it was written for is the shape this map exists to refuse',
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

export function zeroProblems(names: string[]): string[] {
  return names.length === 0
    ? [
        'found 0 script(s) in package.json, so the rule that every command a document names is a ' +
          'real one passes by naming nothing',
      ]
    : [];
}

export function commandProblems(documents: string[], names: string[], readPage = read): string[] {
  const known = new Set(names);
  return documents.flatMap((rel) =>
    commandsIn(readPage(rel))
      .filter((command) => !known.has(command.name))
      .map(
        (command) =>
          `${rel}:${command.number}: names "bun run ${command.name}", which package.json does not ` +
          'define. A command a page lists is a command an agent runs because the page listed it',
      ),
  );
}

export function routerNamesEntryPoints(text: string, entries: string[]): string[] {
  return entries
    .filter((name) => !new RegExp(`\\bbun (run )?${name}\\b`).test(text))
    .map(
      (name) =>
        `AGENTS.md: does not name the entry point "${name}". A colon-free script is a way into ` +
        'this tree, and one the router never mentions is one nobody is told to run',
    );
}

export function problems(documents = markdownFiles(ROOT), readPage = read): string[] {
  const names = declaredScripts();
  const zero = zeroProblems(names);
  if (zero.length > 0) return zero;
  return [
    ...commandProblems(documents, names, readPage),
    ...routerNamesEntryPoints(readPage('AGENTS.md'), entryPoints(names)),
    ...staleEntryProblems(names),
  ];
}

export function main(): void {
  const found = problems();
  for (const problem of found) console.log(`check:vocabulary  ${problem}`);
  console.log(`check:vocabulary  ${found.length} problem(s)`);
  if (found.length > 0) process.exit(1);
}

if ((process.argv[1] ?? '').endsWith('check-vocabulary.ts')) main();
