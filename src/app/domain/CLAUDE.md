# src/app/domain — the model, the fixtures and the services

Every area follows the same three files: `<area>.model.ts` for the types, `<area>.data.ts` for the
typed module constant, and `<area>.ts` for the `providedIn: 'root'` service that holds it in a
signal and exposes computed slices.

`format.ts`, `session.ts`, `cart.ts`, `draft.ts` and `latency.ts` are the cross-cutting ones.

## Rules

- **The data is a module constant read at prerender time.** No HTTP, no `fetch`, nothing that
  depends on a request. A route's fixtures have to exist at build time or its page cannot be
  prerendered.
- **A service holds its data in a signal and returns `readonly` slices.** Mutations rebuild the
  array rather than editing it, so a template that reads a computed sees the change.
- **`withLatency()` resolves immediately on the server.** A promise that settles on a timer never
  settles during prerender, and the build hangs rather than failing.
- **A missing record throws.** `bySlug` returning `undefined` where a page needs a record is a
  build failure, not a state to render, and that is deliberate: a bad slug in a prerender list is
  a bug we want loud.

## Facts the fixtures carry, and the tests that hold them

- **Every shipment has exactly one milestone with `live: false`, it is `en-ruta`, and it carries a
  note.** That is the brand rule as data: when the bus is moving nobody knows where the parcel is,
  and the screen says so. `shipping.spec.ts` fails if someone tidies the note away.
- **Milestones are a reached prefix.** No milestone after an unreached one carries an `at`.
- **A waybill's slug is its lowercase form.** Route segments are lowercase because a prerendered
  directory on a case-sensitive host is a 404 waiting to happen.
- **A hiring offer is addressed.** `Hiring.accept()` throws when the driver answering is not the
  one the offer names, and only a `pendiente` offer transitions. That is the whole of the rule the
  product states: the business proposes, the driver decides.
- **The feed is round-robin over the shops.** `foodFeed` and `parcelFeed` take one product from
  every open merchant before taking a second from any, so neither the buyer's feed nor the four
  products the landing previews belong to a single shop. Within one shop the order is featured first
  and then most sold this month. `marketplace.spec.ts` holds both halves.
- **`Order.shipmentGuia` is the bridge between the two verticals.** It is what makes "same cart,
  same tracking" true rather than claimed: a parcel order links to the shipment record the import
  shop dispatched, and the buyer's detail page draws the milestone timeline from it.
