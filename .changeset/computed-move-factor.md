---
"sohl": patch
---

**Fix: `computedMove` now applies the combatant's `moveFactor` (#252)**

`SohlCombatantLogic.computedMove()` returned the being's corpus `feetPerRound`
verbatim and never read `system.moveFactor`, so the situational move scalar (run,
difficult terrain, haste, …) was silently dropped even though the field exists to
scale tactical move. It now returns `feetPerRound × moveFactor` (`moveFactor`
defaults to `1`, so unscaled behavior is unchanged). `displayedMove` inherits the
fix via delegation.
