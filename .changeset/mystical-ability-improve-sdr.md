---
"sohl": minor
---

**Mystical Abilities can now be improved, not just flagged** ([#1130](https://github.com/Song-of-Heroic-Lands/Song-of-Heroic-Lands-FoundryVTT/issues/1130))

A Mystical Ability could be flagged for improvement from two places — the ☆ star
on its Mysteries-tab row and the **Improvement Flag** checkbox on its Properties
tab — but nothing ever consumed the flag. There was no counterpart to the Skill's
_Improve with SDR_.

- **The improvement quartet is now on Mystical Abilities too** — _Toggle Improve
  Flag_ and _Improve with SDR_ in the Actions context menu, plus the two hidden
  half-toggles (_Flag for Improvement_ / _Clear Improvement Flag_) kept for
  scripts. They run the **same code** the Skill's do, so the two can never drift.
- **A successful SDR raises the ability's own mastery level by 1** and clears the
  flag; a failure clears the flag alone. The roll is `1d100` against the current
  base mastery level — an ability has no Skill Base of its own to add.
- **The ☆ star now appears only where it means something.** An ability that draws
  its mastery level from an Associated Skill (or, for a Spirit Rite or Spirit
  Action, a Spirit Power) improves when _that_ item improves, so it shows no star
  and offers no improvement actions.
- **Improving an ability never touches its Associated Skill** — every write lands
  on the ability alone.

Also removes the dead `SOHL.MysticalAbility.FIELDS.isImprovable.*` strings and
the sheet's stale reference to the field they described, removed in #815.
