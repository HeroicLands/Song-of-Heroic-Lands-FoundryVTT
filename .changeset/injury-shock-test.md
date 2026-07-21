---
"sohl": minor
---

**Injury Shock Test — a wound drives the being's shock state**

The injury card's **Shock Roll** button is now wired: when a wound calls for a
Shock roll, resolving it computes the wound's **Shock State Index** and worsens
the being's shock state accordingly.

- The button (`data-action="injuryShock"`) carries the wound's precomputed shock
  contribution (body-location Shock Value + Injury Level, including the
  glancing-blow point) and the glancing-blow roll bonus.
- `BeingLogic.injuryShock` rolls the **Shock** skill headlessly — the being's
  fatigue penalty applies and the glancing bonus is added, but injury-impairment
  penalties do not — and its result adjusts the Shock State Index (CF +2 / MF +1 /
  MS 0 / CS −1). The index maps to a shock state (`≤6` None … `≥10` Dead), and the
  being is worsened to it (an injury never improves an already-worse state).
- New pure helpers `shockStateFromIndex` and `shockIndexAdjustment` in the
  Foundry-free shock module.

Closes #555
Part of #548
