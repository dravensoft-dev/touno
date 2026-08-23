# Touno

A minimal but working mock-up of **Touno**, a last-mile logistics marketplace for Bolivia. Two
verticals share one network, one cart, one code and one tracking story: food ordered from restaurant
branches, and goods bought from import shops that travel between cities by truck.

Angular 22 + Bun + Vite, prerendered to static HTML, skinned with Arena.

**Start with [`TOUNO_STRUC.md`](TOUNO_STRUC.md).** It describes the business by user group, in
Spanish, for the people who will use Touno rather than for the people who build it. It is the
document this tree is argued against.

## Where the product came from, and where it went

The brief in `Brief para producto nuevo/` is _Terminal Ya_: an intercity parcel product built around
bus companies. It carried the visual identity and nothing about import shops.

A first mock-up was built from it. Then `touno_guide.txt` landed and described a materially
different business, and the tree was rebuilt against it. What changed is not decoration:

| First mock-up (Terminal Ya)                     | Touno today                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| A flat merchant with a city and a zone          | **Empresa + at least one sucursal**, and two management panels    |
| Four roles                                      | **Five roles, eight profiles** — the profile adds the vertical    |
| Drivers hired for a block of prepaid rides      | **Riders**, free agents, bound by a **two-sided recruitment**     |
| Waybill `TY-####` plus a four-digit pickup code | **One order code**, the buyer's, and the only thing that delivers |
| Parcels on third-party buses, **no live map**   | **Own trucks**, live map on every leg a rider is moving           |
| No chat                                         | **One thread per order**, its counterpart following custody       |
| Public parcel tracking pages                    | **A page per sucursal**, with `LocalBusiness`                     |

The guide left gaps, and the answers to them are decisions rather than readings: the intercity leg
is covered by a rider driving a truck that **waits for the load to fill** — which is where the
`En espera a más pedidos` state comes from — and the guide's two contradictory sentences about the
QR were resolved in favour of the one that also works at a counter: the code is the buyer's from the
moment of purchase.

## Stack

| Piece                       | Choice                                                                    |
| --------------------------- | ------------------------------------------------------------------------- |
| Framework                   | Angular 22, standalone, zoneless, `OnPush` everywhere, signals only       |
| Runtime and package manager | Bun 1.3                                                                   |
| Build                       | `@angular/build` — Vite in dev, esbuild in build                          |
| Rendering                   | `@angular/ssr`, `outputMode: "static"`: 267 prerendered routes, no server |
| Design system               | `@dravensoft/arena-angular` 10.2.2, pinned exactly                        |
| Icons                       | Phosphor, subset and self-hosted by `arena-to-prod`                       |
| Tests                       | Vitest through `@angular/build:unit-test` — 458 across 51 files           |

## Commands

```bash
bun install
bun start              # dev server on 0.0.0.0:4200
bun run build          # prerenders every route into dist/touno/browser
bun run test           # Vitest
bun run lint           # angular-eslint
bun run format         # Prettier over the tree
bun run audit:arena    # arena-to-prod over src and every declared style plugin, strict
bun run serve:static   # serves the build on :4173
```

## The skin

`arena.config.json` and `design/touno/` carry the identity; Arena carries the language.

**Two palettes.** `papel` is the default and the identity: Papel `#f7f7f6` for the page, white for
cards — the brief reserves white for cards, so `base-100` is the page and `base-200` is the card,
which is the inversion most Arena projects do not make. `noche` is the dark answer to the same
palette. Petróleo is the primary and also the info tone, amber is the secondary and also the
warning tone: the brief gives each colour one meaning and says outright that no colour decorates.

**Amber is the one colour that does not move between palettes.** It is the mark, the current
milestone, the in-motion status — and the rider's dot on the map, which is the same sign in the
brand and in the product.

**No shadows at all.** All five shadow roles are answered with an all-zero literal, and
`edge-surface-floating` takes ink rather than the hairline, because with no shadow a menu over a
white card needs something to separate it.

**The style plugin answers exactly 77 roles.** Adding one is refused, so the two inline SVGs derive
their stroke widths with `calc()` over existing tokens in their own stylesheets.

## Routes

Spanish paths. Everything public is indexed; every panel is `noindex,follow`.

| Public                                        |                                             |
| --------------------------------------------- | ------------------------------------------- |
| `/`                                           | mixed marketplace                           |
| `/restaurantes`, `/tiendas`                   | listings, by sucursal                       |
| `/restaurantes/:empresa`, `/tiendas/:empresa` | the empresa and every sucursal it runs      |
| `/…/:empresa/:sucursal`                       | one sucursal, with `LocalBusiness`          |
| `/riders`                                     | rider recruitment                           |
| `/manual`, `/manual/:rol`                     | one chapter per role, Tutorial + Reputación |

| Behind the fake sign-in                                   |                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `/feed`, `/carrito`, `/carrito/entrega`, `/mis-pedidos/…` | the buyer's lane                                                 |
| `/rider/…`                                                | shift, jobs, the live job, the scan, loads, agreements, earnings |
| `/sucursal/…`                                             | board, order, deliveries, riders, stock, history, settings       |
| `/empresa/…`                                              | branches, orders, catalogue, riders, finance, settings           |
| `/plataforma/…`                                           | Touno's own fees, the per-city weather, and the network view     |

There is no password. `/ingresar` picks a profile, the profile lives in a signal, and a panel whose
role is not the current one renders an unauthenticated card offering the profiles that do open it.

**The operator panel is `/plataforma` and not `/touno` on purpose.** The GitHub Pages artefact is
built with `--base-href=/touno/`, and every rail destination goes through
`Location.prepareExternalUrl()`, so a `/touno` prefix would write `/touno/touno/tarifas` into each
`href`. It would work, and it would read like a bug in a bug report.

## Data

Everything is a typed module constant read through a `providedIn: 'root'` service that holds it in a
signal: 5 cities, 8 companies, 18 branches, 40 products, 10 riders, 23 recruitments, 17 orders, 6
truck loads, 17 chat threads, 8 rider tracks, one closed-facts reputation ledger and five manual
chapters, plus one platform config. No HTTP, no backend, and mutations go through a
small `withLatency()` helper that resolves immediately on the server so the prerender always
settles.

A fare is derived and never stored twice: `domain/pricing.ts` is pure functions, the way
`domain/timeline.ts` is, and `orders.spec.ts` recomputes every fixture's four amounts from the
order's own inputs rather than trusting the numbers written into it.

**Reputation is derived the same way, and it used to be invented.** `Rider.rating`, `Company.rating`,
`Company.reviewCount` and an `Order.review` with stars were fixture numbers nobody computed — and
they were already leaving the tree as an `aggregateRating` node in the public JSON-LD. They are gone.
`domain/reputation.model.ts` is pure functions over facts the tree already holds: a scan that closed
a delivery, its hour against `promisedAt`, a recruitment that reached `cumplido` or was left with
carreras owing, a pedido rejected, a carga that never filled. `reputation.data.ts` is a ledger of
**closed history as tallies**, so the figures are credible without adding one prerendered route, and
`Reputation` is **read-only**: `Orders.scan()` writes nothing, because a `computed` over the orders
already moves. Signal loss counts against nobody, on purpose — `TOUNO_STRUC.md` promises it.

**Nothing reads the wall clock.** `domain/clock.ts` exports a literal `NOW`, because a live clock
writes different HTML on the server than on the first client render.

The fixtures are chosen so that **every screen is reachable and every rule is demonstrable**: an
invitation for the demo rider to accept, an application for the demo empresa to answer, a parcel
waiting at the demo counter, one rider who has gone quiet, and orders covering all four journeys.

## SEO, asleep until launch

The SEO is complete in the tree and configured for `https://touno.bo`: per-route titles and
descriptions, canonicals and `og:*`, JSON-LD (`WebSite`, `Organization`, `ItemList`, `Restaurant`,
`Store` as `LocalBusiness`, `WebPage`, `Article` and `ItemList` for the manual), a generated
`sitemap.xml` and a `robots.txt`. Thirty-six pages carry `index,follow` and the sitemap has
thirty-six entries.

**No `AggregateRating` anywhere.** It was emitted from invented numbers, and schema.org's
`AggregateRating` means an opinion someone held. The compliance figure is shown in visible HTML
instead, and `branch.spec.ts` and the two manual specs refuse a rating node.

`scripts/pages-preview.ts` puts it to sleep **in the GitHub Pages artefact only**: every `robots`
meta becomes `noindex,nofollow`, `robots.txt` becomes `Disallow: /`, and the sitemap is deleted.
It deliberately does not touch canonical, `og:*` or JSON-LD, because removing nodes from
prerendered HTML breaks hydration.

## What is not here

- No backend and no authentication. **The money is computed but never moved**: the fare breakdown
  and the card records are real, a payment gateway is not. A card record holds a brand, four
  digits, a holder and an expiry, and there is no field that could hold a full number.
- **No real distance.** `pricing.ts` measures over the same schematic planes the map draws — one
  per city, plus a national one at its own scale — so a fee is coherent without pretending to be
  kilometres.
- **No map library.** `shared/route-map` is our own SVG: a schematic street grid, a route, an amber
  rider dot, and — when the rider stops reporting — his last known point labelled with the hour. Its
  coordinates are viewBox positions, not latitudes, which is why no `geo` node appears in any
  JSON-LD.
- No real QR encoding. `shared/order-code` draws a square seeded from the order code, so it is
  stable across renders without being scannable.
- No photography. Every card falls back to its Phosphor glyph.
