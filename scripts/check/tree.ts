import { readdirSync, readFileSync, statSync, lstatSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const ROOT = process.cwd();

export const SKIPPED = new Set([
  'node_modules',
  '.git',
  '.angular',
  'dist',
  'Brief para producto nuevo',
]);

export const GENERATED_INFIX = '.generated.';

export function underSkippedRoot(rel: string): boolean {
  return SKIPPED.has(rel.split('/')[0] ?? '');
}

export function relPosix(path: string): string {
  return relative(ROOT, path).split(sep).join('/');
}

export function walk(base = ROOT): string[] {
  const found: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (SKIPPED.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) found.push(path);
    }
  };
  visit(base);
  return found.sort();
}

export function markdownFiles(base = ROOT): string[] {
  return walk(base)
    .filter((path) => path.endsWith('.md'))
    .map(relPosix);
}

export function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

export function exists(rel: string): boolean {
  try {
    statSync(join(ROOT, rel));
    return true;
  } catch {
    return false;
  }
}

export function isSymlink(rel: string): boolean {
  try {
    return lstatSync(join(ROOT, rel)).isSymbolicLink();
  } catch {
    return false;
  }
}

export const FENCE = /^\s*```/;

export function proseLines(text: string): { line: string; number: number }[] {
  const out: { line: string; number: number }[] = [];
  let fenced = false;
  text.split('\n').forEach((line, index) => {
    if (FENCE.test(line)) {
      fenced = !fenced;
      return;
    }
    if (!fenced) out.push({ line, number: index + 1 });
  });
  return out;
}

export function withoutCodeSpans(line: string): string {
  return line.replace(/`[^`]*`/g, '');
}

export function codeSpans(line: string): string[] {
  return [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1] ?? '');
}
