---
"sohl": minor
---

**Consolidate gear carry action; move equip/hold off generic gear**

`GearLogic` now exposes a single **Toggle Carried** action in place of the paired
`setCarried` / `setNotCarried` actions. The `holdItem` / `releaseItem` actions are
removed (holding is driven from the Combat tab), and the `setEquipped` /
`setNotEquipped` actions are removed from generic gear — worn state moves to an
armor-scoped action tracked in #662.

Closes #673
