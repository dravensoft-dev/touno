import { describe, expect, it } from 'vitest';
import { markdownFiles } from './tree';
import {
  isRouter,
  linksFrom,
  problems,
  reachable,
  resolveLink,
  rootProblems,
  ROUTER,
  strayProblems,
  SURVIVORS,
  unreachableProblems,
  zeroProblems,
} from './check-agents';

const PAGES: Record<string, string> = {
  'AGENTS.md': 'see [one](./one/AGENTS.md)',
  'one/AGENTS.md': 'see [two](./two/AGENTS.md)',
  'one/two/AGENTS.md': 'a leaf',
  'orphan/AGENTS.md': 'nobody links this',
};

describe('what counts as a level', () => {
  it('names the root page and any page beneath it', () => {
    expect(isRouter(ROUTER)).toBe(true);
    expect(isRouter('src/app/AGENTS.md')).toBe(true);
    expect(isRouter('README.md')).toBe(false);
  });
});

describe('resolving a link', () => {
  it('resolves a relative target against the page holding it', () => {
    expect(resolveLink('src/app', './domain/AGENTS.md')).toBe('src/app/domain/AGENTS.md');
    expect(resolveLink('src/app/pages', '../AGENTS.md')).toBe('src/app/AGENTS.md');
  });

  it('ignores a url and a site-root path, which are claims about somewhere else', () => {
    expect(resolveLink('', 'https://agents.md')).toBeNull();
    expect(resolveLink('', '/restaurantes')).toBeNull();
  });

  it('drops a fragment', () => {
    expect(resolveLink('', './AGENTS.md#rules')).toBe('AGENTS.md');
  });

  it('reads every link on a page', () => {
    expect(linksFrom('AGENTS.md', PAGES['AGENTS.md'] as string)).toEqual(['one/AGENTS.md']);
  });
});

describe('the walk', () => {
  const read = (rel: string) => PAGES[rel] ?? '';

  it('follows a chain of links to any depth', () => {
    const found = reachable(Object.keys(PAGES), read);
    expect(found.has('one/two/AGENTS.md')).toBe(true);
  });

  it('reports a level nobody links', () => {
    const found = unreachableProblems(Object.keys(PAGES), read);
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('orphan/AGENTS.md');
  });

  it('passes a tree where every level is linked', () => {
    const linked = Object.keys(PAGES).filter((rel) => rel !== 'orphan/AGENTS.md');
    expect(unreachableProblems(linked, read)).toEqual([]);
  });
});

describe('the root page', () => {
  it('is required at the top of the tree', () => {
    expect(rootProblems(['src/app/AGENTS.md'])).toHaveLength(1);
    expect(rootProblems([ROUTER])).toEqual([]);
  });
});

describe('a README on this branch', () => {
  it('is reported unless SURVIVORS names it', () => {
    const found = strayProblems(['docs/README.md']);
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('docs/README.md');
  });

  it('lets a recorded survivor through', () => {
    expect(strayProblems(['README.md'])).toEqual([]);
  });

  it('gives every survivor a reason rather than a bare name', () => {
    for (const [name, reason] of SURVIVORS) {
      expect(reason.length, name).toBeGreaterThan(40);
    }
  });
});

describe('an empty subject', () => {
  it('fails rather than reporting every level linked over a tree it never opened', () => {
    expect(zeroProblems([])).toHaveLength(1);
    expect(zeroProblems([ROUTER])).toEqual([]);
  });
});

describe('the tree as it stands', () => {
  it('holds more than one level', () => {
    expect(markdownFiles().filter(isRouter).length).toBeGreaterThan(1);
  });

  it('passes', () => {
    expect(problems()).toEqual([]);
  });
});
