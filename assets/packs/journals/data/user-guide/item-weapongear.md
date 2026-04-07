---
title: "Weapon Gear"
slug: "item-weapongear"
category: "User Guide"
sort: 66
tags:
    - items
    - weapon
    - gear
    - equipment
    - combat
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is Weapon Gear? {#weapongear-overview}

Weapon Gear represents a weapon carried by a Being — a sword, axe, bow,
dagger, staff, or any other instrument of combat. Each weapon defines the
physical object itself, while its nested Strike Mode items define the
specific ways it can be used in combat. A single weapon might have multiple
strike modes (for example, a staff could have both a "swing" and a "thrust"
melee strike mode).

# Where It Appears {#weapongear-where}

Weapon Gear belongs to Beings. It appears on the Being sheet's **Gear** and
**Combat** tabs. Each Weapon Gear item contains one or more nested Strike
Mode items (Melee Weapon Strike Mode or Missile Weapon Strike Mode) that
define its attack options. When a character attacks in combat, they select
a specific strike mode from one of their weapons.

Weapon Gear items are typically added from compendium packs.

# Key Properties {#weapongear-properties}

- **Weight** — how heavy the weapon is, contributing to encumbrance.
- **Quality** — the craftsmanship, which may affect attack and damage.
- **Equipped Status** — whether the weapon is currently held or readied.
- **Nested Strike Modes** — the Melee and/or Missile Strike Mode items
  that define how the weapon can be used in combat.

# Accuracy and Hit Location {#weapongear-accuracy}

Each strike mode has an **accuracy** value that determines how precisely the
attacker can place a blow. Accuracy matters when the attacker **aims** at a
specific body part:

- A **lower** accuracy value means the strike is more precise — when
  accuracy is less than or equal to the target body part's probability
  weight, the aimed part is always hit.
- A **higher** accuracy value means the strike is less controlled. The
  system rolls against the target part's weight, and on a miss, the strike
  drifts along the body's adjacency graph to a neighboring part. The
  further accuracy exceeds the target's weight, the more likely the strike
  wanders.

For **unaimed** strikes, accuracy is not used. Instead, the hit location
is selected randomly, weighted by each body part's probability weight —
larger parts are struck more often.

See [Combat Basics](user-guide/combat-basics) for the full hit location
resolution rules.

<!-- TODO: Expand with details on weapon quality effects, weapon length
     and reach, dual-wielding considerations, and how weapon skills
     link to strike modes -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
