---
"sohl": patch
---

**One registry decides which content types compile into Items.** The pack build
kept two hand-maintained lists — the `ITEM_TYPES` whitelist in
`utils/packs/item-docs.mjs` and the `BUILDERS` table in `utils/packs/items.mjs`
— and they had drifted: `trait` was whitelisted with no builder behind it, so a
`type: trait` note passed the gate and then died on `BUILDERS[type] is not a
function`, swallowed as a per-file compile error naming no cause.

- `ITEM_BUILDERS` in the new leaf module `utils/packs/item-builders.mjs` is now
  the single declaration, pairing each item type with the builder producing its
  `system` block. `ITEM_TYPES` is derived from its keys, so a type cannot be
  advertised as compilable without a builder to compile it, and `DOC_ENTRY_TYPES`
  keeps deriving from `ITEM_TYPES` as one set.
- `itemBuilder(type)` names the type it cannot build, in place of the anonymous
  `is not a function`.
- The `sohl:` frontmatter readers moved to a leaf `utils/packs/frontmatter.mjs`
  (re-exported from `helpers.mjs`, so every import path is unchanged) — the
  registry builds on them without reaching `helpers.mjs`, which imports wikilinks
  and through them `item-docs.mjs` itself.
- `trait` — an item type _retired in #651_, absent from `documentTypes.Item` and
  reported by world migration as unrecognized — is no longer advertised anywhere:
  its stale default artwork in `src/utils/default-item-art.mjs` is gone too, and
  that map is now held in exact step with the registry by the unit suite.

(Closes #1504.)
