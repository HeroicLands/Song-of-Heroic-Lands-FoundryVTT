---
"sohl": minor
---

**Foundry-free combat strike-mode collection and chat addressing**

The combat helpers and the Being combat-resume flow no longer reach the Foundry
actor for items or chat-target identity.
- `collectBlockableStrikeModes`, `collectAttackableStrikeModes`,
  `hasMeleeAttackStrikeMode`, and `resolveSkillMasteryLevel` now take the actor
  **logic** and iterate `logicTypes` / `getItemLogic` rather than `itemTypes`.
- Combat chat cards address the defender via the logic's own `name` and (opaque)
  `uuid`, and the opponent via an opaque `attackerAddress` (name + uuid) carried
  on the counterstrike context and resolved in the scene layer. Emission still
  goes through `SohlSpeaker#toChat`.
