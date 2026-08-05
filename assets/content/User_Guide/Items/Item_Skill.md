---
aliases:
    - Skill
id: rbl6nD2s5gxsx9gR
type: doc
package: sohl
category: user-guide
name:
    full: "Skill"
slug: "item-skill"
folder: QtOgPodi8X6gDWL0
---

# What Is a Skill?

A Skill represents a learned or practiced ability that a Being possesses. Skills cover everything from combat proficiency (Sword, Shield, Bow) to everyday talents (Riding, Climbing, Awareness) to specialized knowledge (Herblore, Law, Physician). Every meaningful action a character attempts in the game is typically resolved through a skill test.

# Where It Appears

Skills appear on the Being sheet's **Skills** tab, organized by SubType (such as Combat, Physical, Communication, and so on). Skills are typically added from compendium packs during character creation.

Each skill is based on one or more attributes via a **skill base formula** — for example, a physical skill might derive its base from the average of Strength and Dexterity. This means a character's innate attributes directly influence their starting skill levels.

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **SubType:** Type of this skill. One of:
    - **Social:**
    - **Craft:**
    - **Physical:**
    - **Lore:**
    - **Nature:**
    - **Combat:**
    - **Language:**
    - **Script:**
    - **Ritual:**
- **Skill Base Formula:** Formula for calculating the skill base from referenced attributes. For a religious or arcane skill it may also draw on the character's standing in an [[Item_Affiliation|Affiliation]] — reference that affiliation's rank as `affiliation.<code>.level` (using the affiliation's shortcode) to let the skill scale with the character's grade in a church or arcane school.
- **Mastery Level Base:** Base mastery level representing training and experience. Leave it **blank** to have a skill on a character open automatically at _Skill Base × Initial Skill Multiplier_; enter a number to set the level explicitly.
- **Improve Flag:** Whether this item is flagged for mastery improvement via _Skill Development Roll_ (SDR).
- **Weapon Group:** Combat category this skill applies to, if any.
    - **None:** Skill not associated with a weapon.
    - **All:** Skill associated with all weapon modes.
    - **Melee:** Skill associated with Melee weapon modes
    - **Missile:** Skill associated with Missile weapon modes.
    - **Melee/Missile:** Skill associated with both Melee and Missile weapon modes.
    - **Unarmed:** Skill associated with unarmed modes.
    - **Melee/Unarmed:** Skill associated with Melee and Unarmed modes.
- **Parent Skill Code:** Shortcode of the base skill if this is a specialization.
- **Initial Skill Multiplier:** Multiplier applied to the skill base to open the skill's mastery level for a new character. When _Mastery Level Base_ is blank and the skill is on a character, the opening mastery level is _Skill Base × Initial Skill Multiplier_.
- <!-- TODO: Expand with details on skill tests (success/failure resolution),
       skill improvement through practice, opening new skills, and how
       modifiers affect skill rolls -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->
