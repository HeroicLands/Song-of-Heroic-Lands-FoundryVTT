---
"sohl": minor
---

**Implement chat-card edit-action dispatch**

Clicking the edit icon on a posted chat card (standard-test, opposed-result) now re-runs the named action on the owning document instead of silently doing nothing.

**Changes:**

- `chat-card-dispatch.ts` — adds `dispatchChatCardAction(logic, btn)`: reads `dataset.action`, builds an `SohlActionContext`, looks up the action in `logic.actions` (by name, executor id, or title), falls back to a direct method call, and warns via `sohl.log.warn` when nothing matches. The two dead no-op exports (`onChatCardButton`/`onChatCardEditAction`) are removed.
- `SohlItem.onChatCardEditAction` — replaces the `TODO(#66)` stub: ownership-gated (`this.isOwner`), then delegates to `dispatchChatCardAction(this.logic, btn)`.
- `BeingLogic.onChatCardEditAction` — same pattern: ownership-gated (`this.actor?.isOwner`), then delegates to `dispatchChatCardAction(this, btn)`.

_Ownership check applies per #167's guidance (edit path only; the button path is tracked separately under #167)._

Closes #66.
