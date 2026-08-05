---
aliases:
    - Armor
id: yh3LCFXRlhJWMqLW
type: doc
package: sohl
category: user-guide
name:
    full: "Armor"
slug: "item-armorgear"
folder: QtOgPodi8X6gDWL0
---

# What Is Armor?

Armor represents a wearable piece of protective equipment or normal clothing — a mail
hauberk, a cloth surcoat, a linen shirt, a leather jerkin, leather sandals, a great helm, a wool dress, greaves, etc. When worn by a Being, armor provides protection at the body locations it covers, reducing the damage from incoming attacks. A single piece of armor can cover multiple body locations, and multiple pieces of armor can be layered for additional defense.

# Where It Appears

Armor belongs to Beings. It appears on the Being sheet's **Gear** and **Combat** tabs. Each Armor item specifies the protective aspects that define exactly which body locations it covers and how much protection it provides at each one. When armor is equipped, these protective values are factored into combat resolution.

Armor items are typically added from compendium packs that define standard equipment.

# Additional Properties

In addition to the [[Item_Gear|Standard Gear Properties]], the following additional properties are defined for armor:

- **Material:** The type of material the armor is constructed from (chain, leather, kurbul, cloth, etc.).
- **Flexible Locations:** Body locations covered by flexible portions of this armor.
- **Rigid Locations:** Body locations covered by rigid portions of this armor (e.g., breastplate).
- **Encumbrance:** Specific encumbrance value used when equipped.
- **Protection Base:** For the four standard aspects-Blunt, Edged, Piercing, and Fire-the numbers here represent impact that is absorbed by the armor.

# Encumbrance

Armor and clothing that is worn (i.e., equipped) does not have any encumbrance, regardless of its weight. This is due to the distribution across the body, which is such that it normally does not cause any movement difficulty when worn. However, if there is a specific encumbrance value, then that is used as the encumbrance of that armor when equipped.

When not worn but carried (i.e., carried but not equipped), the armor does have encumbrance based on its weight. In this case any encumbrance value is ignored, since the weight determines its encumbrance instead.

# Wearing Requires Carrying

Armor can only be worn while it is **carried** — it has to be on your character
before it can be on their body. While a piece of armor is not carried, its **Worn**
control is greyed out on both the Gear tab and the armor's own sheet, and the
**Toggle Worn** action is unavailable from the Actions context menu.

Putting armor **down** takes it off in the same stroke: setting Is Carried to false
clears Worn, so armor can never sit in a cart while still counting as protection.
Pick it back up with **Toggle Carried** and you can wear it again — but it starts
off, so you have to put it on deliberately.

See [[Item_Gear|Gear]] for the general rule this follows.

<!-- TODO: Expand with details on how armor layering works, the
     relationship between armor quality and protection, encumbrance
     effects, and armor damage/repair mechanics -->
