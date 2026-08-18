# src/app/layout — the shell

`site-footer/`, `panel-nav.ts` and `theme-toggle/`. The shell itself is `App`, because the choice
between the public chrome and a role panel is one decision and splitting it across two components
would have meant two router outlets.

## One shell, two shapes

`app.html` always draws `arena-skip-link`, `arena-app-bar` and `arena-main`. What changes is what
sits between them, and `panelFor(router.url)` decides:

- **no panel** — the page in a band, then `app-site-footer`;
- **a panel** — the rail and the page side by side, the bottom bar under them, and the footer gone.

`app-root` carries `arena-shell arena-stack arena-stack--section` on its host, and
`router-outlet { display: none }` in `src/styles.css` is the mirror rule: the outlet draws nothing
but is still a flex item.

## The gate is a render decision, not a redirect

```
@if (unlocked()) { <router-outlet /> } @else { <arena-unauth-card> … }
```

A `CanActivateFn` returning a `UrlTree` during hydration navigates away from a page Angular has
already claimed, which is what NG0500 is made of. Two consequences, both deliberate:

- **the role is never persisted**, so a reload of a panel route finds no role and the server and
  the first client render agree exactly;
- **every panel route still prerenders**, to the unauthenticated card, which is the right thing to
  hand a crawler on a `noindex` route.

The theme is the opposite case and _is_ persisted, because its class sits on `<html>`, which
hydration never claims.

## The one media query in the project

`app.css` carries `@media (width >= 48rem)`, and it is the only width query in the tree:

- below it the rail is `display: none` and `ArenaBottomNav` carries the panel, with the page
  padded by `--layout-bar` plus the safe-area inset so the fixed bar never covers the last row;
- above it the rail appears, sticky under the app bar, and the bottom bar goes.

**Why a query and not `arenaViewportBelow`**: `--bp-*` does not resolve during prerender, so the
signal returns the wide branch server-side and a phone is served the sidebar until hydration.
Show/hide is a discrete decision at first paint, which is exactly the case the signal cannot serve.
**Why a literal `48rem`**: a media query cannot read a `var()`, so it restates `--bp-md`. If Arena
moves that breakpoint, this number has to follow.

Both navigation landmarks are named apart — "Panel de la importadora" and "Accesos rápidos" — and
the hidden one is `display: none`, which takes it out of the accessibility tree, so a screen reader
never meets both.

## Navigation

`panel-nav.ts` is the single destination table, keyed by role. Its `bar` flag is what a
destination needs to appear in the bottom bar as well as the rail.

- **`panelFor()` matches on a segment boundary.** `'/restaurantes'.startsWith('/restaurante')` is
  true, and once put the public restaurant listing behind the merchant panel's gate.
- **Never put `routerLink` on an `arena-side-nav-item` or an `arena-bottom-nav-item`.** They report
  `(nav)` with their own id; route from that handler with `router.navigateByUrl`.
- **A destination's `href` is prepared, its path is not.** `app.ts` maps every destination through
  `Location.prepareExternalUrl()` for the `href` the item renders, because `--base-href` reaches
  `routerLink` and nothing else, and a rail item opened in a new tab under `/touno/` would
  otherwise land on the host's root. `go()` still navigates with the raw path, which is what the
  router wants. `app.spec.ts` holds both halves.
- **`active` is an id, never a path**, and there is no route matcher. `activeIdIn()` does the
  comparison, longest path first so `/importadora/envios/nuevo` does not light `Envíos`.
- **`router.url` is read through a `toSignal` bridge over `NavigationEnd`**, never in the template.
  Reading the property directly appears to work and stops the moment a navigation reuses the
  component it is already showing.

## The theme toggle

`ArenaThemeService`'s constructor reaches `document.defaultView.matchMedia`, and the DOM
`@angular/platform-server` ships has `defaultView` and no `matchMedia`, so the optional chain does
not protect you and **the prerender of every route that draws the toggle throws**. The component
resolves the service inside `afterNextRender` and renders one `arena-icon-button` with a glyph that
does not depend on the current theme, so the first client render matches the prerendered HTML.
