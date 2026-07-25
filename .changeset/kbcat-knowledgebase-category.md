---
"sohl": minor
---

**Add `sohl.kbcat` KnowledgeBase Category to compendium content**

Adds a `sohl.kbcat` frontmatter property to the compendium source content, giving
the knowledgebase build an explicit, stable grouping key. Values are always
ASCII-lowercase and are derived per source directory:

- `Afflictions/**` — the immediate folder name (`Poisons_And_Toxins` → `poisontoxin`).
- `Armor/**` — `sohl.material` (spaces → underscores; diacritics stripped, so
  `Kûrbúl` → `kurbul`).
- `Misc_Gear/**` — the immediate folder name (spaces → underscores).
- `Mystical_Abilities/**` — `sohl.subType`.
- `Trauma/physcond/**` — `phys` + the immediate folder name.
- `Trauma/psycond/**` — `psy` + the immediate folder name.
- `Trauma/fatigue/**` — `fatigue`.
- `Weapons/**` — the immediate folder name.

`kbcat` is authoring / KB-build metadata only — the item pack builders ignore it,
so it does not enter compiled item system data.

Closes #696.
