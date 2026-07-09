---
"sohl": minor
---

**Gear state controls on the Being Gear tab**

Per-row controls on the Gear tab now toggle a gear item's state:

- **Carried** (sack icon) — flips `isCarried`, on every gear row.
- **Worn** (armor icon) — flips `isEquipped` on armor; feeds worn-armor protection totals.
- **Held** (grip icon) — grips a weapon with the first free hold-capable body part(s), or releases it, via `GearLogic.holdItem`/`releaseItem`; held weapons feed the strike-mode sections. The grip supports multiple parts (the hold mechanism claims `minPartsToHold` limbs).

The controls previously rendered as state indicators only; they now dispatch `toggleCarried` / `toggleEquipped` / `toggleHeld` sheet actions.
