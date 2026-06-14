---
"sohl": patch
---

**Apply BEM naming to the header and facade components (part 1 of the naming pass)**

First slice of the BEM renaming capstone, scoped to the two component families whose CSS
classes are **not** referenced from `src/` (no JS selectors) and whose state is
template-driven — so the rename is a pure SCSS + template change with no behavioral risk:

- **Header block** (`scss/layout/_sheet.scss` + the 8 `*/header.hbs` templates):
  `header-details → sheet-header__details`, `actor-img → sheet-header__portrait`,
  `status-effects → sheet-header__statuses`, `toggle-status-effect → sheet-header__status`.
- **Facade** (`scss/components/_facade.scss` + `facade.hbs`):
  `facade-image → facade__image`, `facade-description → facade__description`.

SCSS and templates are renamed in lockstep (verified: zero remaining references to the old
names anywhere in `scss/`, `templates/`, or `src/`). `data-*` attributes, `data-action` /
`data-tab` values, localization keys, the generic `.active` state class, and Foundry-owned
classes (`flexrow`, …) are left unchanged. The `.sohl` / `.sohl.sheet` wrappers are kept,
so specificity is unchanged.

The styleguide (`docs/concepts/css-architecture.md` §3) is updated to nail down the
convention: BEM block names are namespaced by the `.sohl` wrapper (no redundant `sohl-`
prefix), and Foundry/JS-owned classes and `data-*`/`lang` keys are explicitly off-limits.

Remaining BEM clusters (the list classes, which are entangled with the `SearchFilter`
`contentSelector`s in `BeingSheet.ts`, and the state-modifier normalization) follow in
later per-component slices so each stays reviewable and visually verifiable.
