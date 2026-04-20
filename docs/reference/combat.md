---
aliases:
    - Combat
tags:
    - rules
    - core-system
    - combat
    - injury
audience: Developers and content authors defining creature anatomy.
---

# Combat

## Strike Accuracy

Every weapon has a strike accuracy value that represents the area of the body (in square feet) that the weapon can threaten in a single strike. A precise, close-range weapon like a dagger has a low strike accuracy (4), meaning its blow is confined to a small region. A broad-swinging weapon like a broadsword has a higher strike accuracy (6), and a long polearm or flail higher still. The value corresponds directly to the zone die size used in compatible systems (a d4 zone die = strike accuracy 4, a d6 = 6, and so on).

Strike accuracy governs how far a blow can scatter from the aimed body part when the hit is imprecise (see Determining Hit Location below). A weapon with strike accuracy 4 can scatter across at most 4 square feet of body area; a weapon with accuracy 6 can scatter across 6. Against a small creature whose total body area is less than the weapon's strike accuracy, the weapon can reach every part of the creature in a single swing.

## Determining Hit Location

When an attack succeeds, the attacker's d100 roll — the same roll that determined success — also determines where the blow lands. The attacker always declares a target body location before the attack. The precision of the hit depends on the margin of success:

**Critical Success.** The blow strikes the exact body location the attacker aimed for. Skill and precision are at their peak; the weapon's strike accuracy is irrelevant.

**Solid Hit** (success roll ≤ ML − 20). The attacker hit well within their ability — nowhere near missing. The blow lands on the correct body part (the one containing the targeted location), but not necessarily the exact location aimed for. The specific location is determined randomly, weighted by each location's probability weight within that body part. Weapon strike accuracy does not apply; the attacker's skill has compensated for the weapon's natural imprecision.

**Barely Hit** (success roll > ML − 20 but still a success). The attacker connected, but only just. The blow scatters away from the targeted location. Starting from the body part containing the target, the system distributes the weapon's strike accuracy across that part and its adjacent parts, weighted by their areas. The body part struck is determined from this distribution, and then a specific location within that part is selected by probability weight. A more precise weapon (lower strike accuracy) keeps the scatter close to the intended target; a less precise weapon allows it to wander further.

This mechanism scales naturally with skill. A novice with ML 50 has a 20-point solid-hit band (rolls 1–30) and a 20-point barely-hit band (31–50) — roughly equal chances of each. A veteran with ML 80 has a 60-point solid-hit band (1–60) and only a 20-point barely-hit band (61–80). The veteran hits the intended body part three-quarters of the time even without a critical success. A master with ML 95 almost never scatters at all. Higher skill means not just hitting more often, but hitting where you intend.
