---
"sohl": minor
---

**Add `setEquipped` / `setNotEquipped` / `holdItem` / `releaseItem` intrinsic actions to `GearLogic`**

Previously there was no write path to `system.isEquipped` or to `bodyPart.heldItemId` — the fields existed and were read by derived logic, but nothing in the system ever wrote them. This left equip state and weapon-hold state permanently inert.

`setEquipped` / `setNotEquipped` mirror the existing `setCarried` / `setNotCarried` pattern and write `system.isEquipped` on the gear item. `holdItem` finds the first free hold-capable body part(s) on the owning actor's lineage and writes `heldItemId`; `releaseItem` clears `heldItemId` on every part gripping this item. The minimum grip count is controlled by the protected `minPartsToHold` getter (default 1), which weapon subclasses can override. All four actions are registered in `defineIntrinsicActions` and have `lang/en.json` titles.

Closes #179.
