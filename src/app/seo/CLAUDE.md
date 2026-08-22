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

| Route                           | Schema                                          | Written by                     |
| ------------------------------- | ----------------------------------------------- | ------------------------------ |
| `/`                             | `WebSite` and `Organization`                    | `pages/public/home`            |
| `/restaurantes`, `/tiendas`     | `ItemList` of empresas                          | `pages/public/companies`       |
| `/restaurantes/:empresa`        | `Restaurant` with `department` and `makesOffer` | `pages/public/company`         |
| `/tiendas/:empresa`             | `Store` with `department` and `makesOffer`      | the same component             |
| `/:vertical/:empresa/:sucursal` | `Restaurant` / `Store` as a `LocalBusiness`     | `pages/public/branch`          |
| `/riders`                       | `WebPage`                                       | `pages/public/ride-with-us`    |
| every route with crumbs         | `BreadcrumbList`                                | `ArenaBreadcrumbs`, on its own |

Do not hand-write a `BreadcrumbList`; Arena already emits it.

## The sucursal page is the indexable surface

Retiring the public parcel tracking took twelve `noindex`-shaped pages out of the sitemap. What
replaced them is eighteen sucursal pages, and they are the better trade: a `LocalBusiness` with a
street address, opening hours and a city is the page a local search actually wants from a delivery
business, where a tracking page was only ever useful to the one person holding the code.

- **No `geo` and no `hasMap`, ever.** A `GeoPoint` in this tree is a position in the map component's
  viewBox, not a latitude and a longitude. Emitting it as one would be a fabricated fact in
  structured data. `pages/public/branch/branch.spec.ts` fails if either key appears.
- **`makesOffer` carries what that sucursal has, not the empresa's whole catalogue**, because the
  availability belongs to the local and a crawler should not be told otherwise.
- **`parentOrganization` points every sucursal at its empresa**, which is what makes the two levels
  legible to a crawler rather than eighteen unrelated shops.
- `openingHoursSpecification` needs day codes (`Mo`, `Tu`, …); the map from the fixtures' Spanish
  day ranges lives in `pages/public/branch/branch.ts` and a range with no entry emits an empty list
  rather than a wrong one.

## StructuredData

- `<app-structured-data key="…" [schema]="…" />` writes a `<script type="application/ld+json">`
  into `document.head`, tagged `data-schema="{key}"`.
- **The key is what keeps a re-render from duplicating it.** A key that varies with the record —
  `'sucursal-' + empresa + '-' + sucursal` — is what makes a client-side navigation between two
  sucursales replace the script instead of stacking two.
- `serialize()` escapes every `<` so no payload can close the script tag. Keep that.
- **The cleanup must not read `key()`, and once it did.** `key` is an `input.required`, and Angular
  clears an input's value before it runs the view's destroy hooks, so a `DestroyRef.onDestroy` that
  looked the script up by `selectorFor(this.key())` threw **NG0950 during `destroyLView`** — which
  aborts the teardown, so the outlet never rebuilt and `<main>` vanished from the page. It fired on
  every navigation from a panel route to a public one: a signed-in reader could not open
  `/restaurantes`, `/tiendas` or any sucursal page at all. The component now holds the element it
  wrote in a field, removes it there, and removes the previous one itself when the key changes.
  `structured-data.spec.ts` holds the destroy and the key change.
- **`ArenaMetadataService.apply()` prefixes `SITE_ORIGIN` onto `canonical`** — pass a path, never
  an absolute URL. JSON-LD is the opposite: every `url` there is absolute.
