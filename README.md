# Touno

A minimal but working mock-up of **Touno**, a last-mile logistics marketplace for Bolivia. Two
verticals share one network, one cart and one tracking story: food ordered from restaurants, and
goods bought from import shops that travel between cities as parcels.

Angular 22 + Bun + Vite, prerendered to static HTML, skinned with Arena.

## Where the product came from

The brief in `Brief para producto nuevo/` is _Terminal Ya_: an intercity parcel product for
Bolivia, built around bus companies, with five roles — vendedor, conductor, sucursal, destinatario
and empresa aliada. It carries the visual identity and nothing about import shops; the word does
not appear in it.

The product changed during planning, and this mock-up is the result:

| Brief                                       | Touno                                                     |
| ------------------------------------------- | --------------------------------------------------------- |
| Vendedor: a shop that ships parcels all day | **Dueño de importadora**, and the deepest panel here      |
| Conductor                                   | **Conductor**, plus a hiring flow the brief does not have |
| Destinatario                                | **Comprador final**, who now also orders food             |
| Sucursal, empresa aliada                    | dropped as roles; they survive as data the others read    |
| —                                           | **Dueño de restaurante**, the second vertical             |

What was kept from the brief is the part that makes the importer's panel worth building: the
waybill `TY-####`, the urban pickup, the seal at the branch, the departure manifest, the bus leg
with **no live map** — stated in the milestone rather than hidden — and the four-digit code that
releases the parcel at the counter.

Four user groups, at deliberately uneven depth: the importer in full, the restaurant well
resolved across its four module groups, the driver and the buyer lighter but navigable end to end.

## Stack

| Piece                       | Choice                                                                    |
| --------------------------- | ------------------------------------------------------------------------- |
| Framework                   | Angular 22, standalone, zoneless, `OnPush` everywhere, signals only       |
| Runtime and package manager | Bun 1.3                                                                   |
| Build                       | `@angular/build` — Vite in dev, esbuild in build                          |
| Rendering                   | `@angular/ssr`, `outputMode: "static"`: 117 prerendered routes, no server |
| Design system               | `@dravensoft/arena-angular` 10.0.1, pinned exactly                        |
| Icons                       | Phosphor, subset and self-hosted by `arena-to-prod`                       |
| Tests                       | Vitest through `@angular/build:unit-test`                                 |

## Commands

```bash
bun install
bun start              # dev server on 0.0.0.0:4200
bun run build          # prerenders every route into dist/touno/browser
bun run test           # Vitest
bun run lint           # angular-eslint
bun run format         # Prettier over the tree
bun run audit:arena    # arena-to-prod report over src and design
bun run serve:static   # serves the build on :4173
```

## The skin

`arena.config.json` and `design/touno/` carry the identity; Arena carries the language.

**Two palettes.** `papel` is the default and the identity: Papel `#f7f7f6` for the page, white for
cards — the brief reserves white for cards, so `base-100` is the page and `base-200` is the card,
which is the inversion most Arena projects do not make. `noche` is the dark answer to the same
palette. Petróleo is the primary and also the info tone, amber is the secondary and also the
warning tone: the brief gives each colour one meaning and says outright that no colour decorates,
so inventing a seventh hue to fill an Arena slot would have been decoration.

**Amber is the one colour that does not move between palettes.** It is the mark, the package dot
on the route line, the in-motion status and the current milestone — the same sign in the brand and
in the product, which is what the brief asks for.

**No shadows at all.** All five shadow roles are answered with an all-zero literal, and
`edge-surface-floating` takes ink rather than the hairline, because with no shadow a menu over a
white card needs something to separate it.

**Control height is a deviation, and a deliberate one.** The brief specifies 52px controls. In
Arena that is a density decision rather than a style-plugin one, so the app runs
`.arena-comfortable`, which gives 48px for ordinary controls and 56px for the one commit action
per screen.

**Fonts** are Archivo for display and body and IBM Plex Mono for every figure a person would
dictate, all self-hosted. Nothing in the tree requests Google Fonts.

## Routes

Spanish paths. Everything public is indexed; every panel is `noindex,follow`.

| Public                                 |                                           |
| -------------------------------------- | ----------------------------------------- |
| `/`                                    | mixed marketplace                         |
| `/restaurantes`, `/restaurantes/:slug` | restaurants and their menus               |
| `/tiendas`, `/tiendas/:slug`           | import shops and their catalogues         |
| `/seguimiento/:guia`                   | public parcel tracking, no account needed |
| `/tarifas`                             | route tariffs                             |
| `/conducir`                            | driver recruitment                        |

| Behind the fake sign-in             |                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `/importadora/…`                    | shipments, new shipment, payment, detail, batch, account, catalogue, drivers                  |
| `/restaurante/…`                    | live orders, history, menu, product, metrics, finance, promotions, reviews, drivers, settings |
| `/conductor/…`                      | shift, incoming ride, verified pickup, branch drop-off, earnings, hiring offers               |
| `/feed`, `/carrito`, `/mis-pedidos` | the buyer's feed, cart and orders                                                             |

There is no password. `/ingresar` picks a profile, the role lives in a signal, and a panel whose
role is not the current one renders an unauthenticated card with the four profiles in it.

## Data

Everything is a typed module constant read through a `providedIn: 'root'` service that holds it in
a signal: 14 merchants, 42 products, 12 shipments, 10 orders, 8 drivers, 6 hiring offers, 4
branches, 3 carriers, 8 tariffs. No HTTP, no backend, and mutations go through a small
`withLatency()` helper that resolves immediately on the server so the prerender always settles.

## SEO, asleep until launch

The SEO is complete in the tree and configured for `https://touno.bo`: per-route titles and
descriptions, canonicals and `og:*`, JSON-LD (`WebSite`, `Organization`, `ItemList`, `Restaurant`,
`Store`, `ParcelDelivery`), a generated `sitemap.xml` and a `robots.txt`.

`scripts/pages-preview.ts` puts it to sleep **in the GitHub Pages artefact only**: every `robots`
meta becomes `noindex,nofollow`, `robots.txt` becomes `Disallow: /`, and the sitemap is deleted.
It deliberately does not touch canonical, `og:*` or JSON-LD, because removing nodes from
prerendered HTML breaks hydration.

## What is not here

- No backend, no authentication and no payments. The QR panel is a placeholder that reads as one.
- No map library. Where a map belongs, an `arena-figure` fallback stands in — which is also the
  honest answer for the bus leg, where there is no live position to draw.
- No photography. Every card falls back to its Phosphor glyph.
