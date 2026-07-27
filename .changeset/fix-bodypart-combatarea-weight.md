---
"sohl": patch
---

Fix body-part hit-spread weighting reading a non-existent `probWeight` field (#739)

Body **parts** persist their unaimed / hit-spread selection weight in the
`combatArea` schema field, but `BodyPart` seeded its derived `probWeight`
modifier from `data.probWeight` — a field that does not exist on a part — so
every part's weight computed as `0`. `BodyStructure.getRandomPart()` (the
unaimed part / spread-drift selection) was therefore not weighted by combat area
as intended.

`BodyPart` now derives its `probWeight` modifier from the persisted
`combatArea`, and the `probWeight` field is removed from the `BodyPart.Data`
interface (parts never persisted it). No data migration is needed — content
already persists `combatArea`. Hit **locations**, which correctly persist and
read their own `probWeight`, are unaffected.
