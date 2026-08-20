# src/app/domain — the model, the fixtures and the services

Every area follows the same three files: `<area>.model.ts` for the types, `<area>.data.ts` for the
typed module constant, and `<area>.ts` for the `providedIn: 'root'` service that holds it in a
signal and exposes computed slices.

`clock.ts`, `format.ts`, `session.ts`, `cart.ts`, `draft.ts`, `clipboard.ts` and `latency.ts` are
the cross-cutting ones, plus `timeline.ts`, which is pure functions rather than a service because a
timeline is derived from an order and never stored. `clipboard.ts` is the one that touches a
browser API, and it answers a boolean rather than throwing, so the page that called it decides what
the reader is told.

## Rules

- **The data is a module constant read at prerender time.** No HTTP, no `fetch`, nothing that
  depends on a request. A route's fixtures have to exist at build time or its page cannot be
  prerendered.
- **A service holds its data in a signal and returns `readonly` slices.** Mutations rebuild the
  array rather than editing it, so a template that reads a computed sees the change.
- **`withLatency()` resolves immediately on the server.** A promise that settles on a timer never
  settles during prerender, and the build hangs rather than failing.
- **A missing record throws** where a page needs one to render — `pages/public/company` and
  `pages/public/branch` do exactly that, because a bad slug in a prerender list is a bug we want
  loud. A missing record **answers `undefined`** where the reader might legitimately ask for
  something that is not theirs; the page then says which refusal it is.
- **`clock.ts` is the only clock.** `NOW` is a literal and every elapsed, remaining or stale count
  derives from it. A wall clock makes the server and the first client render disagree.
- **A `GeoPoint` is not a coordinate.** It is a position in the map component's `0 0 100 100`
  viewBox. Naming it after geography was a convenience; filling it with real latitudes would imply
  a map we cannot draw and a `geo` node in JSON-LD we cannot honour.

## Facts the fixtures carry, and the tests that hold them

- **Every empresa has at least one sucursal**, and a sucursal slug is unique inside its empresa
  rather than globally, so four import shops can each run a `la-paz`. The public URL carries both
  halves. `businesses.spec.ts`.
- **An importadora only sells into a city where it runs a sucursal.** Every interurban order in the
  fixtures belongs to an empresa that owns both ends, and `orders.spec.ts` proves it rather than
  trusting it. It is the guide's hardest rule and the one most likely to be broken by adding a
  fixture in a hurry.
- **A rider is bound to a sucursal only by an agreement both sides accepted.** `agreements.ts`
  throws three times and the three throws are the rule: you cannot answer your own proposal, one
  addressed to someone else, or one already answered.
- **An expiring agreement does not rewrite history.** A load still filling or still moving, and an
  assignment on the leg being moved _now_, need an agreement active now. A finished leg does not.
  `movingLeg()` in `orders.model.ts` states which leg that is, and `loads.spec.ts` and
  `orders.spec.ts` split on it. This came out of a fixture that failed the naive rule and was
  right to.
- **`carga-en-espera` is the only milestone with no tracking**, and it carries the note. That is
  the honest gap in the product: the parcel is not moving, and the screen says how many orders the
  truck is still short of rather than showing a mute wait. It replaced an older rule that said the
  opposite — that the moving leg was the dark one — and the whole shipping model went with it.
- **Milestones are a reached prefix.** No milestone after an unreached one carries an `at`.
- **A code's slug is its lowercase form.** Route segments are lowercase because a prerendered
  directory on a case-sensitive host is a 404 waiting to happen.
- **One chat thread per order, and its counterpart equals the order's custody.** `handOver()`
  rebinds the counterpart and appends the system line in the same update, so they cannot come
  apart. `chat.spec.ts` and `orders.spec.ts` hold both halves.
- **Exactly one rider track is stale**, so the "Última conexión registrada" branch is reachable
  without editing data to see it.
- **The feed is round-robin over open sucursales, and takes a city.** That is where the guide's
  same-city rule becomes true: in what the buyer is offered, rather than as a check at checkout.
  `catalog.spec.ts` holds it.
- **`BranchStock` is an override list.** A product is on sale unless a sucursal took it off, so
  turning it back on removes the row. Ninety rows of "yes" would be a table that says nothing.

## Fixtures are for walking, not only for consistency

Three times during the rebuild a screen turned out not to be reachable — no counter pickup arriving
at the demo sucursal, no invitation for the demo rider to accept, no application for the demo
empresa to answer. Each was consistent and each made one of the guide's flows undemonstrable.

**When you add a screen, check a fixture reaches it**, and add one when it does not. A model that
is correct and cannot be walked is half a mock-up.
