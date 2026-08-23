# scripts/check: the gates

**A gate states one claim about the tree and fails when it stops being true.** They are registered in
`GATES` in `check-all.ts`, which `bun run check` runs: one failure never stops the rest, so a sweep
reports every problem in one pass rather than the first.

| Gate                  | Fails when                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-agents.ts`     | an `AGENTS.md` exists that no chain of links from the root reaches, or a `README.md` sits on this branch outside `SURVIVORS`. **The levels are what the walk finds, never what a list declares**, because a list is maintained by whoever remembers it. Proximity hands an agent the nearest page and hands a reader nothing, so a level nobody links is one only half the readers of this tree can be sent to                                    |
| `check-docs.ts`       | a document passes `MAX_DOCUMENT_CHARS`, prose outside a fence or a code span carries an em dash, or a hand-written source under `src/`, `design/` or `scripts/` carries a comment. `SIZE_ALLOWANCE` is empty, and **that emptiness is the claim**: a document holding a raised limit that has fallen back inside the shared one fails as a stale allowance, so the pressure to decompose it returns rather than ending                            |
| `check-citations.ts`  | prose names a path that is not in the tree, or cites `<file>.ts:<member>()` where that file does not declare that member. **The member half is the one that goes wrong quietly**: a citation naming the wrong file with the right member sends a reader somewhere confident and empty, and nothing about the sentence carrying it looks wrong                                                                                                     |
| `check-vocabulary.ts` | a document tells a reader to `bun run` something `package.json` does not define, or the router fails to name an entry point. A colon-free script is a way into this tree; a colon narrows one of those to a phase                                                                                                                                                                                                                                 |
| `check-all.ts`        | any of the above fails. It is the registry, and a gate that exists and is registered nowhere runs never                                                                                                                                                                                                                                                                                                                                           |
| `tree.ts`             | not a gate. The walk, the prose reader and the code-span reader every gate shares, so "what this tree contains" is answered once. **`SKIPPED` is that answer and `underSkippedRoot()` is how a gate asks it.** The walk never descends into `dist`, so a path claim under it is not a claim either: a build product is there on a machine that has built and absent in CI, and a rule reading the disk instead passes and fails on the same prose |

Every `X.spec.ts` beside a gate covers that gate, and runs inside `bun run test`.

## The shape of a gate

Each exports its logic as **pure functions returning problem strings**, and a `main()` that prints
them and exits non-zero. That is what lets a spec assert on a gate's reason-carrying map by name
without running the gate, and what lets `check-all.ts` collect from all of them in one process.

**A reason-carrying map is part of the gate, not documentation of it.** `SURVIVORS`,
`SIZE_ALLOWANCE`, `OUTSIDE_THE_TREE`, `NOT_AN_ENTRY_POINT`: each entry names a case and says why, as
a string value rather than a comment, and **a stale entry fails the gate itself**. That is what keeps
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
reported satisfied over a tree it never opened. When you write or move anything a gate resolves by
path, the question is not "does it still pass" but "how many things did it look at, and is that the
number I expect".

## Adding one

A gate has two existences, the file and the place that invokes it, and only the second is worth
anything. **Adding one means adding it to `package.json` and to `GATES`**, and citing a gate as
evidence means confirming it is in `GATES` first.
