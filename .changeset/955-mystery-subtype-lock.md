---
"sohl": patch
---

**Lock `Mystery.subType` and reconcile the Mystery / Mystical-Ability subtype taxonomy**

`Mystery.subType` is now `required` with no default, matching
`MysticalAbility.subType`: a Mystery must declare its kind at creation rather than
silently defaulting to _other_. This is a non-additive schema lock ahead of the
planned Being-centric beta freeze; existing worlds are unaffected, since every
stored mystery already carries a `subType`.

The subtype documentation is reconciled with the enums it drifted from:

- Removed the phantom **Birthsign** entry from `MysticalAbilityLogic`'s subtype
  list — birthsign is a _Mystery_, not a Mystical Ability.
- Rewrote `MysteryLogic`'s stale subtype list (which named `FateBonus`,
  `FatePointBonus`, and Ancestor/Totem "Spirit Power" subtypes that do not exist)
  to the seven real subtypes, and noted the intended fate model: the _Fate_
  invocation is a **Divination** Mystical Ability, a per-skill fate bonus is
  modelled with **Active Effects**, and a fate-point bonus is not yet modelled.
- Corrected the `BLESSING` enum description, which was a copy of `OTHER`, and
  refreshed the `BUFF` / `FATE` / `GRACE` / `PIETY` wording.

Closes #955
