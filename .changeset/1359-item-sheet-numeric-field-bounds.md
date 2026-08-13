---
"sohl": patch
---

**e2e: the item-sheet suite now probes each numeric field with a value that field
permits.** The shared `itemSheetSuite` "persists edits to its simple properties
fields" test typed `3` into every enabled numeric input and asserted the
round-trip, so any field whose schema bounds exclude `3` failed against a system
behaving correctly — Foundry cleans an out-of-range value back to the field's
initial. `ArmorGearDataModel.perceptionPenaltyBase` (`max: 0`, because a
perception penalty is zero or negative) made `item-sheet-armorgear.cy.js` fail
deterministically. The suite now reads each numeric input's bounds — from its
schema field, falling back to the input's own `min`/`max` attributes — and picks
the first in-range candidate that differs from the current value, so the edit
still proves persistence (a `max: 0` field is probed with `-3`) and any bounded
field added later is handled without touching the suite. (Closes #1359.)
