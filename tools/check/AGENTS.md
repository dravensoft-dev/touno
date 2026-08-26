# scripts/check: the gates

**A gate states one claim about the tree and fails when it stops being true.** They are registered in
`GATES` in `check-all.ts`, which `bun run check` runs: one failure never stops the rest, so a sweep
reports every problem in one pass rather than the first.

**The tree a gate reads is the whole monorepo**, every app and every package, and it is resolved from
the repository root. That is why the gates live at the root rather than beside an app: a rule about
how this tree documents itself cannot be checked by something that can only see one project in it.

| Gate                  | Fails when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-agents.ts`     | an `AGENTS.md` exists that no chain of links from the root reaches, or a `README.md` sits on this branch outside `SURVIVORS`. **The levels are what the walk finds, never what a list declares**, because a list is maintained by whoever remembers it. Proximity hands an agent the nearest page and hands a reader nothing, so a level nobody links is one only half the readers of this tree can be sent to                                                                                                                                                                                                                                                                                                                                             |
| `check-docs.ts`       | a document passes `MAX_DOCUMENT_CHARS`, prose outside a fence or a code span carries an em dash, or a hand-written source under one of `SCANNED_TREES` carries a comment. `SIZE_ALLOWANCE` raises the budget for a named document and **carries the reason it is raised**, which a spec holds to a real sentence rather than a bare number. **An allowance is a debt and not a settlement**: one naming a document that has fallen back inside the shared budget fails as stale, and one naming a document the tree no longer holds fails too, so the pressure to decompose returns rather than ending. `TOUNO_STRUC.md` holds the only one, because it is a product document with no page beneath it to hand a tour to and it is read as one exported PDF |
| `check-citations.ts`  | prose names a path that is not in the tree, or cites `<file>.ts:<member>()` where that file does not declare that member. **The member half is the one that goes wrong quietly**: a citation naming the wrong file with the right member sends a reader somewhere confident and empty, and nothing about the sentence carrying it looks wrong                                                                                                                                                                                                                                                                                                                                                                                                              |
| `check-vocabulary.ts` | a document tells a reader to `bun run` something the manifest nearest it does not define, a manifest declares an entry point no page beside it names, or a manifest has no page beside it at all. A colon-free script is a way into this tree; a colon narrows one of those to a phase                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `check-all.ts`        | any of the above fails. It is the registry, and a gate that exists and is registered nowhere runs never                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tree.ts`             | not a gate. The walk, the prose reader and the code-span reader every gate shares, so "what this tree contains" is answered once. **`SKIPPED` is that answer and `underSkippedRoot()` is how a gate asks it.** The walk never descends into `dist`, so a path claim under it is not a claim either: a build product is there on a machine that has built and absent in CI, and a rule reading the disk instead passes and fails on the same prose                                                                                                                                                                                                                                                                                                          |

Every `X.spec.ts` beside a gate covers that gate, and runs inside `bun run test`, which reaches them
through `vitest.config.ts` at the root rather than through the Angular builder.

## What a monorepo made these gates learn

Three of the rules moved from "the tree" to "the part of the tree you are in", and each is a place a
gate would otherwise be wrong in a way that reads as correct:

- **A path in prose resolves from the root, from beside the page, or from the root of the package
  holding the page.** `tree.ts:packageRootOf()` answers the third, so a page inside an app names its
  own files by the tail alone and keeps saying something true when the app moves. Without it every
  in-app citation would carry the app's full path, which is the form that goes stale the next time
  anything is rearranged.
- **A command resolves against the manifest nearest the page that names it**, the same way the
  convention resolves the nearest `AGENTS.md`. `check-vocabulary.ts:nearest()` is that resolution. A
  page under an app that named a root command would be telling a reader to run something from a
  directory where it does not exist.
- **An entry point is named by the page beside its own manifest**, not by the root router.
  `check-vocabulary.ts:routerBeside()` says which page that is. A manifest with entry points and no
  page beside it fails, because a way into this tree nobody is sent through is a way nobody takes.

**`SKIPPED` is a single answer to two questions, and that is worth knowing before adding to it.**
`walk()` skips a directory by name at any depth, while `underSkippedRoot()` reads only the first
segment of a path claim. A name added for the first reason silently disables any documented claim
whose path starts with it, and the claim then fails as a stale exemption rather than as what it is.
`bin` is out of the set for exactly that reason.

## The shape of a gate

Each exports its logic as **pure functions returning problem strings**, and a `main()` that prints
them and exits non-zero. That is what lets a spec assert on a gate's reason-carrying map by name
without running the gate, and what lets `check-all.ts` collect from all of them in one process.

**A reason-carrying map is part of the gate, not documentation of it.** `SURVIVORS`,
`SIZE_ALLOWANCE`, `OUTSIDE_THE_TREE`, `NOT_AN_ENTRY_POINT`, `DOC_COMMENT`: each entry names a case
and says why, as a string value rather than a comment, and **a stale entry fails the gate itself**.
`DOC_COMMENT` is the one that admits something rather than excusing it: an XML documentation line on
a public C# member is the single comment shape this tree allows, because the specification generator
reads it and something downstream fails when it goes missing. That is what keeps
an exception list from outliving the exception, and it is why a debt lives beside its gate rather
than in prose. [`../../DOUBTS.md`](../../DOUBTS.md) is the order of preference.

**A gate carries no comment**, because this tree carries none anywhere. A gate's reason is its row
above, its exported reason strings, and the sentence inside the problem it reports. Every one of
those is read by somebody who has a reason to read it, which a comment above the code is not.

## A green run is only as good as what the gate looked at

**A gate that finds nothing reports zero violations either way**, and it does so behind a plausible
line of output. A walk that iterated zero files because the tree moved under it is indistinguishable
from a clean sweep.

Every gate here therefore exports a `zeroProblems` function and calls it first: an empty subject is
an **explicit failure** rather than a vacuous pass, and it says which rule it would otherwise have
reported satisfied over a tree it never opened. **A directory a gate expects and does not find reads
as empty rather than throwing**, which is the same rule seen from the other side: a walk that dies
part way reports neither a pass nor a violation, and a stack trace is the one outcome that says
nothing about the claim. When you write or move anything a gate resolves by
path, the question is not "does it still pass" but "how many things did it look at, and is that the
number I expect".

## Adding one

A gate has two existences, the file and the place that invokes it, and only the second is worth
anything. **Adding one means adding it to `package.json` and to `GATES`**, and citing a gate as
evidence means confirming it is in `GATES` first.
