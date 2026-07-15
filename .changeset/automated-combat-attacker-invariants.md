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
pure and unit-tested. These attacker/target invariants are orthogonal to the
turn gate (only the current combatant may _start_ an attack, added separately);
out-of-turn **defenses** — a counterstrike or a Tactical-Advantage follow-up — run
through the defense-resume path and are unaffected by either. The
`combat-resolution-pipeline` and `combat-model` docs are updated to match the
wired enforcement (the previously-cited `resolveAttackContext` was dormant).
