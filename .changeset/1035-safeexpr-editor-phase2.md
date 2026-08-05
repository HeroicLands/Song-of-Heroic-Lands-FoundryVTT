---
"sohl": minor
---

**SafeExpression editor Phase 2: syntax highlighting, autocomplete, and rollout**

Builds on the Phase 1 editor (#1031). The formula-field editor is now a full
CodeMirror editor:

- **Syntax highlighting** via a custom SafeExpression tokenizer (not JavaScript):
  registered helper names read as functions, the bound namespaces (`attr`, …) as
  namespaces, and only the operators the evaluator implements are recognized — so
  highlighting matches the real grammar.
- **Autocomplete** fed by the live helper registry plus each field's context
  identifiers (helpers insert with their call parentheses).
- **Rollout** via a shared `expressionField` Handlebars partial (form field + edit
  button): the Skill sheet's **Skill Base** and the Affliction sheet's
  **outcome-trauma** SafeExpression fields now both use it. (The affliction
  _duration_ formulas and an attribute's _init-dice_ formula are dice-roll
  formulas, not SafeExpressions, so they are intentionally not converted; the
  action `trigger`/`visible` and Active-Effect `test` fields are JavaScript-typed
  in foundation modules and are left for a separate change.)

**Build note.** CodeMirror is bundled from the `@codemirror/*` packages. Because
the release build is unminified, a scoped Vite plugin renames `style-mod`'s
top-level `top` binding (which would otherwise collide with the unforgeable
`window.top` at load), and `@codemirror/commands` is deliberately not bundled (its
top-level `history` export would shadow the global `history`). We construct the
`EditorView` ourselves rather than reusing Foundry's `<code-mirror>` element,
which renders blank inside a dialog popup.

Closes #1035
