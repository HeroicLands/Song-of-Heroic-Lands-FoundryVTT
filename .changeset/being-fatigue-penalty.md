---
"sohl": minor
---

**Fatigue system — Fatigue Penalty from fatigue traumas**

Fatigue is modeled as `fatigue`-subtype **traumas** (windedness / weariness /
weakness recorded as separate instances because each recovers at its own rate),
not a being field. `BeingLogic.fatiguePenalty` is a derived `ValueModifier` that
sums the Fatigue Levels across every fatigue trauma, seeded in `finalize()`. The
penalty applies to tests and Move rate (consumers read `fatiguePenalty.effective`;
the shock and course tests fold it in). Part of #548. Closes #552
