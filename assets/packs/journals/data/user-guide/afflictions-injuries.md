---
title: "Afflictions and Injuries"
slug: "afflictions-injuries"
category: "User Guide"
sort: 24
tags:
    - mechanics
    - afflictions
    - injuries
    - healing
    - conditions
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# Overview {#conditions-overview}

Characters in SoHL can suffer from two types of harm: **injuries** (physical
wounds from combat or accidents) and **afflictions** (ongoing conditions like
diseases, poisons, and curses). Both have their own lifecycle and can
significantly affect a character's capabilities.

See also: [Injuries](user-guide/item-injury.md), [Afflictions](user-guide/item-affliction.md), [Combat Basics](user-guide/combat-basics.md)

# Injuries {#conditions-injuries}

An **injury** represents a specific wound — a sword cut, a broken bone, a
burn. Injuries are tied to specific **body locations** on the character's
anatomy model.

## How Injuries Happen

Injuries result from combat (when an attack successfully strikes) or from
other sources of physical harm. The system determines:

- **Where** the injury occurs (which body location)
- **How severe** the injury is (injury level)
- **What effects** the injury has (penalties, bleeding, etc.)

## Injury Effects

Injuries impose penalties on the character:

- **Skill penalties** — injuries reduce effective mastery levels
- **Shock** — severe injuries can cause shock, potentially incapacitating
  the character
- **Bleeding** — some injuries cause ongoing blood loss

<!-- TODO: Document the injury severity levels, how injury penalties are
     calculated per body location, shock thresholds, and the stumble/fumble
     mechanics that result from injuries -->

## Healing

Injuries heal over time. The healing process depends on:

- Whether the injury has been **treated** by a physician
- The character's natural healing ability (related to traits)
- Available medical supplies and conditions

<!-- TODO: Document the healing timeline, treatment skill tests,
     and how different injury types (cuts vs. fractures) heal differently -->

# Afflictions {#conditions-afflictions}

An **affliction** is an ongoing condition — a disease, poison, curse, or
other persistent effect. Afflictions have a lifecycle that progresses
through stages.

## Affliction Lifecycle

An affliction progresses through these stages:

1. **Transmission** — how the affliction spreads (contact, airborne, etc.)
2. **Contraction** — whether the character actually catches it (resistance test)
3. **Course** — the affliction's progression over time
4. **Diagnosis** — identifying what the affliction is
5. **Treatment** — applying remedies to cure or mitigate it
6. **Healing** — recovery from the affliction's effects

Each stage involves skill tests (typically Physician or related skills).

<!-- TODO: Document the specific mechanics for each lifecycle stage,
     including which skills are used, difficulty modifiers, and timing.
     Document how afflictions interact with concoction gear (potions,
     antidotes, etc.) -->

## Types of Afflictions

Afflictions include:

- **Diseases** — infections and illnesses with incubation and progression
- **Poisons** — toxins with immediate or delayed effects
- **Curses** — supernatural afflictions requiring mystical removal

<!-- TODO: Document the affliction subtype system and how each subtype
     differs in its lifecycle mechanics -->

# Managing Conditions on the Sheet {#conditions-managing}

Injuries and afflictions appear on the character's sheet:

- **Injuries** are visible in the Combat tab and on the body location
  display
- **Afflictions** appear as items on the character

Right-click an injury or affliction for options to edit, treat, or remove it.

<!-- TODO: Document the UI workflow for treating injuries, diagnosing
     afflictions, and tracking healing progress over game time -->
