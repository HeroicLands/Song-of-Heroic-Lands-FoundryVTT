---
aliases:
    - Being
id: NNwX0CWqScS2HGsl
type: doc
package: sohl
category: user-guide
name:
    full: "Being"
slug: "actor-being"
folder: sYK1BozT9xFcinXK
---

# What Is a Being?

A Being is a single person or creature in the game world. This includes
player characters, non-player characters (NPCs), monsters, and animals.
Beings are the most detailed actor type in SoHL, with a full anatomy model,
skills, traits, gear, and combat capabilities.

Most of your interaction with the system will involve Beings.

See also: [Character Creation](user-guide/character-creation.md), [Combat Basics](user-guide/combat-basics.md)

# What a Being Contains

A Being can hold many types of items:

- **Traits** — innate characteristics like Strength, Stamina, and Dexterity
- **Skills** — trained abilities like Sword, Riding, or Stealth
- **Gear** — weapons, armor, containers, miscellaneous equipment
- **Afflictions** — diseases, poisons, curses, and other conditions
- **Injuries** — wounds and trauma from combat or accidents
- **Body Structure** — body zones, body parts, and body locations that define the anatomy
- **Movement Profiles** — walking, running, swimming speeds
- **Mystical Abilities** — spells, prayers, and supernatural powers
- **Actions** — special procedures that can be triggered from the character sheet

# The Being Sheet

The Being sheet is organized into several tabs:

- **Facade** — portrait and description
- **Profile** — attributes (traits with intensity "attribute"), other traits, and affiliations
- **Skills** — all skills grouped by category
- **Gear** — carried and worn equipment, with encumbrance tracking
- **Combat** — equipped weapons, armor, and combat-relevant information
- **Mystical** — domains, mysteries, philosophies, and mystical abilities
- **Actions** — available actions for this character
- **Effects** — active effects modifying this character

# The Being Sheet Header

Above the tabs, the header shows the portrait and name, a row of **status
indicators**, a **health bar**, and a **body-part grid**.

## Status indicators

Six condition pills are click-toggles — **Sleep, Prone, Stun, Incapacitated,
Unconscious, Dead** — that turn a condition on or off. Two more, **Aural-Shock**
and **Fatigue**, are read-only: they light up on their own when the Being has an
active affliction of that kind.

## Health bar

The health bar shows current health as a percentage of the Being's maximum.

- **Maximum health** is the Being's **Endurance × 3** (a Being with no Endurance
  uses a flat 100).
- Each **injury** lowers current health by the injured location's **shock value ×
  the injury level** — a deeper wound in a more sensitive spot costs more.
- Certain conditions also **cap** current health, and the most severe cap wins:
    - a body part with a **serious** injury (impairment −10 or worse) → at most
      **75%** of maximum
    - an **unusable** body part → at most **50%**
    - **Stunned** → at most **25%**
    - **Incapacitated** or **Unconscious** → at most **10%**
    - **Dead** → **0**

Current health never falls below 0.

## Body-part grid

Each body part appears as a colored chip showing the worst injury among that
part's hit locations:

| Color      | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| **White**  | No impairment                                         |
| **Yellow** | Minor impairment (−5) — a slow-healing minor injury   |
| **Blue**   | Major impairment (−10 or worse) — a serious injury    |
| **Black**  | Unusable — a grievous injury (or a permanent maiming) |

As injuries heal, a part's color climbs back toward white. A part may also carry
a **permanent impairment** — a lasting maiming that keeps it colored even with no
fresh injury.

# Creating a Being

Generally, you should not create a Being from scratch using the Create Actor
dialog. Instead, duplicate an existing Being from the compendium (such as
"Basic Folk") and customize it.

See [Character Creation](user-guide/character-creation.md) for step-by-step instructions.

# Beings on Scenes

Beings can be placed on scenes as tokens. Each token represents the Being's
physical presence in the game world. Tokens can be moved, have vision, and
participate in combat encounters.

<!-- TODO: Expand with token configuration details, linked vs unlinked tokens,
     prototype token setup, and vision/light settings -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
