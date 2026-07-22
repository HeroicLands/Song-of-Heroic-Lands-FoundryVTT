---
"sohl": minor
---

**Offer blood-loss and recovery-course schedules too, instead of auto-arming**

Completes the "nothing auto-schedules" migration for timed effects (issue #579):
the two remaining recurring checks that still armed themselves — a bleeding
wound's **blood-loss advance** and a lasting condition's **recovery course** — are
now **offered**, matching the healing-check offer.

- **Blood-loss** is offered wherever a wound starts bleeding: when an injury bleeds
  on infliction (`createTraumaFromInjury`) and when a treatment leaves it bleeding
  (`TraumaLogic.treatmentTest` — was an auto-`sohl.schedule`).
- **Recovery course** (`courseCheck`) is offered when its lasting condition is
  created: an **Extended Shock / Coma** from a shock re-test
  (`BeingLogic.createLastingShock`) and an **infection** from a critical-failure
  healing test (`TraumaLogic.contractInfection`).
- **`TraumaDataModel._preCreate` no longer seeds any recurring schedule** — only
  the cadence config (the offer's default). Each creating action forwards its
  context, so the interactive path prompts (a dialog, per the prefer-dialog rule)
  while a scripted/bulk caller can pre-answer (`scope.schedule`) or suppress it
  (`skipDialog`).

With this, every recurring timed effect — healing, blood-loss, course — is armed
only at a human's behest, at creation and on every re-schedule.

Refs #579.
