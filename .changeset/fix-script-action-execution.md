---
"sohl": patch
---

**Fix: Script actions never executed their referenced Macro**

Two bugs meant a Script action (an `actionDefs` entry running a referenced Foundry
Macro, #156) could never run, so its macro's return value never came back:

- **Stored actions lost their `shortcode`.** The `actionDefs` schema
  (`SohlDataModel`) omitted the `shortcode` field, so a persisted action's
  shortcode was stripped on save — `logic.actions.get(shortcode)` could never
  find it. Added the field.
- **`SohlAction.resolveContext` was one level short.** It walked
  `action -> logic -> data model` and read `documentName` off the data model
  (which has none), yielding an `undefined` owning actor. For a Script action
  that failed the execute-permission gate, so `execute()` returned early with no
  error. It now walks the full `action -> logic -> data model -> document` chain.

Also, the action context is now passed to the macro as `sohlContext` rather than
`scope`: `scope` collides with the fixed parameter Foundry's macro runner already
declares, which built the wrapper function with a duplicate parameter name.

Fixes #348.
