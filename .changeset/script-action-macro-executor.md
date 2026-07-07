---
"sohl": minor
---

**Script Actions run a Foundry Macro instead of compiled code (#156)**

A Script action's `executor` is now the **UUID of a Foundry `Macro`**, run via
`Macro#execute`, rather than a JavaScript body compiled by `textToFunction`.
This removes the last place the system compiled code from document data (the
SEC-1 executor surface) and gives GM "homebrew" a first-class, permission-gated
home: `Macro#execute` enforces the `MACRO_SCRIPT` permission and ownership, and
no code is ever compiled from serialized data. See the
[Security Model](../docs/concepts/security-model.md).

- New `fvttExecuteMacro` shim resolves a Macro UUID and runs it with the action
  scope (`{ actor, item, speaker, scope }`). Intrinsic actions are unchanged
  (a bound method-name lookup on the target logic).
- The action `executor` field is now a `StringField` (a reference), not a
  `JavaScriptField` — no executable source is stored on a document.
- **Removed `SohlAction.executeSync`** and the now-dead `isAsync` action field:
  a Script action runs a macro and is therefore always asynchronous, so a
  synchronous execution path is impossible and was a trap. A GM who needs a
  synchronous computed value uses a `SafeExpression` field instead.
