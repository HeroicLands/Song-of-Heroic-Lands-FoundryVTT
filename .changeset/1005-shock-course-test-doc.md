---
"sohl": patch
---

**Shock rules: the Extended Shock Course Test is a Healing test, not Initiative**

The Shock rules page described the **Extended Shock Course Test** as an _Initiative_
skill test, but the implementation rolls **`Healing Base × HR`** — the same
Healing-type Course Roll the Coma Course Test already documents. Corrected the
Extended Shock Course Test text to match the code (and the Coma wording), so doc and
code agree.

Also refreshed the stale `BeingLogic.shockReTest` JSDoc: the re-test is no longer
"invoked manually / awaiting a follow-up" — `offerShockReTest` now offers it on the
state's own cadence (end of the being's own turn for Incapacitated, ten minutes later
for Unconscious), with the re-test firing only on the controller's `[Perform]` click.

Closes #1005
