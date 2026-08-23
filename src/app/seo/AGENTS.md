# src/app/seo: head, constants, structured data

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
outranks it. Two constants in `app.routes.ts` do the outranking, and they carry the same string for
reasons that are not the same:

- **`PRIVATE`** is for what a stranger has no business reading: every panel route, `/ingresar`,
  `/404` and `**`.
- **`INVENTED`** is for the catalogue: `/restaurantes`, `/tiendas` and every empresa and sucursal
  under them. Those pages are public, complete and reachable by anyone, and what they describe does
  not exist yet.

Both name `site.ts:NOT_INDEXED`, so the string itself is written once.

**A component that calls `apply()` restates `robots` and wins.** `company` and `branch` set their
metadata from the record rather than from the route, so the route's constant is what
`../../../scripts/generate-sitemap.spec.ts` reads to decide which paths belong in the sitemap, and
the `apply()` call is what reaches the prerendered HTML. **They have to agree.** A route marked
`INVENTED` whose component still applies `index,follow` ships an indexed page under a green suite,
because nothing in the spec reads the artefact.

**A new public route inherits indexing and must be checked**, because the default was moved.

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

## The sucursal page is built to be indexed, and is held back until it is true

One page per sucursal is what a local search actually wants from a delivery business: a
`LocalBusiness` with a street address, opening hours and a city. That is the unit somebody types
into a search box, and it is why this surface exists at all rather than a tracking page, which is
only ever useful to the one person already holding the code.

**It carries `INVENTED` all the same, and the sitemap does not name it.** `COMPANIES` and `BRANCHES`
are fixtures: the empresas have no kitchens and the sucursales have no counters. A `LocalBusiness`
with a street address for a business nobody can walk into is a fabricated fact in a search index,
which is the `geo` rule below applied to the whole record rather than to one key. **The markup stays
complete and correct regardless**, so the day the empresas are real the change is taking `INVENTED`
off those routes and putting their entries back into
`../../../scripts/generate-sitemap.ts:sitemapEntries()`.

- **No `geo` and no `hasMap`, ever.** A `GeoPoint` in this tree is a position in the map component's
  viewBox, not a latitude and a longitude. Emitting it as one would be a fabricated fact in
  structured data. `../pages/public/branch/branch.spec.ts` fails if either key appears.
- **`makesOffer` carries what that sucursal has, not the empresa's whole catalogue**, because the
  availability belongs to the local and a crawler should not be told otherwise.
- **`parentOrganization` points every sucursal at its empresa**, which is what makes the two levels
  legible to a crawler rather than eighteen unrelated shops.
- `openingHoursSpecification` needs day codes (`Mo`, `Tu`, …); the map from the fixtures' Spanish
  day ranges lives in `../pages/public/branch/branch.ts` and a range with no entry emits an empty list
  rather than a wrong one.

## StructuredData

- `<app-structured-data key="…" [schema]="…" />` writes a `<script type="application/ld+json">`
  into `document.head`, tagged `data-schema="{key}"`.
- **The key is what keeps a re-render from duplicating it.** A key that varies with the record,
  `'sucursal-' + empresa + '-' + sucursal`, is what makes a client-side navigation between two
  sucursales replace the script instead of stacking two.
- `serialize()` escapes every `<` so no payload can close the script tag. Keep that.
- **The cleanup must not read `key()`.** `key` is an `input.required`, and Angular clears an input's
  value before it runs the view's destroy hooks, so a `DestroyRef.onDestroy` that looks the script up
  by `selectorFor(this.key())` throws **NG0950 during `destroyLView`**. A throw there aborts the
  teardown, so the router outlet never rebuilds and `<main>` disappears: every navigation from a
  panel route to a public one dies, which costs a signed-in reader the whole public marketplace. The
  component holds the element it wrote in a field, removes it there, and removes the previous one
  itself when the key changes. `structured-data.spec.ts` holds the destroy and the key change.
- **`ArenaMetadataService.apply()` prefixes `SITE_ORIGIN` onto `canonical`**, so pass a path, never
  an absolute URL. JSON-LD is the opposite: every `url` there is absolute.
