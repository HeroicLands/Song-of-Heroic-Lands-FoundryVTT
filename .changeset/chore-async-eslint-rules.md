---
"sohl": patch
---

**Add `no-floating-promises` and `await-thenable` ESLint rules**

Two new type-aware rules catch real async correctness bugs:

- **`@typescript-eslint/no-floating-promises`** — every Promise must be `await`ed, returned, or explicitly marked `void`. Catches fire-and-forget Promise chains that silently swallow rejections.
- **`@typescript-eslint/await-thenable`** — flags `await` applied to a non-Promise value, which is always a logic bug.

**Fixes found by the new rules:**

- `SohlDataModel` and `BeingSheet` — `super._onRender()` was called without `await` in an `async _onRender` override, meaning drag-drop rebinding and filter rebinding ran before the parent render completed.
- `SohlLogger` — `await new SourceMapConsumer(rawMap)` awaited a non-thenable constructor; `await` removed.
- All `this.render()` calls in UI event handlers and `action.execute()` / `doc.update()` calls in sync callbacks are explicitly marked `void` to signal intentional fire-and-forget.
