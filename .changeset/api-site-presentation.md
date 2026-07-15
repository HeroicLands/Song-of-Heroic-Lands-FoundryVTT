---
"sohl": patch
---

**API documentation site: namespace-tree rendering, single logic surface, and brand chrome**

A coordinated overhaul of the generated API reference (api.heroiclands.org) so it
reads as one coherent, honestly-structured property.

- **Rendered from the namespace tree.** TypeDoc now documents the API from the
  namespace root (the `sohl` module) rather than a generated flat barrel, so the
  sidebar is the real `sohl.*` tree (Foundry-VTT-style) and a symbol's doc path is
  its actual source and runtime-global location. A plugin roots qualified
  type-reference paths at `sohl` so disambiguated names match the breadcrumb,
  sidebar, and runtime global. The old category-overlay machinery is removed.
- **A single logic-layer surface.** The five still-published Foundry document
  classes (`SohlActor`, `SohlItem`, `SohlActiveEffect`, `SohlScene`,
  `SohlTokenDocument`) are marked `@internal`, and the logic contracts are re-rooted
  out of the Foundry namespace — author-facing code reaches documents through the
  logic layer, so those classes are uniformly internal.
- **Strictly generated symbols.** The hand-written guide tree is dropped from the
  API build (that prose now lives in the knowledgebase); the landing page points
  developers to the KB, and rendered JSDoc doc-references resolve to knowledgebase
  URLs instead of broken relative `.md` links.
- **Shared brand chrome.** A TypeDoc plugin injects the shared Heroic Lands
  masthead, footer, palette, and fonts (matching www and the KB) without forking
  the theme, and fixes the nav dropdown's hover gap plus cross-property links.

Covers #397, #404, #414, #415, #427, #433, #442.
