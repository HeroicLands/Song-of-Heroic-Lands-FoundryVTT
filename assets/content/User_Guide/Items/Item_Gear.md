---
aliases:
    - Gear
id: 6tsL8QgzqOCc6sVQ
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
