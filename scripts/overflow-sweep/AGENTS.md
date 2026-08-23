# scripts/overflow-sweep: what the horizontal-overflow walk is made of

`../overflow-sweep.ts` is the entry point and these are its modules. It drives a real browser, so it
needs `playwright-core` and a Chrome on the machine, and nothing in the build runs it for you:
`bun run serve:static`, then `bun run sweep:overflow`. `SWEEP_BASE` points it at another origin,
`CHROME` at another browser and `SWEEP_WORKERS` changes how many walks run at once.

| Module     | Why it exists                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plan.ts`  | what gets walked: the whole public surface, built from the fixtures rather than from the sitemap, then every profile with its rail and its detail routes, then the walks that fill a cart first. `open()` takes the records, the path and the ownership test, so adding a detail route means adding one records source rather than another branch in a chain of `if`s |
| `probe.ts` | everything that runs **inside** the page: the wait, the layout signature and the measurement, as commands of one function                                                                                                                                                                                                                                             |
| `pool.ts`  | runs the walks concurrently against one shared cache                                                                                                                                                                                                                                                                                                                  |
| `seen.ts`  | the cache: a page already measured at every width is not measured again                                                                                                                                                                                                                                                                                               |

Every `X.spec.ts` beside a module covers that module.

## The rules that decide whether a run means anything

- **The wait is a condition, never a clock.** `probe.ts:pageProbe()` polls `requestAnimationFrame`
  until the layout signature holds still for `STILL_FRAMES` frames. A fixed timeout is a statement
  about the machine that measured it: right where it was written and silently wrong everywhere else,
  and it was most of the wall clock of a run.
- **`pageProbe` is serialized into the page by `toString()`, so it must be self-contained.** It may
  not call another module's function, read a module constant or close over anything. That is why it
  is one function switching on a command rather than one export per job, and why its helpers are
  declared inside it. A helper lifted out to the module scope compiles fine and throws
  `ReferenceError` in the browser.
- **Everything that runs in the browser is one function and it is under test.** jsdom cannot lay
  anything out, so `measure.spec.ts` stubs `getBoundingClientRect` and the two width properties of
  `documentElement`: what is under test is the walk, the `overflow-x` carve-out and the sentence it
  writes, not the browser's layout. **Every real run of the sweep is green**, so the measurement
  itself would otherwise never have fired in anger.
- **A navigation waits for the page it arrived at, not for the page it left.** A route change does
  not blank the DOM: the router keeps the previous component on screen while it fetches the new
  chunk, so a plain stability poll settles on the previous route and measures the wrong page. The
  `navigate` command captures the signature before `pushState` and refuses to settle until it
  differs. Where two routes genuinely draw the same DOM it waits out `SETTLE_MS`, and the run reports
  how often that happened.
- **The sweep navigates without reloading, and it must.** The profile lives in a signal rather than
  in `localStorage`, so a reload signs you out and a panel route entered by URL renders the gate
  instead of the page. It clicks a profile on `/ingresar`, then moves with `history.pushState` plus a
  `popstate` event, which the router listens to and the session survives.
- **The sweep cannot find pages by following links.** A table row navigates through `[interactive]`
  and `(activate)` rather than through an `href`, so a link crawler reports every list page clean
  without ever opening a detail page, which is where the route map and the chat thread live. It
  builds those routes from the fixtures instead.
- **A detail route is planned for the records the reader can open, plus one he cannot.** Every panel
  page reached by id refuses a record belonging to someone else, and every refusal draws the same
  markup, so walking every pedido as a rider who carries two measures one page and a pile of copies
  of a refusal. `open()` returns every record the reader owns plus the first he does not, which is
  the one visit that proves the refusal state still lays out.
- **A planned path is checked against `app.routes`.** `plan.spec.ts` refuses any path the router
  cannot match. Without it a walk measures the 404 and reports it clean, which is the quietest way
  this tool can lie.
- **`plan.ts:detailsOf(role)` names every role it serves and answers `[]` otherwise.** A fall-through
  plans an unknown role somebody else's detail routes and measures the gate over and over.
- **A walk may fill the cart before it starts, and some do.** The cart action only exists while
  `cart.count() > 0`, so a walk that never buys anything measures a bar the reader stops seeing the
  moment he does. Because `arena-app-bar`'s band wraps rather than overflows, the two-row bar that
  produces is invisible to a measurement that only asks whether anything crosses the right edge.
  `PlannedProfile.fill` names a path and a button; `stocked()` picks a sucursal that is **open**,
  because a closed one draws its Agregar disabled and the click times out. The cart is a signal and
  the sweep never reloads, so it survives every later `pushState`.
- **The cache needs no carve-out for a filled cart**, because a filled cart draws a different bar and
  the signature differs from the same route's empty-cart visit.
- **The walks share one cache on purpose.** A refusal page is the same page whoever was refused, so a
  twin found by one worker spares another every width. Which walk is credited depends on who arrived
  first, and nothing but the diagnostic line reads that. Summaries are collected and printed after
  the pool drains, because concurrent walks writing findings as they go are unreadable.
- **Navigation always happens at the widest viewport.** The widths are walked ascending and the loop
  ends on the widest, so nothing has to reset it. The page signature carries `scrollWidth`, so a
  route navigated at another width keys the cache differently and never matches its twin.
- **The ceiling is the size of a chunk fetch, and only the first visit to a pattern pays one.**
  `COLD_MS` covers a route whose component has not been downloaded in this context, and it is
  generous because a landing page measured before it has finished drawing reports a layout nobody
  ships. `WARM_MS` covers a pattern already visited, where the router reuses the component and only
  the parameter changed, so nothing is fetched.

## What it fails on

`documentElement.scrollWidth` exceeding `clientWidth`, and it names the elements crossing the right
edge, ignoring any inside a container that declares `overflow-x`, which is the carve-out the rule
itself makes. **A wrapped bar is not an overflow** and this tool cannot see one; the root page's
verification list says to look at the bar's height by hand for that reason.
