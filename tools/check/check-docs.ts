import {
  exists,
  GENERATED_INFIX,
  markdownFiles,
  proseLines,
  read,
  relPosix,
  ROOT,
  walk,
  withoutCodeSpans,
} from './tree';

export const MAX_DOCUMENT_CHARS = 60_000;

export const SIZE_ALLOWANCE = new Map<string, { limit: number; reason: string }>([
  [
    'TOUNO_STRUC.md',
    {
      limit: 75_000,
      reason:
        'a product document rather than a level page. The shared budget is paid back by moving a ' +
        "level's own tour into the page below it and leaving a pointer, and this document has no " +
        'page below it: it is the whole of what Touno promises the business that reads it, and it ' +
        'is exported and read as one PDF, where a pointer to another file is a dead end rather ' +
        'than a hop. That is also why it cites its sibling by section number and never by link. ' +
        'It is raised by a quarter and no further, and the gate takes the allowance back by ' +
        'itself the moment the document fits the shared budget again',
    },
  ],
]);

export const BANNED_PUNCTUATION: [string, string][] = [['—', 'an em dash']];

export const COMMENTED_EXTENSIONS = ['.ts', '.css', '.html', '.cs', '.kt', '.swift'];

export const LINE_COMMENT_EXTENSIONS = new Set(['.ts', '.cs', '.kt', '.swift']);

export const DOC_COMMENT = new Map<string, { prefix: string; reason: string }>([
  [
    '.cs',
    {
      prefix: '///',
      reason:
        'an XML documentation line, which the OpenAPI generator reads off a public member to ' +
        'write the contract the three clients are generated from. It is the one comment shape ' +
        'this tree admits, because something downstream fails when it goes missing; loose prose ' +
        'inside a method is a comment and fails like any other',
    },
  ],
]);

export const SCANNED_TREES = ['apps', 'packages', 'tools'];

export function limitFor(rel: string): number {
  return SIZE_ALLOWANCE.get(rel)?.limit ?? MAX_DOCUMENT_CHARS;
}

export function sizeProblems(documents: string[], readPage = read): string[] {
  return documents.flatMap((rel) => {
    const size = readPage(rel).length;
    const limit = limitFor(rel);
    if (size > limit) {
      return [
        `${rel}: ${size} characters against a limit of ${limit}. Move a level's own tour into ` +
          "that level's page and leave a pointer; what spends the budget is a new rule, not a " +
          'new screen',
      ];
    }
    if (SIZE_ALLOWANCE.has(rel) && size <= MAX_DOCUMENT_CHARS) {
      return [
        `${rel}: holds a raised limit and now fits inside the shared one. An allowance that has ` +
          'stopped being needed is a stale allowance',
      ];
    }
    return [];
  });
}

export function punctuationProblems(documents: string[], readPage = read): string[] {
  return documents.flatMap((rel) =>
    proseLines(readPage(rel)).flatMap(({ line, number }) =>
      BANNED_PUNCTUATION.filter(([mark]) => withoutCodeSpans(line).includes(mark)).map(
        ([, name]) =>
          `${rel}:${number}: prose carries ${name}. Documentation punctuates with a colon, a ` +
          'comma, a semicolon or a full stop',
      ),
    ),
  );
}

export const OPERAND_POSITION = new Set([
  '(',
  ',',
  '=',
  ':',
  '[',
  '!',
  '&',
  '|',
  '?',
  '{',
  '}',
  ';',
  '>',
  '+',
  '*',
  '~',
  '^',
  '%',
]);

export const REGEX_KEYWORD =
  /\b(return|typeof|instanceof|in|of|case|do|else|yield|await|new|delete|void|throw)$/;

export function startsRegex(source: string, index: number, previous: string): boolean {
  if (previous === '') return true;
  const before = source.slice(Math.max(0, index - 24), index).trimEnd();
  if (REGEX_KEYWORD.test(before)) return true;
  if (previous === '/') return false;
  return OPERAND_POSITION.has(previous);
}

export function isDocComment(source: string, index: number, extension: string): boolean {
  const admitted = DOC_COMMENT.get(extension);
  if (admitted === undefined || !source.startsWith(admitted.prefix, index)) return false;
  return source.slice(source.lastIndexOf('\n', index - 1) + 1, index).trim() === '';
}

export function findComments(source: string, extension: string): number[] {
  const found: number[] = [];
  if (extension === '.html') {
    source.split('\n').forEach((line, index) => {
      if (line.includes('<!--')) found.push(index + 1);
    });
    return found;
  }
  let line = 1;
  let index = 0;
  let quote = '';
  let previous = '';
  while (index < source.length) {
    const character = source[index] as string;
    const next = source[index + 1] ?? '';
    if (character === '\n') line += 1;
    if (quote !== '') {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      previous = character;
      index += 1;
      continue;
    }
    if (LINE_COMMENT_EXTENSIONS.has(extension) && character === '/' && next === '/') {
      if (!isDocComment(source, index, extension)) found.push(line);
      while (index < source.length && source[index] !== '\n') index += 1;
      continue;
    }
    if (
      extension === '.ts' &&
      character === '/' &&
      next !== '*' &&
      startsRegex(source, index, previous)
    ) {
      index += 1;
      while (index < source.length && source[index] !== '/') {
        if (source[index] === '\\') index += 1;
        else if (source[index] === '[') {
          while (index < source.length && source[index] !== ']') {
            if (source[index] === '\\') index += 1;
            index += 1;
          }
        }
        index += 1;
      }
      previous = '/';
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      found.push(line);
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        if (source[index] === '\n') line += 1;
        index += 1;
      }
      index += 2;
      continue;
    }
    if (character.trim() !== '') previous = character;
    index += 1;
  }
  return found;
}

export function scannedSources(): string[] {
  return SCANNED_TREES.filter((tree) => exists(tree))
    .flatMap((tree) => walk(`${ROOT}/${tree}`))
    .map(relPosix)
    .filter((rel) => COMMENTED_EXTENSIONS.some((extension) => rel.endsWith(extension)))
    .filter((rel) => !rel.includes(GENERATED_INFIX));
}

export function commentProblems(sources: string[], readPage = read): string[] {
  return sources.flatMap((rel) => {
    const extension = COMMENTED_EXTENSIONS.find((one) => rel.endsWith(one)) as string;
    return findComments(readPage(rel), extension).map(
      (line) =>
        `${rel}:${line}: carries a comment. Touno writes none, anywhere: a name carries its own ` +
        'context, and a reason a rename cannot express goes in the level page for that ' +
        'directory or in a reason string a gate reads',
    );
  });
}

export function zeroProblems(documents: string[], sources: string[]): string[] {
  const found: string[] = [];
  if (documents.length === 0) {
    found.push(
      'found 0 document(s), so the size and punctuation rules pass over a tree this gate never ' +
        'opened',
    );
  }
  if (sources.length === 0) {
    found.push(
      `found 0 source file(s) under ${SCANNED_TREES.join(', ')}, so the comment rule passes by ` +
        'reading nothing. A tree that is not there reads as empty rather than throwing, because a ' +
        'gate that dies mid-walk reports neither a pass nor a violation',
    );
  }
  return found;
}

export function staleAllowanceProblems(documents: string[]): string[] {
  return [...SIZE_ALLOWANCE.keys()]
    .filter((rel) => !documents.includes(rel))
    .map((rel) => `SIZE_ALLOWANCE names ${rel}, which is not in the tree`);
}

export function problems(
  documents = markdownFiles(ROOT),
  sources = scannedSources(),
  readPage = read,
): string[] {
  const zero = zeroProblems(documents, sources);
  if (zero.length > 0) return zero;
  return [
    ...sizeProblems(documents, readPage),
    ...punctuationProblems(documents, readPage),
    ...commentProblems(sources, readPage),
    ...staleAllowanceProblems(documents),
  ];
}

export function main(): void {
  const found = problems();
  for (const problem of found) console.log(`check:docs  ${problem}`);
  console.log(`check:docs  ${found.length} problem(s)`);
  if (found.length > 0) process.exit(1);
}

if ((process.argv[1] ?? '').endsWith('check-docs.ts')) main();
