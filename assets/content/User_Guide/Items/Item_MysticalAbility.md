---
aliases:
    - Mystical Ability
id: k2BO5PGE97a6YEZe
type: doc
package: sohl
category: user-guide
name:
    full: "Mystical Ability"
slug: "item-mysticalability"
folder: QtOgPodi8X6gDWL0
---

# What Is a Mystical Ability?

A Mystical Ability is a specific supernatural power — a spell, prayer, ritual, or other manifestation of mystical power that a character can invoke. Unlike a mystery, it is always something that is performed resulting in a specific effect. Each Mystical Ability defines exactly what happens when it is used: its effects, costs, range, duration, and any requirements for successful use.

Mystical Abilities fall into one of three broad supernatural categories: **Arcane**, **Divine**, or **Spirit**.

# Where It Appears

Mystical Abilities appear on the Being sheet's **Mystical** tab. A Mystical Ability may reference a skill if it's use involves mastery of some sort.

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **SubType:** The type of Mystical Ability, one of:
    - **Spirit Rite:** A rite performed by anyone attuned to the spirit realm — transiting to the spirit world, petitioning a spirit for some power, or performing a rite to share spirit wisdom.
    - **Spirit Power:** Using a power the spirits have granted to perform some action.
    - **Ritual Action:** Perform a prescribed ritual to earn a deity's favour.
    - **Divine Incantation:** Perform a ritual to request a divine entity to perform some action.
    - **Arcane Incantation:** Perform a taught ritual to use the caster's own aura to direct arcane forces for some effect.
    - **Spirit Incantation:** Perform a taught ritual to request the spirits to perform some action.
    - **Arcane Talent:** Use innate capacity to direct arcane forces for some effect.
    - **Spirit Talent:** Use innate capacity to direct spirits to produce an effect.
    - **Alchemical Action:** Perform taught arcane recipies and rituals to produce an alchemical elixir or effect.
- **Level:** The difficulty or power tier of the ability. Higher-level incantations are also harder to invoke — see _How the Effective Mastery Level Is Determined_ below.
- **Associated Mystery:** Which Mystery is associated with this ability (optional).
- **Associated Skill:** Which Skill this mystery draws upon (optional).
- **Associated Affiliation:** Which [[Item_Affiliation|Affiliation]] this ability draws its standing from (optional) — the church, arcane or alchemical school, or ancestor/totem/spirit whose membership the ability belongs to. Recording it lets the ability's behaviour take the character's **rank** in that body into account (its **Level**): a full priest and a layperson of the same faith can differ in what they can invoke. This only _informs_ the ability — the player still deliberately triggers every invocation.
- **Charges:** If this mystical ability can be used up, this represents the number of charges
    - **Value:** Current number of charges avaiable
    - **Max:** Maximum number of charges

# How the Effective Mastery Level Is Determined

Invoking a Mystical Ability is resolved as a mastery level test. The **Effective Mastery Level (EML)** used for that test is determined by whether the ability has an **Associated Skill**:

- **If an Associated Skill is set,** the ability draws its mastery level from that skill. This is the usual case: many abilities share a single governing skill, so they improve together and inherit any modifiers applied to that skill — including Active Effects (for example, an effect representing a caster's resistance to a particular tradition applies to every ability that skill governs).
- **If no Associated Skill is set,** the ability uses its own internal mastery level instead.

Either way, the ability's own modifiers still stack on top of the mastery level it draws upon.

## The Incantation Casting Penalty

**Arcane Incantations** and **Divine Incantations** become harder to invoke the more powerful they are. When one of these abilities is invoked, a penalty equal to **Level × 2** is applied to its EML — so a Level 3 incantation is invoked at EML − 6, a Level 4 at EML − 8, and so on. The penalty appears in the roll breakdown as **Level Penalty**.

Abilities with no level (and abilities at Level 0) take no penalty, and other subtypes — talents, rites, ritual actions, and the like — are not affected.
