# design: how anything in Touno is allowed to look

`@dravensoft/arena-angular` carries the language; `arena.config.json` and the directories here carry
the skin. This page is the rules a builder holds whatever they are drawing.
[`touno/AGENTS.md`](./touno/AGENTS.md) is the style kernel, meaning the values those rules resolve
to. [`public/og/AGENTS.md`](../public/og/AGENTS.md) is the share card that source draws.

| Path                | What it is                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `arena.config.json` | the palettes, the fonts and the `stylePlugins` list. Arena's own colours never reach this build |
| `touno/`            | the style plugin: the roles, in DTCG form, and the motifs no role expresses                     |
| `og/card.html`      | the source the Open Graph image is screenshotted from                                           |

Three stylesheets and the sitemap are emitted from these by `bun run prepare:assets` and are never
edited. [`GENERATED.md`](../../../../GENERATED.md) says which files and why.

## The rules that bind every screen

- **No class of ours on an Arena element.** Put the class on a container we own and let the Arena
  element be its child.
- **No rule targeting an `arena-*` class.** Those names are compiler output, not a contract.
  `data-arena-part` hooks are the contract, and only `touno/plugin.css` may select them.
- **Every value is read through its token.** No hex, no `rgb()`, no colour name, no bare pixel
  length. Derive with `calc()`, `clamp()` or `color-mix()` over a token.
- **A role re-answered under a media query goes in `src/styles.css`, not in the plugin.**
  `plugin.generated.css` is wrapped in `@layer arena-plugin` and the role values are emitted
  unlayered, and no layer outranks unlayered. The narrow `--gutter` step is the one case.
- **The style plugin answers the roles the kernel asks and no more.** Adding a role of your own, map
  stroke widths for instance, is refused. Derive with `calc()` over an existing token inside the
  component's own stylesheet, which is what `src/app/shared/route-map` does.
- **Icons are Phosphor class strings**, `class="ph-bold ph-truck"` or `icon="…"`, never an element
  and never inline SVG. The three inline SVGs in the tree are ours and are argued for in
  [`src/app/shared/AGENTS.md`](../src/app/shared/AGENTS.md).
- **No emoji, and no glyph standing in for one.** A row of star characters is reported by the audit
  as an emoji and is not how this system draws a figure.
- **No gradients** and **no shadows**, on any surface. Every shadow role is answered with an all-zero
  literal, because the identity expresses depth as a 1px hairline.
- **One primary accent per view.** Amber is the brand's own mark and the "in motion" state, never a
  second primary.
- **Danger is outline**, never filled. Arena enforces it by making `danger` a button variant.

## Rhythm

- **Air between components comes from Arena's rhythm classes**: `.arena-stack` and `.arena-row`, with
  `--group`, `--component` and `--section` for the step. Put one on a container we own.
- **Never hand-write `display: flex` plus `gap` to separate components.** The two grids in the tree
  that are not rhythm, the panel shell's rail-and-column frame and the milestone timeline's
  bullet-and-body row, are page frames rather than rhythm, and both read their gap from a token.
- `--gap-control` and `--gap-inline` are for composition **inside a single control** and nothing else.

## Figures a person would dictate

- **Every figure a person would dictate or copy by hand goes in the mono face**: order codes,
  amounts, times, dates, plates. Put `.arena-num` on the element that holds it. What that means
  inside a table is [`src/app/AGENTS.md`](../src/app/AGENTS.md).
- `bs()` in `src/app/domain/format.ts` is the only place a boliviano is formatted. Bolivian
  convention is dotted thousands and a comma decimal: `Bs 2.730,50`.
- **No copy anywhere writes "km".** A distance in this tree is in plane units, because a `GeoPoint`
  is a viewBox position. [`src/app/domain/AGENTS.md`](../src/app/domain/AGENTS.md) has the two
  planes and the two rates.

## The palettes

`papel` is the default and the identity. The brief reserves white for cards, so `base-100` is the
page and `base-200` is the card, which is the inversion most Arena projects do not make. `noche` is
the dark answer to the same palette. Petróleo is the primary and also the info tone, amber is the
secondary and also the warning tone: each colour carries one meaning and no colour decorates.

**Amber is the one colour that does not move between palettes.** It is the mark, the current
milestone, the in-motion status and the rider's dot on the map, which is the same sign in the brand
and in the product.

## Fonts

Archivo (display and body) and IBM Plex Mono are self-hosted from `public/fonts/`. Arena's three
slots are declared in `arena.config.json`; the mono weights Arena's single `src` cannot carry are
ordinary `@font-face` rules in `src/styles.css`.

**Nothing may request `fonts.googleapis.com` or `fonts.gstatic.com`.** A `src` pointing at a Google
stylesheet in `arena.config.json` is a regression, not a shortcut.

## What the audit holds, and what it does not

`bun run audit:arena` runs `arena-to-prod --audit` with `--strict=audit,glyph,markers,restated,weight`
and **fails the build on exactly those kinds**. `components` and `ramp` are left out on purpose, and
each has a standing reason:

- **`arena-to-prod` reports `arena-stack` and `arena-row` as unknown components.** They are rhythm
  classes, not components. False positive, harmless, expected in every run.
- **The dark ramp reports "below 3:1 vs surface".** The cool `cat-*` slots do not clear 3:1 against
  `noche`'s card. Arena's own dark ramp is kept because lightening them destroys the colour-vision
  separation the same gate checks, and every Arena chart ships visible labels and an accessible
  table, which is the relief the report asks for.

**No gate reads the rendered page.** After a change here, serve the app and look at it, in both
palettes.
