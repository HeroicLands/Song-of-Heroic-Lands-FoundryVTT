---
aliases:
    - Afflictions and Injuries
id: usEQSnM05guRRXT7
type: doc
package: sohl
category: user-guide
name:
    full: "Afflictions and Injuries"
slug: "afflictions-injuries"
folder: IgwaG8rAUUO9vrtz
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

## Contracting a Disease {#conditions-contract-disease}

When a character is exposed to a disease, use the **Contract Disease** action
on the being (right-click the token or use the character's action menu). Only
**diseases** can be contracted this way — poisons and curses are applied by
other means.

The action opens a dialog offering:

- **A dropdown of every disease** found in your world and in the installed Item
  compendium packs. Picking one copies that disease onto the character if it is
  contracted.
- **A "Custom disease" option**, where you supply a **name** and a **Contagion
  Index (CI)** from 1 to 5. Choosing this creates a brand-new disease if it is
  contracted.

### The Contagion Roll

Contraction is decided by a single d100 **contagion roll** against a target of:

> **Contagion Index × Endurance**

The character rolls to resist. **Failing** the roll means the disease is
contracted. Two consequences follow from the formula:

- **Higher Endurance protects.** A hardier character has a higher target and is
  more likely to resist.
- **The lower the CI, the more contagious the disease.** A low CI produces a low
  target that is easy to roll over (fail), so low-CI diseases spread readily;
  high-CI diseases are shrugged off more often.

If the roll fails, the disease is added to the character sheet as an affliction —
either copied from the chosen source disease, or created fresh from the custom
name and CI you entered — and then follows the normal affliction lifecycle
(course, diagnosis, treatment, healing).

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
