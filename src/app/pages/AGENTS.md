# src/app/pages: the routed components

Six lanes. Every component here is lazy-loaded from `src/app/app.routes.ts` and every one is
prerendered.

| Lane                                | Whose it is                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------- |
| [`public/`](./public/AGENTS.md)     | everyone. The only part of the tree a stranger reaches                      |
| [`buyer/`](./buyer/AGENTS.md)       | the comprador: the feed, the cart, the checkout and his fichas              |
| [`rider/`](./rider/AGENTS.md)       | the rider, on a moto or in a truck. One panel, two kinds of work            |
| [`branch/`](./branch/AGENTS.md)     | the gerente de sucursal, who is there when the pedido comes in              |
| [`company/`](./company/AGENTS.md)   | the gerente de empresa, who answers for the brand rather than for a counter |
| [`platform/`](./platform/AGENTS.md) | the operador de Touno, who answers for the platform                         |

This page holds what binds all six. How anything here is allowed to look is
[`../../../design/AGENTS.md`](../../../design/AGENTS.md); what Arena's components take is
[`../AGENTS.md`](../AGENTS.md).

## A panel route prerenders to the gate, and that is correct

There is no session at build time, so `/mis-pedidos/to-2205` prerenders to the unauthenticated card
rather than to the ficha. **Do not verify a panel screen against `dist/`**: there is nothing there to
read. Component specs are how those pages are checked, and the public pages are the only ones whose
rendered content can be inspected in the artefact.

## A page reached by id must check the record is the reader's

Loading by slug alone turns every panel into a directory of everyone else's records.
`/sucursal/pedidos/:codigo` refuses an order belonging to another sucursal,
`/rider/encargos/:codigo` one not assigned to that rider, `/empresa/sucursales/:id` and
`/empresa/catalogo/:id` ones of another empresa.

Each says **which** refusal it is: "no existe" and "no es tuyo" are different facts and the reader
deserves the right one. That is the opposite of the public lane, where a slug resolving to nothing
throws, because a bad slug in a prerender list is a bug we want loud.

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
`arena-page-head` is promoted to `h1` on every panel screen; a card, an empty state or a board column
directly under it is promoted to `h2`, because with no `arena-section` between them the middle rung
is not there. `arena-to-prod --audit` reports the gap, and it is the one accessibility rule in this
tree a tool checks for us.

`shared/branch-card` takes a `headingLevel` for exactly this reason: `h3` inside a section on the
landing, `h2` on a listing page where no section names the region.

## Notes

- Arena anchors report their own activation, so a card or a crumb is routed from the component's
  event handler. Never wrap an Arena component in `routerLink`.
- Route params and route `data` arrive as signal inputs through `withComponentInputBinding()`.
  `public/companies`, `public/company` and `public/branch` all read `type` from `data`, which is what
  lets one component serve both verticals.
- **`ArenaMetadataService.apply()` prefixes the origin onto `canonical`**, so pass a path, never an
  absolute URL. Which pages call it, and why, is [`public/AGENTS.md`](./public/AGENTS.md).
