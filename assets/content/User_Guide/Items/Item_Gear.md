---
aliases:
  - Gear
id: p5xXqvicKqdw49rA
type: doc
subType: user-guide
name:
  full: "Gear"
shortcode: gearug
folder: QtOgPodi8X6gDWL0
---

# What is Gear?

Gear are physical items that are carried by the character. There are a number of different types of gear:

- [[doc-armorgearug|Armor]]
- [[doc-concoctiongearug|Potions, Elixirs, and Concoctions]]
- [[doc-containergearug|Containers]]
- [[doc-weapongearug|Weapons]]
- [[doc-projectilegearug|Projectiles]]

# Where It Appears

Gear belongs to most actor types, including Beings, Structures, Vehicles, etc.. It appears on the actor's **Gear** tab.

Gear items are typically added from compendium packs that define standard equipment.

# Additional Properties

Along with the [[doc-baseitemug|Standard Item Properties]], the following properties also appear in the **Properties** tab for all Gear type items:

- **Quantity:** The quantity of items. Some items should never have more than Quantity 1: things like Armor, Weapons, and Containers are meant to be unique, and if multiple versions of it are available then separate instances of the gear should be on the actor (such as "Dagger 1", "Dagger 2", and "Dagger 3", rather than "Dagger" with Quantity 3). This is not true for things like projectiles (arrows, bolts, etc.), Miscellaneous Gear (such as Pence, etc.), or Concoctions, which may have a quantity specified.
- **Weight Base:** The weight of a single instance of the item. The total weight will be calculated as the Weight Base x Quantity.
- **Value Base:** The value of a single instance of the item. The total value will be calculated as the Value Base x Quantity.
- **Quality Base:** Quality is a numeric value that represents how much better or worse an item is than a "standard" item of its type. A Quality of 0 is a totally standard item in all respects. Positive numbers represent higher quality items, and negative numbers specifiy lower quality items.
- **Durability Base:** How durable an item is against damage. Most metal weapons and armor have a durability between 8-12, glass from 4-6, paper 3-5, granite 15-17, etc.
- **Is Carried:** Whether the item is being carried or not. When carried, the item participates in encumbrance calculations, but it then may also be used. Items that are not carried remain noted on your character sheet, but it is assumed they have been left on the ground or maybe on a cart or other location. An item that is not carried can do nothing for you — see **Carried Gear Only**, below.
- \*\*Is Equipped:" Certain items have the ability to be equipped, such as armor and weapons. An Equipped Armor actively protects the body locations it is meant to protect, and an equipped weapon is ready to be used. Unequipped weapons and armor that is nevertheless carried might be strapped to the body, slung over the shouldler, or put into a backpack.
- **Shared With:** The [[doc-cohortug|Cohorts]] this item is shared with — see **Sharing Gear With a Cohort**, below. The control appears only when the world actually has a Cohort to share with.

# Sharing Gear With a Cohort

A [[doc-cohortug|Cohort]] — a party, a patrol, a ship's crew — has a **Shared Gear** tab that lists what the group collectively has to hand. An item reaches that list from here: pick one or more cohorts in **Shared With** on the item's **Properties** tab.

Sharing is a **label, not a transfer**. Nothing moves and nothing is copied:

- The item stays on your character, in whatever container it is in, and its weight still counts against _your_ encumbrance.
- Only you can use it. The cohort's view is read-only — nobody can pick it up, re-container it, or set it down from there.
- Un-tick the cohort and the item simply stops appearing on that tab.

Because the setting lives on the item, the character carrying it always decides what the group gets to see. A cohort can never reach out and claim your gear.

# Intrinsic Actions

Every piece of gear — of _any_ gear type — adds one action of its own to the standard actions that all items carry:

| Action                              | Shortcode       | What it does                                                   |
| ----------------------------------- | --------------- | -------------------------------------------------------------- |
| [[#toggle-carried\|Toggle Carried]] | `toggleCarried` | Picks the item up onto the character's person, or sets it down |

**Edit**, **Delete**, and **Output Description to Chat** belong to every item and are described once on [[doc-baseitemug|Base Item]] — they behave no differently on gear.

Individual gear types add further actions of their own: a weapon has its attack and defence actions ([[doc-weapongearug|Weapon]]) and armor has **Toggle Worn** ([[doc-armorgearug|Armor]]). The types that add nothing — [[doc-containergearug|Containers]], [[doc-concoctiongearug|Concoctions]], [[doc-projectilegearug|Projectiles]], and [[doc-miscgearug|Miscellaneous Gear]] — inherit **Toggle Carried** exactly as described below.

# Toggle Carried {#toggle-carried}

|               |                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Toggle Carried                                                                                                             |
| **Shortcode** | `toggleCarried`                                                                                                            |
| **Icon**      | `ginf-knapsack` (a knapsack)                                                                                               |
| **Invoked**   | The **Actions context menu** on the gear item                                                                              |
| **API**       | [`GearLogic.toggleCarried`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.GearLogic#togglecarried) |

## What it does and when to use it

**Toggle Carried** flips the item's **Is Carried** property: gear that was on the character's person is set down, and gear that was set down is picked back up. It is the bookkeeping half of picking things up and putting them down — the item stays on the sheet either way, so you keep a record of the pack you left with the horses or the chest you cached in a cave.

Reach for it whenever what the character is _actually hauling_ changes: dropping a pack before a fight, leaving spare kit at camp, or picking a dropped weapon back up. Because carried gear is what feeds encumbrance, this is also the fastest way to see what a character would move like with a load off.

## How it is invoked

**Toggle Carried** is a visible action, reachable two ways:

- **The Actions context menu** — right-click the item's row on the actor's **Gear** tab, or click the **⋮** control on that row, and pick _Toggle Carried_.
- **The item's own Actions tab** — it is listed under **Intrinsic Actions**, with a **▶** button that runs it.

The **sack** button on the gear row is a shortcut for the same thing: clicking it toggles the identical state, and it stays lit while the item is carried.

## What happens on screen

There is **no dialog, no roll, and no chat card** — the action changes one flag and finishes:

1. **The item's Is Carried property flips**, exactly as if you had ticked or cleared the **Is Carried** checkbox on its **Properties** tab.
2. **The sack icon on the Gear tab row lights up or dims** to match the new state.
3. **The character's carried weight and encumbrance are recomputed.** A carried item contributes its effective weight × quantity; an item that is not carried contributes nothing. If the load crosses an encumbrance threshold, the derived values that depend on it (movement, and any modifier keyed to encumbrance) change with it.

Two details of that tally are worth knowing:

- **Worn armor does not count as carried load.** A fitted harness rides the body rather than hanging off it, so armor that is both carried and worn adds no weight; the same armor carried but _not_ worn counts its full weight like any other cargo.
- **A weapon's own encumbrance value applies while it is carried.** Some weapons and armor declare an encumbrance value representing awkwardness beyond raw weight; a weapon's is added while the weapon is carried.

## What it does not do

- **It does not ask first, and it does not undo.** The toggle applies immediately; run it again to put the state back.
- **It does not put anything on.** Picking an item back up leaves it merely carried: armor comes back off the character's body, and you put it back on deliberately with **Toggle Worn** on [[doc-armorgearug|Armor]]. Setting an item **down**, on the other hand, does take it off — see **Carried Gear Only**, below.
- **It does not cascade into a container.** Each item tracks its own carried state, so setting a backpack down leaves everything inside it still marked carried; toggle the contents too if you mean the whole load to come off.
- **Encumbrance is a Being's concern.** Gear on a Structure, Vehicle, or Cohort still toggles, but those sheets keep no carried-weight total for it to feed.

# Carried Gear Only

**While a piece of gear is not carried, the only thing you can do with it is pick it back up.** Every other action the gear offers is unavailable: it disappears from the item's **Actions** context menu, its button on the Gear tab is greyed out, and it refuses to run even if something else tries to invoke it — a chat-card button, a macro, or a scheduled reminder.

This is the rule that keeps the sheet honest. Gear you are not carrying is on the ground, on a cart, or back at camp; your character cannot swing it, wear it, drink it, or shoot it from there.

Four actions are deliberately **not** gated, so an uncarried item is never stranded:

| Action                     | Why it stays available                                                      |
| -------------------------- | --------------------------------------------------------------------------- |
| Toggle Carried             | The way back. Without it, gear you put down could never be picked up again. |
| Edit                       | You can always open and correct an item's own record.                       |
| Delete                     | You can always remove an item from the sheet.                               |
| Output Description to Chat | Reading out what an item _is_ takes nothing from your character.            |

To make a piece of gear usable again, run **Toggle Carried** — every one of its actions comes back the moment it is carried.

Setting an item **down** also clears any "in use" state that depended on carrying it. For armor, that means it stops being worn: you cannot leave a hauberk marked as worn while it sits in a cart.

# See also

- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-baseitemug|Base Item]] — the tabs, actions, and dialogs every item shares.
- [[doc-gearandequipug|Working with Gear and Equipment]] — using gear at the table: adding, equipping, nesting, and handing it over.
- [[doc-weapongearug|Weapon]], [[doc-armorgearug|Armor]], [[doc-projectilegearug|Projectile]], [[doc-containergearug|Container]], [[doc-concoctiongearug|Concoction]], and [[doc-miscgearug|Miscellaneous Gear]] — the kinds that build on these properties.
- [[doc-cohortug|Cohort]] — sharing a piece of gear with a group.
- [[doc-userguide|User Guide]] — back to the index.
