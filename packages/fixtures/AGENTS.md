# packages/fixtures: the demo walk

Reserved. Nothing is here yet, and this page is what the first commit answers to.

## What moves here, and why it leaves the web app

The records the site reads today at build time: the empresas and their sucursales, the catalogue, the
orders in flight, the recruitments, the llamados, the reputation ledger, the manual. They live inside
the web app now, at
[`../../apps/frontend/web/src/app/domain/AGENTS.md`](../../apps/frontend/web/src/app/domain/AGENTS.md),
which states every rule they obey and every fact their specs hold.

They move when a second surface needs them, and the second surface is what makes the move worth
making: the same walk seeds the backend's development database, backs the previews the native apps
render, and feeds what the site prerenders. One scenario, four places, one edit when it changes.

## What binds them wherever they live

- **A fixture is read at build time and never fetched.** The site prerenders every route, so a
  record that does not exist when the build runs is a page that cannot be written to disk.
- **The fixtures are for walking, not only for consistency.** A set can be perfectly consistent and
  still leave a screen unreachable: no pickup arriving at the demo sucursal, no invitation for the
  demo rider to answer. When a screen arrives, a fixture reaches it or the screen is half a mock-up.
- **They carry no framework.** They are data and the types over it; the services that hold them in
  signals stay in the app that renders them.
- **They are not production data and never become it.** Seeding a development database is what they
  are for; a real order is a row the API wrote.
