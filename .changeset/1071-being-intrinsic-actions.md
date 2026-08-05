---
"sohl": patch
---

**User Guide: the Being page now documents its Intrinsic Actions**

The Being page mentioned an _Actions_ tab twice and described nothing in it. A
player who opened that tab — or met a Rally card or a scheduled Shock Re-Test
reminder in chat — had no reference for what any of it did. `Actor_Being.md`
gains an **Actions on a Being** section indexing all fourteen menu actions, then
one entry per action giving its name, shortcode, icon, how it is invoked, and a
link to its API documentation:

- **Shock** — _Shock Test_ (`shockTest`) with its Base Shock State Index field,
  the index-to-state mapping, the consent-gated _Set Shock State?_ dialog, and
  the Re-Test reminder offer; and _Shock Re-Test_ (`shockReTest`), flagged
  **hidden** and reached only from the reminder's **Perform** button, with the
  Extended Shock / Coma outcomes it can produce.
- **Keep-control tests** — _Stumble_ (`stumbleTest`) and _Fumble_ (`fumbleTest`),
  the better-of-attribute-or-skill rule, and their four-outcome result tables.
- **Psychological tests** — _Fear_ (`fearTest`), _Morale_ (`moraleTest`),
  _Reaction_ (`reactionTest`), _Rally_ (`rallyTest`), and _Resist the Pall_
  (`pallResist`): what each rolls, the state each result produces, the Psyche
  Stress it inflicts, and what is recorded on the sheet. _Answer the Rally_
  (`acceptRally`) is documented as **hidden** beside the Rally! card whose open
  button is its only trigger.
- **Injury flow** — _Calculate Impact_ (`calcImpact`) and its damage card, and
  _Resolve Injury_ (`resolveInjury`) with every field of the Resolve Injury
  dialog (Target ZN, Zone Die, Location, Aspect, Impact, Armor Reduction, Bleed
  Impact Penalty, Treatment Modifier, Add to Character Sheet), the Amputation
  Test dialog, and the result and miss cards.
- **Physician's actions** — _Perform Treatment Test_ (`performTreatmentTest`) and
  _Perform Blood Stoppage_ (`performBloodStoppage`), both run on the physician's
  own sheet, with their Physician-skill gate, their dialogs, and the owner-gated
  **Accept** button by which the patient — never the physician — records the
  result.
- **Contract Disease** (`contractDisease`) — the disease/custom-disease dialog,
  the contagion roll a character wants to _make_, and the onset-check offer.

Shared dialogs are named and linked to _Base Item_ rather than restated, and the
page cross-links the Shock, Fear, Morale, Pall, Injury, Bleeding, Healing Base,
Infection, and Afflictions rules. Two dead relative links on the page
(`user-guide/character-creation.md`, `user-guide/combat-basics.md`) are corrected
to wikilinks.

Closes #1071
