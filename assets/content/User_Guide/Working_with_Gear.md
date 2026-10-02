---
shortcode: gearandequipug
name: {full: "Working with Gear and Equipment"}
type: doc
subType: userguide
data: {packFolder: userguide}
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

# Carried and Equipped {#gear-equipping}

Every row on the Gear tab carries two icons that toggle a piece of gear's inventory state:

- The :icon toggle-carried: toggles **Carried** — whether the item is on the character's person at all. This is the only state every gear type has.
- The :icon shield: toggles **Worn**, armor only. It lights up only once the armor is carried, and dims (disabled) otherwise — armor cannot be worn before it is picked up.

There is no third icon and no "equipped" state for a weapon: a weapon's own carried toggle is all the Gear tab offers it. What makes a weapon usable in a fight is which **body part** holds it, which is set separately and covered under [[doc-beingug|Being]] and [[doc-cmbtbscsug|Combat Basics]].

**Uncarried gear can't be used.** While an item is not carried, the only action available on it is **Toggle Carried** — picking it back up. Everything else the item offers (wearing armor, attacking with a weapon, and so on) is greyed out on the sheet and gone from its Actions context menu, because the item is not on your character. The universal item actions — Edit, Delete, and Output Description to Chat — stay available, so you can always manage the item's own record.

Putting an item down also clears any "in use" state that depended on carrying it: un-carrying worn armor takes it off, so it stops contributing protection.

## How Encumbrance Is Computed

The **Carried: _N_ lb · Enc _N_** readout banding the On Body section totals what you are hauling and what it costs you:

1. Every carried item contributes its weight times its quantity to the carried-weight total — except armor that is currently **worn**. A fitted harness rides the body rather than hanging off it, so worn armor's weight drops out of the total the moment it goes on; the same armor carried but not worn counts in full.
2. The carried-weight total is run through a formula set by the character's **movement profile** — for a Human, that formula is the carried weight divided by four and rounded down. A creature with a different build can set a different one, so the same load does not necessarily encumber two kinds of character alike.
3. Worn armor and carried weapons may each declare an optional **encumbrance value** of their own, added on top of the total from step 2. It represents stiffness or awkwardness beyond raw weight — armor that sets one costs it while worn, a weapon that sets one costs it while merely carried.
4. Small rigid arm pieces (spaulders, vambraces, gauntlets, and the like) cost nothing on their own, however many are worn, but wearing **three or more together** costs **5** encumbrance between them, charged once to the set rather than to each piece.

The result feeds the character's movement and personal fatigue elsewhere on the sheet; this tab only shows and computes the number itself.

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

Some items (coins, arrows, bandages) are kept as a single row with a **Qty**: one row of 20 arrows rather than twenty rows of one. A stack's weight is its per-unit weight times that quantity, and a stack that is not carried contributes nothing — the same carried rule as any other item, applied to the whole stack at once.

**Dropping a stack never merges it into one already on the sheet.** Every drag — from a compendium, from the world, or from another character — adds its own new row, even when a matching item is already there; nothing on the sheet looks for one to combine into. If you want one stack instead of two, move the smaller one's quantity onto the larger by hand and delete the leftover empty row.

**Splitting a stack happens when you move part of it to someone else.** Drag the item from one character's Gear tab onto another's:

- Moving a **single** item, or holding **shift** while you drag, moves the whole stack: it disappears from the source and appears whole on the destination.
- Moving **part** of a stack greater than one (without shift) opens a **How Many?** prompt naming the stack's size. Choose a number from 1 up to that size: that many move to the destination as their own new row, and the rest stay behind on the source with its quantity reduced by the same amount.

There is no equivalent for splitting a stack on the same character — only a move between two characters splits one.

# Gear Types at a Glance {#gear-types}

| Gear Type           | Purpose                       | Usually Contains                                             |
| ------------------- | ----------------------------- | ------------------------------------------------------------ |
| **Weapon Gear**     | A weapon definition           | Strike modes (melee/missile)                                 |
| **Armor Gear**      | Wearable protection           | Protection entries per location                              |
| **Container Gear**  | Holds other items             | Any gear type                                                |
| **Misc Gear**       | General equipment             | Nothing (standalone)                                         |
| **Projectile Gear** | Ammunition                    | Nothing (referenced by missile strike modes)                 |
| **Concoction Gear** | Consumables (potions, salves) | Nothing (no "use" action — applying one is a table decision) |

See the individual item type guides for details on each gear type.

## Quality and Durability

Every gear item, whatever its type, carries a **Qual** and a **Dur** field on its Properties tab and in the Gear tab's ledger. **Quality** is a craftsmanship rating, generally set somewhere from 8 to 12; most shipped gear is authored at 0, which reads as untouched rather than as a judgment on the piece. **Durability** is a structural-integrity rating, authored at 0 by default as well. Both are open to trait and effect deltas the way weight is — hovering either column shows the base value and anything currently modifying it.

Today, neither field changes anything else about the item: an item's quality does not change its performance or its value, and nothing reduces an item's durability or checks it for breakage. Treat both as a number you can read and set, not yet as something the system itself acts on.

# See also

- [[doc-gearug|Gear]] — the properties every carried thing has, and the **Toggle Carried** action.
- [[doc-weapongearug|Weapon]], [[doc-armorgearug|Armor]], [[doc-projectilegearug|Projectile]], [[doc-containergearug|Container]], [[doc-concoctiongearug|Concoction]], and [[doc-miscgearug|Miscellaneous Gear]] — the individual kinds.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-cohortug|Cohort]] — pooling gear across a group, and who is carrying what.
- [[doc-beingug|Being]] — the Gear tab and the encumbrance it feeds.
- [[doc-userguide|User Guide]] — back to the index.
