---
title: "Rules Variants"
slug: "rules-variants"
category: "User Guide"
sort: 3
tags:
    - variants
    - legendary
    - mistyisle
    - rules
    - setup
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# What Are Rules Variants? {#variants-overview}

Song of Heroic Lands supports multiple **rules variants** — different sets
of game mechanics built on the same foundation. You choose your variant when
you first create a world, and it determines how many game mechanics work.

The variant affects things like combat resolution, skill test thresholds,
mystical power systems, and character advancement. However, the basic
concepts (actors, items, sheets, compendiums) work the same regardless of
which variant you use.

See also: [Quickstart](user-guide/quickstart.md), [Settings](user-guide/settings.md)

# Available Variants {#variants-available}

## Legendary

The **Legendary** variant is compatible with _HârnMaster Kethira_. It
provides detailed, realistic combat mechanics, a comprehensive injury
system, and rich mystical traditions.

## Misty Isle

The **Misty Isle** variant is compatible with _HârnMaster 3.5_. It offers
an alternative set of rules with different approaches to combat resolution
and character mechanics.

<!-- TODO: Expand with specific differences between the variants — how combat
     resolution differs, skill test thresholds, mystical system variations,
     character creation differences, and other notable mechanical divergences -->

# Choosing a Variant {#variants-choosing}

You select your rules variant when you first launch a new SoHL world.
The welcome dialog asks which variant to use. After selecting, you must
close and restart the world for the change to take effect.

> **Important:** Although it is technically possible to change the variant
> later, doing so is **not recommended**. Character data may not translate
> cleanly between variants.

# What Varies and What Doesn't {#variants-what-varies}

Many parts of SoHL work identically regardless of which variant you choose.
Understanding this distinction helps when reading the documentation.

## Always the Same (Variant-Invariant)

These features work identically in all variants:

- **All actor types** except Being — Assemblies, Cohorts, Structures, and
  Vehicles behave the same in every variant
- **Basic item types** — Traits, Skills, Affiliations, Dispositions,
  Philosophies, Afflictions, Domains, Movement Profiles, and Actions work
  the same everywhere
- **UI mechanics** — sheets, tabs, drag-and-drop, compendiums, scene setup
- **Nested items** — the nesting hierarchy and container mechanics
- **Assemblies** — creation, transfer, and the Assemblies sidebar
- **Core concepts** — encumbrance, body structure, the three-class pattern

## Varies by Variant

These features may differ between Legendary and Misty Isle:

- **Being** — character creation details and some sheet calculations
- **Combat resolution** — how attacks, defenses, and damage are resolved
- **Injury mechanics** — severity thresholds, healing timelines
- **Strike modes** — melee and missile weapon behavior
- **Gear properties** — armor, weapon, and equipment calculations
- **Mystical systems** — spellcasting and miracle mechanics
- **Skill tests** — success/failure thresholds and critical results
- **Fate** — how fate points work and what they can do
- **Body location** mechanics — hit location probabilities and armor coverage

When documentation covers a feature that varies by variant, it will note
which variant the information applies to.

# Where Variants Are Noted in Documentation {#variants-in-docs}

Throughout the user guide, you'll see notes like:

> **Variant note:** This section describes Legendary mechanics. Misty Isle
> handles this differently.

If no variant note appears, the feature works the same in all variants.

<!-- TODO: As the documentation expands with detailed game mechanics,
     add variant-specific callouts throughout. Consider separate sections
     or sub-pages for mechanics that differ significantly between variants. -->
