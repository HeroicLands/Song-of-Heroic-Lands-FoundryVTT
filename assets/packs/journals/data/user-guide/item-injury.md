---
title: "Injuries"
slug: "item-injury"
category: "User Guide"
sort: 56
tags:
    - items
    - injury
    - wound
    - healing
    - combat
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Is an Injury? {#injury-overview}

An Injury represents a specific wound sustained by a Being — a sword cut
to the arm, a blunt trauma to the head, a burn on the torso, and so on.
Injuries are the primary consequence of combat in SoHL and each one tracks
its own healing timeline. Unlike afflictions (which are ongoing conditions),
injuries represent discrete physical damage to a specific part of the body.

# Where It Appears {#injury-where}

Injuries belong to Beings. They are typically nested under a Body Location
item, linking the wound to the specific part of the anatomy that was hit.
Injuries are usually created automatically as a result of the combat
resolution pipeline when an attack lands, but they can also be added
manually by the GM to represent falls, environmental hazards, or other
sources of harm.

# Key Properties {#injury-properties}

- **Injury Level** — the severity of the wound, which determines the
  mechanical penalties and healing difficulty.
- **Body Location** — where on the body the injury was sustained, linking
  it to the hit location system.
- **Healing Rate** — how quickly the injury heals, influenced by the
  character's attributes and any medical treatment received.
- **Healing Timeline** — tracks the injury's progression from fresh wound
  through stages of recovery.

<!-- TODO: Expand with details on injury severity levels, how injuries
     impose penalties, the healing process (natural and assisted), and
     interaction with the Physician skill and mystical healing -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
