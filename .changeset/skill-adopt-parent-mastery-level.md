---
"sohl": minor
---

**Skill: adopt a parent skill's mastery level**

Add an `adoptParentMasteryLevel` option to specialization skills. When a skill
declares a `parentSkillCode` and this flag is set, the skill adopts its parent
skill's mastery-level base as its own during `evaluate()` — taken from the
parent's static `masteryLevelBase` (so it is independent of cross-item
evaluation order) — before this skill's own boosts and `maxTarget` clamp apply
on top. Default `false`, leaving mastery-level derivation unchanged. The control
renders on the Skill properties tab only when a parent skill is set.

Closes #719
