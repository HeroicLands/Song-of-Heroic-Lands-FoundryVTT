---
"sohl": minor
---

**Trauma: time-based healing and blood-loss scheduling**

Injuries now carry their healing and blood-loss timers as data and schedule them
through the event queue. Adds temporal fields to Trauma (`contractDate`,
`healingCheck*` and `bloodLossAdvance*` interval triplets via the schema helper),
makes `healingRateBase` nullable, and replaces the `healingSeconds` world setting
with `healingCheckDurationFormula` (default `"432000"` = 5 days) plus a new
`bloodLossAdvanceDurationFormula` (default `"86400"` = 1 day).

On creation a Trauma seeds its anchors to the current world time and its interval
formulas from those settings; `TraumaLogic.finalize()` arms the recurring
`healingCheck` (and, for a bleeding wound, `trauma::bloodLossAdvanceRoll`) events
from the persisted anchors. The `healingCheck` / `bloodLossAdvanceCheck` intrinsic
actions roll the next interval and re-arm — reusable both from the timed event and
manually. The per-occurrence roll **effects** are tracked as follow-ups (#486,
#487).

Refs #482.
