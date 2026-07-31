---
"sohl": minor
---

**Shock Test — a general shock primitive, not just for injuries**

The being's standalone **Shock Test** action is now implemented. Shock is not
specific to injury: blood loss, fear, and other systemic or psychological forces
all drive a shock test by supplying a **base Shock State Index (SSI)**.

- `BeingLogic.shockTest` takes a base SSI from the action scope
  (`shockIndex`/`baseShockIndex`) for a scripted cause, or collects it via a
  dialog when run by hand. It rolls the **Shock** skill **without** the body-part
  impairment penalty (the being's fatigue penalty still applies), adjusts the SSI
  by the result (CF +2 / MF +1 / MS 0 / CS −1), and maps it to a shock state
  (`≤6` None, `7` Stunned, `8` Incapacitated, `9` Unconscious, `≥10` Dead). A base
  SSI below 5 is No Shock and above 10 is immediate Dead, with no roll.
- The resulting state is **offered** (a yes/no dialog), never applied without a
  human, and only ever _worsens_ the being's current state — recovery is the
  Shock Re-Test. Applying it clears every other shock status.
- The injury Shock Test (`injuryShock`, #555) is refactored onto the same shared
  roll → SSI → state core; its behaviour is unchanged except that a wound whose
  index already exceeds 10 now resolves to Dead without a redundant roll.
- New Foundry-free helpers `shockRollNeeded` and `shockStateLabelKey` in the shock
  module.

Closes #850
Part of #548
