# Touno, for whoever changes it

Touno is a last-mile logistics marketplace for Bolivia: food from restaurant branches and goods
from import shops on one network, one cart, one code and one tracking story. It is reached three
ways, by a site and by a native app on each phone platform, and it is served by one backend of its
own.

The vocabulary the whole tree speaks: a business is an **empresa** and at least one **sucursal**; a
**rider** is a free agent bound to a sucursal only by a recruitment both sides accepted; an **order**
is one entity for both verticals and its **code belongs to the buyer**. The model in full is
[`apps/frontend/web/src/app/domain/AGENTS.md`](./apps/frontend/web/src/app/domain/AGENTS.md), and
what the business promises the people who use it is [`TOUNO_STRUC.md`](./TOUNO_STRUC.md), and what
it charges for is [`TOUNO_DINERO.md`](./TOUNO_DINERO.md).

**This file routes. Read only what your task needs.**

## The four axes

| Axis                                         | What is under it                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| [`apps/AGENTS.md`](./apps/AGENTS.md)         | everything that gets deployed: the three surfaces, the API, the integrations |
| [`packages/AGENTS.md`](./packages/AGENTS.md) | what more than one app needs: the contract, the demo walk                    |
| [`tools/AGENTS.md`](./tools/AGENTS.md)       | what reads the whole tree rather than one app: the gates                     |
| [`infra/AGENTS.md`](./infra/AGENTS.md)       | how the tree runs in containers                                              |

## Where each decision goes

**The first rows are indexed by symptom rather than by subject**, because a reader arriving with one
does not yet know which layer they are changing, and that is the state a table indexed only by
subject has no row for.

| I am here because                                                                                         | Start at                                                                                                                        |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| a page throws at prerender, or renders differently after hydration, and I do not know which layer owns it | [`apps/frontend/web/src/app/AGENTS.md`](./apps/frontend/web/src/app/AGENTS.md), the prerender contract, then the level it names |
| an Arena component does not take what I wrote, or takes it and draws nothing                              | the idiom table in [`apps/frontend/web/src/app/AGENTS.md`](./apps/frontend/web/src/app/AGENTS.md)                               |
| something crosses the right edge of a phone                                                               | [`apps/frontend/web/tools/overflow-sweep/AGENTS.md`](./apps/frontend/web/tools/overflow-sweep/AGENTS.md)                        |
| what the business promises a person                                                                       | [`TOUNO_STRUC.md`](./TOUNO_STRUC.md), which is the product and the document a change is argued against                          |
| what Touno charges, who funds a promotion, what a plan sells                                              | [`TOUNO_DINERO.md`](./TOUNO_DINERO.md), the product document's sibling, argued against the same way                             |
| an order, a recruitment, a fare, a reputation figure, a fixture                                           | [`apps/frontend/web/src/app/domain/AGENTS.md`](./apps/frontend/web/src/app/domain/AGENTS.md)                                    |
| the rail, the app bar, the gate, the theme, a notice                                                      | [`apps/frontend/web/src/app/layout/AGENTS.md`](./apps/frontend/web/src/app/layout/AGENTS.md)                                    |
| a routed page, in any of the six lanes                                                                    | [`apps/frontend/web/src/app/pages/AGENTS.md`](./apps/frontend/web/src/app/pages/AGENTS.md), then that lane's own                |
| a component Arena does not ship                                                                           | [`apps/frontend/web/src/app/shared/AGENTS.md`](./apps/frontend/web/src/app/shared/AGENTS.md)                                    |
| a title, a canonical, a JSON-LD node, the sitemap                                                         | [`apps/frontend/web/src/app/seo/AGENTS.md`](./apps/frontend/web/src/app/seo/AGENTS.md)                                          |
| how anything is allowed to look: a colour, a step, a class, an icon                                       | [`apps/frontend/web/design/AGENTS.md`](./apps/frontend/web/design/AGENTS.md)                                                    |
| a value the skin answers with                                                                             | [`apps/frontend/web/design/touno/AGENTS.md`](./apps/frontend/web/design/touno/AGENTS.md), the style kernel                      |
| a build-time script                                                                                       | [`tools/AGENTS.md`](./tools/AGENTS.md)                                                                                          |
| a gate, or a claim I want something to fail on                                                            | [`tools/check/AGENTS.md`](./tools/check/AGENTS.md)                                                                              |
| whether the file in front of me is mine to edit                                                           | [`GENERATED.md`](./GENERATED.md), read before the edit and not after the gate                                                   |
| I am about to write down that something is wrong                                                          | [`DOUBTS.md`](./DOUBTS.md), which says what counts as a debt here and which records beat a paragraph                            |

**Nothing below the table routes.** What follows binds a change whatever it is, so it is read once
and not per task.

## What the tree is, and what that forbids

- **This is a monorepo, and the four axes above are the whole of its shape.** An app is deployed, a
  package is shared, a tool reads the tree, and infra runs it. Anything that does not fit one of
  those does not have a home here yet, and inventing a fifth axis is a decision rather than a
  placement.
- **An app never imports another app's source.** What two apps both need becomes a package. The rule
  and its reason are [`apps/AGENTS.md`](./apps/AGENTS.md).
- Bun is the package manager and the script runtime. Never `npm`, never `yarn`, never `npx` where
  `bunx` works. **The workspace root delegates and does not reimplement**: `bun run build` at the
  root builds the surfaces that have a build, and each app's own manifest says how.
- **A command is defined once, in the manifest nearest what it runs.** A page names a command that
  the manifest above it declares, which is what `bun run check:vocabulary` reads, and a page under
  an app names that app's commands rather than the root's.
- The site is Angular 22 on `@angular/build`, with `@angular/ssr` at `outputMode: "static"`.
  **Every route is prerendered and there is no server at runtime.** Nothing on that surface may
  depend on a request, a header, a cookie, or a runtime environment variable, and **the API is
  reached after hydration or not at all**. A new dynamic route needs an entry in
  `apps/frontend/web/src/app/app.routes.server.ts` with `getPrerenderParams`, or it does not exist
  in the output.

## Comments

- **Write no comments. Anywhere. Ever.** Not in TypeScript, not in HTML, not in CSS, not in JSON,
  not in C#, Kotlin or Swift. `bun run check:docs` fails one.
- **One shape is admitted, and it is admitted because something downstream fails without it**: an
  XML documentation line on a public C# member, which the specification generator reads to write the
  contract the clients are generated from. Loose prose inside a method is a comment and fails like
  any other. The exemption carries its own reason inside the gate, so it fails when it stops being
  true.
- The comments the Angular CLI scaffolding ships with are stripped on purpose. Do not reintroduce
  them, and do not restore them when regenerating a scaffolded file.
- A gate states its reason in an exported reason string and in its row in
  [`tools/check/AGENTS.md`](./tools/check/AGENTS.md), which is the better record: a stale entry
  fails its own gate and a stale comment fails nothing.
- The Markdown documents are documentation rather than code, and are exempt.

## Language

- **All code is English**: identifiers, types, file names, commit messages, test names, and every
  string that is not shown to a person.
- **All documentation is English too.** [`TOUNO_STRUC.md`](./TOUNO_STRUC.md) is the one exception and
  it is deliberate: it is written for the Bolivian business that will use Touno and comment on it,
  not for whoever builds it.
- **Spanish is for two things only**: app route paths (`/importadora/envios`) and user-facing UI
  copy. Arena's own rule says copy must be English; this project overrides it deliberately, because
  the business speaks Spanish. Do not "fix" Spanish copy.

## Documentation rules

The tree answers to [the AGENTS.md convention](https://agents.md): a page at the root, a page per
level resolved by proximity, and a command an agent runs because a page listed it. `CLAUDE.md` is a
symlink to this file, which is the migration answer that convention publishes.

- **A fact belongs to exactly one page**, the level that owns the code it describes. A restatement
  one level up fails nothing, so it is the copy that goes stale. `bun run check:agents` holds the
  tree's shape and nothing holds this rule, which is why it is stated first.
- **A level is reachable by a link from this page and not only by being nearest.** Proximity hands
  an agent the closest page and hands a reader nothing.
- **Every document stays under 60,000 characters.** The way a budget is bought back is always the
  same: move a level's own tour into that level's page and leave a pointer. A document with no page
  beneath it to hand a tour to takes a named allowance instead, which carries the reason it was
  raised and expires by itself; [`tools/check/AGENTS.md`](./tools/check/AGENTS.md) owns that.
- **Documentation is written in the present tense** and describes what Touno is, never what it was,
  when a part of it arrived, or what a change replaced. The reason a rule exists is not history and
  stays: state it as a property of the thing, not as an incident. **This is the one rule no gate
  holds**, because nothing mechanical can judge it.
- **No document carries a bare tally of anything that grows.** A count is admissible only where the
  sentence carrying it enumerates what it counts, so a reader can check it on the spot, or where an
  assertion holds it. A measurement is not a tally and stays: a pixel width, a millisecond ceiling
  and a breakpoint are knowledge a rename cannot express. A number an assertion holds is better than
  a command, and a number nothing holds is the defect this rule exists to stop.
- **Documentation punctuates with a colon, a comma, a semicolon or a full stop, never with an em
  dash.** A dash pair enclosing an aside becomes commas, or parentheses where commas would nest; a
  dash that amplifies or introduces a list becomes a colon; a dash marking a turn becomes a
  semicolon or a second sentence. An en dash between two numbers is a range and stays. The rule
  reaches prose only, so a fence and a code span keep what the code they quote contains.
- **Prose cites code as `<path>/<file>.ts:<member>(<parameters>)` and never by line number.** A line moves
  under the next edit and takes every citation with it in silence, while a member carries its own
  address. `bun run check:citations` holds both halves, and **the member half is the one that goes
  wrong quietly**: a citation naming the wrong file with the right member sends a reader somewhere
  confident and empty, and nothing about the sentence carrying it looks wrong.
- **A path in prose is read from three places: the root of the tree, beside the page, and the root
  of the package that holds the page.** That last one is what lets a page inside an app name a path
  like `<app>/src/styles.css` by its tail alone and mean its own, so an app's documentation survives
  the app being moved. A page that belongs to no package has only the first two.
- **A debt is paid, or made loud, before it is written down.** [`DOUBTS.md`](./DOUBTS.md) states what
  counts as one and which records beat a paragraph.

## Formatting and lint

- Prettier follows the Angular convention (`.prettierrc`): 100 columns, single quotes in TS,
  **double quotes in CSS**, `parser: angular` for templates.
- **Prettier must keep double quotes in CSS.** `arena-to-prod` detects part hooks by matching
  `data-arena-part="..."`; single quotes make it blind to the whole style plugin.
- `angular-eslint` on top, with `eslint-config-prettier` last so the two never argue.
- Tests are Vitest through `@angular/build:unit-test`. Run them with `bun run test`, not `vitest`.
  The suite covers `scripts/` as well as `src/`.

## GitHub Pages is the site

`.github/workflows/pages.yml` publishes every push to `main`, and what it publishes is the live
site: **`touno.dravensoft.org`, served from the root of its own subdomain**. `SITE_ORIGIN` is
`https://touno.dravensoft.org`, `<base href>` is `/`, and `robots.txt` allows everything and names
the sitemap. **Nothing in the build puts the SEO to sleep**, which is the whole arrangement: the
artefact a push produces is the one a crawler reads, so a canonical, a JSON-LD `url` and a sitemap
`loc` are all claims about a host that answers. Which routes make that claim, and which are held
back because the businesses on them are fixtures, is
[`apps/frontend/web/src/app/seo/AGENTS.md`](./apps/frontend/web/src/app/seo/AGENTS.md).

**`apps/frontend/web/public/CNAME` is what binds the artefact to that host.** GitHub Pages reads it from the root of
the upload, and a build that ships without it answers at the repository subpath instead, where every
absolute URL the tree writes points at a name the artefact no longer claims. The other half of the
binding lives outside the tree: a `CNAME` record in Cloudflare sending `touno` to
`dravensoft-dev.github.io`, **DNS only rather than proxied**, because GitHub issues the certificate
for the subdomain itself and the orange cloud stands between it and its own challenge.

`--base-href` reaches `routerLink` and nothing else, so **a URL our own code writes goes through
`Location.prepareExternalUrl()`**, which is what keeps an href correct whatever base a build is
given. Who does it and why is stated where the code is:
[`apps/frontend/web/src/app/layout/AGENTS.md`](./apps/frontend/web/src/app/layout/AGENTS.md) for a rail destination and a breadcrumb, and
[`apps/frontend/web/src/app/shared/AGENTS.md`](./apps/frontend/web/src/app/shared/AGENTS.md) for a card's href and its cover.

## Commands

Every one of these runs from the root of the monorepo, and each delegates to the app that owns the
work:

```bash
bun install
bun run dev            # the development stack in containers, the site on :4200
bun start              # the site's dev server on the host, on 0.0.0.0:4200
bun run build          # prerenders every route into apps/frontend/web/dist/touno/browser
bun run check          # every gate, then the suites, the lint, the format and the Arena audit
bun run test           # the site's suite, then the gates' own
bun run lint           # angular-eslint over the site, then the linter over tools
bun run format         # Prettier over the tree (format:check to verify only)
bun run audit:arena    # arena-to-prod over the site's src and design/touno
bun run serve:static   # serves the build on :4173
bun run sweep:overflow # the horizontal-overflow walk, against a running serve:static
```

**`bun run dev` and `bun start` are two ways to the same page**, and the difference is where it
runs: the first builds the image and serves from the container, the second uses the host's own
toolchain. [`infra/AGENTS.md`](./infra/AGENTS.md) owns the first.

`prestart`, `prebuild` and `pretest` all run `prepare:assets`, which regenerates the sitemap and the
three generated stylesheets. What they write and who owns it is [`GENERATED.md`](./GENERATED.md).

## Verification

```bash
bun run check
bun run build
```

Then check by hand, because nothing above checks them. Each names the page that explains what you
are looking at:

- **The gates looked at the tree you think they did.** Every gate refuses an empty subject rather
  than reporting a clean sweep over it, so after anything moves, the question is how many documents
  and sources were read and whether that is the number you expect.
  [`tools/check/AGENTS.md`](./tools/check/AGENTS.md).
- **The container serves the same page the host does.** `bun run dev`, then the site on
  `localhost:4200`, and an edit on the host reaching the browser. [`infra/AGENTS.md`](./infra/AGENTS.md).

- **No horizontal overflow from 320px up.** `bun run serve:static`, then `bun run sweep:overflow`.
  **A wrapped bar is not an overflow and no width measurement can see one**, so when you change what
  the app bar holds, look at its height by hand as well.
  [`apps/frontend/web/src/app/layout/AGENTS.md`](./apps/frontend/web/src/app/layout/AGENTS.md) says why, and
  [`apps/frontend/web/tools/overflow-sweep/AGENTS.md`](./apps/frontend/web/tools/overflow-sweep/AGENTS.md) says what the sweep does
  see.
- **No external font requests.** Nothing to `fonts.googleapis.com` or `fonts.gstatic.com`.
  [`apps/frontend/web/design/AGENTS.md`](./apps/frontend/web/design/AGENTS.md).
- **The skip link is the first tab stop**, and it lands on the main region.
- **Both palettes look right on the page**, including the brand mark, which inverts under `noche`,
  and the route map in both its live and its `stale` state.
  [`apps/frontend/web/src/app/shared/AGENTS.md`](./apps/frontend/web/src/app/shared/AGENTS.md).
- **Walk the four order journeys end to end**, switching profiles as the parcel changes hands, and
  the recruitment, load-reception and reputation-floor walks beside them. Which fixture reaches
  which screen is [`apps/frontend/web/src/app/domain/AGENTS.md`](./apps/frontend/web/src/app/domain/AGENTS.md), under
  `Fixtures are for walking`.
- **Read the Manual from every rail**, and confirm each lands on its own role and offers the way back
  into the panel it left. `/manual/*` is public, so its prerendered HTML must be complete. On a phone
  every one of them is reached through **Más**.
  [`apps/frontend/web/src/app/pages/public/AGENTS.md`](./apps/frontend/web/src/app/pages/public/AGENTS.md).
- **Walk the landing as the one public door**, and confirm each of its cards reaches the surface it
  names. Then sign in and confirm the rail follows you onto a public route.
- **The present-tense rule**, which no gate holds. Read what you changed end to end.
