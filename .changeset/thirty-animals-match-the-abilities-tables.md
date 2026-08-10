---
"sohl": minor
---

Rebuild the thirty animals covered by the **Domesticated Animal Abilities** and
**Wild Animal Abilities** tables so the shipped compendium matches them
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

**Corrected numbers**

The hunting dog carried the guard dog's scores verbatim; the ratter, both dogs
and the ram carried the wrong weight; the cat, ratter and ram carried the wrong
Move. `Cat`, `Ratter` and `Ram` had a Dexterity the tables do not define and no
Scent, which they do. Every `attrRollFormula` now derives from its score
(`1d6 + score − 3` at 10 and above, `1d4 + score − 2` below).

**Body scale**

All thirty shipped `bodyScaleBase: 1.0`, so a dagger wounded a destrier exactly
as it wounded a human. Each is now seeded from its own Strength — 0.18 for a
crow, 5.09 for an elephant — and injury levels read size-correct.

**Anatomy**

Each animal's body structure now reproduces the zone-number runs of its
assigned hit-location table (A–M), including the five wild tables (F–M) that
had no representation at all. The cat and the ratter previously had **no** body
structure, so no blow against them could resolve a location. Foreleg locations
on the dogs no longer hang off the head part. Every part carries the body
`roles` that drive impairment and the fumble/stumble mishaps.

**Natural weapons**

Every animal now carries one Combat Technique per weapons-table row — kick,
bite, claw, gore, tusk, talon, beak, grab — with its reach, zone die, attack
value and impact, plus the Melee-table Dodge and Shock values. Previously only
the bovine had an attack, and it was authored as a non-existent item type. A
natural weapon cannot block, matching the `·` the DEF column prints.

**Negative natural armour**

`BodyLocation.protectionBase` is no longer floored at zero, so a hide softer
than bare human skin (a crow's is `−6` blunt / `−8` piercing) raises the
effective impact instead of being clamped away. Armour reduction still bottoms
out at the location's own floor, so it can strip a hauberk to nothing but
cannot make an already-vulnerable hide worse. Existing bodies are unaffected —
the constraint only widened.

The two reference tables now also ship as an executable specification
(`tests/content/animal-abilities.test.ts`), so an animal that drifts from its
printed row fails the build.
