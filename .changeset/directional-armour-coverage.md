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
rather than a qualifier on all 309 armour articles. The thirteen cloaks now cover the
shoulders all round, and the thorax, abdomen, pelvis, thighs, knees and calves to the
rear — locations most of them were not recording at all, which is why a cloak read as
barely more than a mantle. The two breastplates mark their torso as front-facing;
cuirasses are all-round rigid and are left alone.

**One-sided articles cost half.** A breastplate is literally the front half of a cuirass,
and the table prices it that way — 60d / 4.6 lb against the cuirass's 120d / 9.1. Cloaks
were priced as though their rear coverage were full, so all thirteen are rescaled by the
same factor, which keeps every material's relative pricing intact: the base cloth cloak
moves from 66d / 3.3 lb to 34.5d / 1.7, matching coverage of 0.345 against the cloth base
price of 100.

**Data now; resolution when outnumbering lands.** The rules never ask which way a
combatant is pointing. They settle one-sided armour by circumstance, and the two cases
are not mirrors: rear-facing armour is ignored against one aware foe who can keep to your
front, and applies 50% of the time against several (d10 versus TN 5), while front-facing
armour is ignored when you are caught unaware from behind, and applies 70% of the time
against several (d10 versus TN 7). Both need the opponent count, awareness and a die
rather than an angle — so the clause becomes mechanizable as soon as the outnumbered rule
supplies the first, and this field is its input, marking which Armour Value is subject to
it at all. A hauberk wraps and is never ignored; a cloak's rear protection is exactly what
an aware opponent steps around.

What stays out of scope is deriving the angle itself from token rotation. The rules
deliberately abstract that away, and computing it would have the system make a ruling
they left open.

`armorFacingFor()` answers which side a layer protects, and a content spec fixes which
articles are one-sided so that adding another — a backplate, say — is a deliberate act.

Closes #1331.
