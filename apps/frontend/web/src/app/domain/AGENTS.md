# src/app/domain: the model, the fixtures and the services

Every area follows the same three files: `<area>.model.ts` for the types, `<area>.data.ts` for the
typed module constant, and `<area>.ts` for the `providedIn: 'root'` service that holds it in a
signal and exposes computed slices.

`clock.ts`, `format.ts`, `session.ts`, `cart.ts`, `draft.ts`, `clipboard.ts` and `latency.ts` are
the cross-cutting ones, plus `timeline.ts` and `pricing.ts`, which are pure functions rather than
services because a timeline and a fare are both derived from an order and never stored.
`promotions.*` is an ordinary three-file area whose fixtures are read from two sides: a buyer types
a code at checkout and an empresa manages the list from its panel. `payments.model.ts` is a model
with no data and no service of its own: a card belongs to a rider or to a business, so it lives
beside neither. `staffing.ts` is the opposite shape, a service with no
model and no data: it answers who a sucursal may put work on, by reading `Agreements` and
`Callouts` together, because after free agency that question has two answers and only one caller
should have to know it. `clipboard.ts` is the one that touches a
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
- **A rider has no stored position, and that is deliberate.** `Rider.zones` names the zones he
  works, `Geography.zoneOf(cityId, name)` resolves the first of them to a point, and that point is
  what the free agent map draws him at. Storing one on `Rider` would be a second source of truth
  against `RiderTrack`, which is per order in flight and answers nothing for a rider carrying
  nothing.
- **A `GeoPoint` is not a coordinate.** It is a position in the map component's `0 0 100 100`
  viewBox. Naming it after geography was a convenience; filling it with real latitudes would imply
  a map we cannot draw and a `geo` node in JSON-LD we cannot honour.
- **There are two schematic planes and they do not share a scale.** A `Zone.point` and a
  `Branch.point` sit in their city's plane; a `City.point` sits in a national one. `pricing.ts`
  therefore charges them at two separate rates, and the copy says "unidades del plano" and never a
  kilometre.
- **A work mode is not a recruitment kind, and `RecruitmentKind` is derived from it.**
  `WorkMode` names the three ways a rider works and `RecruitmentKind` is `Exclude<WorkMode,
'agente-libre'>`, so the two lists cannot drift apart. A free agent is bound to nobody by
  agreement, which is why he is a mode and not a third kind.
- **A carrera is paid in three terms, and the mode decides only the first.**
  `pricing.ts:riderPayOf()` mirrors `fareOf()`: a fixed component floored per mode, a distance at
  the plane's own rate, and the bad-weather extra. **`riderRatesOf()` is the only place a rate is
  resolved**, and it takes the best of what Touno, the empresa and the sucursal offer, because a
  raise is the only edit any of them may make. A `RiderPayInput` carries the resolved rates rather
  than the config, so there is no second path that could quietly read the floor instead.
- **The order of the three fixed minimums is a rule with a throw behind it.**
  `platform.model.ts:orderedBases()` states it and `Platform.patch()` refuses a write that breaks
  it, so `agente-libre < normal < hora-pico` cannot become a convention that drifted.
- **A service that reads a floor reads it with `Math.max`, and a service that writes one throws.**
  `Businesses.setDeliveryFee` and `setWeatherFee` refuse a value under `Platform`'s, and
  `deliveryFeeOf`/`weatherFeeOf` clamp on the way out, so raising the universal floor lifts every
  empresa that had raised less without invalidating a stored row.
- **A promotion is subtracted, never a floor lowered.** `Businesses.setDeliveryFee()` throws under
  Touno's minimum, so free delivery cannot be expressed by lowering a fee. `pricing.ts:discountOf()`
  is a fifth term of the fare instead, and `Fare.discountBob` is what a page reads.
- **The commission is charged on the undiscounted products, and that is a monetization decision
  rather than an oversight.** The empresa funds every promotion in full, so Touno's revenue has to
  be invariant under one. `promotions.spec.ts` asserts it against every fixture rather than a
  sentence asserting it here.
- **No promotion may reach what a rider is paid.** It is already true by construction, because
  `pricing.ts:riderRatesOf()` resolves with `raised()` and only ever raises, and
  `promotions.spec.ts` holds it as a claim so it stays true. A `RiderLeg` is the one thing an
  empresa may offer instead, and `pricing.ts:legUnderFloor()` is what refuses one below the mode's
  minimum.
- **A promotion carries a buyer's discount, a rider's leg, or both, and never neither.**
  `promotions.model.ts:BuyerDiscount` is the half a comprador meets and `promotions.model.ts:RiderLeg`
  is the half a rider is offered, and both are optional on the record while the pair is not.
  `promotions.ts:create()` refuses a draft with neither, and `promotions.spec.ts` asserts over the
  fixtures both that none is empty and that all three shapes exist, because a shape no fixture
  carries is a screen nobody walks. **The audience is read off the record and never stored beside
  it**, which is the same move the reputation gate makes below: a field naming what the two other
  fields already say is a field that can disagree with them.
- **A promotion's reputation gate is read at the question, like every other floor here.**
  `promotions.model.ts:promotionRefusal()` takes the buyer's percentage as an argument, which is the
  same move `fareOf()` makes with `config`, so `Promotions` never injects `Reputation` and the
  buyer's figure is never written onto a record. `Cart` is what resolves it and passes it down.
- **A plan is a `Record<CompanyPlan, PlanLimits>` and not a set of scattered conditionals.**
  `businesses.model.ts:PLAN_LIMITS` refuses to compile until a new tier answers every limit, so no
  document has to enumerate them. Every tier charges the same commission, and the argument for that
  is in [`TOUNO_DINERO.md`](../../../../../../TOUNO_DINERO.md).
- **`Platform` injects nothing and must stay that way.** `Businesses -> Platform`,
  `Agreements -> Platform` and `Orders -> Agreements` are all safe only while it is a leaf.
- **`Reputation` reads and never writes, and nothing it reads may read it back.** It injects
  `Orders`, `Agreements`, `Loads`, `Callouts`, `Businesses` and `Platform`; an
  `Agreements -> Reputation` edge would be a cycle. **`Callouts` injects only `Platform`** for the
  same reason: `Reputation` and `Staffing` both read it. The gate goes the other way through `ReputationGate` on the ask, which is the
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
  under Touno's minimum, a fija under the floor of its own class, a second hora pico, one from an
  empresa that already recruited this rider that way, and one to a rider who still owes runs.
  **The scope check is not one of the hora pico rules**: `scopeRefusal()` runs for every class, so
  a sucursal recruiting beyond itself is refused in normal as well, and calling `peakRefusal()` for
  a normal proposal would wrongly refuse a rider who simply holds a peak elsewhere. `settle()`
  re-checks the last three on accept, because the rider could have taken a normal recruitment in
  between. `spend()` charges the hora pico first, then the one with fewest runs left, then by id
  and never `Math.random()`.
- **A llamado de agentes libres is a sucursal's alone, and its cupos are the whole of its
  bookkeeping.** `Callouts.publish()` throws on an opener that is not the sucursal itself, on no
  cupos, and on a fija under Touno's free agent floor. `claim()` throws on a rider who is not free,
  on one already holding a cupo, and on a llamado with none left. **`claim()` never reads
  reputation, and the absence is the rule**: the floor closes hora pico and closes recruiting, and
  leaves free agency open, because it is the only way back for a rider under it.
  `callouts.spec.ts` asserts that `r-rene`, who is under the floor, may take one.
- **A rider is staffed by an agreement or by a cupo, and `Staffing` is the only place that knows
  it.** `staffing.ts:ridersOf()` is what `rider-picker` reads, and `Orders.assign()` refuses a
  rider `Staffing.bondOf()` answers nothing for, so a sucursal cannot put work on someone bound to
  it by neither.
- **An assignment records the mode it was handed under, and never derives it afterwards.**
  `Assignment.mode` and `TruckLoad.mode` are written at the moment the work is given, so a
  recruitment that later goes `cumplido` cannot move an old delivery from one compliance figure to
  another.
- **A rider's compliance is four figures and the total is not their average.**
  `reputation.model.ts:modeStandingOf()` splits by mode and `mergeStandings()` builds the total out
  of kept and total counts, so a mode with four carreras cannot weigh the same as one with four
  hundred. Every rider fact carries a mode, and `reputation.spec.ts` holds that the three add up to
  the total for every rider. **Retiring from a llamado writes no fact at all**, and that absence is
  the promise: `factsOfClaim()` counts only the cupo taken and never reached.
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

- **Every promotion refusal is reachable from a fixture, and a spec asserts the set is complete.**
  `promotions.spec.ts` collects the refusals the fixtures can produce and compares them against the
  keys of `promotions.model.ts:PROMOTION_REASONS`, so adding a reason nobody can reach fails. A
  promotion that only pays a rider answers a comprador with its own refusal rather than with
  silence, and `promotions.ts:spend()` refuses to count a use for one, because that ceiling counts
  carreras and a checkout is not one.
- **A settlement is the empresa's own money and the commission is not deducted from it.**
  `Settlement.grossBob` is what buyers paid in products and belongs to the empresa,
  `commissionBob` is what Touno charged the buyer on top and is reported rather than subtracted, and
  `netBob` is `grossBob` less `promotionsBob`. Reading it the other way contradicts `fareOf()`,
  which charges the commission to the buyer above the price.

## Fixtures are for walking, not only for consistency

A set of fixtures can be perfectly consistent and still leave a screen unreachable: no counter
pickup arriving at the demo sucursal, no invitation for the demo rider to accept, no application for
the demo empresa to answer. Each of those is a flow the product promises and nobody can demonstrate.

**When you add a screen, check a fixture reaches it**, and add one when it does not. A model that is
correct and cannot be walked is half a mock-up.
