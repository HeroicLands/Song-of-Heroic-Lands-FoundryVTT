---
"sohl": minor
---

**Permanent impairment from slow-healing wounds**

An eligible injury that takes a long time to heal now leaves a **permanent
impairment** on its body part, completing the Injury Impairment model (the
indefinite, severity-scaled impairment already tracked down as a wound heals is
#464).

- New Foundry-free `permanentImpairmentFor(days)` (time-to-heal table: none under
  20 days, then −5 per completed 20-day band, floored at −25).
- When `TraumaLogic.healingCheck` heals an eligible injury (flagged by the
  Treatment Test, #553) to Injury Level 0, it records the permanent impairment on
  the injured body part via `BeingLogic.applyPermanentImpairment`, which worsens
  the part's persisted `permanentImpairment` (worst-of) with a whole-array write.
- The body-part impairment rollup already consumes `permanentImpairment` as a
  floor, so the impairment persists after the wound itself has healed.

Closes #554
Part of #548
