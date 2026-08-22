# src/app/layout — the shell

`site-footer/`, `panel-nav.ts`, `notices.ts` and `theme-toggle/`. The shell itself is `App`, because
the choice between the public chrome and a role panel is one decision and splitting it across two
components would have meant two router outlets.

## One shell, two shapes

`app.html` always draws `arena-skip-link`, `arena-app-bar` and `arena-main`. What changes is what
sits between them, and `panelFor(router.url)` decides:

- **no panel** — the page in a band, then `app-site-footer`;
- **a panel** — the rail and the page side by side, the bottom bar under them, and the footer gone.

`app-root` carries `arena-shell arena-stack arena-stack--section` on its host, and
`router-outlet { display: none }` in `src/styles.css` is the mirror rule: the outlet draws nothing
but is still a flex item.

## Four roles, seven profiles, two blind panels

The **role** is the access level and the **profile** adds the vertical. That split is the whole
reason `/empresa` and `/sucursal` can be blind to whether the business is a restaurant or an import
shop: the gate keys on `panel.role`, and the rail keys on the profile's `businessType`. Six roles
would have meant four management panels instead of two.

Seven profiles over four roles, and two of them are riders — one on a moto, one on a truck —
because the vehicle decides the work and not the account. They share one panel and see different
things in it.

`Destination.type` is the entire mechanism. Only two destinations carry one, `carta` and
`catalogo`, and `destinationsFor()` drops the ones that do not match. **Signed out, `businessType()`
is `undefined` and both drop** — which is what the prerender writes and what the first client render
reproduces, so hydration agrees. The filter lives in `app.ts` rather than in `panelFor()` because it
depends on the session and `panelFor()` is pure.

The gate offers **only the profiles whose role opens that panel** — two on each management panel,
one elsewhere — with the first `primary` and the rest `secondary`, plus a ghost link to
`/ingresar`. Seven buttons with two primaries would have broken "one primary accent per view", and
seven greyed-out ones make the reader hunt.

## The gate is a render decision, not a redirect

```
@if (unlocked()) { <router-outlet /> } @else { <arena-unauth-card> … }
```

A `CanActivateFn` returning a `UrlTree` during hydration navigates away from a page Angular has
already claimed, which is what NG0500 is made of. Two consequences, both deliberate:

- **the profile is never persisted**, so a reload of a panel route finds none and the server and
  the first client render agree exactly;
- **every panel route still prerenders**, to the unauthenticated card, which is the right thing to
  hand a crawler on a `noindex` route.

The theme is the opposite case and _is_ persisted, because its class sits on `<html>`, which
hydration never claims.

## The two media queries in the project

`app.css` carries `@media (width >= 48rem)`, and it is the only one that changes a layout:

- below it the rail is `display: none` and `ArenaBottomNav` carries the panel, with the page
  padded by `--layout-bar` plus the safe-area inset so the fixed bar never covers the last row;
- above it the rail appears, sticky under the app bar, and the bottom bar goes.

**Why a query and not `arenaViewportBelow`**: `--bp-*` does not resolve during prerender, so the
signal returns the wide branch server-side and a phone is served the sidebar until hydration.
Show/hide is a discrete decision at first paint, which is exactly the case the signal cannot serve.
**Why a literal `48rem`**: a media query cannot read a `var()`, so it restates `--bp-md`. If Arena
moves that breakpoint, this number has to follow.

The same query decides the top bar, because at a phone width the three public links do not fit
beside the brand and the account action: below it they are `display: none` and an `arena-menu` on a
`ph-list` trigger carries them, and "Ingresar" is drawn as an `arena-icon-button` rather than a
labelled one; above it the links come back and the menu goes. **Both branches are always in the
markup and CSS picks one**, which is the same reason the width decision is a query at all. The menu
is dispatched on the label — `ArenaMenuItem` carries no id — so `PUBLIC_LINKS` in `app.ts` is the
one place a section's label is written, and `MENU_LINKS` is derived from it.

The second query is `@media (width < 22.5rem)` in `src/styles.css`, and it changes no layout: it
re-answers `--gutter` as `--sp-4`, so the page padding steps from 24px to 16px on the narrowest
phones. It sits there rather than in `design/touno/plugin.css` because the plugin's sheet is wrapped
in `@layer arena-plugin` and the role values are emitted unlayered, which no layer can outrank.
Those sixteen pixels are what lets the app bar hold one row at 320.

Both navigation landmarks are named apart — "Panel de la sucursal" and "Accesos rápidos" — and
the hidden one is `display: none`, which takes it out of the accessibility tree, so a screen reader
never meets both.

## Navigation

`panel-nav.ts` is the single destination table, keyed by role. Its `bar` flag is what a
destination needs to appear in the bottom bar as well as the rail.

- **`panelFor()` matches on a segment boundary.** `'/restaurantes'.startsWith('/restaurante')` is
  true, and once put the public restaurant listing behind a panel's gate. The trap now exists three
  times: that pair is gone, but `/rider` sits against the public `/riders`, and the public
  `/restaurantes/:empresa/:sucursal` is three segments deep under a prefix a panel could plausibly
  claim. `panel-nav.spec.ts` holds all of them.
- **Never put `routerLink` on an `arena-side-nav-item` or an `arena-bottom-nav-item`.** They report
  `(nav)` with their own id; route from that handler with `router.navigateByUrl`.
- **A destination's `href` is prepared, its path is not.** `app.ts` maps every destination through
  `Location.prepareExternalUrl()` for the `href` the item renders, because `--base-href` reaches
  `routerLink` and nothing else, and a rail item opened in a new tab under `/touno/` would
  otherwise land on the host's root. `go()` still navigates with the raw path, which is what the
  router wants. `app.spec.ts` holds both halves.
- **`active` is an id, never a path**, and there is no route matcher. `activeIdIn()` does the
  comparison, longest path first, so `/sucursal/pedidos/to-1042` lights `Pedidos` and nothing else.
- **`go()` resolves against the filtered destinations**, not the panel's whole table. Routing to a
  destination the current vertical does not have would be routing to a screen the rail never
  offered.
- **`router.url` is read through a `toSignal` bridge over `NavigationEnd`**, never in the template.
  Reading the property directly appears to work and stops the moment a navigation reuses the
  component it is already showing.

## Notices are raised from `notices.ts` and nowhere else

`arena-toast-host` is mounted once in `app.html`, at the top level and outside the panel grid,
because a fixed box inside a transformed ancestor scrolls away with it. `ArenaToastQueue` is
Arena's own, provided in root, and it owns the clock; `App` only renders `toasts()` into the host
and answers `(close)`.

- **`Notices` holds the Spanish, one method per outcome.** It is the same rule `bs()` and
  `state-tag` follow: an outcome is worded once, not re-worded in the five pages that raise it.
  A page injects `Notices`, never `ArenaToastQueue`.
- **A notice is for an outcome the page cannot show.** Adding to the cart,
  sending a proposal, answering one, assigning a rider, marking an article gone: in each of those
  the reader stays put and nothing on screen changes enough to say it worked. A row leaving a list
  already says so, so it gets no notice.
- **`codeMismatch()` is danger and it is pinned.** A scanned code that belongs to another order is
  the one notice in this tree the reader must act on, because the alternative is handing a parcel
  to the wrong person.
- **`tone: 'danger'` pins the notice**, and it ignores an explicit `persist: false`. That is why
  the failed-copy notices are danger and the rest are not: a message the reader has to act on must
  not go away on a timer, and one that only reports success must.
- **It lives here rather than in `domain/`.** The queue is Arena's and the host is the shell's, so
  the wording that feeds them belongs beside them. `domain/` stays free of anything that draws.

## The theme toggle

`ArenaThemeService`'s constructor reaches `document.defaultView.matchMedia`, and the DOM
`@angular/platform-server` ships has `defaultView` and no `matchMedia`, so the optional chain does
not protect you and **the prerender of every route that draws the toggle throws**. The component
resolves the service inside `afterNextRender`, so the first client render matches the prerendered
HTML.

It draws **two** `arena-icon-button`s and always both: a moon that offers `noche` and a sun that
offers `papel`, each in a `span` of ours, and `:host-context(.arena-noche)` decides which one has a
box. **The glyph must not be computed from the current theme.** The server does not know it —
`localStorage` is read by the inline script in `index.html`, in the browser, before Angular starts —
so a component that picked its own icon would prerender one glyph and hydrate to the other, which is
NG0500. Rendering both and letting CSS choose is what keeps the two renders identical, and it is the
same move the brand mark makes when it inverts. `theme-toggle.spec.ts` holds the pair.
