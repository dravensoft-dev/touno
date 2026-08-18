# src/app/pages — the routed components

`public/`, `buyer/`, `restaurant/`, `importer/`, `driver/` and `hiring/`. Every one is lazy-loaded
from `src/app/app.routes.ts` and every one is prerendered.

Three of those folders carry a `CLAUDE.md` of their own, because their rules differ: `importer/`
owns the waybill's life, `restaurant/` the four module groups, `driver/` the handover that has to
work with no signal.

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

`shared/merchant-card` takes a `headingLevel` for exactly this reason: `h3` inside a section on the
landing, `h2` on a listing page where no section names the region.

## Notes

- Arena anchors report their own activation, so a card or a crumb is routed from the component's
  event handler. Never wrap an Arena component in `routerLink`.
- Route params and route `data` arrive as signal inputs through `withComponentInputBinding()`.
  `merchants` reads `kind` from `data`, `hiring/hire-drivers` reads `base` and `businessKind`.
- `merchant-detail` and `tracking` are the two pages whose metadata describes a record, so they
  call `ArenaMetadataService.apply()` in an effect. Everything else is `arenaRouteMeta` on the
  route. **`apply()` prefixes the origin onto `canonical`**, so pass a path, never an absolute URL.
