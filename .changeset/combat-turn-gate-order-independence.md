---
"sohl": patch
---

**Stabilize the `combat-turn-gate` e2e spec against run order**

The automated-combat turn-gate spec (#384) no longer depends on the ambient,
viewport-resolved `game.combat` being `undefined` headless — an assumption that
held only in isolation. Once a preceding combat spec had rendered the combat
tracker, `game.combat` resolved this spec's active combat with the attacker as
the current combatant, so the gate passed and the flow warned about the target
instead of the turn (a full-suite-only failure).

The spec now pins the combat's current turn to the **defender** and drives the
**attacker**, so the current combatant is never the attacker and the gate always
short-circuits with a turn reason, regardless of how `game.combat` resolves.
Test-only change; the gate logic is unchanged. Closes #638 and #644.
