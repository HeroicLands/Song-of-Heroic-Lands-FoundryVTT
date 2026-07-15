---
"sohl": minor
---

**Event queue dispatches through document actions with SafeExpression predicates**

When a subscription fires, the queue now **executes the action named by its
`kind`** on the owning document's logic, rather than a bespoke `handleSohlEvent`
handler. The trigger context (with the subscription's `payload` attached as
`ctx.payload`) becomes the action context's `scope`, and `kind` its `type` — so an
event reuses the same action a user can invoke manually, and one implementation
serves both.

Subscription predicates are now `SafeExpression`s evaluated against the trigger
context (e.g. `name === 'combatStart'`), replacing raw callback functions.
`SohlTriggerContext` gains an optional `payload`.

Refs #480.
