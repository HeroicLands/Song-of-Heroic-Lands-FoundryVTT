---
"sohl": patch
---

**Reconcile the Combat Model developer doc with the current combat code**

The `docs/concepts/combat-model.md` combat concept doc (and two source JSDoc
comments it flagged) had drifted as follow-up combat fixes landed:

- Dropped the "turn-start location field-name mismatch" caveat — `updateCombat`
  now records `startLocation` correctly (fixed in #390).
- Dropped the "`moveFactor` is unapplied" caveat — `computedMove()` now scales the
  being's `feetPerRound` by `moveFactor` (fixed in #393); updated the combatant
  properties table to match.
- Removed the stale `allyIds` / `threatenedAllyIds` relationship-state row (those
  fields and their mutators do not exist; combat relationships are computed).
- Corrected the assisted-impact description: `_onRollStrikeModeImpact` dispatches
  the actor's `calcImpact` action, it does not call the strike mode's `calcImpact`.
- Fixed the `injuryButton` and `SohlCombat` group-seeding JSDoc so they match the
  code (aim is forwarded for aimed blows → automated injury; the desired group
  name comes from `actor.system.defaultCombatGroup`), and removed the now-resolved
  "stale docstrings" caveat.

Closes #384
