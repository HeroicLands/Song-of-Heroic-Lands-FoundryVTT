---
"sohl": patch
---

Give the remaining 114 animals a body structure and natural weapons, so every
creature in the animals pack can now be hit and can now attack
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

Before this, all but a handful shipped with an **empty** `system.body.structure`
— which reads as _incorporeal_ — so `getRandomLocation` could not resolve a hit
on a wolverine, a giant spider or an elephant bird, and none of them had an
attack to make.

**Fifteen body plans.** Each mirrors the shape of a printed hit-location table
where one exists and extrapolates the same construction where none does:
`ungulate`, `carnivore`, `smallQuadruped`, `anthropoid`, `smallAvian`,
`largeAvian`, `biped`, `drake`, `serpentine`, `proboscidean`, `arachnid`,
`insect`, `aquatic`, `chelonian`, `cephalopod`. Zone weights scale with the
creature's size band; part and location weights are the plan's own. Apes and
monkeys use the **human** plan unchanged — the same six parts and thirty-two
hit locations a Being carries — over a zone run scaled to their size, so a
monkey's zone numbers run 1–6 where a person's run 1–15.

**Natural weapons.** One Combat Technique per attack the creature's own Dossier
describes — a wolverine's raking claws and bone-crushing bite, a scorpion's
pincer and sting, an octopus's tentacle grapple.

**Derived numbers.** Reach, zone die, attack value, impact and natural armour
are extrapolated from the printed animals rather than invented freely: impact
tracks Strength (`d6` bite = `STR ÷ 2 − 5`, fitted to the printed bites; a claw
is one lower on a `d8`; a constrictor's grab equals its Strength), attack tracks
Agility off a `40 + 2 × AGL` baseline shifted per body plan, the zone die scales
with how many zone numbers the body spans, and natural armour follows the same
Strength ladder the printed rows sit on, shifted by a per-creature hide value.
Each creature's `bodyScaleBase` is seeded from its own Strength.

The specification in `tests/content/animal-abilities.test.ts` now also asserts
the invariants that hold for **every** animal, printed or derived: contiguous
gap-free zone numbers, no orphaned parts or locations, no part without a hit
location, uniform natural armour, a Strength-derived body scale, and at least
one usable combat technique whose impairing role the body actually has.
