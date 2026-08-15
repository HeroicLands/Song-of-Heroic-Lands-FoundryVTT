---
aliases:
    - skill-musc
tags: []
name:
    full: Musician
    aliases: []
description: "Playing various instruments with technical facility and musical interpretation."
id: 5DPlnTLCpfyz4Rar
img: icons/game-icons/delapouite/harp.svg
shortcode: musc
type: skill
package: sohl
sohl:
    kbcat: craft
    archetype: 0
    subType: craft
    skillBaseFormula: "sb(attr.per, attr.cre)"
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 0
    masteryLevelBase: null
    improveFlag: false
    impairedByRoles:
        - core
        - vital
        - manipulator
folder: gqRvjlrWbuCwGy3N
---

Musician is competence on an instrument, and it is defined narrowly on purpose: **one instrument, within one of three categories** — percussion, string or wind. Mastery Level describes that instrument. Anything else is played at a penalty.

| Category   | Examples                     | On percussion | On string | On wind |
| ---------- | ---------------------------- | ------------- | --------- | ------- |
| Percussion | Cymbals, tabor, tambourine   | 0             | −40       | −40     |
| String     | Fiddle, harp, lute, zither   | −10           | −20       | −40     |
| Wind       | Flute, horn, shawm, recorder | −10           | −40       | −20     |

Read the row for what the character actually plays and the column for what they are reaching for. A lutenist picks up a harp at −20 and a drum at −10; wind is beyond them entirely until they have Mastery Level enough to survive the −40. Where the penalty reduces Mastery Level to zero or less, the instrument simply cannot be played. A character may of course take up a second instrument in earnest, beginning from that penalised level and improving it separately thereafter.

A Musician Success Value test measures the aesthetic worth of a performance, read exactly as Dancing is, and its Value Diamonds bear on persuasion for as long as the room is listening.
