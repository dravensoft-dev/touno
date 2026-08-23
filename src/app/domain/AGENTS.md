# src/app/domain: the model, the fixtures and the services

Every area follows the same three files: `<area>.model.ts` for the types, `<area>.data.ts` for the
typed module constant, and `<area>.ts` for the `providedIn: 'root'` service that holds it in a
signal and exposes computed slices.

`clock.ts`, `format.ts`, `session.ts`, `cart.ts`, `draft.ts`, `clipboard.ts` and `latency.ts` are
the cross-cutting ones, plus `timeline.ts` and `pricing.ts`, which are pure functions rather than
services because a timeline and a fare are both derived from an order and never stored.
`payments.model.ts` is a model with no data and no service of its own: a card belongs to a rider or
to a business, so it lives beside neither. `clipboard.ts` is the one that touches a
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
- **A missing record throws** where a page needs one to render: `pages/public/company` and
  `pages/public/branch` do exactly that, because a bad slug in a prerender list is a bug we want
  loud. A missing record **answers `undefined`** where the reader might legitimately ask for
  something that is not theirs; the page then says which refusal it is.
- **`clock.ts` is the only clock.** `NOW` is a literal and every elapsed, remaining or stale count
  derives from it. A wall clock makes the server and the first client render disagree.
- **A `GeoPoint` is not a coordinate.** It is a position in the map component's `0 0 100 100`
  viewBox. Naming it after geography was a convenience; filling it with real latitudes would imply
  a map we cannot draw and a `geo` node in JSON-LD we cannot honour.
- **There are two schematic planes and they do not share a scale.** A `Zone.point` and a
  `Branch.point` sit in their city's plane; a `City.point` sits in a national one. `pricing.ts`
  therefore charges them at two separate rates, and the copy says "unidades del plano" and never a
  kilometre.
- **A service that reads a floor reads it with `Math.max`, and a service that writes one throws.**
  `Businesses.setDeliveryFee` and `setWeatherFee` refuse a value under `Platform`'s, and
  `deliveryFeeOf`/`weatherFeeOf` clamp on the way out, so raising the universal floor lifts every
  empresa that had raised less without invalidating a stored row.
- **`Platform` injects nothing and must stay that way.** `Businesses -> Platform`,
  `Agreements -> Platform` and `Orders -> Agreements` are all safe only while it is a leaf.
- **`Reputation` reads and never writes, and nothing it reads may read it back.** It injects
  `Orders`, `Agreements`, `Loads`, `Businesses` and `Platform`; an `Agreements -> Reputation` edge
  would be a cycle. The gate goes the other way through `ReputationGate` on the ask, which is the
  same move `pricing.ts` makes by taking `config` as an argument. `Manual` injects nothing at all.

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
- **A reclutamiento carries runs, `carreras`, and the hora pico rules are throws too.** `propose()` refuses
  under Touno's minimum, a sucursal scoping outside itself, a second hora pico, one from an empresa
  that already recruited this rider that way, and one to a rider who still owes runs. `settle()`
  re-checks the last three on accept, because the rider could have taken a normal recruitment in
  between. `spend()` charges the hora pico first, then the one with fewest runs left, then by id
  and never `Math.random()`.
- **`cumplido` is a real state and it stops binding.** `covers()` filters on `activo`, so the scan
  that spends the last run drops the rider out of `ridersOf()` in the same update. `ag-516` is
  left at one run on purpose, so that transition is walkable and not only asserted.
- **A `TruckLoad` has a `receiptCode` and it is not an order code.** `RC-####` against `TO-####`,
  one per load, and `loads.spec.ts` holds both the uniqueness and the prefix.
- **An expiring agreement does not rewrite history.** A load still filling or still moving, and an
  assignment on the leg being moved _now_, need an agreement active now. A finished leg does not.
  `movingLeg()` in `orders.model.ts` states which leg that is, and `loads.spec.ts` and
  `orders.spec.ts` split on it. This came out of a fixture that failed the naive rule and was
  right to.
- **`carga-en-espera` is the only milestone with no tracking**, and it carries the note. That is
  the honest gap in the product: the parcel is not moving, and the screen says how many orders the
  truck is still short of rather than showing a mute wait. It replaced an older rule that said the
  moving leg carry the note instead: the parcel that is moving is the one with something to say.
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
- **`BranchPrice` is the same shape for the same reason.** A product charges its brand price unless
  its `priceScope` is `sucursal` and that sucursal has a row, and setting the scope back to `marca`
  drops every row. `al-campera` is the one article priced per sucursal.
- **The reputation ledger is closed history, and the present is derived.** `reputation.data.ts` is
  tallies of `subjectId`, `fact` and `count`, because a row per event is a file that says
  nothing, and because a tally adds no prerendered route. Everything live comes from
  `factsOfOrder`, `factsOfAgreement` and `factsOfLoad`, so a scan moves the figure with no write at
  all. `reputation.spec.ts` holds that no ledger row names a live pedido and that each fact appears
  once per subject.
- **A comprador's subject id is his phone**, which is already the key `Orders.ofBuyer()` uses.
- **Nothing in the reputation calculation reads `RiderTrack` or `STALE_AFTER_MINUTES`**, and that is
  a promise `TOUNO_STRUC.md` makes to riders in writing, not an oversight.
- **`r-rene` is under the floor and owes no carreras**, so his hora-pico refusal is `reputacion-baja`
  and not one of the older three; `b-yungas-oruro` is the sucursal under it; `r-elias` has no history
  at all, so the empty figure is walkable. `ag-522` is the abandoned reclutamiento and `ag-523` puts
  a second urban rider on the demo sucursal, so the picker's ordering is visible rather than only
  asserted.
- **The manual is a fixture with a coverage spec.** Every `Role` has a chapter, every chapter has
  both a Tutorial and a Reputación section, and the Reputación section names `ReputationFact` members
  rather than repeating their wording, so renaming a fact renames the manual.
- **An order stores its fare and `orders.spec.ts` recomputes it.** The four amounts are
  denormalised, so the spec rebuilds each one from the order's own branch, zone, city and weather
  and compares. Editing an amount by hand without its inputs fails loudly.

## Fixtures are for walking, not only for consistency

A set of fixtures can be perfectly consistent and still leave a screen unreachable: no counter
pickup arriving at the demo sucursal, no invitation for the demo rider to accept, no application for
the demo empresa to answer. Each of those is a flow the product promises and nobody can demonstrate.

**When you add a screen, check a fixture reaches it**, and add one when it does not. A model that is
correct and cannot be walked is half a mock-up.
