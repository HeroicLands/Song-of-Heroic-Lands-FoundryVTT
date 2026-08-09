---
"sohl": patch
---

Give the Helthraals and the Nightwights the human body plan
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

Both already carried the human parts and hit locations, but **every zone weight
was 0** — a zone of weight 0 claims no zone numbers, so each had a
`maxZoneNumber` of 0 and no blow could resolve a hit location on either of
them. They now take Basic Folk's structure, zone numbers 1–15, and a body scale
derived from their own Strength rather than a flat 1.0. Their items are left
alone.

Both move out of the specification's no-anatomy allowlist and are now checked
like every other creature.
