---
"sohl": patch
---

**Enable type-aware `@typescript-eslint/consistent-return` lint rule (#235)**

Enables the type-aware `@typescript-eslint/consistent-return` ESLint rule (with the base `consistent-return` rule turned off to avoid false positives on `void` returns). The type-aware version correctly distinguishes functions returning `Promise<T | undefined>` — where bare `return;` is inconsistent with `return value;` — from `Promise<void>` functions where bare returns are fine.

**Changed files:**

- `eslint.config.js` — added `parserOptions.project: true` + `tsconfigRootDir`, disabled base `consistent-return`, enabled `@typescript-eslint/consistent-return`
- All bare `return;` statements in non-void async functions changed to `return undefined;` across: `SohlLogic`, `SohlActor`, `SohlItem`, `SohlCombatant`, `BeingLogic`, `SohlCombatantLogic`, `SohlTokenDocumentLogic`, `MasteryLevelModifier`, `StrikeModeBase`
- `_preUpdate`/`_preCreate` overrides that fell off the end without a return now have an explicit `return undefined;`
