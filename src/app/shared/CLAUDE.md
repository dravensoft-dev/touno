# src/app/shared — the pieces Arena does not ship

Everything here either composes Arena components or is drawn from tokens because Arena has no
component for it. Nothing here restyles an Arena component.

| Piece                                         | Why it exists                                                     |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `brand-mark`                                  | the one inline SVG the project allows                             |
| `merchant-card`, `product-card`, `order-card` | compositions over `ArenaCard`                                     |
| `status-tag`                                  | maps a state to a tone and a label, once                          |
| `shipment-timeline`                           | `ArenaActivityFeed` has no pending state and nowhere for the note |
| `shipment-header`                             | the ink band on the shipment detail                               |
| `pickup-code`, `qr-panel`                     | the two figures the brief draws that are not components           |

## BrandMark is inline SVG, and that is the point

Three things have to reach inside it, and an external asset gets none of them: the container takes
`--ink-heading`, the parcel outline takes `--fill-page`, and the route line and its dot take
`--color-secondary`. Under `noche` the first two swap, which is exactly the inverted lockup the
brief specifies — and the amber does not move, because it is what distinguishes the mark. It is
`aria-hidden` with the accessible name coming from the element around it.

**Do not tint the mark a single flat colour.** The amber route is what makes it the mark.

## The cards add no air

`arena-card` already brings its own padding and its own gap between the figure and the body. The
body carries `.arena-stack .arena-stack--group` and nothing else about separation. The projection
markers `[media]` and `[fallback]` need `ArenaMedia` and `ArenaFallback` in the component's own
`imports`; drop one and the slot renders nothing, with no error.

`merchant-card` takes a `headingLevel` so it can be `h2` on a listing page and `h3` inside a
section, which is what keeps the document outline whole.

## ShipmentTimeline carries the brand rule

A milestone with `at` is reached and draws a filled check in `--color-success`; the first one
without is current and draws the amber dot — the mark's own package, reused; the rest are hollow
and muted. **A milestone whose `live` is false renders its note**, in the amber left-rail callout
the brief uses for consequences. That note is the product's honesty about the bus leg, and
`domain/shipping.spec.ts` fails if the fixtures lose it.

## StatusTag composes, it does not restyle

It maps a `ShipmentState` or an `OrderState` to an `ArenaTag` tone and a Spanish label in one
place, so nine states are not re-worded in six templates. It renders an Arena component; it does
not reach into one.
