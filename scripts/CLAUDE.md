# scripts — the build-time helpers

Four Bun TypeScript files. They import the app's own fixtures so nothing is stated twice. The
first three are dependency-free, using only `node:fs` and `node:path`, and run inside the build.
`overflow-sweep.ts` is the exception on both counts: it drives a real browser, so it needs
`playwright-core` and a Chrome on the machine, and nothing runs it for you.

- `generate-sitemap.ts` — writes `public/sitemap.xml` from `COMPANIES` and `BRANCHES`, plus the four
  static public routes. Runs in `prepare:assets`. **The count it prints must equal the number of
  prerendered pages carrying `index,follow`**; they are 30 and 30 today, and a mismatch means either
  a public route was added without a sitemap entry or a panel route lost its `PRIVATE` marker.
- `emit-404.ts` — copies the prerendered `404/index.html` up to `404.html`, because a static host
  serves the not-found page from the root. Exits 1 if the route was not prerendered.
- `overflow-sweep.ts` — the horizontal-overflow check the root checklist asks for by hand, which
  nothing else in the tree performs. `bun run serve:static` first, then `bun run sweep:overflow`;
  it signs in as each of the seven profiles and walks the rail of that profile plus every detail
  route the fixtures can name, at 320, 360, 390, 768, 1024 and 1440. It fails when
  `documentElement.scrollWidth` exceeds `clientWidth` and names the elements crossing the right
  edge, ignoring any that sit inside a container declaring `overflow-x`, which is the carve-out the
  rule itself makes. `SWEEP_BASE` points it at another origin and `CHROME` at another browser.
- `pages-preview.ts` — the GitHub Pages step. Sets every `robots` meta to `noindex,nofollow`,
  replaces `robots.txt` with `Disallow: /`, deletes the sitemap, and rebases three kinds of URL
  that `--base-href` cannot reach:
  - `url()` inside the built stylesheet, because CSS resolves it against the sheet and not `<base>`;
  - `url()` inside the **critical CSS Angular inlines into every prerendered page**, which is a
    second copy of the same `@font-face` rules and the reason fonts still 404ed after the sheet
    was fixed;
  - the `href` of every `<link rel="preload">`, because the browser's preload scanner fetches
    before `<base>` is applied.

## Rules

- **The sweep navigates without reloading, and it must.** The profile lives in a signal and not in
  `localStorage`, so a reload signs you out and a panel route entered by URL renders the gate
  instead of the page. It clicks a profile on `/ingresar` and then moves with `history.pushState`
  plus a `popstate` event, which the router listens to and the session survives.
- **The sweep cannot find pages by following links.** Table rows navigate through
  `[interactive]` and `(activate)`, not through an `href`, so a link crawler reports every list
  page clean without ever opening a detail page — which is where the route map and the chat
  thread live. It builds those routes from the fixtures instead.
- **No script writes a source file.** They write into `public/` and into `dist/`, and nowhere else.
- **A script that finds nothing to do exits 1.** `emit-404.ts` is the example: a silent success
  there would ship a mock-up whose 404 is a blank page.
- `pages-preview.ts` deliberately does **not** strip canonical, `og:*` or JSON-LD. Removing nodes
  from prerendered HTML throws NG0500 on hydration, and a sleeping `robots` meta is enough.
