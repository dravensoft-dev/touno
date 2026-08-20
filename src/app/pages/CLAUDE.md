# src/app/pages — the routed components

`public/`, `buyer/`, `branch/`, `company/` and `rider/`. Every one is lazy-loaded from
`src/app/app.routes.ts` and every one is prerendered.

Four of those folders carry a `CLAUDE.md` of their own, because their rules differ. `public/` does
not: its rules are the SEO ones, and they live in `src/app/seo/CLAUDE.md`.

## A panel route prerenders to the gate, and that is correct

There is no session at build time, so `/mis-pedidos/to-2205` prerenders to the unauthenticated card
rather than to the ficha. **Do not verify a panel screen against `dist/`** — there is nothing there
to read. Component specs are how those pages are checked, and the public pages are the only ones
whose rendered content can be inspected in the artefact.

## A page reached by id must check the record is the reader's

Loading by slug alone turns every panel into a directory of everyone else's records.
`/sucursal/pedidos/:codigo` refuses an order belonging to another sucursal,
`/rider/encargos/:codigo` one not assigned to that rider, `/empresa/sucursales/:id` and
`/empresa/catalogo/:id` ones of another empresa. Each says **which** refusal it is — "no existe"
and "no es tuyo" are different facts and the reader deserves the right one.

## Every routed component needs `display: contents`

```ts
host: { style: 'display: contents' },
```

Angular inserts our component's element between `<router-outlet>` and our content, so without this
the shell's stack gap reaches that one element and stops.

## The page container is ours

Each page opens with a container we own, and that is where the layout classes go:

```
<div class="arena-stack arena-stack--section">
```

The band is the shell's, not the page's. Never put a rhythm class on an Arena element.

## The heading ladder has no gaps

A page draws exactly one `h1`, and nothing may sit two rungs below it with nothing between.
`arena-page-head` is promoted to `h1` on every panel screen; a card, an empty state or a board
column directly under it is promoted to `h2`, because with no `arena-section` between them the
middle rung is not there. `arena-to-prod --audit` reports the gap, and it is the one accessibility
rule in this tree a tool checks for us.

`shared/branch-card` takes a `headingLevel` for exactly this reason: `h3` inside a section on the
landing, `h2` on a listing page where no section names the region.

## Notes

- Arena anchors report their own activation, so a card or a crumb is routed from the component's
  event handler. Never wrap an Arena component in `routerLink`.
- Route params and route `data` arrive as signal inputs through `withComponentInputBinding()`.
  `public/companies`, `public/company` and `public/branch` all read `type` from `data`, which is
  what lets one component serve both verticals.
- `public/company` and `public/branch` are the two pages whose metadata describes a record, so they
  call `ArenaMetadataService.apply()` in an effect. Everything else is `arenaRouteMeta` on the
  route. **`apply()` prefixes the origin onto `canonical`**, so pass a path, never an absolute URL.
- **A page head takes `title` and `subtitle`.** Not `eyebrow`, not `lede` — those belong to
  `arena-section` and `arena-hero`. Written as plain attributes they render and do nothing at all.
