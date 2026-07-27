---
"sohl": patch
---

**Skill: consume `initSkillMult` to open mastery level; show it on the sheet**

The **Initial Skill Multiplier** (`initSkillMult`) was a persisted-but-inert field
— never displayed on the Skill sheet and never used to compute anything.

- **Opening mastery level.** `masteryLevelBase` is now nullable (`integer`,
  `min 0`, `initial null`). When it is unset (`null`) and the skill is on an actor,
  the skill opens deterministically at _Skill Base × initSkillMult_. A stored
  `masteryLevelBase` always takes precedence; off an actor the base stays 0.
- **Sheet.** The Skill Properties tab now shows an editable **Initial Skill
  Multiplier** control (existing `SOHL.Skill.FIELDS.initSkillMult` keys).
- **Content.** The `sohl` skill compendium ships `masteryLevelBase` unset so
  shipped skills actually open from their multiplier; the item pack builder now
  preserves an unset value as `null`. Existing worlds keep any explicit value
  (a stored `0` remains `0`), so no migration is required.

Closes #715
Closes #182
