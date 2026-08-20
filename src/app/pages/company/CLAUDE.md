# src/app/pages/company — the gerente de empresa's lane

Nine screens for the person who answers for the brand rather than for a counter.

## The proposal is the half of the mutual rule that lives here

`rider-detail` is where the empresa picks a rider and **ticks which of its sucursales the agreement
covers**. Before this screen, `branchIds` was a field on a record; now it is a decision someone
makes.

The reachable set is not cosmetic: an urban rider is offered only the sucursales in his own city, a
truck rider all of them, and the ones he cannot cover are **named rather than hidden**, because
"he cannot serve that local" is what the manager needs to know. Proposing buys nothing on its own —
the spec asserts `covers()` is still false until the rider says yes.

The empresa answers applications and sends proposals, and can do neither to its own. The page offers
no button and `Agreements.settle()` would throw anyway.

## The importadora's hard rule is a sentence on the branch list

To sell into a city you need a sucursal there, and the page names the cities you are missing. A
restaurant never sees it, because it sells where it stands.

## Prices here, availability in the local

Said out loud on both catalogue screens. That split is the reason there are two management panels
rather than one, and it is the first thing to check when someone asks why a screen is in this lane
and not the other.

## This lane does not operate

No accepting a pedido, no assigning a rider, no answering a chat. When something is stuck, the
empresa's job is to see **why** — a sucursal with no riders, a city with no branch — not to reach in
and do the sucursal's work. The orders screen says so where it would be tempting.
