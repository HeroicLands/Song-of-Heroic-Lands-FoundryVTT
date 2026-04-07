---
title: "Combat Technique Strike Modes"
slug: "item-combattechnique"
category: "User Guide"
sort: 73
tags:
    - items
    - strike-mode
    - combat-technique
    - combat
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Combat Technique Strike Mode? {#combattechnique-overview}

A Combat Technique Strike Mode represents a combat maneuver that is not
tied to a specific weapon. These are special fighting techniques, unarmed
attacks, grappling moves, or other combat actions that a character can
perform regardless of what weapon they are holding. Unlike melee and missile
strike modes (which are nested in weapons), combat techniques stand on
their own as items belonging directly to a Being.

# Where It Appears {#combattechnique-where}

Combat Technique Strike Modes belong to Beings directly — they are not
nested inside Weapon Gear items. They appear on the Being sheet's **Combat**
tab alongside weapon-based strike modes. This allows characters to always
have access to techniques like unarmed strikes, grapples, or special
maneuvers even when disarmed.

# Key Properties {#combattechnique-properties}

- **Technique Type** — the nature of the combat maneuver (unarmed strike,
  grapple, trip, disarm, etc.).
- **Impact** — the base damage or effect strength of the technique.
- **Accuracy** — how precisely the technique can target a specific body
  part. See below.
- **Associated Skill** — which skill governs this technique.
- **Description** — details about how the technique is performed and any
  special rules.

# Accuracy and Hit Location {#combattechnique-accuracy}

Like weapon strike modes, combat techniques have an **accuracy** value
that governs aimed strike resolution:

- A **lower** accuracy means the technique is more precise — aimed strikes
  reliably hit the intended body part.
- A **higher** accuracy means the strike is harder to place. On a miss
  against the target part, the blow drifts to a neighboring body part
  along the adjacency graph.

For **unaimed** techniques, accuracy is not used. The hit location is
selected randomly, weighted by body part probability.

See [Combat Basics](user-guide/combat-basics) for the full hit location
resolution rules, and [Weapon Gear](user-guide/item-weapongear) for how
accuracy works on weapon strike modes.

<!-- TODO: Expand with details on the standard combat techniques
     available, how techniques interact with the combat resolution
     pipeline, and requirements or prerequisites for learning
     specific techniques -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
