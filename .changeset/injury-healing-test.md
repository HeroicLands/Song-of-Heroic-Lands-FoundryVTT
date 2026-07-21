---
"sohl": minor
---

**Injury Healing Test effect**

An `injury`-subtype trauma now heals over time: its recurring `healingCheck`
applies the **Injury Healing Test** at each elapsed checkpoint, in sequence. Each
is a headless test of `Healing Base × Healing Rate` — a marginal success reduces
the Injury Level by 1, a critical success by 2; a marginal failure does nothing;
a critical failure does no healing (infection-on-CF is completed by the Infection
work, #557). No test is made while the injury is untreated, already healed, or
while any active infection halts the patient's healing. A shared `rollTimedTest`
helper wraps `successTest({ skipDialog })` for the timed effects. Part of #548.
Closes #486
