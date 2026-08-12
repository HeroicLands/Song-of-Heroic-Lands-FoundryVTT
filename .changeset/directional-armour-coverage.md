---
"sohl": minor
---

Let armour record which side of a covered location it actually protects.

**The gap.** Coverage was directionless, so a cloak — which hangs down the back and
protects the torso and legs from behind only — read as full torso and leg protection,
identical to a garment that wraps all the way round. A breastplate is the mirror case.

**The model.** `system.locations.facing` lists the covered locations an article protects
from one side alone, as `{ location, side }` with side `front` or `back`. An absent entry
means "protected from any direction", so every all-round article ships an empty list and
nothing needs migrating.

Directional coverage is genuinely the exception, so it is modelled as an exception list
rather than a qualifier on all 309 armour articles. The thirteen cloaks now mark their
torso, pelvis, thighs, knees and calves as rear-facing — locations most of them were not
recording as covered at all, which is why a cloak read as barely more than a mantle — and
the breastplates and cuirasses mark their torso as front-facing.

**Data now; resolution when outnumbering lands.** The rules never ask which way a
combatant is pointing. They settle one-sided armour by circumstance instead: its Armour
Value is ignored against a single aware foe, who can simply keep to your front, and
applies half the time against several, who cannot all be faced at once. That clause needs
only the opponent count, awareness, and a coin flip — so it becomes mechanizable as soon
as the outnumbered rule supplies the first of those, and this field is its input, marking
which Armour Value is subject to the clause at all. A hauberk wraps and is never ignored;
a cloak's rear protection is exactly what an aware opponent steps around.

What stays out of scope is deriving the angle itself from token rotation. The rules
deliberately abstract that away, and computing it would have the system make a ruling
they left open.

`armorFacingFor()` answers which side a layer protects, and a content spec fixes which
articles are one-sided so that adding another — a backplate, say — is a deliberate act.

Closes #1331.
