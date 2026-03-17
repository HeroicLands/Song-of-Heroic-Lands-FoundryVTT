---
title: "Missile Weapon Strike Modes"
slug: "item-missilestrikemode"
category: "User Guide"
sort: 72
tags:
    - items
    - strike-mode
    - missile
    - ranged
    - combat
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Missile Weapon Strike Mode? {#missilestrikemode-overview}

A Missile Weapon Strike Mode defines a ranged attack option for a weapon.
This covers bows, crossbows, slings, thrown weapons, and any other method
of attacking at a distance. Each missile strike mode specifies how the
weapon is used at range and references a Projectile Gear item as its
ammunition source. When a character makes a ranged attack, the system
combines the strike mode's properties with the projectile's properties
to resolve the shot.

# Where It Appears {#missilestrikemode-where}

Missile Weapon Strike Modes are always nested inside a Weapon Gear item,
just like melee strike modes. A weapon can have both melee and missile
strike modes — for example, a javelin might have a melee thrust mode and
a missile throw mode. They appear on the Being sheet's **Combat** tab as
ranged attack options for equipped weapons.

The missile strike mode references a Projectile Gear item on the same
Being for its ammunition.

# Key Properties {#missilestrikemode-properties}

- **Range** — the effective and maximum distances for the ranged attack.
- **Impact** — the base damage potential of this ranged strike.
- **Associated Skill** — which ranged combat skill is used when attacking
  with this mode.
- **Projectile Reference** — which Projectile Gear item is used as
  ammunition for this strike mode.

<!-- TODO: Expand with details on range penalties, rate of fire,
     ammunition consumption, and how missile attacks differ from
     melee in the combat resolution pipeline -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
