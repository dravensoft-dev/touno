import { describe, expect, it } from 'vitest';
import {
  BANNED_PUNCTUATION,
  DOC_COMMENT,
  findComments,
  limitFor,
  MAX_DOCUMENT_CHARS,
  problems,
  punctuationProblems,
  scannedSources,
  SIZE_ALLOWANCE,
  sizeProblems,
  startsRegex,
  zeroProblems,
} from './check-docs';

describe('the comment rule', () => {
  it('finds a line comment', () => {
    expect(findComments('const a = 1;\n// why\nconst b = 2;\n', '.ts')).toEqual([2]);
  });

  it('finds a block comment and reports where it opens', () => {
    expect(findComments('const a = 1;\n/* why\n   more */\n', '.ts')).toEqual([2]);
  });

  it('finds an html comment', () => {
    expect(findComments('<div>\n<!-- why -->\n</div>\n', '.html')).toEqual([2]);
  });

  it('finds a css comment', () => {
    expect(findComments('a { color: red; }\n/* why */\n', '.css')).toEqual([2]);
  });

  it('does not read a url inside a string as a comment', () => {
    expect(findComments("const a = 'https://touno.dravensoft.org';\n", '.ts')).toEqual([]);
  });

  it('does not read a double slash inside a regex as a comment', () => {
    expect(findComments('const a = /^[a-z]+:\\/\\//i.test(b);\n', '.ts')).toEqual([]);
  });

  it('does not read a character class holding a slash as a comment', () => {
    expect(findComments('const a = /[/*]/.test(b);\n', '.ts')).toEqual([]);
  });

  it('still finds a comment that follows a regex literal', () => {
    expect(findComments('const a = /x/.test(b);\n// why\n', '.ts')).toEqual([2]);
  });

  it('reads a division as division rather than as a regex', () => {
    expect(findComments('const a = b / c;\nconst d = e / f;\n// why\n', '.ts')).toEqual([3]);
  });

  it('treats a slash after a keyword as a regex', () => {
    expect(startsRegex('return /a/', 7, 'n')).toBe(true);
  });
});

describe('the comment rule over the backend', () => {
  it('finds a line comment in C#', () => {
    expect(findComments('var a = 1;\n// why\n', '.cs')).toEqual([2]);
  });

  it('admits an XML documentation line, which the OpenAPI generator reads', () => {
    expect(findComments('/// <summary>Order</summary>\npublic record Order();\n', '.cs')).toEqual(
      [],
    );
  });

  it('admits one indented under an attribute', () => {
    expect(findComments('public class A {\n    /// <summary>x</summary>\n}\n', '.cs')).toEqual([]);
  });

  it('still finds loose prose beside code on the same line', () => {
    expect(findComments('var a = 1; // why\n', '.cs')).toEqual([1]);
  });

  it('leaves a triple slash alone only where the language admits one', () => {
    expect(findComments('/// why\n', '.ts')).toEqual([1]);
  });

  it('gives every admitted shape a reason rather than a bare prefix', () => {
    for (const [extension, admitted] of DOC_COMMENT) {
      expect(admitted.reason.length, extension).toBeGreaterThan(40);
    }
  });
});

describe('the punctuation rule', () => {
  it('names the em dash', () => {
    expect(BANNED_PUNCTUATION.map(([mark]) => mark)).toContain('—');
  });

  it('reports an em dash in prose', () => {
    const found = punctuationProblems(['one.md'], () => 'a sentence — an aside');
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('one.md:1');
  });

  it('leaves a fenced block alone', () => {
    expect(punctuationProblems(['one.md'], () => '```\na — b\n```')).toEqual([]);
  });

  it('leaves a code span alone', () => {
    expect(punctuationProblems(['one.md'], () => 'the `a — b` token')).toEqual([]);
  });
});

describe('the size rule', () => {
  it('reports a document over the limit', () => {
    const found = sizeProblems(['big.md'], () => 'x'.repeat(MAX_DOCUMENT_CHARS + 1));
    expect(found).toHaveLength(1);
    expect(found[0]).toContain('big.md');
  });

  it('passes a document at the limit', () => {
    expect(sizeProblems(['fits.md'], () => 'x'.repeat(MAX_DOCUMENT_CHARS))).toEqual([]);
  });

  it('gives every raised limit a reason rather than a bare number', () => {
    for (const [rel, allowed] of SIZE_ALLOWANCE) {
      expect(allowed.reason.length, rel).toBeGreaterThan(40);
    }
  });

  it('raises a limit above the shared one, because raising it to less buys nothing', () => {
    for (const [rel, allowed] of SIZE_ALLOWANCE) {
      expect(allowed.limit, rel).toBeGreaterThan(MAX_DOCUMENT_CHARS);
    }
  });

  it('takes an allowance back once the document fits the shared budget again', () => {
    const found = sizeProblems(['TOUNO_STRUC.md'], () => 'x'.repeat(MAX_DOCUMENT_CHARS));

    expect(found).toHaveLength(1);
    expect(found[0]).toContain('stale allowance');
  });

  it('still fails a document that runs past the limit its allowance raised', () => {
    const limit = limitFor('TOUNO_STRUC.md');
    const found = sizeProblems(['TOUNO_STRUC.md'], () => 'x'.repeat(limit + 1));

    expect(found).toHaveLength(1);
    expect(found[0]).toContain(String(limit));
  });
});

describe('an empty subject', () => {
  it('fails rather than passing over a tree it never opened', () => {
    expect(zeroProblems([], ['a.ts'])).toHaveLength(1);
    expect(zeroProblems(['a.md'], [])).toHaveLength(1);
    expect(zeroProblems([], [])).toHaveLength(2);
  });
});

describe('a scanned tree that is not there', () => {
  it('reads as empty rather than throwing, so zeroProblems is what reports it', () => {
    expect(() => scannedSources()).not.toThrow();
  });
});

describe('the tree as it stands', () => {
  it('reads more than zero sources', () => {
    expect(scannedSources().length).toBeGreaterThan(0);
  });

  it('passes', () => {
    expect(problems()).toEqual([]);
  });
});
