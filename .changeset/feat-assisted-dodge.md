---
"sohl": minor
---

**Assisted dodge: skill ML cells are rollable on the Skills tab**

The skills tab now has a clickable mastery-level value for every skill (displayed in the `ML` column). Clicking the ML rolls a success test via `SkillLogic.successTest`, matching the roll pattern of the combat tab's attack/block/counterstrike cells. Hold Shift to skip the dialog.

**Changes:**

- `BeingSheet` — adds a `rollSkillTest` action handler (`_onRollSkillTest`) that reads the skill item from the clicked row's `data-item-id`, then calls `skillLogic.successTest(context)`.
- `templates/actor/being/skills.hbs` — the ML cell gains `class="rollable"` and `data-action="rollSkillTest"`.

_The Dodge skill is the primary consumer (it is the only defensive skill offered in the automated-combat flow), but all skills in the tab are now directly rollable._

Closes #187.
