import { describe, expect, it } from 'vitest';
import { packageRootOf } from './tree';
import {
  isPathClaim,
  linkProblems,
  linkTargets,
  resolveTarget,
  memberClaims,
  memberProblems,
  OUTSIDE_THE_TREE,
  pathClaims,
  pathProblems,
  problems,
  staleExemptProblems,
  zeroProblems,
} from './check-citations';

const WEB = 'apps/frontend/web';
import { markdownFiles, read } from './tree';

describe('what counts as a claim about a path', () => {
  it('takes a path with a directory and an extension', () => {
    expect(isPathClaim('src/app/app.ts')).toBe(true);
  });

  it('leaves a bare word alone', () => {
    expect(isPathClaim('carreras')).toBe(false);
  });

  it('leaves a url and a site-root path alone', () => {
    expect(isPathClaim('https://touno.dravensoft.org/riders')).toBe(false);
    expect(isPathClaim('/restaurantes')).toBe(false);
  });

  it('leaves a metavariable alone, since a concrete one would read as a claim', () => {
    expect(isPathClaim('<area>/<name>.ts')).toBe(false);
  });

  it('leaves a generated name alone, since a fresh clone carries none', () => {
    expect(isPathClaim('src/plugin.generated.css')).toBe(false);
  });

  it('leaves a path the walk never descends into alone, whatever is on disk', () => {
    expect(isPathClaim('dist/touno/browser/404.html')).toBe(false);
    expect(isPathClaim('node_modules/vitest/index.js')).toBe(false);
  });

  it('reports nothing for a build product whether or not the tree has been built', () => {
    const naming = () => 'it writes `dist/touno/browser/404.html`';

    expect(pathProblems(['one.md'], naming)).toEqual([]);
    expect(memberProblems(['one.md'], () => 'see `dist/touno/browser/app.ts:main()`')).toEqual([]);
  });

  it('reads a path out of a code span and not out of running prose', () => {
    expect(pathClaims('the `src/app/app.ts` file and src/app/other.ts')).toEqual([
      { claim: 'src/app/app.ts', number: 1 },
    ]);
  });

  it('ignores a fenced block', () => {
    expect(pathClaims('```\n`nowhere/at/all.ts`\n```')).toEqual([]);
  });
});

describe('a path that is not there', () => {
  it('is reported', () => {
    const found = pathProblems(['one.md'], () => 'see `src/app/nowhere.ts`');
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('src/app/nowhere.ts');
  });

  it('resolves beside the page that names it', () => {
    expect(pathProblems([`${WEB}/src/app/AGENTS.md`], () => 'see `domain/AGENTS.md`')).toEqual([]);
  });

  it('resolves from the root of the package that holds the page', () => {
    expect(pathProblems([`${WEB}/src/app/AGENTS.md`], () => 'see `src/styles.css`')).toEqual([]);
  });

  it('answers the package root of a page, and the tree root for one no package holds', () => {
    expect(packageRootOf(`${WEB}/src/app/AGENTS.md`)).toBe(WEB);
    expect(packageRootOf('tools/check/AGENTS.md')).toBe('');
  });
});

describe('the member half of a citation', () => {
  it('is read out of a span', () => {
    expect(memberClaims(`\`${WEB}/src/app/app.ts:panelFor(url)\``)).toEqual([
      { path: `${WEB}/src/app/app.ts`, member: 'panelFor', number: 1 },
    ]);
  });

  it('passes when the file declares the member', () => {
    const cite = (rel: string) =>
      rel === 'one.md' ? `\`${WEB}/src/app/app.ts:GATE_NOUN()\`` : read(rel);
    expect(memberProblems(['one.md'], cite)).toEqual([]);
  });

  it('reports a member the named file does not declare, which is the half that goes wrong quietly', () => {
    const cite = (rel: string) =>
      rel === 'one.md' ? `\`${WEB}/src/app/app.ts:notDeclaredAnywhere()\`` : read(rel);
    const found = memberProblems(['one.md'], cite);
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('notDeclaredAnywhere');
  });

  it('reports a citation whose file is not in the tree at all', () => {
    const found = memberProblems(['one.md'], () => '`src/app/nowhere.ts:thing()`');
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('nowhere.ts');
  });
});

describe('OUTSIDE_THE_TREE', () => {
  it('gives every entry a reason rather than a bare name', () => {
    for (const [name, reason] of OUTSIDE_THE_TREE) {
      expect(reason.length, name).toBeGreaterThan(40);
    }
  });

  it('reports an entry no document cites any more', () => {
    const found = staleExemptProblems(['one.md'], () => 'nothing cited here');
    expect(found.length).toBe(OUTSIDE_THE_TREE.size);
  });
});

describe('a link a reader would follow', () => {
  it('is read out of markdown and resolved against the page holding it', () => {
    expect(linkTargets('see [one](./one/AGENTS.md)')).toEqual([
      { target: './one/AGENTS.md', number: 1 },
    ]);
    expect(resolveTarget('src/app/AGENTS.md', '../../design/AGENTS.md')).toBe('design/AGENTS.md');
  });

  it('ignores a url and a site-root path', () => {
    expect(linkTargets('[a](https://agents.md) [b](/riders)')).toEqual([]);
  });

  it('is reported when it resolves to nothing', () => {
    const found = linkProblems(['AGENTS.md'], () => '[x](./nowhere/AGENTS.md)');
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('nowhere');
  });

  it('passes when it resolves', () => {
    expect(linkProblems(['AGENTS.md'], () => '[x](./README.md)')).toEqual([]);
  });

  it('is examined in quantity across the real tree', () => {
    const found = markdownFiles().flatMap((rel) => linkTargets(read(rel)));
    expect(found.length).toBeGreaterThan(20);
  });
});

describe('an empty subject', () => {
  it('fails rather than reporting every citation resolved', () => {
    expect(zeroProblems([], () => '')).toHaveLength(1);
  });

  it('fails when no document holds a link, rather than following nothing', () => {
    expect(zeroProblems(['one.md'], () => 'no links here')).toHaveLength(1);
  });
});

describe('the tree as it stands', () => {
  it('passes', () => {
    expect(problems()).toEqual([]);
  });
});
