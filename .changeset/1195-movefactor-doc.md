---
"sohl": patch
---

**Correct the `moveFactor` status in the combatant reference**

_Scene, Token, and Combatant Systems_ claimed `moveFactor` was "stored on the
combatant but not yet applied", citing #252. That issue shipped:
`SohlCombatantLogic.computedMove()` multiplies the actor's effective
`feetPerRound` by `moveFactor`. The two developer docs contradicted each other,
since the Combat Model page already documented the applied behaviour.

- The _Movement state_ prose now states that `computedMove()` scales by
  `moveFactor`, and the stale `#252` citation is dropped from both pages.
- `displayedMedium` is described as the medium the tracker row _reports_ (seeded
  user-set › the actor's `currentMoveMedium` › schema default), with the
  standing caveat that `computedMove` does not yet honor it and always uses the
  actor's active medium — matching what Combat Model already records.
