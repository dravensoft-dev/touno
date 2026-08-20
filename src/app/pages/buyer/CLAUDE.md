# src/app/pages/buyer — the buyer's lane

`feed`, `cart`, `checkout`, `orders`, `order-detail`. Five screens, and the one that carries the
guide is the ficha.

## The ficha draws its parties from `sheetOf()`

Two, three or four of them, from one record: a restaurant order shows the sucursal and the rider; a
counter pickup adds the local sucursal; a home delivery from another city adds the local rider on
top. The counts are asserted in `order-detail.spec.ts`, so losing a party is a failing build rather
than a quiet omission.

## The map runs from the first assignment until the code is scanned

And nowhere else. Before a rider exists the page says **En espera de rider**; while the truck fills
it says how many parcels are still missing; once the code is read the map goes. When a rider stops
reporting, the drawing keeps his last point and labels it with the hour, and the figcaption says the
same thing in words.

Never draw the map from `mapLive` alone — it also needs a track. A rider assigned in a city the
fixtures do not map would otherwise render an empty box.

## Checkout is the buyer's one decision, and it only sometimes exists

It appears **only when something in the cart comes from another city**, offers exactly the two
endings the guide names, and lists only sucursales **of that empresa in the buyer's city**. It
refuses to confirm until it knows where the parcel is going, either way: an address for a home
delivery, a sucursal for a counter pickup, never both.

## The cart is grouped by sucursal, not by empresa

Because a sucursal is what despatches, and the delivery is charged per sucursal. Two locals of one
chain in one cart are two envíos, and the page says so.
