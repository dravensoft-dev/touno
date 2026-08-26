# tools: the build-time helpers of the web app

Bun TypeScript entry points that belong to this app and to no other. They import the app's own
fixtures so nothing is stated twice, which is also why they live here rather than at the root of the
monorepo: a helper that reads `src/app/domain` cannot be shared with a surface that has no `src`.

**Everything under `tools` is type-checked, linted and tested the way `src` is.**
`tsconfig.spec.json` includes `tools/**/*.ts`, `angular.json` adds `../tools/**/*.spec.ts` to the
unit-test `include` and `tools/**/*.ts` to `lintFilePatterns`. The include glob is written with `../`
because the builder globs from `sourceRoot`, which is `src`, and not from the project root its own
schema names.

| Entry point           | Emits                         | Why it exists                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate-sitemap.ts` | `public/sitemap.xml`          | Written from `MANUAL` plus the landing and `/riders`, which are the routes that say `index,follow`. Runs inside `prepare:assets`. **What it writes must equal the set of prerendered pages carrying `index,follow`**, and a mismatch means either an indexed route arrived without a sitemap entry or a route lost the marker holding it out. `generate-sitemap.spec.ts` derives that set from the router itself and holds the two equal |
| `emit-404.ts`         | `dist/touno/browser/404.html` | A static host serves the not-found page from the root, and Angular prerenders it to `404/index.html`. Runs in `postbuild`, and **exits 1 when the route was not prerendered**, because a silent success there ships a mock-up whose 404 is a blank page                                                                                                                                                                                  |
| `overflow-sweep.ts`   | nothing                       | The horizontal-overflow walk, which nothing else in the tree performs. It is the one entry point with modules of its own and the one that drives a browser: [`overflow-sweep/AGENTS.md`](./overflow-sweep/AGENTS.md)                                                                                                                                                                                                                     |

**The gates are not here.** They read the whole monorepo rather than this app, so they live at
[`../../../../tools/AGENTS.md`](../../../../tools/AGENTS.md) and run from the root.

## Rules for anything under here

- **No script writes a source file.** They write into `public/` and into `dist/`, and nowhere else.
- **A script that finds nothing to do exits 1.** A walk that iterated zero files reports zero
  problems and is indistinguishable from a clean run.
- **A script that carries a spec exports its logic and guards its write.** The work goes in exported
  functions, and the entry point runs only when `process.argv[1]` names that file. A script whose
  write happens at import time cannot be covered, because importing it does the thing.
- **A script states its reason in this table or in a reason string**, never in a comment. The comment
  ban is absolute, and what holds it is a gate at the root of the monorepo rather than a command this
  app declares: [`../../../../tools/check/AGENTS.md`](../../../../tools/check/AGENTS.md).
