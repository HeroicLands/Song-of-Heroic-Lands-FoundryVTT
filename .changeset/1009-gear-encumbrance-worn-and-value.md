---
"sohl": patch
---

**Fix gear encumbrance: exclude worn armor weight; apply per-item encumbrance values**

Two encumbrance rules documented in `Rules/Gear.md` were not honored by the being's
derived load.

- **Worn armor weight is excluded from encumbrance.** `GearLogic` now decides
  whether an item's weight counts as carried load through a `countsAsCarriedWeight`
  predicate (default: any carried gear). `ArmorGearLogic` overrides it so **worn**
  armor is left out of `carriedWeight` — a fitted harness rides the body — while
  the same armor carried but **not** worn still counts its full weight like any
  other cargo.
- **Per-item encumbrance values are applied.** An armor's or weapon's optional
  encumbrance value (representing awkwardness beyond raw weight) is now added to
  `BeingLogic.encumbrance` while the item is in use — armor that is worn, a weapon
  that is carried — on top of the weight-derived base.

Closes #1009
Closes #1010
