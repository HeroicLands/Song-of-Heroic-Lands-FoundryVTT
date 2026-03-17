---
title: "Protection"
slug: "item-protection"
category: "User Guide"
sort: 63
tags:
    - items
    - protection
    - armor
    - defense
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is Protection? {#protection-overview}

A Protection item represents a layer of defense at a specific body location.
This can be armor coverage (a mail hauberk protecting the torso), natural
defenses (thick hide or scales), or any other form of physical protection
that reduces incoming damage. Protection values are checked during combat
resolution to determine how much of an attack's impact is absorbed before
it causes an injury.

# Where It Appears {#protection-where}

Protection items belong to Beings. They are usually nested under either an
Armor Gear item (representing a piece of worn armor) or directly under a
Body Location (representing natural defenses). When armor is worn, the
system creates Protection items at each Body Location that the armor covers,
so a single suit of mail might generate Protection entries at several
locations across the torso and arms.

# Key Properties {#protection-properties}

- **Protection Value** — how much damage this layer absorbs, reducing the
  effective impact of attacks.
- **Material** — the substance providing protection (e.g., leather, mail,
  plate, hide), which may interact with different damage types.
- **Coverage** — which body location this protection applies to.
- **Parent Item** — the Armor Gear item or Body Location this protection
  is nested under.

<!-- TODO: Expand with details on how multiple layers of protection
     stack, how different damage types interact with materials, and
     how protection degrades or is bypassed -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
