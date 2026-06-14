---
"sohl": patch
---

**Fix: Being (and all) sheets rendered unstyled — remove the `@layer` wrapping**

The CSS refactor wrapped all of SoHL's styles in custom cascade layers
(`@layer sohl.*`). Foundry v14 core is itself fully layered, and the layered SoHL rules
stopped winning in practice, so sheets rendered with no parchment background, unstyled
status pills, unstyled tabs, and unstyled façade (while the deliberately-unlayered fonts
and icon glyphs still worked — the tell).

Emit SoHL's CSS **unlayered** again: `scss/sohl.scss` drops the `@layer` declaration and
wrappers, keeping every partial in the same load order and the `.sohl` / `.sohl.sheet`
scope wrappers. Unlayered styles always beat layered styles of the same origin, so
unlayered SoHL reliably wins over Foundry's fully-layered core. The compiled selector and
declaration sets are otherwise identical to before — only the layer wrappers are removed.
Styleguide §5 updated to document the unlayered decision and the lesson learned.
