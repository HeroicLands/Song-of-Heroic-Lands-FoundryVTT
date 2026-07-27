---
"sohl": patch
---

**Skill sheet: editable Parent Skill, and specialization shown in the label**

The `parentSkillCode` field marks a skill as a specialization of another skill,
but it had no control on the Skill sheet and never surfaced in a skill's display
label — a specialization could only be set by editing raw data, and looked
identical to a standalone skill.

- **Parent Skill control** — the Skill properties tab now renders an editable
  `parentSkillCode` field, bound to `system.parentSkillCode`, for every skill.
- **Nullable field** — `parentSkillCode` is now a nullable, non-blank
  `StringField` (`initial: null`). A blank entry is stored as `null`, and any
  legacy empty-string value is cleaned to `null` on load, so "no parent" has a
  single representation.
- **Label** — a specialized skill's `label` now appends its parent skill's name
  in parentheses (e.g. `Sword (Combat)`), built from the localizable
  `SOHL.Skill.labelWithParent` format string.

Closes #710
