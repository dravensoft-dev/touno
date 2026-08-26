# src/app/pages/branch: the gerente de sucursal's lane

The lane of the person who is there when the pedido comes in. Some of these screens carry rules the
guide states outright.

## A rider is offered only if this sucursal is bound to him

`shared/rider-picker` reads `Staffing.ridersOf(branchId)`, and that is the only source. Two bonds
reach it and no third: a reclutamiento this sucursal is named in, and a cupo of its own llamado that
a free agent is occupying right now. There is no "all riders" list anywhere in this lane, on
purpose: the screen cannot offer what the model forbids, and since `Orders.assign()` refuses an
unbound rider outright, it could not offer one even by mistake. It splits by range, trucks for the interurban leg and motos for the local one, and a rider
out of shift is listed without a button rather than hidden.

Assigning takes custody with the rider **and** hands the chat over in the same handler, so the buyer
learns why his counterpart changed at the moment it changes.

## Promotions are read here and written nowhere

`promotions/` lists what the marca is running, in the same two audiences the empresa's lane uses and
through the same `shared/promotion-table`, and it carries neither the switch column nor a way to the
ficha. **A promotion belongs to the empresa exactly as a marca price does**, so a gerente de sucursal
has nothing to change about one; what a sucursal needs is to know what a comprador is about to type
at the counter, and reading it is the whole of that need.

## The llamado is the one thing this lane opens that the empresa cannot

`riders/` publishes a llamado de agentes libres with its cupos and its fija, and the empresa has no
screen for it: a free agent works for one sucursal, so a llamado spanning several would have nothing
to mean. The same reputation floor that stops this sucursal recruiting stops it calling.

Recruiting itself now offers **both** clases, always with `originBranchId` set, which is what keeps
the scope to itself. The hora pico refusal is asked for only when hora pico is chosen: asking for it
on a normal proposal would refuse a rider who merely holds a peak somewhere else.

## The scan is the only way a counter pickup closes

`shared/scan-panel` reports the code; this lane decides. A code from another order raises a pinned
danger notice and delivers nothing. The right one marks the order delivered, records **the branch
id** as `scannedBy`, and writes the system line into the buyer's thread. Both branches are held by
`pickups.spec.ts`.

## The board is a board, and the one action that matters is assigning

Four columns: nuevos, preparando, esperando rider, en camino. What is broken goes **above** the
board: an alert counting the pedidos waiting on a rider, with an action that opens the first. That
ordering is the whole reason the screen beats a spreadsheet.

Rejecting is a destructive `ArenaConfirmDialog`, because it leaves a buyer with no food.

## carta and catálogo are one component on four routes

`stock/` and `stock-item/` serve `/sucursal/carta`, `/sucursal/catalogo` and both `:id` routes. They
differ in a noun, which is what "the panel adapts to the vertical" was supposed to mean. Two twin
components would have been the duplication the vertical-blind prefixes exist to avoid.

**This lane never changes a price.** The empresa owns those, and both screens say so out loud.
