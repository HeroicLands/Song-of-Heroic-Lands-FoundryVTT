---
"sohl": minor
---

**Being Gear tab display**

The Gear tab now lists gear under **On Body** and under **each container** as its
own section, with Type / Qty / Weight / Qual / Dur / Notes columns, plus the
carried/worn toggles and a per-row context menu.

- **On Body** summarizes the being's overall load: total carried-gear weight
  (accumulated ground-up on `BeingLogic.carriedWeight`) and the resulting
  **encumbrance** for its active movement medium (`lineage.encumbrance`), e.g.
  _Carried: 10 lb · Enc 2_. A being with no lineage (an incorporeal being) shows
  0 encumbrance.
- **Containers** each show their own used / max capacity (from the container's
  max capacity).

Completes the Gear-tab epic (#301).

Closes #302
