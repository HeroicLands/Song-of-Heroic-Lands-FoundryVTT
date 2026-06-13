---
"sohl": patch
---

**Remove dead SCSS verified against templates**

Delete ~408 lines of SCSS whose selectors match no `.hbs` template and no `src/` class
reference. Mechanical cleanup ahead of the CSS reorganization (epic #95), with each
deletion grep-verified against `templates/` and `src/`:

- `scss/components/_forms.scss` — the `.sheet-header-being` and `.sheet-header-object`
  blocks (superseded by the live `.sheet-header` / `.header-details` / `img.actor-img`
  markup), plus the now-unused `@use "../utils/colors"`.
- `scss/components/_sheet.scss` — the orphaned `.summary`, `.subtype`, and top-level
  `.sheet-navigation` blocks (templates use Foundry tab navigation, not `.sheet-navigation`).
- `scss/components/_top.scss` — `img.token-image`.
- `scss/components/_items.scss` — the `.subtype` list column and the `.items-block`
  adjacency rule.

No renaming, no folder moves, no changes to any live selector (e.g. `.item-subtype`,
`.status-effects`). Pure deletion; `npm run build:css` and `npm run build` both pass.
