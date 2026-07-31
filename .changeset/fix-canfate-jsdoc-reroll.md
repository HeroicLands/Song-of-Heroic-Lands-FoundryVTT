---
"sohl": patch
---

**Fix `canFate` JSDoc: Fate raises the success level, it never re-rolls**

Corrected the `canFate` getter's JSDoc in `SuccessTestResult` and the parallel
"re-roll" wording along the Fate path in `MysteryLogic` (the Fate mystery's
subtype description, the `assocSkillCode` doc, and the `evaluate()` comment).
Fate is spent **after** the roll to raise an already-settled test's success level
(e.g. MF→MS); the die is frozen and the outcome re-derives from the same roll — it
is never a re-roll. The old wording described the wrong mental model.

Closes #855
