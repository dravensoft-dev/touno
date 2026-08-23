# src/app/pages/public: the surface a stranger reaches

Every page a crawler and a stranger can reach. `home`, `companies`, `company`, `branch`,
`ride-with-us`, `manual`, `manual-role`, `sign-in` and `not-found`. Everything else in the tree is
behind the gate and carries `noindex,follow`.

**`/` is the only public door, and that is not the same as the only public route.** The landing names
every other public surface and the app bar carries no section links, but the listings, every empresa
and sucursal ficha, `/riders` and `/manual/:rol` all keep their own URL and their own metadata.
Collapsing them into the landing would leave Touno findable by its own name and nothing else, and
**the sucursal ficha is the unit somebody actually searches for**. Navigation folded in; the routes
did not.

**Reachable and indexed are two different things here.** The landing, `/riders` and the Manual are
the ones a crawler is told about; the catalogue is public, complete and deliberately kept out of the
index while its empresas are fixtures. Which constant does that, and why, is
[`../../seo/AGENTS.md`](../../seo/AGENTS.md).

| Component               | Serves                          | Note                                                                         |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `home`                  | `/`                             | the one door. Its cards are the only navigation to the other public surfaces |
| `companies`             | `/restaurantes`, `/tiendas`     | one component, two verticals, `type` read from route `data`. `INVENTED`      |
| `company`               | `/:vertical/:empresa`           | the empresa and every sucursal it runs. `INVENTED`                           |
| `branch`                | `/:vertical/:empresa/:sucursal` | the ficha, and the page this surface exists for. `INVENTED`                  |
| `ride-with-us`          | `/riders`                       | rider recruitment                                                            |
| `manual`, `manual-role` | `/manual`, `/manual/:rol`       | one chapter per role, `Tutorial` and `Reputación`                            |
| `sign-in`               | `/ingresar`                     | `noindex`, because a profile picker is not a public surface                  |
| `not-found`             | `/404` and `**`                 | `noindex`, and `scripts/emit-404.ts` lifts it to the host's root             |

## A new public route is not done until it has all of these

- a `title` and an `arenaRouteMeta` `description`, or an `ArenaMetadataService.apply()` call when the
  metadata is a fact about the record rather than about the route;
- a canonical and the `og:*` pair, which follow from `origin` being configured;
- the right JSON-LD, through `<app-structured-data>`;
- an entry in the generated `sitemap.xml` when the route is indexed, and none when it is not;
- **complete HTML at prerender time.**

Which schema belongs on which route is [`../../seo/AGENTS.md`](../../seo/AGENTS.md). How the
sitemap is written, and what it has to agree with, is
[`../../../../scripts/AGENTS.md`](../../../../scripts/AGENTS.md).

## Three of these pages describe a record rather than a route

`company` and `branch` call `ArenaMetadataService.apply()` in an effect, because their title and
description come from the fixture rather than from the route table. `manual-role` does the same. The
rest carry `arenaRouteMeta` on the route and nothing at runtime.

## The manual is written out of the model, not beside it

Every `Role` has a chapter and every chapter has both sections. **The `Reputación` section names
`ReputationFact` members rather than repeating their wording**, so renaming a fact renames the
manual. `/manual/*` is public, so its prerendered HTML has to be complete: a chapter that renders
only after hydration is a chapter no crawler reads.

Each chapter offers the way back into the panel it was reached from, because a reader arriving from
a rail has left their panel to get here.

## A missing record throws here, and that is on purpose

`company` and `branch` throw when the slug resolves to nothing. A bad slug in a prerender list is a
bug we want loud at build time, not a soft not-found page written to disk. That is the opposite of
the panel lanes, where a record the reader does not own answers a refusal.
