---
"sohl": minor
---

Actor & combatant reach

BeingLogic.reach` is the greatest reach among the actor's currently *available* melee strike modes: combat-technique modes are intrinsic (always available); a weapon mode counts only while the weapon is held in at least its `minParts` limbs (`canHoldItem` body parts). `SohlCombatant.reach` surfaces that value for the combatant. The availability + max logic lives in the Foundry-free `reach-helpers.ts` (`computeActorReach`). `SohlCombatant.reaches(other)` returns whether this combatant's reach covers the center-to-center grid distance to `other`, so `threatenedBy` now reports an enemy `c` as a threat when `c`'s melee reach extends to the combatant.
