---
"sohl": minor
---

Restructure and improve the developer/user documentation for readability and usability

An intentional, major reorganization of the developer/API documentation. The
goal is a clearer information architecture, consistent per-document framing,
better lateral cross-linking, and refreshed navigation so developers can find
the right document for their goal quickly. The documentation set is now scoped
as _developer/contributor/API-facing only_ — player- and GM-facing rules live at
heroiclands.org and are linked to rather than duplicated.

- **API navigation grouped by architecture** — the generated TypeDoc site
  (api.heroiclands.org) previously rendered the entire public API as a single
  flat, alphabetical class list. The entry-point generator
  (`utils/build-docs-entry.mjs`) now emits a tree of barrel modules that mirrors
  `src/`, so the API sidebar groups symbols as **Core**, **Documents**
  (`Actor`, `Item`, `Combat`, `Combatant`, `Chat`, `Effect`, `Scene`, `Token`),
  **Domain** (`Action`, `Body`, `Modifier`, `Movement`, `Result`, `StrikeMode`,
  `SkillBase`), **Utility** (`AI`, `Collection`, `Constants`, `Helpers`), and
  **Applications**. Each barrel is a TypeDoc `@module` whose full slashed name
  drives folder nesting via `navigation.includeFolders`; `constants.ts` and
  `SkillBase` get dedicated modules so no single node is overwhelming. The HTML
  and Markdown TypeDoc configs and `tsconfig.docs.json` are updated to consume
  the bundle tree via an `expand` entry-point strategy.
- **Navigation** — the documentation hub and per-folder index pages are
  refreshed so every published document is reachable and grouped by purpose.
- **Structure** — documents are sorted into the appropriate Di&#225;taxis bucket
  (concepts, how-to, reference) and given consistent headers and
  "who is this for" framing.
- **Readability** — overlapping or orphaned material is consolidated and
  cross-linked; stable localization keys, data fields, and code remain
  untouched.
