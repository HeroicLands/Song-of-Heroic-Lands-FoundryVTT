---
"sohl": patch
---

**Fix: register the Combatant data model under `base` so combat works**

Combatants could not receive `SohlCombatantDataModel`: it was registered under a
`sohlcombatantdata` subtype that `system.json` `documentTypes` never declared, so
every combatant fell back to the typeless `base` model with no `system.logic`.
Group seeding then crashed on the first combatant added
(`Cannot read properties of undefined (reading 'groupId')`), making combat
non-functional end to end.

Register the single combatant data model under the always-valid `base` type (as
Scene already does). The data model's static `kind` is unchanged, so the
`COMBATANT_LOGIC` lookup still resolves `SohlCombatantLogic`. Combatants now carry
their logic, group seeding runs, and turns/rounds advance.

Fixes #142.
