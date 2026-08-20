# scripts — the build-time helpers

Three dependency-free Bun TypeScript files, using only `node:fs` and `node:path`. They import the
app's own fixtures so nothing is stated twice.

- `generate-sitemap.ts` — writes `public/sitemap.xml` from `COMPANIES` and `BRANCHES`, plus the four
  static public routes. Runs in `prepare:assets`. **The count it prints must equal the number of
  prerendered pages carrying `index,follow`**; they are 30 and 30 today, and a mismatch means either
  a public route was added without a sitemap entry or a panel route lost its `PRIVATE` marker.
- `emit-404.ts` — copies the prerendered `404/index.html` up to `404.html`, because a static host
  serves the not-found page from the root. Exits 1 if the route was not prerendered.
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

- **No script writes a source file.** They write into `public/` and into `dist/`, and nowhere else.
- **A script that finds nothing to do exits 1.** `emit-404.ts` is the example: a silent success
  there would ship a mock-up whose 404 is a blank page.
- `pages-preview.ts` deliberately does **not** strip canonical, `og:*` or JSON-LD. Removing nodes
  from prerendered HTML throws NG0500 on hydration, and a sleeping `robots` meta is enough.
