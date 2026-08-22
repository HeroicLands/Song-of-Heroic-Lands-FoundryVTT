---
"sohl": patch
---

**Knowledgebase being pages carry their info-block data again.** The derivation
that flattens a being's `sohl.items[]` into the shapes the theme's sidebar reads
— a `skills` map, grouped `gear`, `corpus`, `spells`/`talents` — was still gated
on the `character` and `creature` types retired by #1580, so it had matched
nothing since the merge. All 95 being pages published with the raw authored
block and none of the derived fields, and nothing failed or logged while they
did.
