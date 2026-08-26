# src/app/layout: the shell

`site-footer/`, `panel-nav.ts`, `notices.ts` and `theme-toggle/`. The shell itself is `App`, because
the choice between the public chrome and a role panel is one decision and splitting it across two
components would have meant two router outlets.

## One shell, two shapes

`app.html` always draws `arena-skip-link` and `arena-main`. Two decisions change what sits between
them.

**Who is reading decides the chrome.** `arena-app-bar` is drawn **only while nobody is signed in**,
because a header full of public sections is in the way of someone who came to work. Signed in there
is no bar at all: the brand sits above the rail on a desktop, and on a phone the bottom bar is the
whole chrome. `signedIn()` gates the bar and `shell-signed-in` on the host is what re-answers the
rail's sticky offset and gives the panel its own top padding. **Nothing else may assume a header is
on the page.**

**The session sits under the rail, and it is an avatar and two controls with no name.** The rail is
`--layout-sidebar`, 232px, of which 208 is content, and an avatar plus a name plus the theme plus
the salida leaves the name 56px where "Delia Mamani" wants 85. The name would have been truncated
for half the profiles, so it is not drawn: `arena-avatar` carries the initials, a `.arena-sr-only`
span carries "Tu sesión: name, place" for a screen reader, and a `title` carries it on hover.
**`arena-avatar` renders initials with no `aria-label` and no `title` of its own**, so without that
span nothing anywhere would say who is signed in. `--layout-sidebar` is Arena's token and this
project's plugin does not answer it; widening the rail would mean adding a role, which is refused.

**`.shell-person` is that block, and the phone wears the same one.** The rail's foot and the Más
sheet's `[footer]` draw the identical markup, so a reader who learns the row on a desktop finds it
where they left it on a phone. Only the separator above it belongs to the rail, because the sheet
draws its own; `.shell-panel__rail .shell-person` is where that lives. The sheet's copy carries the
cart in front of the theme when there is one to carry, which the rail has no reason to: on a phone,
signed in, there is no app bar left to hold it.

**Where they are decides the shape**, and `panelFor(router.url)` decides that:

- **no panel**: the page in a band, then `app-site-footer`;
- **a panel**: the rail and the page side by side, the bottom bar under them, and the footer gone.

**A signed-in reader carries their panel everywhere.** `App.panel` is
`panelFor(url) ?? panelOf(role)`, so a comprador reading `/restaurantes/pollos-copacabana` keeps his
rail rather than losing every way out, which is what removing the app bar would otherwise cost him.
The fallback lives in `app.ts` and not in `panelFor()` for the same reason the vertical filter does:
it depends on the session and `panelFor()` is pure. The gate is unaffected, because a route under
_another_ panel's prefix is answered by `panelFor()` before the fallback is ever reached.

`app-root` carries `arena-shell arena-stack arena-stack--section` on its host, and
`router-outlet { display: none }` in `src/styles.css` is the mirror rule: the outlet draws nothing
but is still a flex item.

## Roles, profiles, and two blind panels

The **role** is the access level and the **profile** adds the vertical. That split is the whole
reason `/empresa` and `/sucursal` can be blind to whether the business is a restaurant or an import
shop: the gate keys on `panel.role`, and the rail keys on the profile's `businessType`. A role per
vertical would mean a management panel per vertical instead of two.

There are more profiles than roles, and the riders are why: one on a moto and one in a truck,
because the vehicle decides the work and not the account. They share one panel and see different
things in it. The **operador de Touno** is the profile that holds no `companyId`, no `branchId` and
no `riderId`: he answers for the platform rather than for a record, and his rail carries no `type`,
so `destinationsFor()` never filters him. `panel-nav.spec.ts` holds that every `Role` has at least
one profile and that every profile's panel exists.

**His prefix is `/plataforma` and not `/touno`.** Every destination goes through
`prepareExternalUrl()`, so under a build served from a `/touno/` subpath the segment would be
written twice into each `href`.

`Destination.type` is the entire mechanism. Only two destinations carry one, `carta` and
`catalogo`, and `destinationsFor()` drops the ones that do not match. **Signed out, `businessType()`
is `undefined` and both drop**, which is what the prerender writes and what the first client render
reproduces, so hydration agrees. The filter lives in `app.ts` rather than in `panelFor()` because it
depends on the session and `panelFor()` is pure.

The gate offers **only the profiles whose role opens that panel**, with the first `primary` and the
rest `secondary`, plus a ghost link to `/ingresar`. Offering every profile would mean two primaries
on one view, which the design rules refuse, and greying the rest out makes the reader hunt.

**`GATE_NOUN` is a `Record<Role, string>` and that is deliberate**: adding a role does not compile
until the gate has a noun for it.

## The gate is a render decision, not a redirect

```
@if (unlocked()) { <router-outlet /> } @else { <arena-unauth-card> … }
```

A guard returning a `UrlTree` during hydration is one of the shapes
[`../AGENTS.md`](../AGENTS.md) refuses, so the gate is drawn rather than redirected to. Two
consequences follow, both deliberate:

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
- above it the rail appears and the bottom bar goes. The rail is sticky under the app bar when
  there is one, and `:host(.shell-signed-in)` drops that offset to `--rhythm-component` when there
  is not.

**The rail is as tall as the screen, and the session sits at its foot.** Above the query it is a
flex column whose height is the viewport less its own sticky offset and one `--rhythm-component` of
air below, so the bottom of the rail is the bottom of the screen whatever the page is long enough to
do. `.shell-panel__rail-nav` is the wrapper the destinations sit in and it is the flexing child, so
the brand stays at the top, the session block lands on the floor, and a viewport too short for every
destination scrolls the list inside itself rather than pushing the session off screen. The wrapper
exists because the growing element has to be one we own: a class of ours never goes on an Arena
element, which [`../../../design/AGENTS.md`](../../../design/AGENTS.md) states as a rule for the whole
tree.

**Why a query and not `arenaViewportBelow`**: `--bp-*` does not resolve during prerender, so the
signal returns the wide branch server-side and a phone is served the sidebar until hydration.
Show/hide is a discrete decision at first paint, which is exactly the case the signal cannot serve.
**Why a literal `48rem`**: a media query cannot read a `var()`, so it restates `--bp-md`. If Arena
moves that breakpoint, this number has to follow.

The same query decides the public top bar: below it "Ingresar" is drawn as an `arena-icon-button`
rather than a labelled one and the brand is **the mark alone**; above it the mark is joined by the
wordmark in an `arena-app-logo size="md"`. **Both branches are always in the markup and CSS picks
one**, which is the same reason the width decision is a query at all.

**The bar carries no section links, and its `nav` slot is empty.** The landing is the single public
door and names every public surface itself, so the bar holds the brand, the cart, the theme and
Ingresar and nothing else. Putting a link row back means putting the phone's `arena-menu` back with
it, and the section below is what that costs.

**The wordmark is what the phone cannot afford, and the cart is why.** `arena-app-bar`'s band is
`flex-wrap: wrap`, so a bar that stops fitting becomes two rows in silence rather than overflowing,
which is why no width measurement can catch it. The cart action only exists while `cart.count() > 0`,
so the narrow bar is at its tightest once the reader has bought something. This project runs
Arena's **comfortable** density, so every control in the bar is 48px, and `--gap-items` is 16: at
320px the band has 288px and the filled narrow bar wanted 298. The mark alone is 30px against the
`sm` lock-up's 95, and that is where the ten pixels came from. `.shell-brand__narrow` is the box
that gives the SVG its size and it reads `--logo-mark-sm`, so the mark stays exactly the size
`size="sm"` drew it. The anchor keeps its `aria-label`, and `BrandMark`'s host is `aria-hidden`, so
the link is named "Touno, inicio" in both branches whatever it draws. **The bar has one control's
worth of room and no more**: the measured band is 68px at 320 with a filled cart and 72px above it,
one row either way. The margin is the reason the rule stands, not a reason to spend it.

Two more pixels come from the style plugin, under the `22.5rem` query rather than this one, because
they are the bar's own spacing and not a layout: the band, the nav and the actions take `--sp-2`
for their gap, and the band re-answers `--dz-ctl-h` as `--dz-ctl-h-sm`. **44px still clears the
44px thumb target** Arena's comfortable density exists to meet, which is the whole reason that step
is takeable. Without them a two-digit count wrapped the bar again at 320.

## The bar gets out of the way

`scroll-away.ts` is the decision and it is a pure function: `nextBarScroll(held, y)` answers where
the bar should be, and `scroll-away.spec.ts` holds its rules: present at or under `REVEAL_ABOVE`,
away on a move down past `SETTLE_PX`, back on a move up past it, and unchanged for anything smaller,
so momentum never flickers the bar.

- **The listener only exists in the browser.** It is registered inside `afterNextRender`, the same
  move `theme-toggle.ts` makes and for the same reason: there is no `window` during prerender. The
  signal starts at `AT_TOP`, so the prerendered HTML and the first client render carry the same
  class list and hydration agrees.
- **It runs outside the zone.** `NgZone.runOutsideAngular` plus `{ passive: true }`, so a scroll
  does not run change detection per event; setting the signal is what schedules the tick.
  `DestroyRef.onDestroy` takes it back off, because `App` is created and destroyed per spec.
- **A navigation puts the bar back.** `NavigationEnd` resets to `{ away: false, at: window.scrollY }`,
  so a restored scroll position does not read as a jump.
- **The rule that moves it lives in `design/touno/plugin.css`**, because `arena-app-bar` is an
  Arena element: no class of ours may go on it, and `data-arena-part` is the contract. `App` owns
  the state and binds `[class.shell-bar-away]` on its own host; the plugin owns the part.
  `:focus-within` pins the bar open, so keyboard focus is never scrolled off screen.

The second query is `@media (width < 22.5rem)` in `src/styles.css`, and it changes no layout: it
re-answers `--gutter` as `--sp-4`, so the page padding steps from 24px to 16px on the narrowest
phones. It sits there rather than in `design/touno/plugin.css` because the plugin's sheet is wrapped
in `@layer arena-plugin` and the role values are emitted unlayered, which no layer can outrank.
Those sixteen pixels are what lets the app bar hold one row at 320.

Both navigation landmarks are named apart, "Panel de la sucursal" and "Accesos rápidos", and the
hidden one is `display: none`, which takes it out of the accessibility tree, so a screen reader never
meets both.

## Navigation

`panel-nav.ts` is the single destination table, keyed by role.

- **The bottom bar is derived from the rail's order, never from a flag.** `barDestinations()` takes
  the first `BAR_SLOTS` and `moreDestinations()` takes the rest; `app.html` draws a fourth column,
  **Más**, that opens an `arena-sheet` holding everything the bar could not. A `bar: boolean` on
  each destination would say the same thing as the order beside it and could only drift out of sync
  with it. `panel-nav.spec.ts` holds that bar and sheet together reconstruct the rail.
- **Más is why every role's Manual is reachable on a phone.** The bar holds `BAR_SLOTS`
  destinations, and every panel has more than that, so without the sheet each role hides whatever
  falls past the last slot. Every rail ends with its Manual, which is exactly what a bar alone would
  drop. The sheet also carries the theme and the salida, because signed in there is no app bar to
  carry them, and it carries them as the rail does: the salida is an icon with `Cerrar sesión` for
  its accessible name and no visible copy, so the row stays a row at 320px.
- **Más lights up for the destination it hides.** `barActiveId()` answers `mas` when `activeId()`
  names something inside `moreDestinations()`, or reading the Manual would leave the whole bar dark.
- **The sheet's actions need `ArenaFooter` in `imports`.** `[footer]` is a marker, and a marker
  written without its directive renders nothing at all, in silence.
- **`panelFor()` matches on a segment boundary**, comparing `path === prefix` or
  `path.startsWith(prefix + '/')`. A bare `startsWith` puts a public route behind a panel's gate the
  moment a panel prefix is another route's prefix, which several already are: `/rider` sits against
  the public `/riders`, `/plataforma` sits against a plural nobody has written yet, and the public
  `/restaurantes/:empresa/:sucursal` is three segments deep under a prefix a panel could plausibly
  claim. `panel-nav.spec.ts` holds each pair.
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
  `state-tag` follow: an outcome is worded once, not re-worded in every page that raises it.
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
box. **The glyph must not be computed from the current theme.** The server does not know it, since
`localStorage` is read by the inline script in `index.html`, in the browser, before Angular starts,
so a component that picked its own icon would prerender one glyph and hydrate to the other, which is
NG0500. Rendering both and letting CSS choose is what keeps the two renders identical, and it is the
same move the brand mark makes when it inverts. `theme-toggle.spec.ts` holds the pair.
