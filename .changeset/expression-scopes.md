---
"sohl": minor
---

**Expression scopes — every SafeExpression call site now declares what is in play**

A `SafeExpression`'s bindings used to be implicit: each call site built an ad-hoc
object literal and handed it to `evaluate()`, so writing an identifier that site
did not bind parsed cleanly, threw at evaluation, was caught by the caller, and
silently disabled the feature. Nothing connected the identifiers an author could
write to the identifiers actually supplied — not the type system, not the editor,
not the documentation.

Each of the twelve call sites now declares an **expression scope**: a named set of
bindings, each with a description, in `src/entity/expr/expression-scopes.mjs`.
That one declaration is what the runtime validates against, what the formula
editor autocompletes from, and what the developer documentation is generated
from, so the three cannot drift apart.

- _Out-of-scope identifiers are rejected at construction_, with an error naming
  the offending identifier and listing the legal ones — once, where the
  expression is authored, instead of a warning on every render. Only the **root**
  of a member chain is checked (`itemLogic.a.b` validates `itemLogic`).
- _The formula editor offers exactly the declared identifiers_, with their
  descriptions, and flags an out-of-scope name as you type — **Save** stays
  disabled, as it already did for a syntax error. A `SafeExpressionField` carries
  its scope id, so this comes from the schema; the hand-typed
  `data-context="attr"` template attribute is gone.
- _The bound-variables table_ in the Expressions concept doc is generated
  (`npm run docs:expr-scopes`) and guarded by `npm run lint`. It had fallen four
  call sites behind.
- _A bare helper reference_ (`sb` instead of `sb(...)`) is now also caught at
  construction wherever a scope is declared.

Closes #1142.

**Fixes: Shock Re-Test was hidden in every state**

The `shockReTest` intrinsic action's visibility expression reads `actorLogic`,
which the action-`visible` binding never supplied — so it threw on every menu
render and the action was unconditionally hidden. The action-`visible` scope now
binds `actorLogic`, resolved the same way the action's own execution resolves it
(row actor → row item's actor → the owning logic's actor), which also makes
`visible` and `trigger` agree on what they see. An Incapacitated or Unconscious
being offers Shock Re-Test on its Actions context menu; no other state does.

Closes #1090.
