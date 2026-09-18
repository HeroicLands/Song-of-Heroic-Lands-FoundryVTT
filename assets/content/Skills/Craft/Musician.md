---
tags: []
name:
  full: Musician
  aliases: []
description: "Playing various instruments with technical facility and musical interpretation."
shortcode: musc
type: skill
data:
  icon: harp
  templatePriority: 0
subType: craft
sohl:
  kbcat: craft
  system:
    skillBaseFormula: sb(attr.per, attr.cre)
    improveFlag: false
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 0
    impairedByRoles:
      - core
      - vital
      - manipulator
packFolder: craft
---

Musician is competence on an instrument, and it is defined narrowly on purpose: **one instrument, within one of three categories** — percussion, string or wind. Mastery Level describes that instrument. Anything else is played at a penalty.

| Category   | Examples                     | On percussion | On string | On wind |
| ---------- | ---------------------------- | ------------- | --------- | ------- |
| Percussion | Cymbals, tabor, tambourine   | 0             | −40       | −40     |
| String     | Fiddle, harp, lute, zither   | −10           | −20       | −40     |
| Wind       | Flute, horn, shawm, recorder | −10           | −40       | −20     |

Read the row for what the character actually plays and the column for what they are reaching for. A lutenist picks up a harp at −20 and a drum at −10; wind is beyond them entirely until they have Mastery Level enough to survive the −40. Where the penalty reduces Mastery Level to zero or less, the instrument simply cannot be played. A character may of course take up a second instrument in earnest, beginning from that penalised level and improving it separately thereafter.

A Musician Success Value test measures the aesthetic worth of a performance, read exactly as Dancing is, and its Value Diamonds bear on persuasion for as long as the room is listening.
