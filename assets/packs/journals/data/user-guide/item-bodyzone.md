---
title: "Body Zones"
slug: "item-bodyzone"
category: "User Guide"
sort: 60
tags:
    - items
    - bodyzone
    - anatomy
    - hit-location
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Body Zone? {#bodyzone-overview}

A Body Zone is the broadest division of a Being's anatomy. It represents a
major region of the body such as the head, torso, or limbs. Body Zones are
the top level of SoHL's three-tier hit location hierarchy: Zone contains
Parts, which contain Locations. This hierarchy determines where attacks land
and how damage is applied.

# Where It Appears {#bodyzone-where}

Body Zones belong to Beings. They contain nested Body Part items, which in
turn contain Body Location items. Together, these three levels define the
complete anatomy of a creature. Body Zones are typically set up automatically
when a Being is created from a compendium template (such as "Basic Folk")
and rarely need to be modified directly.

# Key Properties {#bodyzone-properties}

- **Name** — the region of the body this zone represents (e.g., "Head",
  "Torso", "Arms", "Legs").
- **Aim Target Weight** — influences the probability of this zone being
  struck during combat when determining random hit locations.
- **Contained Body Parts** — the Body Part items nested within this zone.

<!-- TODO: Expand with details on how body zones interact with aimed
     attacks, the standard body zone layout for humanoid Beings, and
     how to customize anatomy for non-humanoid creatures -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
