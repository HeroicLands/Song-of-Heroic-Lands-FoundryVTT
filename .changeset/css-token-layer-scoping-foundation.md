---
"sohl": minor
---

**CSS foundation: design tokens, cascade layers, and a single scoping model**

Lay the foundation the rest of the CSS refactor (epic #95) builds on. No visual change
is intended — the compiled CSS is computed-value-equivalent to before, apart from the
dead-rule deletions and the redundant-`!important` removal noted below.

**Design tokens.** New `scss/abstracts/_tokens.scss` is the single source of truth for
the palette, spacing, and font stacks as SCSS maps, emitted to CSS custom properties on
`:root` (`--sohl-color-*`, `--sohl-space-*`, `--sohl-font-*`). Every component now
consumes the custom properties (`var(--sohl-color-…)`) instead of SCSS color variables,
so the system is themeable at runtime without recompiling. `utils/_colors.scss` and
`utils/_variables.scss` are removed (folded into the tokens layer); `utils/_foundry-vars.scss`
now maps the Foundry `--color-*` overrides onto the new tokens.

**Cascade layers.** `scss/sohl.scss` declares a documented layer order
(`sohl.base, sohl.layout, sohl.components, sohl.apps, sohl.utilities`). Foundry v14 core
is fully layered, so SoHL's own `sohl.*` layers — registered after Foundry's stack — beat
core without `!important` or deep nesting. Current rules map to `base` (Foundry-core
overrides + global UI) and `components` (the `.sohl` namespace block, in unchanged order);
`layout`/`apps`/`utilities` are reserved for the file reorg (#92) and component
extraction (#93). The now-redundant `!important` flags on the disabled-input focus reset
are dropped (specificity + layer already win).

**Scoping model.** Settled on the compound `.sohl.sheet` pattern for frame classes and
documented it. Removed the dead `.item-form` and `.macro-sheet` selectors (the classes
no longer exist under ApplicationV2), and de-duplicated `.window-content` so the parchment
background/font/color have a single owner (`components/_top.scss`) while the sheet frame
adds only its overflow/padding.

The styleguide (`docs/concepts/css-architecture.md`) is updated to match: tokens emit on
`:root`, and the cascade-layer section now reflects Foundry v14's layered core.
