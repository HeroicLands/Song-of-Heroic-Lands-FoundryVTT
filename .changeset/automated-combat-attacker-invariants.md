---
"sohl": patch
---

**Fix: enforce automated-combat attacker and target invariants**

`startAutomatedAttack` now refuses to begin an automated attack when an invariant
is violated, instead of proceeding regardless (#387):

- The **attacker** cannot attack while out of the fight — dead, vanquished
  (Foundry-DEFEATED), unconscious, asleep, restrained, paralyzed, frozen, or
  incapacitated (`attackerBlockingStatus` / `ATTACK_BLOCKING_STATUSES`).
- The **target** must resolve to a combatant in the active combat, and cannot be
  **dead or defeated** — a defeated (killed/surrendered) combatant is no longer a
  valid target (`targetInvalidStatus` / `TARGET_INVALID_STATUSES`).

Each violation aborts with a player-facing notification. The status predicates are
pure and unit-tested. There is deliberately no "current combatant / your turn"
gate, so automated and assisted combat remain freely interleavable. The
`combat-resolution-pipeline` and `combat-model` docs are updated to match the
wired enforcement (the previously-cited `resolveAttackContext` was dormant).
