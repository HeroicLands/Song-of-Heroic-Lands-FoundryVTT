---
"sohl": patch
---

**Show the Treatment Result card's outcome warnings (#846)**

`treatment-result-card.hbs` guards its infection / permanent-impairment / bleeder
/ amputation notes on `infect`, `impair`, `bleed`, and `newInj`/`newSev`, but
`BeingLogic.performTreatmentTest` never provided any of them, so those warnings
were unreachable.

A new pure `treatmentOutcome(aspect, band, code, normSuccessLevel)` helper derives
every special effect a Treatment Test produces — the Healing Rate, infection
exposure, bleeder, permanent-impairment eligibility, and (for an `AMP` treatment)
the new edged wound an amputation inflicts (`amputationInjury`). `performTreatmentTest`
now feeds those flags to the card, so it displays exactly what the treatment did.
The persist path (`TraumaLogic.applyTreatmentResult`) consumes the **same** helper,
so the card and the recorded injury state can no longer drift.
