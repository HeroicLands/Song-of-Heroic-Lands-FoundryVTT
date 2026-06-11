---
"sohl": patch
---

Overhaul the generated API documentation: working cross-references, a
hierarchical navigation tree, and links out to the Foundry API.

**Cross-reference resolution.** A docs build surfaced 178 unresolved `{@link}`
warnings. TypeDoc's link resolver degrades as the API is split across multiple
entry-point modules, so the previous per-group barrel tree stranded valid links
between, e.g., `Documents/Item` and `Domain/Modifier`. The entry point is now a
single flat module (`utils/build-docs-entry.mjs`), which resolves every internal
link — **178 → 0**.

**Hierarchical navigation, preserved.** Architecture grouping is restored at the
navigation layer instead of via modules: `typedoc-plugin-source-category.mjs`
assigns each symbol a `@category` from its `src/` path (a hand-written
`@category` always wins), and `typedoc-plugin-nested-nav.mjs` splits the
slash-encoded category names into a real nested tree at render time. The sidebar
shows `Documents ▸ Actor`, `Domain ▸ Modifier`, etc. — the folder-tree feel,
with zero broken links.

**Links to the Foundry API.** `typedoc-plugin-foundry-links.mjs` resolves
`fvtt-types` symbols to the official Foundry API site, in both doc comments and
rendered type signatures, so `{@link Scene}` links to
`foundryvtt.com/api/classes/foundry.documents.Scene.html`.

**Structure and authoring.** The symbol API is one module renamed **API
Reference**, whose landing page is authored by hand in `docs/api-module.md`
(pulled in via `{@include}`). All guides now live under a top-level
**Documentation** node that mirrors the `docs/` layout (Concepts, How-to,
Reference, Contributing), built with TypeDoc document `children` frontmatter.

Source changes are comments-only (broken/inappropriate `{@link}`s reworded or
de-linked); no runtime code, types, or behavior change.
