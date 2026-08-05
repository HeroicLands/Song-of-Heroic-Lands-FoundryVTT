---
"sohl": minor
---

**Gear you are not carrying can only be picked back up**

Every action a piece of gear offered was available regardless of whether the item
was on the character's person — you could mark an uncarried hauberk as worn, and
worn armor contributes protection. Gear that is not carried is on the ground, on a
cart, or back at camp, and nothing can be done with it from there.

- **Carried gate.** While `system.isCarried` is `false`, every gear action is
  unavailable: hidden from the Actions context menu **and** refused by
  `SohlAction.execute`, so a chat-card button, macro, or scheduled reminder cannot
  route around it. `GearLogic.gateOnCarried` composes the gate onto each action's
  `trigger`, preserving (never replacing) an author's own trigger; every gear logic
  runs its `defineIntrinsicActions` result through it.
- **Four actions stay available**, so an uncarried item is never stranded:
  `toggleCarried` (the way back), plus the universal `editDocument`,
  `deleteDocument`, and `outputDescription`.
- **Setting gear down clears its "in use" state.** `toggleCarried` merges a new
  `GearLogic.stowUpdates()` payload when un-carrying; `ArmorGearLogic` overrides it
  to clear `isWorn`, so armor can never remain worn while off the character.
- **The sheet controls honor the gate.** The Being sheet's Gear-tab carry and worn
  buttons now dispatch the item's intrinsic actions instead of writing the field
  directly, the worn button renders disabled while the item is uncarried, and the
  armor sheet's **Is Worn** field is disabled for the same reason.
- **`GearLogic.isCarried`** exposes the carried flag on the logic layer, so
  expressions and modules can read it without reaching into `data`.

Documentation updated: the Gear user-guide page documents the carried-gear rule, the
Armor page documents that wearing requires carrying, and the "Working with Gear and
Equipment" guide notes both.

Closes #1097
