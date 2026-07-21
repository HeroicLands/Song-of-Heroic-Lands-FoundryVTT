---
"sohl": minor
---

**Injury Treatment Test — establish an injury's Healing Rate**

A `trauma` of subtype `injury` now supports the Physician **Treatment Test** that
establishes its Healing Rate, unblocking the Injury Healing Test (#486, which
assumes the rate is already set).

- **Treatment Test action.** The `treatmenttest` intrinsic action rolls the
  owning being's **Physician** skill headlessly at the difficulty of the wound's
  _required treatment_ (looked up from the wound's aspect and severity band), and
  maps the result and severity to the injury's Healing Rate. A `HEAL` result (a
  critical success on a minor wound) heals the wound outright.
- **Untreated resolves as a Critical Failure.** With no owning being able to roll
  (a headless/GM context, pending the interactive physician card of #547), the
  treatment auto-resolves as though the Physician roll were a Critical Failure.
- **Special injury effects.** A surgical mishap (`EXT`/`SUR` treatment on a
  failure) or a grievous blunt/edged/piercing wound left at Healing Rate 2–3
  becomes a **bleeder** (arming the blood-loss timer, #487); and the wound is
  flagged for **permanent-impairment eligibility** (new
  `system.permanentImpairmentEligible` field) per its aspect, severity, and
  Healing Rate, for the Impairment system (#554) to apply.
- The lookup tables live in a new Foundry-free `entity/body/injury-treatment`
  module. The `Frost` and `Projectile` aspects (and the amputation path) named in
  the rules are not yet representable in the impact-aspect model and are deferred.

Closes #553
Part of #548
