# src/app/seo — head, constants, structured data

Two files: `site.ts` (the constants) and `structured-data.ts` (the JSON-LD writer).

## site.ts is the single source

- **`SITE_ORIGIN` is the one line to change when the domain changes.** It reaches
  `provideArenaMetadata`, every JSON-LD `url`, `SITE_IMAGE`, and the sitemap generator.
- Contact details live here too and are imported by the shell and the footer. **Never re-type a
  phone number or a URL in a template.**
- `public/robots.txt` hardcodes the sitemap URL. Changing `SITE_ORIGIN` means editing that file too.

## robots defaults to noindex

`ArenaMetadataService` treats a route as `noindex` until it says otherwise. This project sets
`robots: 'index,follow'` as the application-wide default in `app.config.ts`, and a route still
outranks it — every panel route, `/ingresar`, `/404` and `**` carry `noindex,follow` explicitly
through the `PRIVATE` constant in `app.routes.ts`. **A new public route inherits indexing and must
be checked**, because the default was moved.

## Which schema goes on which route

| Route                       | Schema                         | Written by                     |
| --------------------------- | ------------------------------ | ------------------------------ |
| `/`                         | `WebSite` and `Organization`   | `pages/public/home`            |
| `/restaurantes`, `/tiendas` | `ItemList`                     | `pages/public/merchants`       |
| `/restaurantes/:slug`       | `Restaurant` with `makesOffer` | `pages/public/merchant-detail` |
| `/tiendas/:slug`            | `Store` with `makesOffer`      | the same component             |
| `/seguimiento/:guia`        | `ParcelDelivery`               | `pages/public/tracking`        |
| every route with crumbs     | `BreadcrumbList`               | `ArenaBreadcrumbs`, on its own |

Do not hand-write a `BreadcrumbList`; Arena already emits it.

## StructuredData

- `<app-structured-data key="…" [schema]="…" />` writes a `<script type="application/ld+json">`
  into `document.head`, tagged `data-schema="{key}"`.
- **The key is what keeps a re-render from duplicating it.** A key that varies with the record —
  `'merchant-' + slug` — is what makes a client-side navigation between two detail pages replace
  the script instead of stacking two.
- `serialize()` escapes every `<` so no payload can close the script tag. Keep that.
- **`ArenaMetadataService.apply()` prefixes `SITE_ORIGIN` onto `canonical`** — pass a path, never
  an absolute URL. JSON-LD is the opposite: every `url` there is absolute.
