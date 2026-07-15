---
"sohl": minor
---

**Affliction: disease/poison phase progression over world time**

Afflictions now progress through their phases on the event queue, mirroring the
Trauma healing/blood-loss scheduling. Adds temporal fields to Affliction
(`contractDate`, an `onset` and `resolution` one-shot triplet, and a recurring
`healingCheck` triplet via the schema helpers). On creation `_preCreate` seeds
`contractDate` and the incubation interval; `AfflictionLogic.finalize()` arms the
correct event by phase:

- **incubating** → the `onsetCheck` transition;
- **symptomatic** → the `resolutionCheck` transition plus the recurring
  `healingCheck`;
- **resolved** → nothing.

The `onsetCheck` / `healingCheck` / `resolutionCheck` intrinsic actions advance
the phase (crystallizing `onsetDate` / `resolutionDate` and rolling the next
intervals) and re-arm — reusable from the timed event or manually. The
per-phase roll **effects** are tracked as follow-ups (#488 onset, #489
course/recovery, #490 resolution).

Refs #483.
