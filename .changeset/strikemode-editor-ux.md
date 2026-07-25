---
"sohl": patch
---

**Fix: Strike Mode editor & tab UX — read-only type, auto-save, create dialog, list columns (#687)**

Refines the Strike Mode editor and the Weapongear Strike Modes tab:

- **Type is read-only.** A strike mode's type is fixed at creation and shown as a
  plain label in the editor — to change it, delete the mode and create a new one.
- **Auto-save.** The editor persists on every field change; the Save button is
  gone.
- **Labels.** _Governing Skill Override_ → _Associated Skill_; the Attack section's
  _Attack Modifier_ → _Modifier_; the Impact section's _Dice_ → _Num Dice_; and
  _Spread_ → _Zone Die_ when the `useZoneDie` world setting is on.
- **Create dialog.** The Strike Modes tab's `+` now opens a dialog asking for
  **Type, Name, and Shortcode** (shortcode validated unique within the weapon);
  _Create Strike Mode_ adds it, dismissing the dialog adds nothing.
- **List columns.** The tab lists **Name, Shortcode, Type, Impact formula**, and the
  row controls (replacing the previous Name / Type / Reach / Aspect layout).
- **Wider sheet.** The Weapongear sheet is 100px wider to give the columns room.
