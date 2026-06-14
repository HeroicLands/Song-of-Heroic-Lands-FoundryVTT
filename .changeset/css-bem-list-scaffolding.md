---
"sohl": patch
---

**Apply BEM to the shared list scaffolding (part 2 of the naming pass)**

Unify the ad-hoc `item-*` / `items-*` scaffolding classes — used ~250× across every
list-bearing sheet — into a single `list` BEM block, renamed in lockstep across the
templates and `scss/components/_items.scss`:

| Old | New |
| --- | --- |
| `items` | `list-section` |
| `items-list` | `list` |
| `item-list` | `list__items` |
| `items-header` | `list__header` |
| `item-name` | `list__name` |
| `item-detail` | `list__detail` |
| `item-controls` / `item-controls-wide` | `list__controls` / `list__controls--wide` |
| `item-control` | `list__control` |
| `item-image` | `list__image` |

**Deliberately kept** (JS-coupled — renaming them would silently break behavior):
`.item` (the row class queried by `_displayFilteredResults` for every search filter),
`.item-contextmenu` and `.default-action` (event hooks), and the eight `SearchFilter`
`contentSelector` classes. Generic single-word leaf columns (`.name`, `.detail`,
`.type`, …) are left scoped under their block, and Foundry-owned classes (`flexrow`, …)
are untouched. `data-*` / `data-action` values and `lang/` keys are unchanged.

Template class lists were rewritten only inside `class="…"` attributes, so handlebars
expressions and `data-*` are unaffected; verified zero orphaned old tokens remain in
`scss/` or `templates/`. The rename is consistent (wrapper + children moved together), so
ancestor-scoped styling is preserved.

Remaining for a follow-up: the effect/body-location component-specific classes (the
effect list's `contentSelector` needs a paired `src/` edit, and much of the
body-location SCSS is dead and better deleted than renamed) and the state-modifier
normalization (`active`/`disabled` are JS/Foundry-toggled and need per-site care).
