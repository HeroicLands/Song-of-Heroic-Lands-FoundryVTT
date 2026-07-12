---
"sohl": minor
---

**Rename the Lineage item to Corpus (a being's physical body)**

The item formerly called **Lineage** is now **Corpus**. It models a being's
**physical body** — anatomy, body weight, reach, and per-medium movement — not
its taxonomic kind. The tell: a being can validly have **no** corpus. Such a
being is **incorporeal** (a spirit): no carry capacity, speed, encumbrance,
strength modifier, or body structure. That is now a supported, first-class
state — a being with no corpus no longer warns during preparation.

- Item type `lineage` → `corpus`; `LineageLogic`/`LineageDataModel`/`LineageSheet`
  → `CorpusLogic`/`CorpusDataModel`/`CorpusSheet`; `BeingLogic.lineage` →
  `BeingLogic.corpus`.
- The redundant `body` prefix is dropped from the corpus's own fields:
  `system.bodyStructure` → `system.structure`, `system.bodyWeight` →
  `system.weight`.
- Cardinality is unchanged: 0 or 1 corpus per being, never more than one.

**Migration.** A world migration runs once on `ready` (GM only, version-gated):
it converts existing `lineage` items to `corpus` and de-prefixes their
`bodyStructure`/`bodyWeight` fields, across world items and every actor's embedded
items. The compendium is re-exported as `corpus`.

**Compatibility note.** This renames a Foundry document sub-type and its
localization keys (`SOHL.Lineage.*` → `SOHL.Corpus.*`, `TYPES.Item.lineage` →
`TYPES.Item.corpus`) — a deliberate, migrated exception to the usual
never-rename-keys rule, required because the sub-type key must match the new type.
Downstream modules referencing the `lineage` item type, `SOHL.Lineage.*` keys, or
the `bodyStructure`/`bodyWeight` fields must update to the corpus names.

Closes #371
