---
"sohl": patch
---

**Security:** Fix XSS in `CalendarSettingsMenu._onDeleteCalendar` via imported calendar name (#163).

`cal.label` (verbatim from a GM-imported JSON file) was passed to `game.i18n.format` without HTML escaping. A calendar named `<img src=x onerror=…>` would execute when the GM opened the delete confirmation dialog. Also fixed the sibling import-success notification that used `calendarConfig.name` unescaped.

Both `cal.label` and `calendarConfig.name` are now wrapped with `foundry.utils.escapeHTML` before interpolation. Also adds `foundry.utils.escapeHTML` and `foundry.utils.deepClone` stubs to the test setup.
