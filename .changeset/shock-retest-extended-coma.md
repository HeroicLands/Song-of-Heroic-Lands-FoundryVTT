---
"sohl": minor
---

**Shock Re-Test, Extended Shock, and Coma**

Ordinary shock can now be shaken off — or deepen into the lasting conditions of
Extended Shock and Coma, each with its own recovery.

- **Shock Re-Test** — `BeingLogic.shockReTest` resolves a re-test for an
  Incapacitated or Unconscious being: a headless **Shock** skill test at −20
  (fatigue penalty applies) that recovers from all shock (CS), improves to
  Stunned (MS), or drops the victim into **Extended Shock** (a `shock`-subtype
  trauma at Healing Rate 4/5) — or a **Coma** (a `coma`-subtype trauma) for an
  Unconscious victim on a critical failure.
- **Extended Shock / Coma course tests** — the two lasting-shock traumas recover
  through a recurring `courseCheck` (a `Healing Base × Healing Rate` test with
  the fatigue penalty; Extended Shock every 4 hours, Coma every d10 days). The
  Healing Rate shifts by the result (CF −2 / MF −1 / MS +1 / CS +2); at Healing
  Rate 0 the victim dies, and at 6 they recover — a recovering Coma additionally
  inflicts weariness fatigue equal to the days spent in it.
- New Foundry-free helpers in the shock module (`shockReTestOutcome`,
  `shockCourseHrDelta`, `comaHealingRate`, `SHOCK_RETEST_MODIFIER`) and a new
  `course` recurring-phase field triplet on the Trauma data model.

The Shock Re-Test is currently invoked on demand; its automatic scheduling
(end of the next turn / ten minutes later) is deferred to a follow-up.

Closes #556
Part of #548
