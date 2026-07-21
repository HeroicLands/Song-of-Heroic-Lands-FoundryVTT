---
"sohl": minor
---

**Timed effects remind, they no longer auto-perform**

When a scheduled effect comes due, the event queue now posts an owner-gated
**[Perform] reminder card** instead of running the effect on its own — the core
of the consent model (issue #579). Nothing mutates a character until that
character's controller clicks [Perform]; the click runs the *same* action the
queue used to run automatically, on the effect's document.

- `SohlEventQueue.dispatchOne` posts `templates/chat/reminder-card.hbs` (a
  `[Perform]` action-card button addressed to the effect's **document** via
  `data-handler-uuid` — an item, actor, or any document — carrying the trigger
  context + payload as its scope) rather than calling `executeAction`.
- De-duplicated by `(uuid, actionName, fireAt)` so a due occurrence is offered
  once, not on every world-time advance while it sits unperformed.
- Renamed `SohlSubscription.kind` → `actionName` (a runtime-only field): the
  queue is a *deferred action runner* — it stores which action to run on which
  document, and `actionName` names that action.
- The seven timed effects (#486, #487, #488, #489, #490, #556, #557) all flow
  through this — none of them can apply to a character without a click.

Part of #579. Follow-ups: make the effect *offer to reschedule* the next
occurrence (dialog/scope, per the self-sufficient action contract) instead of
auto-re-arming, and offer the first schedule at creation.
