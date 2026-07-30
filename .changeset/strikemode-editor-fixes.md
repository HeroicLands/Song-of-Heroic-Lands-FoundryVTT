---
"sohl": patch
---

**Strike Mode editor & tab UX fixes**

Refinements to the Strike Mode editor (`StrikeModeConfig`) and the Weapongear
Strike Modes tab:

- **Strike modes stored as an array.** A weapon's `system.strikeModes` is an
  `ArrayField` whose elements each carry their own editable `shortcode` (unique
  within the weapon), replacing the keyed-object shape; the compendium builder keeps
  the authored array shape. _No world migration is required._
- **Identity header like an item sheet.** The editor leads with a vertical identity
  stack — **name** large, **shortcode** small beneath, **type** medium beneath that
  — modeled on the SoHL item-sheet header, replicated in the editor's own
  `strike-mode-config` stylesheet (the `.sohl.sheet` header rules don't reach this
  frame). The `.form-group.stacked` fields no longer overlap.
- **Read-only type + auto-save.** A strike mode's type is fixed at creation and
  shown as a plain label (to change it, delete and recreate); the editor persists on
  every field change, and the Save button is gone.
- **Labels.** _Governing Skill Override_ → _Associated Skill_; the Attack section's
  _Modifier_; the Impact section's _Num Dice_; and _Spread_ → _Zone Die_ when the
  `useZoneDie` world setting is on.
- **Create dialog + list columns.** The tab's **+** opens a dialog asking for
  **Type, Name, and Shortcode** (shortcode validated unique within the weapon); the
  list shows **Name, Shortcode, Type, Impact formula**. The Weapongear sheet is 100px
  wider to give the columns room.

Closes #683
Closes #685
Closes #687
