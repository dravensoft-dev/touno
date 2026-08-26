# tools: what reads the whole monorepo

One directory, and the rule that puts something in it: **a tool here answers a question about the
tree rather than about an app.** A helper that imports an app's own source belongs beside that app,
which is why the sitemap writer, the 404 lifter and the overflow sweep live in
[`../apps/frontend/web/tools/AGENTS.md`](../apps/frontend/web/tools/AGENTS.md) and the gates live
here.

| Directory | What it holds                                                                    |
| --------- | -------------------------------------------------------------------------------- |
| `check/`  | the four gates that `bun run check` runs: [`check/AGENTS.md`](./check/AGENTS.md) |

## Why the root runs its own suite

Everything under `tools` is tested by `vitest.config.ts` at the root rather than by the Angular
builder, which tests one project and cannot be asked about a directory outside it. The specs import
from `vitest` exactly as the app's do, so **the tree still has one test framework and two entry
points into it**, and `bun run test` runs both in order.

`eslint.config.js` at the root lints `tools/**/*.ts` for the same reason, and `tsconfig.json` at the
root type-checks them. A tool here is held to what `src` is held to; nothing about being
infrastructure lowers the bar.

## What a tool here may reach

- **A tool reads the tree and writes nothing into it.** The gates report and exit non-zero; the rule
  that no script writes a source file is the same one every app-side helper answers to.
- **A tool resolves paths from the repository root**, which is `process.cwd()` when a root script
  runs it. Running one from inside an app gives it a tree that starts in the wrong place, and
  `zeroProblems` is what turns that into a failure rather than a clean sweep.
