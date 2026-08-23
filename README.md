# Touno

A working mock-up of **Touno**, a last-mile logistics marketplace for Bolivia. Two verticals share
one network, one cart, one code and one tracking story: food ordered from restaurant branches, and
goods bought from import shops that travel between cities by truck.

Angular 22 and Bun, prerendered to static HTML, skinned with Arena.

**Start with [`TOUNO_STRUC.md`](TOUNO_STRUC.md).** It describes the business by user group, in
Spanish, for the people who will use Touno rather than for the people who build it. It is the
document this tree is argued against.

## Stack

| Piece                       | Choice                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| Framework                   | Angular 22, standalone, zoneless, `OnPush` everywhere, signals only                       |
| Runtime and package manager | Bun                                                                                       |
| Build                       | `@angular/build`: Vite in dev, esbuild in build                                           |
| Rendering                   | `@angular/ssr` with `outputMode: "static"`. Every route is prerendered and no server runs |
| Design system               | `@dravensoft/arena-angular`, pinned exactly                                               |
| Icons                       | Phosphor, subset and self-hosted by `arena-to-prod`                                       |
| Tests                       | Vitest through `@angular/build:unit-test`, over `src/` and `scripts/` alike               |

## Commands

```bash
bun install
bun start              # dev server on 0.0.0.0:4200
bun run build          # prerenders every route into dist/touno/browser
bun run check          # every gate, then the suites, the lint, the format and the Arena audit
bun run test           # Vitest
bun run lint           # angular-eslint
bun run format         # Prettier over the tree
bun run audit:arena    # arena-to-prod over src and every declared style plugin, strict
bun run serve:static   # serves the build on :4173
bun run sweep:overflow # the horizontal-overflow walk, against a running serve:static
```

## Routes

Spanish paths. The landing, `/riders` and the Manual are indexed; the catalogue is public and
`noindex,follow` while its empresas are fixtures; every panel is `noindex,follow`.

| Public                                        |                                               |
| --------------------------------------------- | --------------------------------------------- |
| `/`                                           | the one public door                           |
| `/restaurantes`, `/tiendas`                   | listings, by sucursal                         |
| `/restaurantes/:empresa`, `/tiendas/:empresa` | the empresa and every sucursal it runs        |
| `/:vertical/:empresa/:sucursal`               | one sucursal, with `LocalBusiness`            |
| `/riders`                                     | rider recruitment                             |
| `/manual`, `/manual/:rol`                     | one chapter per role, Tutorial and Reputación |

| Behind the fake sign-in                                   |                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `/feed`, `/carrito`, `/carrito/entrega`, `/mis-pedidos/…` | the buyer's lane                                                 |
| `/rider/…`                                                | shift, jobs, the live job, the scan, loads, agreements, earnings |
| `/sucursal/…`                                             | board, order, deliveries, riders, stock, history, settings       |
| `/empresa/…`                                              | branches, orders, catalogue, riders, finance, settings           |
| `/plataforma/…`                                           | Touno's own fees, the per-city weather, and the network view     |

There is no password. `/ingresar` picks a profile, the profile lives in a signal, and a panel whose
role is not the current one renders an unauthenticated card offering the profiles that do open it.

## What is not here

- No backend and no authentication. **The money is computed but never moved**: the fare breakdown and
  the card records are real, a payment gateway is not. A card record holds a brand, four digits, a
  holder and an expiry, and there is no field that could hold a full number.
- **No real distance.** Fares are measured over the same schematic planes the map draws, one per city
  plus a national one at its own scale, so a fee is coherent without pretending to be kilometres.
- **No map library.** `src/app/shared/route-map` is our own SVG: a schematic street grid, a route, an
  amber rider dot, and, when the rider stops reporting, his last known point labelled with the hour.
  Its coordinates are viewBox positions rather than latitudes, which is why no `geo` node appears in
  any JSON-LD.
- **No real QR encoding.** `src/app/shared/order-code` draws a square seeded from the order code, so
  it is stable across renders without being scannable.
- **No photography.** Every card falls back to its Phosphor glyph.
- **No live clock.** `src/app/domain/clock.ts` exports a literal `NOW`, because a wall clock writes
  different HTML on the server than on the first client render.

## Where to go next

[`AGENTS.md`](AGENTS.md) is the root of the working documentation and routes into all of it. This
page belongs to no level and carries no rule of its own. The levels below it:

- [`src/app/AGENTS.md`](src/app/AGENTS.md): the routes, what prerendering forbids, and where Arena's
  Angular layer takes something other than what you would write.
- [`src/app/domain/AGENTS.md`](src/app/domain/AGENTS.md): the model in one screen, the fixtures, and
  which spec holds each rule.
- [`src/app/layout/AGENTS.md`](src/app/layout/AGENTS.md): the shell, the rail, the gate and the
  theme.
- [`src/app/pages/AGENTS.md`](src/app/pages/AGENTS.md): the six lanes, and what binds all of them.
- [`src/app/shared/AGENTS.md`](src/app/shared/AGENTS.md): the components Arena does not ship.
- [`src/app/seo/AGENTS.md`](src/app/seo/AGENTS.md): the head, the constants and the structured data.
- [`design/AGENTS.md`](design/AGENTS.md): how anything is allowed to look, and the style kernel
  beside it.
- [`scripts/AGENTS.md`](scripts/AGENTS.md): the build-time helpers, and the gates under it.
- [`GENERATED.md`](GENERATED.md): which half of a file is yours to edit.
- [`DOUBTS.md`](DOUBTS.md): what counts as a debt here, and where the records live.
