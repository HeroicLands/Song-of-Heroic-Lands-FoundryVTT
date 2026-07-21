---
"sohl": patch
---

**Fix: actor-addressed chat-card buttons never dispatched**

Chat-card buttons and edit-actions whose handler is an **actor** (`data-handler-uuid`
= an Actor uuid) were silently dropped: `sohl.ts` calls `doc.onChatCardButton` /
`doc.onChatCardEditAction` on the resolved document, but `SohlActor` defined neither
(the handling lived on a dead `static BeingLogic.onChatCardButton` and an unreachable
`BeingLogic.onChatCardEditAction`). This broke the `createInjury` "Calculate Injury"
button and the injury card's Shock Roll (`injuryShock`).

- `SohlActor` now defines `onChatCardButton` / `onChatCardEditAction` that owner-gate
  (#167) then delegate to the shared `dispatchChatCardAction` chokepoint — mirroring
  `SohlItem` / `SohlCombatant` / `SohlTokenDocument`.
- `createInjury` is now a normal action-dispatched method (`BeingLogic.createInjury`,
  reading `context.scope`) that flows through that chokepoint, replacing the private
  `onCreateInjury(btn)` and the dead static special-case.

Closes #572
