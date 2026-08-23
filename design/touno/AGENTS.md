# design/touno: the style kernel

This directory is the project's answer to Arena's style kernel. `arena.config.json` names it in
`stylePlugins`, and it is the first (root) entry, so it emits on `:root`.

Two files, and nothing else belongs here:

- `plugin.tokens.json`: every role the kernel asks for, in DTCG form, each with a `$description`.
- `plugin.css`: the motifs no role expresses.

## plugin.tokens.json

- **Answer every role the kernel asks for.** The root plugin has no fallback: an unanswered role
  is a custom property with no value, which is invalid at computed-value time, so the declaration reading it is dropped.
  That is a missing border, not a plainer look. `arena-to-prod` refuses the build over it.
- **A colour role takes a `{color.*}` alias and nothing else.** A literal resolves to one palette's
  value and inherits it into the other, so `papel` would bleed into `.arena-noche`.
- **Write a `$description` on every entry.** `bin/style-plugin-rules.mjs` has a check that demands
  one; the consumer path does not call it today, and one wiring change makes it fatal.
- **Some roles need a unit the type does not carry**, through
  `$extensions."com.dravensoft.arena".cssUnit`: `track-heading`, `track-eyebrow`, `track-label` and
  `track-trail` take `em`; `measure-prose` takes `ch`. Forget it and the value emits as a bare
  number, which is not a valid letter spacing, and it silently resolves to `normal`.
- **The reading floors refuse the build.** `lh-heading` must be ≥ 1, which is why the brief's 1.04
  heading leading resolves to `{lh.snug}` and not to `{lh.tight}`; `lh-prose` must be ≥ 1.5;
  `measure-prose` must sit between 45 and 90.
- **A literal is right where the scale has no step for the answer.** Here that is `r-control` and
  `r-field` at 8px, `step-title-page` at 28px, `container-max` at 1180px, `grid-min` at 280px,
  `lift-control` at 0, and the five shadows as all-zero objects with a fully transparent colour.
- **The `fs` ladder is deliberately not re-answered.** Arena's 13/15/17 is exactly the brief's
  scale, and `step-title-surface` aliases `{fs.lg}`. An aliased role freezes the value the step had
  when the plugin was generated, so if anyone ever re-answers `fs-lg`, `step-title-surface` has to
  become a literal `17px` in the same commit.
- **Three keys here are not roles**: `rhythm-group`, `rhythm-component` and `rhythm-section`. They
  are the ladder a plugin is allowed to re-answer, because they reach the page through classes
  rather than through a role.

## plugin.css

- **Selectors are `data-arena-part` hooks, and only this directory may use them.** Application CSS
  reaching one is reported by the audit.
- **Discover a hook by inspecting the served page**, never by guessing it from a component's member
  list. `bun start`, open the element, read the attribute value. That is how `tabs` was found to be
  the tablist rather than the host.
- **Never write `@layer`.** The build wraps this sheet in the reserved layer and restates the layer
  order at its head, so an ordinary selector wins with no `!important`.
- What this file legitimately holds: the `clamp()` over `hero.title`, `page-head.title` and
  `section.title`, because `fs` steps are fixed pixels and a 44px title overflows a 320px phone;
  the horizontal scroll on the tablist, because four category tabs do not fit a 320px screen
  and a tab strip that scrolls inside itself is the only fix that does not need a width the
  prerender cannot know; the rail's own density and the sheet's folded-away caret, below; and the
  two things the app bar needs, below.
  **The ceiling of every `clamp()` stays the role**, so desktop does not move.
- **The app bar's motif is a translate, and the state is the app's.** `app-bar` takes
  `transition: translate` and `translate: 0 -100%` under `.shell-bar-away`, which `App` binds on
  its own host; the plugin owns the part hook and nothing else, because only this file may select
  one. `:focus-within` re-answers it to `none`, so a bar holding keyboard focus cannot be scrolled
  off screen. [`../../src/app/layout/AGENTS.md`](../../src/app/layout/AGENTS.md) carries the reasoning.
- **`side-nav.item` is denser inside the rail, and only inside it.** The page wears
  `.arena-comfortable`, so an item stands 48px tall on a thumb's target, and the rail is read with a
  pointer on a desktop. Scoped by `.shell-panel__rail`, the item takes `--sp-10` for its floor and
  one `--sp-1` of block padding, which is 40px and one row of air rather than five, so the column of
  destinations is shorter and the session block below it has further to fall. The phone's
  copy of the same navigation, the one inside the `Más` sheet, keeps the full target, which is the
  point of scoping rather than re-answering: how large a control is answers who is pointing at it.
  The row's inline start padding is an inline style Arena binds for indentation, and no sheet
  outranks one, so the density this file can buy is block only.
- **`sheet.caret` is hidden, because the fold it offers never happens.** `arena-sheet` heads itself
  with a trigger and a caret whichever way it is used, and Arena never folds the panel by itself:
  `collapsed` is an input and `collapsedChange` is an output, so a host that binds neither draws an
  affordance that reports and a body that does not move. The Más sheet binds neither on purpose,
  because a panel a phone opened from the bar has one way out and it is the close control beside it.
  The caret is the half of that a person can see, so the caret is what goes. There is no input that
  suppresses it, which is why this is a motif rather than an attribute.
- **`app-bar.band` is where the narrowest phone buys its last ten pixels.** Under
  `@media (width < 22.5rem)` the band, the nav and the actions take `--sp-2` for their gap and the
  band re-answers `--dz-ctl-h` as `--dz-ctl-h-sm`. It is scoped to the band by inheritance rather
  than re-answered on `:root`, so nothing else in the app re-densifies; 44px is still the thumb
  target Arena's comfortable density argues for. Without it the cart action wrapped the bar into
  two rows at 320.

## After a change here

```bash
bun run prepare:assets
bun run audit:arena
```

`arena-to-prod` takes no arguments: it resolves this directory from `stylePlugins` and walks it
wherever it sits, so a plugin outside `src` needs no `--src` of its own. Then serve the app and
look at it, in both palettes: no gate reads the rendered page.
