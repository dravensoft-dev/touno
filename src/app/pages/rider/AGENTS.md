# src/app/pages/rider: the rider's lane

One panel, two kinds of rider. What separates them is the vehicle and nothing else:
`rangeOf(vehicle)` decides whether this person sees urban jobs or interurban loads. There is no
second role, no second panel and no seventh profile.

## The agreement screen is the rider's half of the mutual rule

He answers an invitation the empresa sent, and he **cannot answer one he sent himself**: no button,
and the service would throw. The spec asserts what accepting actually buys: before it, `covers()` is
false and no sucursal can assign him anything; after it, true.

## The scan closes the pedido and nothing else does

There is no "mark delivered" anywhere in this lane. A code from another order raises a pinned danger
notice and delivers nothing; the right one records the rider as who read it and writes the system
line into the buyer's chat. The screen refuses outright a pedido he is not carrying **right now**,
including one he carried on a leg that is over.

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
