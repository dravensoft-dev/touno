import { describe, expect, it } from 'vitest';
import {
  allScripts,
  commandProblems,
  commandsIn,
  directoryOf,
  entryPoints,
  manifests,
  nearest,
  NOT_AN_ENTRY_POINT,
  problems,
  routerBeside,
  routerNamesEntryPoints,
  scriptsOf,
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

describe('the manifest nearest a page', () => {
  const found = ['package.json', 'apps/frontend/web/package.json'];

  it('is the deepest one above it', () => {
    expect(nearest('apps/frontend/web/src/app/AGENTS.md', found)).toBe(
      'apps/frontend/web/package.json',
    );
  });

  it('falls back to the root for a page no package encloses', () => {
    expect(nearest('tools/check/AGENTS.md', found)).toBe('package.json');
    expect(nearest('AGENTS.md', found)).toBe('package.json');
  });

  it('answers nothing when there is no manifest at all', () => {
    expect(nearest('AGENTS.md', [])).toBe(null);
  });

  it('is the page beside it that has to name its entry points', () => {
    expect(routerBeside('apps/frontend/web/package.json')).toBe('apps/frontend/web/AGENTS.md');
    expect(routerBeside('package.json')).toBe('AGENTS.md');
    expect(directoryOf('a/b/c.md')).toBe('a/b');
  });
});

describe('a command that does not exist', () => {
  it('is reported', () => {
    const found = commandProblems(
      ['one.md'],
      () => ['build'],
      () => 'run `bun run nowhere`',
    );
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('nowhere');
  });

  it('passes when the script is declared', () => {
    expect(
      commandProblems(
        ['one.md'],
        () => ['build'],
        () => '`bun run build`',
      ),
    ).toEqual([]);
  });

  it('reads each page against its own manifest', () => {
    const scriptsFor = (rel: string): string[] => (rel === 'a.md' ? ['build'] : ['sweep']);
    expect(commandProblems(['a.md', 'b.md'], scriptsFor, () => '`bun run build`')).toHaveLength(1);
  });
});

describe('entry points', () => {
  it('are the colon-free scripts that are not lifecycle hooks', () => {
    expect(entryPoints(['build', 'check:docs', 'prebuild', 'ng'])).toEqual(['build']);
  });

  it('must each be named by the page beside their manifest', () => {
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

  it('names only scripts a manifest in this tree still declares', () => {
    expect(staleEntryProblems(allScripts())).toEqual([]);
  });

  it('reports an entry that has outlived its script', () => {
    expect(staleEntryProblems([]).length).toBe(NOT_AN_ENTRY_POINT.size);
  });
});

describe('an empty subject', () => {
  it('fails rather than passing over a tree it never opened', () => {
    expect(zeroProblems([])).toHaveLength(1);
  });
});

describe('the tree as it stands', () => {
  it('holds more than one manifest, which is what a monorepo means here', () => {
    expect(manifests().length).toBeGreaterThan(1);
  });

  it('declares more than zero scripts in each of them', () => {
    for (const rel of manifests()) expect(scriptsOf(rel).length, rel).toBeGreaterThan(0);
  });

  it('passes', () => {
    expect(problems()).toEqual([]);
  });
});
