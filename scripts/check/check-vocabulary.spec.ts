import { describe, expect, it } from 'vitest';
import {
  commandProblems,
  commandsIn,
  declaredScripts,
  entryPoints,
  NOT_AN_ENTRY_POINT,
  problems,
  routerNamesEntryPoints,
  staleEntryProblems,
  zeroProblems,
} from './check-vocabulary';

describe('reading a command out of a page', () => {
  it('finds one and says where', () => {
    expect(commandsIn('run `bun run build` first')).toEqual([{ name: 'build', number: 1 }]);
  });

  it('finds a narrowed one', () => {
    expect(commandsIn('`bun run check:docs`')).toEqual([{ name: 'check:docs', number: 1 }]);
  });
});

describe('a command that does not exist', () => {
  it('is reported', () => {
    const found = commandProblems(['one.md'], ['build'], () => 'run `bun run nowhere`');
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('nowhere');
  });

  it('passes when the script is declared', () => {
    expect(commandProblems(['one.md'], ['build'], () => '`bun run build`')).toEqual([]);
  });
});

describe('entry points', () => {
  it('are the colon-free scripts that are not lifecycle hooks', () => {
    expect(entryPoints(['build', 'check:docs', 'prebuild', 'ng'])).toEqual(['build']);
  });

  it('must each be named by the router', () => {
    expect(routerNamesEntryPoints('run bun run build', ['build'])).toEqual([]);
    const found = routerNamesEntryPoints('nothing here', ['build']);
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('build');
  });
});

describe('NOT_AN_ENTRY_POINT', () => {
  it('gives every entry a reason rather than a bare name', () => {
    for (const [name, reason] of NOT_AN_ENTRY_POINT) {
      expect(reason.length, name).toBeGreaterThan(40);
    }
  });

  it('names only scripts package.json still declares', () => {
    expect(staleEntryProblems(declaredScripts())).toEqual([]);
  });

  it('reports an entry that has outlived its script', () => {
    expect(staleEntryProblems([]).length).toBe(NOT_AN_ENTRY_POINT.size);
  });
});

describe('an empty subject', () => {
  it('fails rather than passing by naming nothing', () => {
    expect(zeroProblems([])).toHaveLength(1);
  });
});

describe('the tree as it stands', () => {
  it('declares more than zero scripts', () => {
    expect(declaredScripts().length).toBeGreaterThan(0);
  });

  it('passes', () => {
    expect(problems()).toEqual([]);
  });
});
