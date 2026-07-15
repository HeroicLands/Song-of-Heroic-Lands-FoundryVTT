---
"sohl": minor
---

**CSS/SCSS architecture refactor (epic #95)**

A ground-up modernization of the stylesheet layer. No visual change is intended —
except where noted, the compiled CSS is computed-value-equivalent to before; the
work is structural, and lays the foundation for runtime theming.

- **Ratified architecture** (`docs/concepts/css-architecture.md`). The decision
  record grounding the epic: stay on Dart Sass, ITCSS-inspired folders, BEM under
  the `.sohl` namespace, `--sohl-*` design tokens, a documented `@layer` order, and
  the compound `.sohl.sheet` scoping rule.
- **Tokens, layers, and scoping foundation.** A single `abstracts/_tokens.scss`
  source of truth emits the palette, spacing, and font stacks as `--sohl-*` custom
  properties, so the system is themeable at runtime; components consume the custom
  properties rather than SCSS variables. `scss/sohl.scss` declares the cascade-layer
  order (`base, layout, components, apps, utilities`) — since Foundry v14 core is
  fully layered, SoHL's layers beat core without `!important` or deep nesting. The
  compound `.sohl.sheet` frame-scoping pattern is settled and documented.
- **Folder reorganization** into `abstracts/ base/ layout/ components/ utilities/`,
  splitting the mixed-concern "dumping ground" partials so each holds one concern.
- **Dead-CSS removal.** Deleted the SCSS whose selectors matched no template and no
  `src/` reference (the mis-scoped `_bodyloc.scss`, the `.sheet-header-being` /
  `.sheet-header-object` blocks, orphaned state rules, and redundant `!important`
  flags) — grep-verified against `templates/` and `src/`.
- **Reusable list widget.** Extracted the shared list skeleton (scroll body, header
  row, control cluster, ellipsis-truncation) into `components/_list.scss` mixins, so
  the item / effect / body-location lists become thin consumers.
- **BEM naming pass.** Renamed the header, facade, shared list scaffolding
  (`item-*`/`items-*` → a single `list` block, ~250 sites), and effects components
  to `block__element--modifier` in lockstep across templates and SCSS. JS-coupled
  classes (`.item`, event hooks, `SearchFilter` `contentSelector`s), Foundry-owned
  classes, and `data-*` / `lang` keys are deliberately left unchanged.

Closes the CSS refactor epic (#95): #87, #92, #93, #94.
