---
"sohl": minor
---

**Strike Modes tab + editor on Weapongear and CombatTechnique sheets (#663)**

Add a **Strike Modes** tab to the Weapongear and CombatTechnique item sheets so a
strike mode can be created, edited, and removed from the sheet instead of only
through raw data or seeded defaults.

- The tab lists **one row per strike mode** (name, type, reach/range, aspect),
  with a **⋮** menu offering **Edit** and **Delete** (plain menu items, not
  SohlActions).
- **Add Strike Mode** appends a blank strike mode to the item and opens the new
  **Strike Mode editor** on it.
- The **Strike Mode editor** (`StrikeModeConfig`) is a small Application that
  edits an embedded strike mode's fields and handles the melee/missile
  discriminated union via a type selector, persisting through the item's
  `update()`.

CombatTechnique keeps its single `system.strikeMode` (no data-model change or
migration): its tab shows the one strike mode as a single row and offers **Add**
only when it currently has none. Weapongear continues to store many strike modes
at `system.strikeModes.<id>`. The combat technique's strike mode is no longer
edited inline on the Properties tab — it moves to the shared Strike Modes tab and
editor.
