---
"sohl": patch
---

Fix body-part hit-spread weighting reading an unset weight field (#739)

Body **parts** persist their unaimed / hit-spread selection weight in a scalar
schema field, but `BodyPart` seeded its derived `probWeight` modifier from a
field name that does not exist on a part — so every part's weight computed as
`0`, and `BodyStructure.getRandomPart()` (the unaimed part / spread-drift
selection) was not weighted as intended.

`BodyPart` now derives its `probWeight` modifier from the persisted weight. Hit
**locations**, which correctly persist and read their own `probWeight`, were
unaffected.

_(The persisted part field was named `combatArea` when this fix was made; #780
renames it to `probWeight` in this same release, so all three body tiers spell
their weight identically.)_
