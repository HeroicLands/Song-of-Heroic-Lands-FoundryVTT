---
"sohl": patch
---

**Restore Affliction Course / Treatment / Healing action gating**

The Course Test, Treatment Test, and Healing Test intrinsic actions were left
unconditionally visible (`visible: "true"`) during the port to the Foundry-free
logic layer, so the context menu offered them regardless of the affliction's
state. Their gating is restored against the ported logic:

| Action         | Now visible when                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Course Test    | affliction is **active** (not dormant) **and** the bearer has a usable Endurance attribute                     |
| Treatment Test | affliction is **untreated**                                                                                    |
| Healing Test   | affliction **heals naturally** (healing rate not disabled) **and** the bearer has a usable Endurance attribute |

The gating is exposed as the `hasCourse` / `canTreat` / `canHeal` getters on
`AfflictionLogic` and referenced from the actions' `visible` predicates. The old
port left a FIXME claiming the original gate involved a `pysn` skill and an
`isBleeding` flag; that was a mis-copied Trauma gate — afflictions have no
bleeding concept — so no bleeding gate is applied.

Closes #65
