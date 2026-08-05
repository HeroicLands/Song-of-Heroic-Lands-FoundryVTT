---
"sohl": minor
---

**A code editor for SafeExpression formula fields (Phase 1: Skill Base pilot)**

SafeExpression formula fields were edited as plain single-line text inputs with no
highlighting, no validation until runtime, and no discoverability of the available
helper functions. This adds the first piece of a richer editing experience:

- **`SafeExpression.validateSource(src)`** — a pure static check that returns the
  grammar error for an invalid expression, or `undefined` when valid/blank. It runs
  the exact jsep parse + allowlist the runtime uses, so editor validity never drifts
  from evaluation behaviour.
- **`SafeExpressionField`** — a `StringField` subclass (the stored value stays a
  plain string) that marks a field as holding an expression so the sheet offers the
  code editor. It intentionally does not reject an invalid formula at the schema
  boundary — invalid formulas are still stored and surfaced as warnings by the
  consuming logic (unchanged behaviour); the authoritative check runs live in the
  editor.
- **Expression editor dialog** — an edit button beside a formula field opens a
  popup with a monospace editor, **live validation** against the real SafeExpression
  grammar (the status line and the Save button react on every keystroke; Save is
  disabled while the expression is invalid), and a click-to-insert palette of the
  registered helpers.

Wired as a pilot on the Skill sheet's **Skill Base** field. Follow-up work — syntax
highlighting and registry-fed autocomplete (a bundled CodeMirror instance), and
rollout to the other formula fields — is tracked on the issue.

Closes #1031
