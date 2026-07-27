---
"sohl": patch
---

**Skill Development Roll now persists its outcome**

`SkillLogic.improveWithSDR` built an update payload but never applied it, so a
successful Skill Development Roll posted a "mastery increased" chat card without
actually raising the skill's `masteryLevelBase`, and the `improveFlag` was never
cleared (leaving the skill perpetually flagged for improvement). The method now
writes the payload back before posting the card: the improve flag is cleared and,
on a successful roll, the base mastery level is raised by `sdrIncr` — so the gain
the card announces is real.

Closes #716
