# apps/frontend/web: the site

Angular 22 on `@angular/build`, prerendered to static HTML and published to
`touno.dravensoft.org`. It is the surface that carries the public product: the landing, the manual,
the businesses a crawler reads, and every panel a signed-in person works in.

## Where each decision goes

| I am changing                                        | Start at                                                 |
| ---------------------------------------------------- | -------------------------------------------------------- |
| a route, the prerender contract, or Arena's idiom    | [`src/app/AGENTS.md`](./src/app/AGENTS.md)               |
| an order, a recruitment, a fare, a reputation figure | [`src/app/domain/AGENTS.md`](./src/app/domain/AGENTS.md) |
| the rail, the app bar, the gate, the theme           | [`src/app/layout/AGENTS.md`](./src/app/layout/AGENTS.md) |
| a routed page, in any of the six lanes               | [`src/app/pages/AGENTS.md`](./src/app/pages/AGENTS.md)   |
| a component Arena does not ship                      | [`src/app/shared/AGENTS.md`](./src/app/shared/AGENTS.md) |
| a title, a canonical, a JSON-LD node, the sitemap    | [`src/app/seo/AGENTS.md`](./src/app/seo/AGENTS.md)       |
| how anything is allowed to look                      | [`design/AGENTS.md`](./design/AGENTS.md)                 |
| a build-time helper of this app                      | [`tools/AGENTS.md`](./tools/AGENTS.md)                   |

## Commands

```bash
bun run start          # dev server on 0.0.0.0:4200
bun run build          # prerenders every route into dist/touno/browser
bun run test           # the app's suite, plus the specs under tools
bun run lint           # angular-eslint over src and tools
bun run serve:static   # serves the build on :4173
bun run sweep:overflow # the horizontal-overflow walk, against a running serve:static
bun run audit:arena    # arena-to-prod over src and design/touno
```

Each of them runs from the root of the monorepo too, where `bun run build` and `bun run test`
delegate here. The gates, the formatter and the whole-tree sweep belong to the root and are
[`../../../AGENTS.md`](../../../AGENTS.md).

## Where the API is allowed to be

**This app is prerendered and there is no server at runtime**, which decides the whole shape of its
relationship with the backend. `src/app/AGENTS.md` states the contract; this is what it means once
an API exists:

- **Nothing reaches the API during prerender.** What is written to disk at build time comes from
  build-time data alone. A page that needs a live request cannot be a prerendered page.
- **A panel route prerenders to its unauthenticated card**, which is what it already does: the gate
  is a render decision rather than a redirect. Session and data arrive after hydration, in the
  browser, through the generated client.
- **The seam is `src/app/domain/latency.ts`.** `withLatency()` resolves immediately on the server so
  the build cannot hang on a timer, and it is the one place where a fixture-backed service and an
  HTTP-backed service can be swapped behind the same interface. No component learns which one it
  got.

That division is what lets the site keep being built, and read by a crawler, with no backend
running at all.
