---
"sohl": minor
---

**Relocate the automated combat defenses to the combatant**

A defender's automated-combat defenses are a combatant concern, so they move
off the actor and the attack card dispatches them to the combatant.
- The automated **Block** / **Dodge** / **Counterstrike** / **Ignore** resumes
  move from `BeingLogic` to `CombatantLogic` as intrinsic actions; `this` is the
  defender combatant and `this.actorLogic` supplies strike-mode capability.
  `BeingLogic` keeps only the attacker entry (`automatedCombatStart`).
- `SohlCombatant` gains `onChatCardButton`, dispatching generically to its
  logic. The attack card's defense buttons now address the defender's
  **combatant**, and `chat-card-gating` reaches the actor (statuses, capability)
  through it. The "Calculate Injury" buttons still address the **actor**.
- `SohlLogic.actor` resolves the owning actor from the document, so it works for
  a combatant (or effect) instead of throwing.
