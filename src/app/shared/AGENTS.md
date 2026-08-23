# src/app/shared: the pieces Arena does not ship

Everything here either composes Arena components or is drawn from tokens because Arena has no
component for it. Nothing here restyles an Arena component.

| Piece                         | Why it exists                                                     |
| ----------------------------- | ----------------------------------------------------------------- |
| `brand-mark`                  | the first of the two inline SVGs the project allows               |
| `route-map`                   | the second, and the answer to "live map" without a map library    |
| `branch-card`, `product-card` | compositions over `ArenaCard`                                     |
| `state-tag`                   | maps an order, a load or an agreement state to a tone and a label |
| `order-timeline`              | `ArenaActivityFeed` has no pending state and nowhere for the note |
| `order-chat`                  | it has no per-item projection and no notion of sides              |
| `order-code`, `scan-panel`    | the two halves of the handover, drawn from tokens                 |
| `custody-card`                | the ficha: who answers for this order right now                   |
| `rider-picker`                | the one place a sucursal may choose someone to carry a pedido     |
| `order-header`                | the ink band on a pedido's heading                                |
| `reputation-figure`           | the compliance percentage, and what it is made of                 |

## The two inline SVGs, and why they are allowed

[`../../../design/AGENTS.md`](../../../design/AGENTS.md) says icons are Phosphor class strings. A
brand mark and a schematic map are not icons, and
`arena-to-prod --audit` agrees: it reads the whole tree and reports nothing on either. Do not read
that as a licence for a third one without checking.

**BrandMark** takes `--ink-heading` on the container, `--fill-page` on the parcel and
`--color-secondary` on the route line and its dot. Under `noche` the first two swap, which is the
inverted lockup the brief specifies, and the amber does not move because it is what distinguishes
the mark. **Do not tint it a single flat colour.**

**RouteMap** carries two mechanics that make the token rule survive an SVG:

- every stroke is `vector-effect="non-scaling-stroke"`, so `stroke-width` is a real length and can
  read `--bw-*`. A viewBox unit is not a token and would be a bare number wearing a costume;
- every colour comes from a CSS class, never from an SVG presentation attribute, because an
  attribute cannot read a `var()`.

Its `viewBox` is computed from the points it draws rather than fixed, so the route always frames
itself and no fixture can wander out of frame. Streets are clipped by that box, which is what a map
does anyway.

**The drawing is not its own alternative text.** The `figcaption` says in words what the shapes say,
including that the rider went quiet and at what hour, because a `role="img"` with an `aria-label`
tells a screen reader the picture exists and nothing about what changed.

## OrderCode is one component because there is one code

There is one code and one component that draws it, because the guide asks the question once.
Its modules are **seeded from the order code**, which is what the prerender contract in
[`../AGENTS.md`](../AGENTS.md) requires of anything that draws. **Its field is
drawn from tokens and not from a `repeating-linear-gradient`**, because this project bans gradients
outright and the audit fails one.

## ScanPanel reports and decides nothing

Whether the code matches, and what happens when it does not, belongs to the page that owns the
order. That is why the same component serves a rider at a door and a gerente at a counter, and why
its spec asserts it says neither "correcto" nor "incorrecto".

## RiderPicker is where the guide's rule is enforced on screen

It reads `Agreements.ridersOf(branchId)` and nothing else, so a sucursal can only put work on
someone who agreed to work with it. It splits by range, trucks for the interurban leg and motos for
the local one, and it lists a rider who is out of shift **without a button rather than hiding
him**, because "he is not available" and "he does not work here" are different answers to the
manager's question.

## OrderChat draws a system line with no bubble and no author

That is the only visual difference that matters in the component, and it is what makes a custody
hand-over read as an explanation rather than as a stranger talking.

## OrderTimeline carries the honest gap

A milestone with `at` is reached and draws a filled check in `--color-success`; the first one
without is current and draws the amber dot, which is the mark's own package reused; the rest are hollow and
muted. **The untracked milestone renders its note**, in the amber left-rail callout, and that note
is now `carga-en-espera`: the parcel is sitting in a sucursal waiting for the truck to fill, and the
screen says how many orders are missing rather than showing a mute wait.

## The cards add no air

`arena-card` already brings its own padding and its own gap. The body carries
`.arena-stack .arena-stack--group` and nothing else about separation. The projection markers
`[media]` and `[fallback]` need `ArenaMedia` and `ArenaFallback` in the component's own `imports`;
drop one and the slot renders nothing, with no error.

`product-card` takes an optional `branch`, and that is the whole of what makes it a feed card: the
sucursal's name fills `ArenaCard`'s own `eyebrow`. It also takes `available`, because availability
belongs to the local rather than to the product. It takes no `href` even in the feed, because the
card already holds the Agregar button.

`branch-card` links three segments, `/tiendas/:empresa/:sucursal`, so it prepares both the `href`
and the cover through `Location`, and its spec holds the `/touno/` case.

## ReputationFigure never draws a figure it does not have

It takes a `Standing` and an optional breakdown, and it draws the percentage **with what it is made
of underneath**, never one without the other. With no history it says "Sin historial" in words
instead of a zero, which is the same honesty as "Última conexión registrada": a figure computed from
nothing is not a bad figure, it is an absent one. **There is no star, and no glyph, bar or dot row
standing in for one**, and `audit:arena --strict=glyph` fails the build over one.

## StateTag composes, it does not restyle

It maps an `OrderState`, a `LoadState` or an `AgreementState` to an `ArenaTag` tone and a Spanish
label in one place, so a state is not re-worded in every template that shows one. Any new state must
be added here or TypeScript breaks, which is the point.
