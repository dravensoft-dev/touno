# src/app: the routes, the prerender contract, and Arena's idiom

The files at this level are the application's frame: `app.ts` and `app.html` are the shell,
`app.routes.ts` is what exists, `app.routes.server.ts` is what gets written to disk, and
`app.config.ts` and `app.config.server.ts` are what is provided on each side.

**The shell itself is documented next door.** `app.ts` holds the rail, the gate, the bar and the
session, and every rule about them is [`layout/AGENTS.md`](./layout/AGENTS.md). This page owns the
three things that bind every component underneath it: what prerendering forbids, how a route is
declared, and where Arena's Angular layer takes something other than what you would write.

## The prerender contract

`outputMode: "static"`. Every route is written to disk at build time and no server runs afterwards,
so **the server render and the first client render must produce the same HTML**. Where they differ,
Angular throws NG0500 and the page dies in the browser after loading correctly.

- **Nothing may read a request, a header, a cookie or a runtime environment variable.** There is
  nothing to read them from.
- **Nothing reads the wall clock.** `domain/clock.ts` exports a literal `NOW` and every elapsed
  count derives from it. `Date.now()` writes one time on the server and another in the browser.
- **Nothing draws from `Math.random()`.** `shared/order-code` seeds its modules from the order code
  itself, so the same order draws the same square on both sides.
- **The session is deliberately not persisted**, so a reload finds no profile and the two renders
  agree. The theme is persisted and may be, because its class sits on `<html>`, which hydration
  never claims.
- **A width decision is a media query, never `arenaViewportBelow`.** `--bp-*` does not resolve
  during prerender, so the signal returns the wide branch server-side and a phone is served the
  desktop layout until hydration. Both branches of a swap stay in the markup and CSS alone decides.
- **A guard returning a `UrlTree` during hydration is NG0500.** The panel gate is a render decision,
  `@if (unlocked())`, rather than a redirect.
- **A required input may not be read in a destroy hook.** Angular clears an input's value before the
  view's destroy hooks run, so `input.required` throws **NG0950 inside `destroyLView`**, and a throw
  there aborts the teardown, so the router outlet never rebuilds and `<main>` disappears from the
  page. Hold the thing you will need to clean up in a field, not behind an input.
  `seo/structured-data.ts` is the component that has to, and `seo/AGENTS.md` carries the case.
- **A service whose constructor reaches a browser global cannot be injected at construction.**
  Resolve it inside `afterNextRender`. `layout/theme-toggle` and `layout/scroll-away.ts` both do.
- **A promise that settles on a timer never settles during prerender**, and the build hangs rather
  than failing. `domain/latency.ts:withLatency()` resolves immediately on the server.

## A route is declared in three places

`app.routes.ts` declares the path, lazy-loads the component and carries `arenaRouteMeta`. **The
application-wide default is `index,follow`**, set in `app.config.ts`, so a route is indexed unless it
says otherwise: `PRIVATE` and `INVENTED` both carry `noindex,follow`, and which routes take which,
and why the two are not one constant, is [`seo/AGENTS.md`](./seo/AGENTS.md). A new public route
inherits indexing and has to be checked.

`app.routes.server.ts` decides what reaches disk. **A dynamic route needs an entry with
`getPrerenderParams`, or it does not exist in the output**, however well it renders in dev.

`app.routes.spec.ts` holds every dynamic route to the parameter names it declares and refuses one
the static output would not prerender. **A parameter is named for what it holds**: `:slug` where the
lookup is by slug and `:id` where it is by id. A parameter that lies costs nothing at build time and
sends every reader of that route to the not-found state.

What each route is for is [`pages/AGENTS.md`](./pages/AGENTS.md); which schema it carries is
[`seo/AGENTS.md`](./seo/AGENTS.md).

## Arena's Angular layer, where its idiom differs from what you would write

Most of these compile. A marker written without its directive in `imports`, an input under the wrong
name and a slot spelled in the singular all render nothing at all, in silence, which is why the list
is worth reading before the debugging rather than after it.

| What you would write                                 | What Arena takes                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<arena-table-row>`, `<arena-table-cell>`            | attribute selectors on real elements: `<tr arena-table-row>`, `<td arena-table-cell>`. The element form compiles to "not a known element" **and** "the directive is unused" at the same time                                                                                                                                                                          |
| `<arena-page-head eyebrow lede>`                     | `title` and `subtitle`. Neither wrong name exists, and written as plain attributes they render and do nothing; only binding one raises an error. When a page head looks bare, check the names                                                                                                                                                                         |
| `[actions]` on `arena-card`                          | `action`, singular. `ArenaPageHead`'s is `actions`, plural, which is the whole of the difference                                                                                                                                                                                                                                                                      |
| `icon` on `arena-card`                               | there is none. It takes `title`, `eyebrow`, `href`, `interactive` and `headingLevel`                                                                                                                                                                                                                                                                                  |
| `(activate)` on `arena-card`                         | it reports `click`. `ArenaTableRow` is the one that reports `activate`                                                                                                                                                                                                                                                                                                |
| `(requestChange)="set($event)"` on `arena-switch`    | it reports with no payload. The host owns the state and the handler flips the value it already holds; binding `$event` is a type error                                                                                                                                                                                                                                |
| `(valueChange)` on `arena-input` or `arena-textarea` | they report `change`, carrying the string                                                                                                                                                                                                                                                                                                                             |
| `label` on `arena-button`                            | there is none. Put the text in the content                                                                                                                                                                                                                                                                                                                            |
| `[value]` and `[max]` on `arena-progress-bar`        | `progressPercentage`                                                                                                                                                                                                                                                                                                                                                  |
| `id` on an `arena-tab`                               | `value`. `arena-tabs` takes `value` and reports `change`                                                                                                                                                                                                                                                                                                              |
| a `BreadcrumbList` you write                         | `arena-breadcrumbs` takes `items`, reports `navigate`, and emits the JSON-LD itself                                                                                                                                                                                                                                                                                   |
| a filled danger button                               | `danger` is a button **variant**, which is how Arena enforces that danger is never filled                                                                                                                                                                                                                                                                             |
| an id on an `arena-menu-item`                        | it carries none, so a menu is dispatched on `label`. `select` reports the whole item, so the labels are module constants shared by the items array and the handler. Never inline a label string in one of the two                                                                                                                                                     |
| `<arena-side-nav-section>`                           | it cannot be prerendered. Its `ngAfterContentInit` guard spreads `host.nativeElement.children`, and the DOM `@angular/platform-server` ships returns a collection with no `Symbol.iterator`, so every panel route dies with "children is not iterable" and `bun run build` writes nothing. Group a rail by ordering `layout/panel-nav.ts`, never by drawing a section |
| an `arena-section` whose title is sometimes `''`     | it refuses an empty title at runtime and throws rather than degrading, so a computed title that is empty for some states takes down the page for exactly those records. Put the varying string in `description`                                                                                                                                                       |
| an `@else` block with two root nodes filling a slot  | a projection slot takes one root node. Wrap the block's content in a container of your own                                                                                                                                                                                                                                                                            |
| an `output` named `copy`                             | an output may not be named after a DOM event; `angular-eslint` refuses it                                                                                                                                                                                                                                                                                             |

**A row's overflow menu lives inside an `interactive` row, and that is legal.** Arena's own rule is
that a press starting on a control inside an activation target runs that control. What the menu costs
is a column: an actions column takes `align: 'right'` and `mobileLayout: 'block'`.

**`mono: true` on an `ArenaTableColumn` is for identifiers only.** It carries the mono face **and**
the identifier ink, so a money column set that way reads as a code. Money and time columns take
`align: 'right'` and a `<span class="arena-num">` in the cell. Which figures take the mono face at
all is [`design/AGENTS.md`](../../design/AGENTS.md).
