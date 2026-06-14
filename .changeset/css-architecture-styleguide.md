---
"sohl": patch
---

**Document the target CSS/SCSS architecture and conventions (styleguide)**

Adds `docs/concepts/css-architecture.md` — the decision record that grounds the
CSS/SCSS refactor epic (#95). It ratifies, with rationale and examples drawn from the
current `scss/` tree, the choices the rest of the epic builds on:

- **Tool:** stay on SCSS (Dart Sass); modernize _usage_ rather than switching to
  Tailwind or CSS-in-JS.
- **Folders:** ITCSS-inspired `abstracts/ · base/ · layout/ · components/ · apps/ ·
utilities/`, with a migration map from today's `utils/ · global/ · components/`.
- **Naming:** BEM (`block__element--modifier`) under the `.sohl` namespace; `data-*`
  hooks and `lang/en.json` keys stay stable.
- **Tokens:** `--sohl-*` custom properties generated from SCSS maps, kept distinct
  from the Foundry `--color-*` overrides.
- **Cascade:** a documented `@layer` order.
- **Scoping:** the #87 rule written down — compound `.sohl.sheet` (never descendant),
  `:where()` for low specificity.
- **Module loading:** `@use`/`@forward` canonical, `meta.load-css` reserved for
  scoped output.

Documentation only — no `.scss`/`.css` changes. Linked from `docs/README.md`,
`docs/concepts/concepts.md`, and the `CLAUDE.md` quick reference.
