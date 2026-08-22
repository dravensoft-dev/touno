# scripts — the build-time helpers

Four Bun TypeScript entry points. They import the app's own fixtures so nothing is stated twice.
Three of them are dependency-free, using only `node:fs` and `node:path`, and run inside the build.
`overflow-sweep.ts` is the exception on both counts: it drives a real browser, so it needs
`playwright-core` and a Chrome on the machine, and nothing runs it for you. It is also the only one
with modules of its own, under `overflow-sweep/`, and the only one under test.

**Everything under `scripts` is type-checked, linted and tested like `src` is.**
`tsconfig.spec.json` includes `scripts/**/*.ts`, `angular.json` adds `../scripts/**/*.spec.ts` to
the unit-test `include` and `scripts/**/*.ts` to `lintFilePatterns`. The include glob is written
with `../` because the builder globs from `sourceRoot`, which is `src`, and not from the workspace
root its own schema names.

- `generate-sitemap.ts` — writes `public/sitemap.xml` from `COMPANIES` and `BRANCHES`, plus the four
  static public routes. Runs in `prepare:assets`. **The count it prints must equal the number of
  prerendered pages carrying `index,follow`**; they are 30 and 30 today, and a mismatch means either
  a public route was added without a sitemap entry or a panel route lost its `PRIVATE` marker.
- `emit-404.ts` — copies the prerendered `404/index.html` up to `404.html`, because a static host
  serves the not-found page from the root. Exits 1 if the route was not prerendered.
- `overflow-sweep.ts` — the horizontal-overflow check the root checklist asks for by hand, which
  nothing else in the tree performs. `bun run serve:static` first, then `bun run sweep:overflow`;
  `overflow-sweep/plan.ts` names what it walks: the public surface the sitemap indexes, then each
  of the eight profiles with its rail and its detail routes, then two short walks with a **filled
  cart**, at 320, 360, 390, 768, 1024 and 1440. **`detailsOf()` names every role it serves and
  answers `[]` for the rest.** It used to fall through to `branchRoutes()`, so a profile of a new
  role would have been planned a sucursal's routes and measured the gate over and over.
  It fails when
  `documentElement.scrollWidth` exceeds `clientWidth` and names the elements crossing the right
  edge, ignoring any that sit inside a container declaring `overflow-x`, which is the carve-out the
  rule itself makes. `SWEEP_BASE` points it at another origin and `CHROME` at another browser.
- `pages-preview.ts` — the GitHub Pages step. Sets every `robots` meta to `noindex,nofollow`,
  replaces `robots.txt` with `Disallow: /`, deletes the sitemap, and rebases three kinds of URL
  that `--base-href` cannot reach:
  - `url()` inside the built stylesheet, because CSS resolves it against the sheet and not `<base>`;
  - `url()` inside the **critical CSS Angular inlines into every prerendered page**, which is a
    second copy of the same `@font-face` rules and the reason fonts still 404ed after the sheet
    was fixed;
  - the `href` of every `<link rel="preload">`, because the browser's preload scanner fetches
    before `<base>` is applied.

## Rules

- **The sweep waits for a condition, never for a clock.** `overflow-sweep/probe.ts` exports
  `pageProbe`, which polls `requestAnimationFrame` until the layout signature holds still for
  `STILL_FRAMES` frames. The fixed `waitForTimeout(260)` and `waitForTimeout(140)` it replaced were
  4-5x longer than the page actually needs — measured at 54ms after a route change and 38ms after a
  viewport change — and they were 85% of a 348-second run.
- **Everything the sweep runs inside the browser is one function, and it is under test.** Waiting,
  the page signature and the overflow measurement are all commands of `pageProbe`, so there is one
  thing to serialize and one thing to test. jsdom cannot lay anything out, so `measure.spec.ts`
  stubs `getBoundingClientRect` and the two width properties of `documentElement`: what is under
  test is the walk, the `overflow-x` carve-out and the sentence it writes, not the browser's
  layout. The measurement had never once fired in anger, because every run of the sweep is green.
- **`pageProbe` is serialized into the page by `toString()`, so it must be self-contained.** It may
  not call another module's function, read a module constant or close over anything. That is why it
  is one function switching on a command rather than one export per job, and why its helpers are
  declared inside it. A helper lifted out to the module scope compiles fine and throws
  `ReferenceError` in the browser.
- **A navigation waits for the page it arrived at, not for the page it left.** A route change does
  not blank the DOM: the router keeps the previous component on screen while it fetches the new
  chunk, so a plain stability poll settles on the _previous_ route and measures the wrong page.
  `pageProbe`'s `navigate` command captures the signature before `pushState` and refuses to settle
  until it differs. When two routes genuinely draw the same DOM it waits out `SETTLE_MS` and the
  run reports how many times that happened.
- **The sweep navigates without reloading, and it must.** The profile lives in a signal and not in
  `localStorage`, so a reload signs you out and a panel route entered by URL renders the gate
  instead of the page. It clicks a profile on `/ingresar` and then moves with `history.pushState`
  plus a `popstate` event, which the router listens to and the session survives.
- **A detail route is planned for the records the reader can actually open, plus one he cannot.**
  Every panel page reached by id refuses a record belonging to someone else, and every refusal
  draws the same markup, so walking all fifteen pedidos as a rider who carries two measured one
  page and thirteen copies of a refusal. `open()` in `plan.ts` takes the records, the path and the
  ownership test, and returns every record the reader owns plus the first he does not, which is
  the one visit that proves the refusal state still lays out. Adding a detail route means adding
  one `Records` source, not another branch in a chain of `if`s.
- **A planned path is checked against `app.routes`.** `plan.spec.ts` refuses any path the router
  cannot match, which is how `/empresa/carta/:id` was found: the empresa's catalogue is
  `/empresa/catalogo/:id` whatever the vertical, and only the sucursal splits `carta` from
  `catalogo`. Five product pages had been measuring the 404. The empresa's rider page resolves by
  **slug**, not by id, and had been measuring the not-found state for all ten riders.
- **A walk may fill the cart before it starts, and two of them do.** The cart action only exists
  while `cart.count() > 0`, so every walk before this one measured a bar the reader never sees
  once he has bought anything — and because `arena-app-bar`'s band wraps rather than overflows, the
  two-row bar it produced was invisible to a measurement that only asks whether anything crosses
  the right edge. `PlannedProfile.fill` names a path and a button; `walk()` navigates there after
  the sign-in click, clicks it and settles. `anon-carrito` is the narrow bar with no session,
  `p-comprador-carrito` the wide bar with a cart and a name beside it, which is the tightest the
  bar ever gets. `stocked()` picks a sucursal that is **open**, because a closed one draws its
  Agregar disabled and the click would time out. The cart is a signal and the sweep never reloads,
  so it survives every later `pushState`. `SeenPages` needs no carve-out: a filled cart draws a
  different bar, so the signature differs from the same route's empty-cart visit.
- **The ten walks run four at a time and share one cache.** `pool.ts` keeps the worker count,
  `SWEEP_WORKERS` moves it. `SeenPages` is shared on purpose: a refusal page is the same page
  whoever was refused, so a twin found by one worker spares another the six widths. Which walk
  gets credited for a page depends on who arrived first, and nothing but the diagnostic line reads
  that. Every summary is collected and printed after the pool drains, because ten walks writing
  findings as they go is unreadable.
- **The ceiling is the size of a chunk fetch, and only the first visit to a pattern pays one.**
  `COLD_MS` covers a route whose component has not been downloaded in this context, measured at
  267ms for the landing page and slower under four parallel contexts, which is why it is 2500 and
  not the 600 it started at: at 600 the landing page was being measured before it had finished
  drawing. `WARM_MS` covers a pattern already visited, where the router reuses the component and
  only the parameter changed, so nothing is fetched and 400ms is generous. The four escanear
  twins pay the warm ceiling because there is genuinely nothing to see.
- **Navigation always happens at the widest viewport.** The widths are walked ascending and the
  loop ends on the widest, so nothing has to reset it. The page signature carries `scrollWidth`,
  so a route navigated at some other width would key the cache differently and never match its
  twin.
- **The sweep cannot find pages by following links.** Table rows navigate through
  `[interactive]` and `(activate)`, not through an `href`, so a link crawler reports every list
  page clean without ever opening a detail page — which is where the route map and the chat
  thread live. It builds those routes from the fixtures instead.
- **No script writes a source file.** They write into `public/` and into `dist/`, and nowhere else.
- **A script that finds nothing to do exits 1.** `emit-404.ts` is the example: a silent success
  there would ship a mock-up whose 404 is a blank page.
- `pages-preview.ts` deliberately does **not** strip canonical, `og:*` or JSON-LD. Removing nodes
  from prerendered HTML throws NG0500 on hydration, and a sleeping `robots` meta is enough.
