---
aliases:
    - Container
id: 5hYkqelfICqvXZp7
type: doc
package: sohl
category: user-guide
name:
    full: "Container"
slug: "item-containergear"
folder: QtOgPodi8X6gDWL0
---

# What Is a Container?

Containers represent an object that holds other items — a backpack, sack, chest, belt pouch, saddlebag, or any other storage vessel. Containers use SoHL's nested item system to hold other gear items inside them, helping organize a character's inventory and track what is stored where. This matters for encumbrance, accessibility during combat, and narrative details like "the potion is in my belt pouch."

# Where It Appears

Containers appear on the Being's **Gear** tab. Other gear (Miscellaneous, Concoctions, Projectiles, Armor, Weapons, even other Containers) can be nested inside a Container,
creating a hierarchical inventory structure.

# Additional Properties

In addition to the [[Item_Gear|Standard Gear Properties]], the following additional properties are defined for containers:

- **Capacity** — how much the container can hold, limiting what can be
  stored inside.
- **Weight** — the weight of the container itself (contents add their own
  weight on top).
- **Contained Items** — the gear items nested inside this container.

<!-- TODO: Expand with details on how container capacity is enforced,
     how nested containers affect encumbrance calculations, and
     accessing items from containers during combat -->
