---
"sohl": patch
---

**Correct the Assisted Combat tour text**

Four wording fixes to the guided tour so it matches the actual UI and behavior.

- **Step 3** now says to add "four **weapons**" (all four archetypes are _Weapon_
  type) rather than "four items".
- **Steps 3 and 4** name the bow "**Longbow 125**", matching the archetype label
  the player sees in the Type/Archetype picker and the Held-Items dropdowns
  (previously "Longbow").
- **Step 4** now teaches that a bow held in one arm _does_ show its **Crush**
  melee mode (a one-arm strike mode) — you can swing a bow one-handed like a
  fragile club — and that only the **Ranged** mode is gated by the two-hand rule.
  The old text implied no strike mode appeared at all.
- **Step 6** no longer tells the player to hover a value for a calculation tooltip
  _during_ the tour: Foundry suppresses all tooltips while a tour is running, so
  the tooltip is now described as available once the tour ends.

Resolves #841
