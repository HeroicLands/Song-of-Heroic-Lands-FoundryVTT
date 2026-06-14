---
"sohl": minor
---

**SkillBase computed entirely in the logic layer**

`SkillBase` now takes the actor's `AttributeLogic` instances and a `TraitLogic`
birthsign instead of Foundry items, so skill-base resolution no longer touches
the Foundry layer.

- The constructor option changes from `{ items }` to
  `{ attributes?: AttributeLogic[]; birthsign?: TraitLogic }`.
- Attribute references are matched by `data.shortcode` and scored from
  `score.effective`; the birthsign tokens are read from the trait's
  `data.textValue`. Callers pass `actorLogic.logicTypes[ATTRIBUTE]`.
