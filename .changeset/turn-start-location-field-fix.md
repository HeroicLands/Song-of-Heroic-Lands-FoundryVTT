---
"sohl": patch
---

**Fix: turn-start location is now recorded under the field it is read from**

The `updateCombat` hook wrote the current combatant's turn-start position to
`system.initialLocation`, but the schema field — and the one
`spacesMovedThisTurn` reads — is `system.startLocation`. The value was therefore
never persisted where it was used, so movement-since-turn-start always read the
default. The hook now writes `system.startLocation` (#386).

The update payload is built by a new pure, unit-tested helper
`turnStartCombatantUpdate(center, elevation)`, which guards the field name
against a future typo.
