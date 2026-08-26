# src/app/pages/company: the gerente de empresa's lane

The lane of the person who answers for the brand rather than for a counter.

## The proposal is the half of the mutual rule that lives here

`rider-detail` is where the empresa picks a rider and **ticks which of its sucursales the agreement
covers**. Before this screen, `branchIds` was a field on a record; now it is a decision someone
makes.

The reachable set is not cosmetic: an urban rider is offered only the sucursales in his own city, a
truck rider all of them, and the ones he cannot cover are **named rather than hidden**, because
"he cannot serve that local" is what the manager needs to know. Proposing buys nothing on its own:
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

## The catalogue is `catalogo` here for both verticals, and `/empresa/carta` does not exist

The sucursal serves `/sucursal/carta` and `/sucursal/catalogo` from one component under two nouns,
because a counter speaks the local's language. This lane does not split: one `/empresa/catalogo`,
one `/empresa/catalogo/:id`, labelled "Catálogo" whatever the empresa sells. Reading the split as
symmetric is how a walk ends up measuring the 404. Making the restaurant's
empresa read "Carta" is a product change carrying two routes and their prerender params, not a
label edit.

## `/empresa/riders/:slug` is the one route here that resolves by slug

Every other dynamic segment in this lane carries a real id: `empresa/sucursales/:id` and
`empresa/catalogo/:id`. This one resolves through `Riders.bySlug`, because `marco-quispe` is what a
gerente would paste into a chat and `r-marco` is not, and the segment is named `:slug` for that
reason. Why a parameter is named for what it holds is
[`../../AGENTS.md`](../../AGENTS.md).

## This lane does not operate

No accepting a pedido, no assigning a rider, no answering a chat. When something is stuck, the
empresa's job is to see **why** (a sucursal with no riders, a city with no branch) rather than to reach in
and do the sucursal's work. The orders screen says so where it would be tempting.
