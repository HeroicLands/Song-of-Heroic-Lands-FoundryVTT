---
"sohl": minor
---

**Resolve Injury — the injury flow becomes a single, richer intrinsic action**

The Being's injury flow is now one **Resolve Injury** action behind the intrinsic
action, the combat cards' injury buttons, and the sheet's Add Injury — replacing
the old `createInjury` handler and the separate `addInjuryViaDialog`. It seeds its
parameters from the action scope, derives the hit location (an explicit body
location, else the target body part — a random `VITAL` part when unspecified — and
the strike spread), and resolves the blow through the pure resolution pipeline.

New behavior on top of the old flow:

- **Armor reduction now applies only to a piercing aspect** (an armor-defeating
  point), matching the rules; other aspects ignore it.
- **Bleeding is judged on its own impact.** A new **bleed impact penalty** boosts
  the effective impact used _only_ for the bleeding check, so a bleed-prone strike
  can bleed at a higher effective severity than its injury level implies. With no
  penalty the bleed severity equals the injury severity (unchanged).
- **Amputation is resolved, not just flagged.** A G5 edged wound at an amputable
  location now rolls a **Strength test** (with a confirmable modifier) whose result
  may sever the location — fatal if it is vital — make it bleed, or penalize the
  Shock Roll by 20. The result card shows the outcome instead of a "roll manually"
  note.
- **A treatment modifier** can be set on the resulting wound
  (`treatmentModifierBase` on the Trauma), and whether the wound is recorded now
  defaults from the world's "record trauma" setting.

Under the consent model the combat injury button now opens the Resolve Injury
dialog so a human confirms the wound, rather than resolving silently.

Also fixes a data-model defect uncovered here: `TraumaData.treatmentModifierBase`
was declared on the interface but missing from the `TraumaDataModel` class
properties, breaking `build:types`.
