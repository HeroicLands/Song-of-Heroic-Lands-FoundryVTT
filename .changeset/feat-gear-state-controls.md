---
"sohl": minor
---

**Gear state controls: carried / worn toggles and per-limb Held Items**

Two ways to set a Being's gear state:

- **Carried** (sack) and **Worn** (armor icon) per-row toggles on the Gear tab flip `isCarried` / `isEquipped` (worn armor feeds body-location protection totals). These controls previously rendered as indicators only; they now dispatch actions.
- A **Held Items** section on the Combat tab (below the strike modes) with **one dropdown per hold-capable limb**. Each dropdown lists the actor's holdable gear — weapons and misc gear that are **not** stowed inside a container — plus a blank option. Selecting an item makes that limb hold it; blank releases it. A **two-handed** weapon is held by selecting it in **both** limbs' dropdowns. Held weapons feed the strike-mode sections.
