---
"sohl": patch
---

**Docs: render the API from the namespace tree; retire the category overlay (#404)**

TypeDoc now documents the API from the namespace root (`src/index.ts`, the `sohl`
module) instead of a generated flat barrel. The sidebar renders the real
`sohl.*` namespace tree — `sohl ▸ document ▸ effect ▸ foundry ▸ SohlActiveEffect`,
Foundry-VTT-style — so a symbol's documentation path is its actual location in the
source and on the runtime global. This fixes the duplicated top-level nodes
(Core, Entity) the old category overlay produced.

**Removed** the overlay machinery now that namespaces carry the hierarchy
natively: `utils/build-docs-entry.mjs` (the flat-barrel generator),
`utils/typedoc-plugin-source-category.mjs`, `utils/typedoc-plugin-nested-nav.mjs`,
`utils/docs-grouping.mjs`, the `docs:bundle` script, and the `categoryOrder` /
`navigation.includeCategories` config.

**Cross-references qualified.** Every `{@link}` that resolved only by the old flat
barrel's global name lookup is now written with its honest namespace path (e.g.
`{@link sohl.entity.modifier.ValueModifier}`), across both source doc-comments and
the Markdown docs, so `npm run docs` is clean under `treatWarningsAsErrors`.
