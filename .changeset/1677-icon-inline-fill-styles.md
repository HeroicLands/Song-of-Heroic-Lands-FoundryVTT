---
"sohl": patch
---

**Bundled icons that stated their colour in a `style` attribute now theme in
dark mode.** The build injects a `prefers-color-scheme` fill swap into every
icon under `assets/icons`, and deliberately declines any file whose shapes carry
an inline `style="…fill:…"` — an inline style beats the injected rule, and a
half-recoloured icon is worse than an untouched one. Forty-five icons were
authored that way and shipped black on the dark compendium and directory
windows, whose `<img>` thumbnails SoHL's `.sohl`-scoped CSS cannot reach.

The guard is right, so the fix is in the source files: each of those icons now
states its colour as a `fill` attribute, the shape `game-icons/**` already had.
The rendered artwork is unchanged — a `fill` attribute and a `fill:` declaration
name the same colour, verified pair-by-pair against the previous files — and the
sources stay pristine black-on-transparent for the knowledgebase and website.

**Five default item and actor arts were among them**, so those types showed a
black icon before anyone picked another: `skill` (`other/head-gear.svg`, the
default for 73 notes), `mystery` (`other/sparkles.svg`), `mysticalability`
(`other/hand-sparkles.svg`), `attribute` (`other/user-gear.svg`), and
`affiliation` with `cohort` (`other/people-group.svg`). The issue named four,
one of which — `affliction` — has since moved to a Game-Icons default that
already themed.

**The guard now keys on the `fill` property rather than the substring.** It
matched `\bfill\b` anywhere in a style attribute, which also catches
`fill-rule`, `fill-opacity` and `paint-order: fill` — none of which set a
colour. Those are exactly what a converted file retains, so without this the
rewritten icons would have kept being skipped.

**`tests/build/icon-theming.test.ts` is the standing gate.** It walks every
bundled `.svg`, fails on any the injection declines, and separately requires
every `ITEM_METADATA` / `ACTOR_METADATA` default art to theme — so a newly added
icon carrying inline fills fails there instead of shipping un-themed. It carries
one allowlist entry, `other/mantle.svg`, which is drawn entirely in strokes and
cannot be themed by a fill swap at all; stroke theming is #1687.

(Closes #1677.)
