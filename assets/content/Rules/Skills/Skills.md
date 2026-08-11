---
aliases:
    - Skills
    - Skill
id: cL5j8XD4fBEqWioE
type: doc
package: sohl
category: rules
name:
    full: Skills
    aliases: []
folder: e0HEIHw9qUVWqyzJ
shortcode: skills
---

A **skill** represents a character's trained ability at some activity — a weapon, a craft, a lore, a social art. Each skill is rated by a **Mastery Level (ML)**, and whenever the outcome of using a skill is uncertain, the character makes a test against it. This page introduces the kinds of test skills use; each links to its detailed rules.

# Success Tests

The basic way to resolve a skill is the **Success Test**: roll d100 against the skill's Effective Mastery Level (EML). A roll equal to or under the EML succeeds; a roll over it fails. The units digit (the ones place) decides whether the result is _critical_ — a 5 or a 0 is critical, anything else is marginal — producing a numeric **success level**:

| Level | Abbreviation | Name             | Meaning                           |
| ----- | ------------ | ---------------- | --------------------------------- |
| −1    | CF           | Critical Failure | The task fails badly              |
| 0     | MF           | Marginal Failure | The task fails                    |
| 1     | MS           | Marginal Success | The task succeeds                 |
| 2     | CS           | Critical Success | The task succeeds especially well |

Some rules or modifiers shift a success level beyond this base range, giving values of 3 or higher, or −2 or lower. Extended levels are written colloquially by appending the offset to the nearest base level: a level of 3 is **CS+1**, a level of 4 is **CS+2**, a level of −2 is **CF−1**, a level of −3 is **CF−2**, and so on.

See [[Success Tests]] for Effective Mastery Level, Index, the star-rating competence scale, and assistance.

# Opposed Tests

When two characters act against one another — Stealth versus Awareness, Melee versus Dodge, Eloquence versus Eloquence — both make Success Tests at once. The victor is the character who achieves a positive success level _and_ a higher success level than their opponent. The difference between the two success levels is the number of **Victory Stars**, measuring how decisively the contest was won.

See [[Opposed Tests]] for ties and tiebreaks.

# Success Value Tests

Sustained or complex efforts — crafting a sword, sailing a ship, researching a topic — are resolved with a single **Success Value (SV) test** rather than many individual rolls. The SV combines the skill's **Index** (ML divided by ten, rounded down) with a modifier taken from a Success Test's success level, producing a graduated measure of quality rather than a simple pass or fail. A high Success Value earns **Success Stars**: none at Base Value or below, and one through five above it (SV 5 = one star, up to SV 9 = five stars). The more stars, the further the work exceeds a plain result.

See [[Success Value Tests]] for the full four-step procedure.

# Secondary Mastery

A test uses one primary skill at a time, but other skills and attributes can influence it as **Secondary Mastery**, in one of two ways. A **Secondary Modifier** lends a bonus or penalty to the EML, derived from the secondary skill or attribute's Index. A **Secondary Roll** instead accompanies the test as a separate d10 check, using that Index as its target number.

See [[Secondary Mastery]] for the modifier table, Secondary Rolls, and the rule on missing mastery.

# Injury and Skills

A skill does not name the body parts it needs — it names **body roles**. Each skill (and each attribute) carries a list of the roles whose injury impairs it: **Vital**, **Core**, **Manipulator**, **Locomotor**, or any combination. Climbing might list both Manipulator and Locomotor; Legerdemain, Manipulator alone; a Lore skill, none at all.

When you test a skill, every body part holding one of the roles that skill lists is consulted:

- If any of those parts is **unusable** — a grievous wound, or a limb lost outright — the test **automatically Critically Fails**. No roll is made.
- Otherwise the test suffers the **worst** impairment penalty among those parts: **−5** or **−10**. Penalties do not stack across parts; the single worst applies.

A skill that lists no roles is never impaired by injury, however badly hurt the character is.

Naming roles rather than parts is what lets one skill definition serve every creature. "Manipulator injury impairs me" is a true and complete statement whether the creature has two arms, four, or a pair of tentacles — the skill never needs to know the anatomy it is used on.

See [[Body Structure]] for the roles in full, how parts become impaired or unusable, and how a human's parts are tagged.
