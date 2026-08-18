# Touno

A working mock-up of a last-mile logistics marketplace for Bolivia: food from restaurants and
parcels from import shops on one network, one cart and one tracking story. Angular 22 prerendered
to static HTML, skinned with Arena.

`README.md` documents the decisions and their reasoning. This file is the working contract: the
rules that hold across the tree, and the traps that already cost a session.

## Rules

### Comments

- **Write no comments. Anywhere. Ever.** Not in TypeScript, not in HTML, not in CSS, not in JSON.
- The comments the Angular CLI scaffolding shipped with were stripped on purpose. Do not
  reintroduce them, and do not restore them when regenerating a scaffolded file.
- `CLAUDE.md` and `README.md` are documentation, not code, and are exempt.

### Language

- **All code is English**: identifiers, types, file names, commit messages, test names, and every
  string that is not shown to a person.
- **All documentation is English too**, which is where this project differs from Fragancia: both
  `README.md` and every `CLAUDE.md` are written in English.
- **Spanish is for two things only**: app route paths (`/importadora/envios`) and user-facing UI
  copy. Arena's own rule says copy must be English; this project overrides it deliberately,
  because the business speaks Spanish. Do not "fix" Spanish copy.

### Stack

- Bun is the package manager and the script runtime. Never `npm`, never `yarn`, never `npx` where
  `bunx` works.
- Angular 22 on `@angular/build`: Vite in dev, esbuild in build. There is no webpack config.
- `@angular/ssr` with `outputMode: "static"`. **Every route is prerendered and there is no server
  at runtime.** Nothing may depend on a request, a header, a cookie, or a runtime environment
  variable. A new dynamic route needs an entry in `src/app/app.routes.server.ts` with
  `getPrerenderParams`, or it will not exist in the output.

### Design system

`@dravensoft/arena-angular` 10.0.1 carries the language; `arena.config.json` plus `design/touno/`
carry the skin. Hold these:

- **No class of ours on an Arena element.** Put the class on a container we own and let the Arena
  element be its child.
- **No rule targeting an `arena-*` class.** Those names are compiler output, not a contract.
  `data-arena-part` hooks are the contract, and only `design/touno/plugin.css` may select them.
- **Every value is read through its token.** No hex, no `rgb()`, no colour name, no bare pixel
  length. Derive with `calc()`, `clamp()` or `color-mix()` over a token.
- **Icons are Phosphor class strings**, `class="ph-bold ph-truck"` or `icon="…"`, never an element
  and never inline SVG. The one inline SVG in the tree is the brand mark, and it is ours.
- **No emoji, and no glyph standing in for one.** A row of `★` characters is reported by the audit
  as an emoji and is not how this system draws a rating.
- **No gradients** and **no shadows**, on any surface. Every one of the five shadow roles is
  answered with an all-zero literal, because the identity expresses depth as a 1px hairline.
- **One primary accent per view.** Amber is the brand's own mark and the "in motion" state, never
  a second primary.
- **Danger is outline**, never filled.

### Rhythm

- **Air between components comes from Arena's rhythm classes**: `.arena-stack` and `.arena-row`,
  with `--group` / `--component` / `--section` for the step. Put one on a container we own.
- **Never hand-write `display: flex` + `gap` to separate components.** The two grids in the tree
  that are not rhythm — the panel shell's rail-and-column frame and the milestone timeline's
  bullet-and-body row — are page frames rather than rhythm, and both read their gap from a token.
- `--gap-control` and `--gap-inline` are for composition _inside a single control_ and nothing else.

### Money, codes and hours

- **Every figure a person would dictate or copy by hand goes in the mono face**: waybill codes,
  amounts, times, dates, plates. Put `.arena-num` on the element that holds it.
- **`mono: true` on an `ArenaTableColumn` is for identifiers only.** It carries the mono face _and_
  the identifier ink, so a money column set that way reads as a code. Money and time columns take
  `align: 'right'` and a `<span class="arena-num">` in the cell.
- `bs()` in `src/app/domain/format.ts` is the only place a boliviano is formatted. Bolivian
  convention is dotted thousands and a comma decimal: `Bs 2.730,50`.

### Fonts

- Archivo (display and body) and IBM Plex Mono at 400/500/600 are self-hosted from `public/fonts/`.
  Arena's three slots are declared in `arena.config.json`; the two mono weights Arena's single
  `src` cannot carry are ordinary `@font-face` rules in `src/styles.css`.
- **Nothing may request `fonts.googleapis.com` or `fonts.gstatic.com`.** A `src` pointing at a
  Google stylesheet in `arena.config.json` is a regression, not a shortcut.

### SEO

SEO is a first-class requirement, not a finishing pass. A new public route is not done until it has:

- a `title` and an `arenaRouteMeta` `description` (or an `ArenaMetadataService.apply()` call when
  the metadata is a fact about the record, not about the route);
- a canonical and the `og:*` pair, which follow from `origin` being configured;
- the right JSON-LD, via `<app-structured-data>`;
- an entry in the generated `sitemap.xml`, which follows from the fixtures;
- **complete HTML at prerender time.**

Every panel route carries `noindex,follow` and is not in the sitemap.

### Formatting and lint

- Prettier follows the Angular convention (`.prettierrc`): 100 columns, single quotes in TS,
  **double quotes in CSS**, `parser: angular` for templates.
- `angular-eslint` on top, with `eslint-config-prettier` last so the two never argue.
- Tests are Vitest through `@angular/build:unit-test`. Run them with `bun run test`, not `vitest`.

## Commands

```bash
bun install
bun start              # dev server on 0.0.0.0:4200
bun run build          # prerenders every route into dist/touno/browser
bun run test           # Vitest
bun run lint           # angular-eslint
bun run format         # Prettier over the tree (format:check to verify only)
bun run audit:arena    # arena-to-prod report over src and design, writes nothing
bun run serve:static   # serves the build on :4173
```

`prestart`, `prebuild` and `pretest` all run `prepare:assets`, which regenerates
`public/sitemap.xml` and the three generated stylesheets.

## Build products — never edit, never commit

- `src/arena.generated.css`
- `src/icons.generated.css`
- `src/plugin.generated.css`
- `public/sitemap.xml`

All four are in `.gitignore`, `.prettierignore` and the ESLint `ignores` list. To change what they
contain, change their source — `arena.config.json`, `design/touno/`, or the fixtures — and run
`bun run prepare:assets`.

## GitHub Pages is the mock-up, not the site

`.github/workflows/pages.yml` publishes every push to `main`. That is a showroom; `touno.bo` is
the site.

- **The tree stays configured for the root of the real domain.** `SITE_ORIGIN` is
  `https://touno.bo`, `<base href>` is `/`, `robots.txt` allows everything.
- The subpath is a build flag: `bun run build --base-href=/touno/`.
- **A URL our own code writes must go through `Location.prepareExternalUrl()`**, because
  `--base-href` reaches `routerLink` and nothing else. `merchant-card` does it for the card's
  `href` and its cover, and `merchant-card.spec.ts` holds both cases.
- `ArenaBreadcrumbs` takes `href` already prefixed, so the handler strips the base back off with
  `Location.normalize()` before handing the path to the router.
- The SEO going to sleep lives in `scripts/pages-preview.ts` and runs only in the workflow. So
  does the rebasing of everything `--base-href` cannot reach: the `url()` in the built stylesheet,
  **the `url()` in the critical CSS Angular inlines into every prerendered page**, and the `href`
  of every preload link, which the browser's preload scanner fetches before `<base>` applies.

## Gotchas

Each of these was paid for once. Do not rediscover them.

- **`ArenaThemeService` throws during prerender.** Its constructor reaches
  `document.defaultView.matchMedia`, and the DOM `@angular/platform-server` ships has
  `defaultView` and no `matchMedia`, so the optional chain does not save you. `theme-toggle.ts`
  resolves the service inside `afterNextRender` and renders identical markup on both sides.
- **The role lives in memory only, and the theme persists.** A guard returning a `UrlTree` during
  hydration is NG0500, so the panel gate is a render decision (`@if (unlocked())`) rather than a
  redirect, and the role is deliberately not in `localStorage` so server and first client render
  agree. The theme _is_ persisted, and may be, because its class sits on `<html>`, which
  hydration never claims.
- **A panel prefix must match on a segment boundary.** `'/restaurantes'.startsWith('/restaurante')`
  is true, and it once put the public restaurant listing behind the merchant panel's gate.
  `panelFor()` in `layout/panel-nav.ts` compares `path === prefix || path.startsWith(prefix + '/')`.
- **`ArenaSwitch` reports `requestChange` with no payload.** The host owns the state, so the
  handler flips the value it already holds; binding `$event` is a type error.
- **`ArenaTableRow` and `ArenaTableCell` are attribute selectors on real elements**,
  `<tr arena-table-row>` and `<td arena-table-cell>`, not `<arena-table-row>`. Writing the element
  form compiles to "not a known element" _and_ "the directive is unused" at the same time.
- **`ArenaCard`'s slot is `action`, singular**, and `ArenaPageHead`'s is `actions`. A marker
  written without its directive in `imports` renders nothing, silently.
- **An `@else` block with more than one root node cannot fill a projection slot.** Wrap the block's
  content in one container of your own.
- **`--bp-*` does not resolve during prerender**, so `arenaViewportBelow` always returns the wide
  branch server-side. The one width decision in this project is a media query for exactly this
  reason, in `app.css`.
- **Prettier must keep double quotes in CSS.** `arena-to-prod` detects part hooks by matching
  `data-arena-part="..."`; single quotes make it blind to the whole style plugin.
- **`arena-to-prod` reports `arena-stack` and `arena-row` as unknown components.** They are rhythm
  classes, not components. False positive, harmless, expected in every run.
- **The dark ramp reports "below 3:1 vs surface".** The four cool `cat-*` slots do not clear 3:1
  against `noche`'s card. Arena's own dark ramp is kept because lightening those four destroys the
  CVD separation the same gate checks, and every Arena chart ships visible labels and an
  accessible table, which is the relief the report asks for.
- **Ink from the page does not reach a dark band we drew.** A neutral `ArenaTag` inside the
  shipment header's ink surface is invisible, because the tag reads `--ink-body`. Keep status
  tags out of the dark band.

## Verification checklist

Run all of these before claiming work is done:

```bash
bun run build
bun run test
bun run lint
bunx prettier --check .
bunx arena-to-prod --src src --src design --audit
```

Then check by hand, because nothing above checks them:

- **No horizontal overflow from 320px up.** Sweep 320, 360, 390, 768, 1024 and 1440 across the
  routes of all four roles: `documentElement.scrollWidth` must equal `clientWidth`, and nothing
  outside a container that declares `overflow-x` may cross the viewport's right edge.
- **No external font requests.** Nothing to `fonts.googleapis.com` or `fonts.gstatic.com`.
- **The skip link is the first tab stop**, and it lands on the main region.
- **Both palettes look right on the page**, including the brand mark, which inverts under `noche`.
