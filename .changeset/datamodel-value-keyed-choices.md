---
"sohl": patch
---

**Fix: convert remaining DataModel array `choices` to value-keyed objects**

Foundry builds `<option>` values from `Object.entries(choices)`, so a DataModel
`StringField({ choices })` given an enum `values` array renders option values as
indices (`0`, `1`, …) — breaking any editable select of that field on submit.
This completes the sweep started in #149, converting the remaining choice fields
across the item / actor / combatant / strike-mode data models to the value-keyed
`choices` map now emitted by `defineType`:

- Item: skill (`subType`, `combatCategory`), mystery, mysticalability, trauma
  (`subType`, `aspect`), affliction (`subType`), concoctiongear (`subType`),
  projectilegear (`subType`), attribute (`bodyRole`), lineage (`bodyRole`,
  bleeding, amputation, move medium).
- Actor: cohort (member role), vehicle (occupant role); Combatant: displayed
  medium; StrikeModeBase: impact aspect.

Strike-mode `type` discriminators (a `TypedSchemaField`'s hidden discriminator)
are intentionally left as single-value arrays.

Fixes #148
