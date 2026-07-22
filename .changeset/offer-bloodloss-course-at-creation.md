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
- **Per-effect offer titles.** Because a bleeder wound now fires two offers
  back-to-back (healing check, then blood-loss advance), each schedule offer's
  title names its effect — "Set a Blood Loss Advance Reminder?" instead of two
  identical "Set a Reminder?" dialogs — so the player can tell them apart. The
  whole title is one localization string (`SOHL.Schedule.title`, with an
  already-localized `{actionName}`) so translations control word order.

With this, every recurring timed effect — healing, blood-loss, course — is armed
only at a human's behest, at creation and on every re-schedule.

**Tests.** A new e2e (`timed-effect-creation-offer.cy.js`) presses the _real_
offer buttons, modelling the player per the testing-doc rule of thumb: pressing
Schedule / Not Now on the **blood-loss** offer arms / leaves it unarmed, and a
**critical-failure healing test** (driven deterministically via the forced-dice
seam, `SimpleRoll.forceValues(100)`) contracts an infection whose **recovery
course** offer is then Scheduled by button. Two new reusable Cypress commands
support it — `cy.submitDialogMatching(text, action)` to answer a specific one of
several look-alike dialogs by content, and a hardened `cy.submitDialog` that only
targets a _rendered_ dialog (Foundry retains closed dialog instances, whose stale
elements otherwise leak across tests).

Refs #579, #598.
