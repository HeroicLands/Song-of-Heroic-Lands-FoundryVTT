---
"sohl": patch
---

**Fix stale SafeExpression completion test asserting a removed helper**

`tests/apps/expression-completions.test.ts` asserted that a `birthsignBonus`
helper is offered in the SafeExpression editor's autocomplete, but the astrology
helpers were renamed to `astrologySign` / `astrologySettings` (#1018), leaving no
`birthsignBonus`. The assertion now targets the currently-registered
`astrologySign`, so the unit suite is green again. Test-only; no shipped behavior
change.

Closes #1041
