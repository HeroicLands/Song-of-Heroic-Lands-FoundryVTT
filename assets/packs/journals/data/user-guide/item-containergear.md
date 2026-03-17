---
title: "Container Gear"
slug: "item-containergear"
category: "User Guide"
sort: 67
tags:
    - items
    - container
    - gear
    - equipment
    - inventory
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is Container Gear? {#containergear-overview}

Container Gear represents an object that holds other items — a backpack,
sack, chest, belt pouch, saddlebag, or any other storage vessel. Containers
use SoHL's nested item system to hold other gear items inside them, helping
organize a character's inventory and track what is stored where. This
matters for encumbrance, accessibility during combat, and narrative details
like "the potion is in my belt pouch."

# Where It Appears {#containergear-where}

Container Gear belongs to Beings and Vehicles. It appears on the Being
sheet's **Gear** tab. Other gear items (Misc Gear, Projectile Gear,
Concoctions, and even other Containers) can be nested inside a Container,
creating a hierarchical inventory structure.

# Key Properties {#containergear-properties}

- **Capacity** — how much the container can hold, limiting what can be
  stored inside.
- **Weight** — the weight of the container itself (contents add their own
  weight on top).
- **Contained Items** — the gear items nested inside this container.

<!-- TODO: Expand with details on how container capacity is enforced,
     how nested containers affect encumbrance calculations, and
     accessing items from containers during combat -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
