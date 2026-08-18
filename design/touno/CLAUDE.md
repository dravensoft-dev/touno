# design/touno — the style kernel

This directory is the project's answer to Arena's style kernel. `arena.config.json` names it in
`stylePlugins`, and it is the first (root) entry, so it emits on `:root`.

Two files, and nothing else belongs here:

- `plugin.tokens.json` — the 72 roles, in DTCG form, each with a `$description`.
- `plugin.css` — the four motifs no role expresses.

## plugin.tokens.json

- **Answer all 72 roles.** The root plugin has no fallback: an unanswered role is a custom property
  with no value, which is invalid at computed-value time, so the declaration reading it is dropped.
  That is a missing border, not a plainer look. `arena-to-prod` refuses the build over it.
- **A colour role takes a `{color.*}` alias and nothing else.** A literal resolves to one palette's
  value and inherits it into the other, so `papel` would bleed into `.arena-noche`.
- **Write a `$description` on every entry.** `bin/style-plugin-rules.mjs` has a check that demands
  one; the consumer path does not call it today, and one wiring change makes it fatal.
- **Four roles need a unit the type does not carry**, through
  `$extensions."com.dravensoft.arena".cssUnit`: `track-heading`, `track-eyebrow` and `track-label`
  take `em`; `measure-prose` takes `ch`. Forget it and the value emits as a bare number, which is
  not a valid letter spacing, and it silently resolves to `normal`.
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
- **Six keys here are not roles**: `rhythm-group`, `rhythm-component` and `rhythm-section`. They
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
  and the horizontal scroll on the tablist, because four category tabs do not fit a 320px screen
  and a tab strip that scrolls inside itself is the only fix that does not need a width the
  prerender cannot know. **The ceiling of every `clamp()` stays the role**, so desktop does not move.

## After a change here

```bash
bun run prepare:assets
bunx arena-to-prod --src src --src design --audit
```

Passing `--src design` is what puts this directory in scope. Then serve the app and look at it, in
both palettes: no gate reads the rendered page.
