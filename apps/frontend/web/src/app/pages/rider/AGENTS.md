# src/app/pages/rider: the rider's lane

One panel, two kinds of rider and three ways of working. The vehicle separates the kinds and nothing
else: `rangeOf(vehicle)` decides whether this person sees urban jobs or interurban loads. The way of
working is a state he can change, not a kind he is: **there is no second role and no second panel**,
and a free agent reaches the same Turno, the same Encargos and the same scan as anyone.

## The agreement screen is the rider's half of the mutual rule

He answers an invitation the empresa sent, and he **cannot answer one he sent himself**: no button,
and the service would throw. The spec asserts what accepting actually buys: before it, `covers()` is
false and no sucursal can assign him anything; after it, true.

## Agente libre is the screen of a rider bound to nobody

`free-agent/` refuses to offer anything to a rider who holds an active reclutamiento or owes
carreras, and **says which of the two it is** rather than hiding the switch, which is the same
treatment `PEAK_REASONS` gives a blocked hora pico. Below that it is one map and a list of the
llamados open in his own city, nearest first.

**The map is readable out of shift and only the going is not.** "He is not available" and "nobody is
looking for him" are different answers, and the screen keeps them apart the way `rider-picker` does.

His position is derived from the first of his `Rider.zones` through `Geography.zoneOf()`; nothing
about a free agent is stored on the rider except the switch itself, which outlives any one llamado.

## The scan closes the pedido and nothing else does

There is no "mark delivered" anywhere in this lane. A code from another order raises a pinned danger
notice and delivers nothing; the right one records the rider as who read it and writes the system
line into the buyer's chat. The screen refuses outright a pedido he is not carrying **right now**,
including one he carried on a leg that is over.

## The question after the scan is blocking, and silence answers it

A successful scan by a rider holding a cupo opens `shared/free-agent-prompt` at once, because the
sucursal has to know before its next pedido whether it still has him. **The condition is the cupo
and never the return of `Orders.scan()`**, which answers `undefined` both for a free agent and for a
scanner who is not the assigned rider; this screen has already refused the second case before it
ever reaches the panel.

Leaving ends the trato with that sucursal and **not** the rider's free agent mode, so the next
llamado is one tap away.

## Departing a load moves every parcel at once

`load/` calls the same `Chat.handOver()` the sucursal uses, in a loop over the load's orders, so
every buyer's counterpart becomes the truck rider with a line saying why. That is what makes
"the counterpart follows custody" hold on the interurban leg too.

The departure button is disabled until the load is full, and the screen says how many are missing,
the same number the buyer sees. That is the point of `En espera a más pedidos`: it is not a delay,
it is how the leg works, and both sides are told the same thing.

## Losing signal is a first-class state here

The rider's own map says he is offline and explains what the buyer sees: a last connection with an
hour, not a frozen map. Nothing has to be tapped to clear it.
