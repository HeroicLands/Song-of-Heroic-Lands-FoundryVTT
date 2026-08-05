---
"sohl": patch
---

**Fix stale `@str`/`@dex` `skillBaseFormula` syntax in e2e specs**

Four Cypress specs still wrote `skillBaseFormula` using the pre-#972 `@str` / `@dex`
reference syntax. Since #972 the skill base is a value-returning `SafeExpression` over
the `attr.<shortcode>` namespace, so `@str` fails to parse and `skillBase` resolves to
`0` — which broke the `being-build` `initSkillMult` test's `skillBase > 0` assertion.

- `being-build.cy.js` and `skill-value-test.cy.js` → `sb(attr.str, attr.agl)` /
  `sb(attr.str, attr.dex)`.
- `fate-spend.cy.js` and `gm-result-edit.cy.js` carried the same stale form (harmless
  there because each set `masteryLevelBase` explicitly); updated for consistency so no
  `@`-namespace formula remains in the suite.

Closes #996
