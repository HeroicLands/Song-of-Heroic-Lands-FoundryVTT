---
"sohl": minor
---

**Add temporal field and scheduling helpers**

Shared building blocks for timed item processes (injury healing / blood-loss,
affliction phases):

- **Scheduling** (`@src/entity/event/scheduling`, Foundry-free): `deriveNext(anchor,
  interval)` — the single definition of the next occurrence time (from the
  persisted anchor, never the clock); and `elapsedCheckpoints(lastAnchor,
  worldTime, interval)` — the ordered catch-up set for a time advance, guarded
  against non-advancing loops on a non-positive interval.
- **Schema factory** (`temporal-fields`): `phaseFields(name)` /
  `recurringPhaseFields(name)` stamp the repeating `{ …DurationFormula,
  …DurationBase, …Date | last…Date }` nullable field triplet with consistent
  nullability, plus `worldTimeDateField` / `durationBaseField` /
  `durationFormulaField` for standalone use.

Closes #481.
