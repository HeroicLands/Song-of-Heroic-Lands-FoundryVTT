---
aliases:
    - Gear
id: p5xXqvicKqdw49rA
type: doc
package: sohl
category: user-guide
name:
    full: "Gear"
slug: "item-gear"
folder: QtOgPodi8X6gDWL0
---

# What is Gear?

Gear are physical items that are carried by the character. There are a number of different types of gear:

- [[Item_Armorgear|Armor]]
- [[Item_Concoctiongear|Potions, Elixirs, and Concoctions]]
- [[Item_Containergear|Containers]]
- [[Item_Weapongear|Weapons]]
- [[Item_Projectilegear|Projectiles]]

# Where It Appears

Gear belongs to most actor types, including Beings, Structures, Vehicles, etc.. It appears on the actor's **Gear** tab.

Gear items are typically added from compendium packs that define standard equipment.

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab for all Gear type items:

- **Quantity:** The quantity of items. Some items should never have more than Quantity 1: things like Armor, Weapons, and Containers are meant to be unique, and if multiple versions of it are available then separate instances of the gear should be on the actor (such as "Dagger 1", "Dagger 2", and "Dagger 3", rather than "Dagger" with Quantity 3). This is not true for things like projectiles (arrows, bolts, etc.), Miscellaneous Gear (such as Pence, etc.), or Concoctions, which may have a quantity specified.
- **Weight Base:** The weight of a single instance of the item. The total weight will be calculated as the Weight Base x Quantity.
- **Value Base:** The value of a single instance of the item. The total value will be calculated as the Value Base x Quantity.
- **Quality Base:** Quality is a numeric value that represents how much better or worse an item is than a "standard" item of its type. A Quality of 0 is a totally standard item in all respects. Positive numbers represent higher quality items, and negative numbers specifiy lower quality items.
- **Durability Base:** How durable an item is against damage. Most metal weapons and armor have a durability between 8-12, glass from 4-6, paper 3-5, granite 15-17, etc.
- **Is Carried:** Whether the item is being carried or not. When carried, the item participates in encumbrance calculations, but it then may also be used. Items that are not carried remain noted on your character sheet, but it is assumed they have been left on the ground or maybe on a cart or other location.
- \*\*Is Equipped:" Certain items have the ability to be equipped, such as armor and weapons. An Equipped Armor actively protects the body locations it is meant to protect, and an equipped weapon is ready to be used. Unequipped weapons and armor that is nevertheless carried might be strapped to the body, slung over the shouldler, or put into a backpack.

# Intrinsic Actions

Every piece of gear — of _any_ gear type — adds one action of its own to the
standard actions that all items carry:

| Action                            | Shortcode       | What it does                                                   |
| --------------------------------- | --------------- | -------------------------------------------------------------- |
| [Toggle Carried](#toggle-carried) | `toggleCarried` | Picks the item up onto the character's person, or sets it down |

**Edit**, **Delete**, and **Output Description to Chat** belong to every item and
are described once on [[Item_Base|Base Item]] — they behave no differently on
gear.

Individual gear types add further actions of their own: a weapon has its attack
and defence actions ([[Item_Weapongear|Weapon]]) and armor has **Toggle Worn**
([[Item_Armorgear|Armor]]). The types that add nothing —
[[Item_Containergear|Containers]], [[Item_Concoctiongear|Concoctions]],
[[Item_Projectilegear|Projectiles]], and [[Item_Miscgear|Miscellaneous Gear]] —
inherit **Toggle Carried** exactly as described below.

# Toggle Carried

|               |                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Toggle Carried                                                                                                              |
| **Shortcode** | `toggleCarried`                                                                                                             |
| **Icon**      | `fa-solid fa-sack` (a sack)                                                                                                 |
| **Invoked**   | The **Actions context menu** on the gear item                                                                               |
| **API**       | [`GearLogic.toggleCarried`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.GearLogic.html#togglecarried) |

## What it does and when to use it

**Toggle Carried** flips the item's **Is Carried** property: gear that was on the
character's person is set down, and gear that was set down is picked back up. It
is the bookkeeping half of picking things up and putting them down — the item
stays on the sheet either way, so you keep a record of the pack you left with the
horses or the chest you cached in a cave.

Reach for it whenever what the character is _actually hauling_ changes: dropping
a pack before a fight, leaving spare kit at camp, or picking a dropped weapon
back up. Because carried gear is what feeds encumbrance, this is also the fastest
way to see what a character would move like with a load off.

## How it is invoked

**Toggle Carried** is a visible action, reachable two ways:

- **The Actions context menu** — right-click the item's row on the actor's
  **Gear** tab, or click the **⋮** control on that row, and pick _Toggle
  Carried_.
- **The item's own Actions tab** — it is listed under **Intrinsic Actions**, with
  a **▶** button that runs it.

The **sack** button on the gear row is a shortcut for the same thing: clicking it
toggles the identical state, and it stays lit while the item is carried.

## What happens on screen

There is **no dialog, no roll, and no chat card** — the action changes one flag
and finishes:

1. **The item's Is Carried property flips**, exactly as if you had ticked or
   cleared the **Is Carried** checkbox on its **Properties** tab.
2. **The sack icon on the Gear tab row lights up or dims** to match the new
   state.
3. **The character's carried weight and encumbrance are recomputed.** A carried
   item contributes its effective weight × quantity; an item that is not carried
   contributes nothing. If the load crosses an encumbrance threshold, the derived
   values that depend on it (movement, and any modifier keyed to encumbrance)
   change with it.

Two details of that tally are worth knowing:

- **Worn armor does not count as carried load.** A fitted harness rides the body
  rather than hanging off it, so armor that is both carried and worn adds no
  weight; the same armor carried but _not_ worn counts its full weight like any
  other cargo.
- **A weapon's own encumbrance value applies while it is carried.** Some weapons
  and armor declare an encumbrance value representing awkwardness beyond raw
  weight; a weapon's is added while the weapon is carried.

## What it does not do

- **It does not ask first, and it does not undo.** The toggle applies
  immediately; run it again to put the state back.
- **It does not change worn or equipped state.** Carrying is tracked separately
  from wearing armor or readying a weapon, and the system never forces the two to
  agree — use **Toggle Worn** on [[Item_Armorgear|Armor]] for the other half.
- **It does not cascade into a container.** Each item tracks its own carried
  state, so setting a backpack down leaves everything inside it still marked
  carried; toggle the contents too if you mean the whole load to come off.
- **It does not stop you using the item.** Nothing in the system blocks an
  action on gear that is not carried — where an item has been left is a table
  matter, so uncarried gear is a record of the fiction, not a lock.
- **Encumbrance is a Being's concern.** Gear on a Structure, Vehicle, or Cohort
  still toggles, but those sheets keep no carried-weight total for it to feed.
