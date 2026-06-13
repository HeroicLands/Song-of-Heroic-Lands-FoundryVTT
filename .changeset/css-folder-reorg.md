---
"sohl": patch
---

**Reorganize SCSS into the target folder architecture**

Move every partial into the agreed `abstracts/ base/ layout/ components/ utilities/`
layout and split the mixed-concern "dumping ground" files, so each partial holds a single
concern. Pure regrouping — the compiled CSS rule set is **identical** to before (verified:
the set of selectors and the set of declarations both diff clean against the previous
build); only rule ordering and `@layer` wrapping change.

- `abstracts/` — `_tokens`, `_typography`, `_mixins`, `_icons` (the icon-font generator
  now writes to `scss/abstracts/_icons.scss`).
- `base/` — `_foundry-vars`, `_editor`, `_hotbar`, plus `_elements` (form-element resets)
  and `_window` (window chrome) split out of the old `_top`/`_forms`.
- `layout/` — `_sheet` (frame), `_tabs` (tab nav + `.tab-body`), `_grid`.
- `components/` — `_facade`, `_items`, `_profile`, `_bodyloc`, `_effects`, `_chat`,
  `_tooltip`, `_rollable`, plus `_search` (from `_top`) and `_field` (split from
  `_resource`).
- `utilities/` — `_flex` (incl. the `flex-group-*` helpers moved out of `_grid`).
- Removed the empty/commented-out `_nav` partial and the now-empty `utils/`, `global/`
  directories.

`scss/sohl.scss` loads the folders in the documented `@layer` order
(`base → layout → components → utilities`). Grid helpers load in `layout` rather than
`utilities` so the existing component-level overrides (e.g. chat's `.mingap` tightening a
grid gap) keep winning; the BEM pass (#94) will convert those to modifiers and promote
grid to the utilities layer.
