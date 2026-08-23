# DOUBTS

**A debt is paid, or made loud, before it is written down.**

This file is not a ledger. Touno keeps no prose register of defects: what is actionable is paid, and
what is a standing limit or a settled decision lives in a place that fails when it stops being true.
What this page holds is the definition of a debt here, and where the records live.

## What counts as a debt

Something that is **wrong, incomplete, or unverified**, and that a reader would otherwise have to
rediscover. Three tests separate one from an ordinary imperfection:

1. **It is a claim about the tree**, not a preference. "The route map's viewBox crops a track that
   leaves the city plane" is a debt; "this component could be shorter" is not.
2. **It survives the person who found it.** If reading the code answers it, the code is the record
   and there is nothing to file.
3. **It costs something specific**, and the cost is stated. A limit with no consequence is a fact,
   and a fact belongs in the level page that describes the thing.

A **decision** is the other admissible shape: an option that was weighed and refused, recorded so the
next reader does not re-propose it. A decision without its reason is worthless, because the reason is
the whole entry.

## Where a debt goes, in order of preference

**Prefer any of these to a paragraph.** Each of them fails when it stops being true, and a paragraph
does not. That is the entire argument for this order:

1. **Pay it.** A defect that can be fixed is not debt; it is work.
2. **A gate, with a reason-carrying map.** `SURVIVORS`, `SIZE_ALLOWANCE`, `OUTSIDE_THE_TREE`,
   `NOT_AN_ENTRY_POINT`: each entry names a case and says why, as a string value rather than a
   comment, and **a stale entry fails its own gate**. See
   [`scripts/check/AGENTS.md`](./scripts/check/AGENTS.md).
3. **A spec assertion.** A limit a test can pin is pinned, and this tree already prefers it: a fare
   is recomputed from its own inputs rather than trusted, and the sitemap's count is asserted against
   the routes rather than written into a sentence. An assertion that a collision does **not** happen
   is worth more than a sentence saying it does not.
4. **The level page for that directory.** A structural limit belongs where the rule it qualifies is
   stated, which is the `AGENTS.md` nearest the code.
5. **A type that refuses to compile.** `Record<Role, string>` and `Record<AgreementState, Look>` are
   the two here: neither compiles until a new member is answered, so the compiler finds the sites and
   no document has to list them.

**No source file in this tree carries a comment**, so a fact about one goes to its level page or into
one of the shapes above, never into the file.

## What this file is not

**It is not a changelog.** A fixed defect is neither wrong, incomplete nor unverified, and a
paragraph explaining how it was fixed is history. The commit log already holds that, and it holds it
better, because it is dated.

**It is not a home for prose that could be a check.** Prose is the cheapest place to put something,
which is exactly why it accumulates: nothing ever fails because a paragraph goes false. An entry can
be wrong for as long as nobody reads it, and having been corrected is no evidence of being correct,
because nothing checks the correction either.

**It is not a substitute for reading.** An entry is a claim, and a claim about a file you have not
read is how any record goes quietly false. "I grepped it" is not sufficient evidence, because a query
answers where a name appears and never what the file around it says.

## If you must file one here

Write what is wrong, what it costs, and the command that re-derives it. **Prefer no exemplar, or a
command.** Both are stale-proof, and a present-tense component name is not. Then ask once more
whether a gate, a spec or the level's own page would hold the same claim, because one of them almost
always will.

## Filed

**Nothing verifies that a page renders.** Every route is prerendered, and `bun run build` fails when
one throws on the server, so a page that cannot render at all is loud. What is not held is a page
that renders and is wrong: a component that mounts nothing, a slot whose projection marker was
written without its directive, or a class no stylesheet defines. The overflow sweep opens the whole
surface and would raise a page that threw on its way there, but it asks only whether anything crosses
the right edge.

What it costs: a marker written without its directive in `imports` renders nothing, in silence, with
every gate green and the suites passing, because a component spec asserts what the component draws
and not what the page around it drew.

Re-derive the surface with `bun run build` and read what it wrote; open it with `bun run serve:static`.

**No gate reads a rendered page's appearance.** The palettes, the brand mark's inversion under
`noche`, and the route map's live and stale states are all checked by a person looking at them.
`bun run audit:arena` reads the source and the tokens, never the paint.

What it costs: a role that resolves to the wrong value, or a colour that carries a meaning it should
not, ships with every gate green. The axis most likely to move unseen is the dark palette, because
the ordinary walk of the app is done in `papel`.

Re-derive with `bun start` and read the page in both palettes.
