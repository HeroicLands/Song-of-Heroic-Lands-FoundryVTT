---
title: "Body Locations"
slug: "item-bodylocation"
category: "User Guide"
sort: 62
tags:
    - items
    - bodylocation
    - anatomy
    - hit-location
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Body Location? {#bodylocation-overview}

A Body Location is the most specific level of SoHL's anatomy hierarchy. It
represents the exact spot on the body where a hit can land — such as the
"Left Upper Arm" or "Right Shin". Body Locations are where injuries are
recorded and where armor protection is tracked. When an attack strikes a
character, the system resolves down through Zone, Part, and finally Location
to determine exactly where the blow falls.

# Where It Appears {#bodylocation-where}

Body Locations belong to Beings and are always nested inside a Body Part
item. They can contain nested Protection items (representing armor or
natural defenses covering that location) and nested Injury items (wounds
sustained at that location). This makes each Body Location a detailed
record of what is protecting that spot and what damage it has taken.

# Key Properties {#bodylocation-properties}

- **Name** — the specific location on the body (e.g., "Left Upper Arm",
  "Abdomen", "Right Foot").
- **Parent Body Part** — the part this location belongs to.
- **Aim Target Weight** — influences hit probability at the location level.
- **Protection** — any Protection items nested here, representing armor
  or natural defenses.
- **Injuries** — any Injury items nested here, representing wounds at
  this location.

<!-- TODO: Expand with details on how hit location rolls work, how
     protection at a location reduces damage, and the relationship
     between body locations and the combat resolution pipeline -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
