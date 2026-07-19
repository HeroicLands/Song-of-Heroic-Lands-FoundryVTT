---
"sohl": minor
---

**Add a calendar-aware `datePicker` Handlebars helper** (#530)

A new `{{datePicker}}` helper edits numeric **worldTime** fields (seconds since
the calendar epoch) through the active calendar, so dates no longer have to be
typed as raw world-time integers. The field stores and returns the same numeric
value; only the display and editing use calendar format.

The control shows the current value formatted by the active calendar and opens a
picker dialog with:

- a **month dropdown**, and numeric **day**, **year**, **hour**, **minute**, and
  **second** inputs;
- a **day-skip stepper** (± N days) that rolls months and years over correctly,
  including variable-length months and intercalary days;
- **Now** (set to the current world time) and **Clear** (set to empty) buttons;
- a live **preview** of the resulting date, with a red **"Invalid Date Format"**
  when the entered parts don't resolve to a real date.

Wired into the Trauma and Affliction date fields (`contractDate`,
`treatmentDate`). The worldTime ↔ calendar-parts conversion is a Foundry-free,
unit-tested core (`date-picker-logic`).
