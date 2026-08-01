---
"sohl": patch
---

**Add missing JSDoc `@returns` on two public members**

`_processSubmitData` (the shared sheet mixin) and `defineIntrinsicActions`
(`SohlItemBaseLogic`) each carried a JSDoc block with no `@returns` tag, which
tripped `eslint`'s `jsdoc/require-returns` rule and left the published API docs
incomplete. Each now documents its return value, and `eslint src/` runs clean.

Closes #884
