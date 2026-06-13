---
"sohl": minor
---

**Combatant actions on the combat-tracker context menu**

Right-clicking a combatant in the combat tracker now lists that combatant's
available actions, so the automated-combat start (added alongside) is actually
reachable from the UI.

- A `getCombatantContextOptions` hook maps each row combatant's
  `getContextOptions()` into the tracker menu, reusing the same delegation
  contract `SohlActor`/`SohlItem` use (`SohlCombatant.getContextOptions()` →
  `CombatantLogic.getContextOptions()`). Entries are gated on `combatant.isOwner`
  (owner + GM).
- **Automated Attack** appears for the combatant's owner; **Move to Group…** is
  now a first-class GM-only `CombatantLogic.moveToGroup` intrinsic action
  (replacing the previous bespoke context-menu entry), so it flows through the
  same mechanism.
- Action `visible` predicates gain an `isGM` binding, letting an action declare
  `visible: "isGM"`.
