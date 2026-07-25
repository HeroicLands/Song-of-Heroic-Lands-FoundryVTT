---
"sohl": minor
---

**KnowledgeBase: group section pages into `kbcat` tables, and add `kbcat` to skills**

The KB Weapons, Armor/Clothing, Attributes & Skills, and Trauma landing pages now
render their items grouped by `sohl.kbcat` instead of one flat list — each group a
table (weapons/armor) or linked list (attributes/skills/trauma), rows sorted by
name. The groups are generated dynamically from `.Params.sohl.kbcat` at every Hugo
build (Hugo section-layout overrides under `kb/layouts/`; no theme changes), so
newly added content appears automatically, and any new `kbcat` value not in the
curated ordering is appended rather than dropped.

To support the skill grouping, `sohl.kbcat` is added to the skill compendium
content (derived from the source folder: `combat`, `craft`, `languages`, `lore`,
`mystical`, `nature`, `physical`, `script`, `social`). Like all `kbcat` values it
is authoring / KB-build metadata only — the item pack builders ignore it, so it
does not enter compiled item system data.

Closes #699.
