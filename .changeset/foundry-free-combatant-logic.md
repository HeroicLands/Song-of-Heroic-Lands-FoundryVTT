---
"sohl": minor
---

**Foundry-free combatant logic (`CombatantLogic`)**

The Combatant now has a logic layer on the same footing as actors and items,
consolidating combat logic that was previously split across the document,
`combatant-logic.ts`, and the combat-action helpers.

- `SohlCombatantDataModel` extends `SohlDataModel` (gaining the `SohlLogicData`
  port); a new `CombatantLogic` is registered and resolved by
  `SohlDataModel.create`, so `combatant.logic` returns a `CombatantLogic`.
- `CombatantLogic` owns the combatant's combat-scoped state (last attack/block
  mode, `didAction`, move factor), capability (`reach`, `computedMove` via
  `this.actorLogic`), relational queries (`groupId`, `allies`, `isEnemyOf`,
  `threatenedBy` over sibling combatant logics), and spatial queries
  (`reaches`, `spacesMovedThisTurn`). `SohlCombatant` delegates to it.
- The token-center geometry moves to `FoundryHelpers`
  (`combatantGridDistance` / `combatantSpacesMoved`) — the one scene-coupled
  edge — and **`sohl.currentCombatCombatantLogics`** exposes the
  `CombatantLogic` of every combatant in the active combat.
