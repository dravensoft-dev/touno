# What a machine writes, and what you do

**Before you edit a file in this tree, know which half of it is yours.** An edit to a generated file
survives until the next `bun run prepare:assets` and then goes, and nothing fails in between: the
suites read the source you edited, the gates compare files that still agree with each other, and the
page you open is drawn from the file the build rewrote. A green board is not evidence that your edit
is still there.

This page answers that question and nothing else, for the whole monorepo. What a value means is
[`apps/frontend/web/design/AGENTS.md`](./apps/frontend/web/design/AGENTS.md); what a script does is
[`apps/frontend/web/tools/AGENTS.md`](./apps/frontend/web/tools/AGENTS.md).

## A file here is one of two things

**Written by a machine, and its name says so.** `<stem>.generated.<ext>`. Never edit one, never
review one as though a person chose its wording, and never fix a defect in one: the defect is in its
source, and the next build restores it.

**Written by a machine, and its name does not say so.** One file is in this class, and it is named
below with the reason it cannot carry the infix.

**There is no third class here.** No file in this tree is hand-written with a machine-written region
inside it, which is the shape that costs the most elsewhere, and none should become one: a region
whose owner is invisible from outside means a gate judging the file reports a defect whose fix is
somewhere the message does not name.

## When a generator writes a directory rather than a file

A file name is the only place the infix can go, and **a generator emitting a whole client library
does not choose its file names**. Where that happens, the directory carries the announcement instead:
everything under a directory named `generated` is written by a machine, ignored the way every other
build product is, and rebuilt rather than edited.

[`packages/contracts/AGENTS.md`](./packages/contracts/AGENTS.md) is the level where that arrives, and
the rule is stated here rather than there because the question it answers is this page's: whether the
file in front of you is yours.

## What is generated, from what

| File                                         | Written by                                                             | From                                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `apps/frontend/web/src/arena.generated.css`  | `arena-to-prod`, inside `prepare:assets`                               | `apps/frontend/web/arena.config.json`: the palettes, the fonts and the component set                |
| `apps/frontend/web/src/icons.generated.css`  | the same                                                               | the Phosphor glyphs the tree actually uses, subset and self-hosted                                  |
| `apps/frontend/web/src/plugin.generated.css` | the same                                                               | `apps/frontend/web/design/touno/plugin.tokens.json` and `apps/frontend/web/design/touno/plugin.css` |
| `apps/frontend/web/public/sitemap.xml`       | `apps/frontend/web/tools/generate-sitemap.ts`, inside `prepare:assets` | `MANUAL`, plus the landing and `/riders`                                                            |

**`apps/frontend/web/public/sitemap.xml` is the one whose name does not announce it.** It cannot carry the infix,
because the name is the one a crawler fetches and `robots.txt` points at. Nothing else in the tree
is in that position.

All four are in `.gitignore`, in `.prettierignore` and in the ESLint `ignores` list, so a fresh clone
carries none of them and nothing lints or formats what a machine wrote. **To change what one
contains, change its source and run the build.**

```bash
bun run prepare:assets
```

`prestart`, `prebuild` and `pretest` each run it first, so the ordinary commands never read a stale
one. A build product is absent from a fresh clone rather than wrong in it, which is the failure mode
worth having: a missing stylesheet is loud and a stale one is not.

## After you change anything a generator reads

Run the build and read `git status --short`. Because all four outputs are ignored, that list should
be **empty**, and two rules about it are load-bearing:

**A tracked file you did not expect means something wrote where it should not.** No script in this
tree may write a source file; `apps/frontend/web/tools/AGENTS.md` states that as a rule and this is where it shows.

**A generated file you expected and did not get means the generator never saw your edit.** That is
nearly always a source in the wrong place rather than a generator at fault: `arena-to-prod` resolves
the style plugin from `stylePlugins` in `apps/frontend/web/arena.config.json` and walks it wherever it sits, so a
plugin file outside that directory is a file nothing reads.
