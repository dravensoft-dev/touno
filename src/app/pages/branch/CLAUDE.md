# src/app/pages/branch — the gerente de sucursal's lane

Eight screens for the person who is there when the pedido comes in. Two of them carry rules the
guide states outright.

## A rider is offered only if an agreement covers this sucursal

`shared/rider-picker` reads `Agreements.ridersOf(branchId)`, and that is the only source. There is
no "all riders" list anywhere in this lane, on purpose: the screen cannot offer what the model
forbids. It splits by range — trucks for the interurban leg, motos for the local one — and a rider
out of shift is listed without a button rather than hidden.

Assigning takes custody with the rider **and** hands the chat over in the same handler, so the buyer
learns why his counterpart changed at the moment it changes.

## The scan is the only way a counter pickup closes

`shared/scan-panel` reports the code; this lane decides. A code from another order raises a pinned
danger notice and delivers nothing. The right one marks the order delivered, records **the branch
id** as `scannedBy`, and writes the system line into the buyer's thread. Both branches are held by
`pickups.spec.ts`.

## The board is a board, and the one action that matters is assigning

Four columns — nuevos, preparando, esperando rider, en camino. What is broken goes **above** the
board: an alert counting the pedidos waiting on a rider, with an action that opens the first. That
ordering is the whole reason the screen beats a spreadsheet.

Rejecting is a destructive `ArenaConfirmDialog`, because it leaves a buyer with no food.

## carta and catálogo are one component on four routes

`stock/` and `stock-item/` serve `/sucursal/carta`, `/sucursal/catalogo` and both `:id` routes. They
differ in a noun, which is what "the panel adapts to the vertical" was supposed to mean. Two twin
components would have been the duplication the vertical-blind prefixes exist to avoid.

**This lane never changes a price.** The empresa owns those, and both screens say so out loud.
