---
"sohl": minor
---

Build the twelve Mythic creatures from their bestiary entries
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

All twelve shipped with an **empty** `system.body.structure` — which reads as
incorporeal, so no blow could resolve a hit location on them — no natural
weapons, and no skills.

**The six dragons** take the Young, Mature and Old Dragon tables; fire and ice
share a stat block at each age. Each gains the printed attributes, weight,
ground and flying Move, the AWARE / INITIATIVE / SHOCK / SPIRIT / DODGE values,
and a seven-zone anatomy in the order the table prints it — head, forelegs, one
wing, torso, the other wing, hind legs, tail — with per-location natural
armour that runs from 10 on a young dragon's wing to 30 on an old one's flank.
Zone runs reach 25, 50 and 100 by age. Bite, Claw and Tail are melee combat
techniques; the Breath is a **missile** strike mode carrying the printed cone
range (40, 60 and 80 feet), with its declining impact bands recorded on the
strike mode.

**Six more Mythic creatures** take their own entries: the Wýrè (Wyvern), Yélgri
(Harpy), Unicorn, Warg, Gryphon and Hirénu (Hippogriff). Each gets the body
plan its table prints — the wyvern's two-legged winged frame, the harpy's
winged biped with arms, the unicorn's ungulate anatomy with its horn as a hit
location, the warg's quadruped, and the two chimaeras' eagle forequarters over
equine or leonine hindquarters — plus per-location armour and one combat
technique per natural weapon.

Press is a maneuver rather than a natural weapon and is not modelled, and the
harpy's javelin and stick are ordinary gear rather than techniques. Talents
with no corresponding skill (Immersion, Sensing, Telepathy) are left out.

Ice dragons use the `fire` impact aspect for their breath, that being the only
elemental aspect the impact model defines.
