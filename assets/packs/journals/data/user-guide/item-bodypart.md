---
title: "Body Parts"
slug: "item-bodypart"
category: "User Guide"
sort: 61
tags:
    - items
    - bodypart
    - anatomy
    - hit-location
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is a Body Part? {#bodypart-overview}

A Body Part is the middle tier of SoHL's anatomy hierarchy. It represents a
specific structural component within a Body Zone — for example, the "Upper
Arm" or "Forearm" within the Arms zone, or the "Skull" and "Face" within
the Head zone. Body Parts contain the individual Body Locations where hits
actually land and injuries are recorded.

# Where It Appears {#bodypart-where}

Body Parts belong to Beings and are always nested inside a Body Zone item.
They in turn contain nested Body Location items. Like Body Zones, Body Parts
are typically established when a Being is created from a compendium template
and seldom require manual editing.

# Key Properties {#bodypart-properties}

- **Name** — which part of the body this represents (e.g., "Upper Arm",
  "Thigh", "Skull").
- **Parent Body Zone** — the zone this part belongs to.
- **Aim Target Weight** — influences hit probability when narrowing down
  from zone to specific part.
- **Contained Body Locations** — the Body Location items nested within
  this part.

<!-- TODO: Expand with details on standard body part layouts, how body
     parts differ between creature types, and any mechanical properties
     specific to body parts -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
