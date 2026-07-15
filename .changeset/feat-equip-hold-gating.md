---
"sohl": minor
---

**Gate armor aggregation and combat-tab weapons on equip/hold state**

The combat tab now only shows weapons the character is actively holding (gripped by a body part), and armor protection is only aggregated onto body locations for armor that is currently equipped. Previously both operations ignored equip/hold state entirely, so an unequipped suit of plate armor would still protect the wearer and an unheld weapon would appear in the strike-mode list.

**Changes:**

- `BeingLogic.aggregateArmorProtection` — filters to `isEquipped` armor before building the layer list; unequipped armor no longer contributes to `bodyLocation.armorProtection`.
- `being-sheet-view.ts` — adds the pure `filterHeldWeapons` helper (testable without Foundry).
- `BeingSheet._prepareBeingContext` — applies `filterHeldWeapons` before `splitWeaponsByRange`; only held weapons reach the melee/missile display lists.

_This is a consistency fix: `reach` and `availableStrikeModes` already required the weapon to be held; armor aggregation and the combat-tab weapon rows now follow the same rule._

Closes #180.
