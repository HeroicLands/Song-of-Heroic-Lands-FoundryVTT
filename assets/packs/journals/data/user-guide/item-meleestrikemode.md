---
title: "Melee Weapon Strike Modes"
slug: "item-meleestrikemode"
category: "User Guide"
sort: 71
tags:
    - items
    - strike-mode
    - melee
    - combat
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Melee Weapon Strike Mode? {#meleestrikemode-overview}

A Melee Weapon Strike Mode defines a specific way to use a weapon in
close combat. A single weapon can have multiple melee strike modes — for
instance, a sword might offer both a "slash" and a "thrust" mode, each
with different damage profiles and characteristics. When a character attacks
in melee, they choose which strike mode to use, and the combat resolution
pipeline uses that mode's properties to resolve the attack.

# Where It Appears {#meleestrikemode-where}

Melee Weapon Strike Modes are always nested inside a Weapon Gear item.
They never exist as standalone items — they are part of the weapon's
definition. They appear on the Being sheet's **Combat** tab as the
available attack options for each equipped weapon. Strike modes are
typically pre-configured in compendium weapon entries.

# Key Properties {#meleestrikemode-properties}

- **Attack Type** — the kind of melee attack (e.g., slash, thrust, crush).
- **Impact** — the base damage potential of this strike mode.
- **Associated Skill** — which combat skill is used when attacking with
  this mode.
- **Reach** — the effective engagement distance for this strike mode.

<!-- TODO: Expand with details on how attack type interacts with armor,
     impact calculation, weapon speed/initiative, and how strike modes
     link to the combat resolution pipeline -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
