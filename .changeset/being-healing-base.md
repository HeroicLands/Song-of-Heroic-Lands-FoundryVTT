---
"sohl": minor
---

**Compute a being's Healing Base**

`BeingLogic.healingBase` — previously declared but never assigned — is now a
derived `ValueModifier`, seeded during `evaluate()` to the average of the being's
**Endurance** and **Will** scores (the fraction rounded **up when END > WIL**,
**down otherwise**), and left open to trait and treatment deltas on top. A being
with no Endurance or Will attribute (e.g. an incorporeal being) keeps an empty
modifier (base `0`).

Multiplied by a Healing Rate, the Healing Base is the mastery level of nearly
every recovery test in the system (the Injury Healing Test, the affliction Course
Test, the Infection Healing Test, and the Extended Shock / Coma course tests), so
this is a foundation for the trauma / shock / affliction timed effects. The
rounding rule is a pure, Foundry-free helper (`healingBaseFor`).

Part of #548. Closes #549
