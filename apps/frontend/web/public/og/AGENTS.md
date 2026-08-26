`touno.png` is the Open Graph card: the preview a link to Touno draws when it is shared on
WhatsApp, Telegram, Facebook, X, Slack or iMessage. It is declared once, as `SITE_IMAGE` in
`src/app/seo/site.ts`, and reaches every prerendered page through `provideArenaMetadata` as
`og:image`.

**1200×630** is the 1.91:1 frame those platforms crop to. Below roughly 600×315 several of them
drop the image and render the link as plain text.

It matters more here than on an ordinary site, because the most-shared Touno link is not the
landing page: it is a sucursal's own, `touno.dravensoft.org/restaurantes/pollos-copacabana/miraflores`, which
a branch sends to its customers and a buyer forwards to whoever is eating with them. That preview
is the first time the recipient meets the brand.

The source is `design/og/card.html`, drawn from the same parts the app uses (Archivo, the
Phosphor bold glyphs and the identity's three colours), so the mark on the card and the mark in
the product stay the same sign. Regenerate it by opening that file in a browser at a 1200×630
viewport and screenshotting it.
