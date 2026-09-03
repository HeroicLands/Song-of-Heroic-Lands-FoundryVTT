---
aliases: []
id: qB7c6j4tnrijhQ3P
type: doc
subType: user-guide
name:
  full: "Working with Gear and Equipment"
shortcode: gearandequipug
folder: IgwaG8rAUUO9vrtz
---

# Overview {#gear-overview}

Gear in SoHL includes weapons, armor, containers, potions, projectiles, and miscellaneous equipment. This guide explains how to manage gear on a character — adding, removing, equipping, and organizing items.

See also: [[doc-crtngactitemug|Creating Actors and Items]], [[doc-armorgearug|Armor Gear]], [[doc-weapongearug|Weapon Gear]]

# Adding Gear to a Character {#gear-adding}

To give a character equipment:

1. Open the character's sheet and navigate to the **Gear** tab.
2. Drag an item from a compendium or the World Items sidebar onto the sheet.
3. The item appears in the Gear tab.

When you drop a complex item like a weapon or armor, all its nested components (strike modes, protection entries) are included automatically.

# Equipping and Carrying {#gear-equipping}

Items on the Gear tab can be in different states:

- **Carried** — the item is in the character's inventory and contributes to encumbrance, but is not actively worn or wielded
- **Equipped** — the item is actively worn (armor) or wielded (weapon) and its effects are applied

Click the equip/carry icon on an item to toggle its state. Equipped weapons appear on the Combat tab; equipped armor contributes its protection.

**Uncarried gear can't be used.** While an item is not carried, the only action available on it is **Toggle Carried** — picking it back up. Everything else the item offers (wearing armor, attacking with a weapon, and so on) is greyed out on the sheet and gone from its Actions context menu, because the item is not on your character. The universal item actions — Edit, Delete, and Output Description to Chat — stay available, so you can always manage the item's own record.

Putting an item down also clears any "in use" state that depended on carrying it: un-carrying worn armor takes it off, so it stops contributing protection.

# See also

- [[doc-gearug|Gear]] — the properties every carried thing has, and the **Toggle Carried** action.
- [[doc-weapongearug|Weapon]], [[doc-armorgearug|Armor]], [[doc-projectilegearug|Projectile]], [[doc-containergearug|Container]], [[doc-concoctiongearug|Concoction]], and [[doc-miscgearug|Miscellaneous Gear]] — the individual kinds.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-cohortug|Cohort]] — pooling gear across a group, and who is carrying what.
- [[doc-beingug|Being]] — the Gear tab and the encumbrance it feeds.
- [[doc-userguide|User Guide]] — back to the index.

<!-- TODO: Document the specific icons and states, and how encumbrance
     is calculated from carried vs equipped items -->

# Containers and Nesting {#gear-containers}

Container Gear items (bags, backpacks, chests) can hold other items inside them. To put an item into a container:

1. Drag the item onto the container in the Gear tab.
2. The item is nested inside the container and indented in the display.

Items inside containers still contribute to encumbrance but are organized under their parent container. You can nest containers inside containers (a pouch inside a backpack).

# Moving Items Between Characters {#gear-moving}

To transfer gear from one character to another:

1. Open both character sheets.
2. Drag the item from one sheet's Gear tab onto the other sheet.
3. If the item has a quantity greater than 1, you'll be asked how many to transfer.

The item is removed from the source character and added to the destination.

# Item Quantities {#gear-quantities}

Some items (coins, arrows, bandages) have a quantity. When you drop a stackable item onto a character who already has the same item, the quantities are combined. When moving items between characters, you can choose how many to transfer.

<!-- TODO: Expand with details on how quantity stacking works, weight
     calculations for stacked items, and splitting stacks -->

# Gear Types at a Glance {#gear-types}

| Gear Type           | Purpose                       | Usually Contains                             |
| ------------------- | ----------------------------- | -------------------------------------------- |
| **Weapon Gear**     | A weapon definition           | Strike modes (melee/missile)                 |
| **Armor Gear**      | Wearable protection           | Protection entries per location              |
| **Container Gear**  | Holds other items             | Any gear type                                |
| **Misc Gear**       | General equipment             | Nothing (standalone)                         |
| **Projectile Gear** | Ammunition                    | Nothing (referenced by missile strike modes) |
| **Concoction Gear** | Consumables (potions, salves) | Nothing (applies effects when used)          |

See the individual item type guides for details on each gear type.

<!-- TODO: Add section on gear quality, durability, and how these affect
     item performance and value -->
