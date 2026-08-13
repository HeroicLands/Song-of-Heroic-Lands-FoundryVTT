---
"sohl": patch
---

Point three craft cross-references at Weaponcraft's rules rather than its sheet
([#1366](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1366)).

Textilecraft sends the reader to the armour-making routine; Metalcraft and
Woodworking send them to the weaponmaking routine. All three linked
`[[skill/wpnc]]`, which addresses the Weaponcraft **item** — following one opened
a sheet of numbers instead of the rules the sentence was pointing at.

Each now uses `[[docskill/wpnc#crafting]]`, the address for that item's
documentation, landing on the Crafting page that actually carries those routines.

The anchored form was written this way first, then backed out, because it
compiled to a UUID under the items pack and dead-ended — the defect since fixed.
