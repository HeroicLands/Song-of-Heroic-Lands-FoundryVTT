---
aliases: []
tags: []
name:
  full: Swimming
  aliases: []
description: "Moving through water across rivers, during shipwrecks, or beneath surfaces."
id: DlPCHm0GqMcwZyyh
img: icons/game-icons/delapouite/swimfins.svg
shortcode: swim
type: skill
subType: physical
sohl:
  kbcat: physical
  archetype: 0
  skillBaseFormula: "sb(attr.agl, attr.end)"
  combatCategory: none
  parentSkillCode: ""
  initSkillMult: 1
  masteryLevelBase: null
  improveFlag: false
  impairedByRoles:
    - core
    - vital
    - locomotor
    - manipulator
folder: Yt9THlZ0NT8H6aSK
---

Swimming covers staying up, getting somewhere, and going under on purpose. What makes it dangerous is rarely the water itself but the state of it: a character makes a Swimming Success Value test once per minute, and the Success Value is then modified by how exposed the water is and how hard the wind is blowing across it.

| Water                        | WF 0 | WF 1 | WF 2 | WF 3 | WF 4 |
| ---------------------------- | ---- | ---- | ---- | ---- | ---- |
| Inland or sheltered coast    | 0    | −1   | −2   | −3   | −4   |
| Open water, 1–5 leagues out  | 0    | −1   | −3   | −4   | −6   |
| Open water, 6–19 leagues out | 0    | −1   | −4   | −6   | −8   |
| Open water, 20+ leagues out  | 0    | −1   | −6   | −8   | −8   |

Rivers, ponds, lakes and any coast within a league of shore count as inland.

The adjusted Success Value gives the distance covered in that minute:

| SV  | Distance             |
| --- | -------------------- |
| < 0 | The character sinks. |
| 0   | Treading water.      |
| 1   | 80 feet              |
| 2   | 100 feet             |
| 3   | 120 feet             |
| 4   | 140 feet             |
| 5   | 160 feet             |
| 6   | 180 feet             |
| 7   | 200 feet             |
| 8   | 230 feet             |
| 9   | 260 feet             |
| 10+ | 300 feet             |

A strong swimmer on flat water covers ground quickly; the same swimmer in a gale needs a Critical Success merely to keep their face above the surface. A character who sinks is in immediate danger of drowning, and Mastery Level in Swimming greatly extends how long they can hold their breath while it is resolved.

**Encumbrance.** For swimming purposes, multiply base encumbrance from armour and gear by four before modifying for Strength. Soaked clothing weighs even where dry clothing does not — an ordinary suit of clothes carries ENC 10 in the water and a heavy one ENC 20. A Swimming EML reduced below zero permits no test: the character goes under.

**Fatigue.** Swimming at the full rate is fast swimming and accrues windedness fatigue every minute. A character who reaches at least SV 1 may instead swim slowly, covering at most half the distance but accruing only weariness fatigue, and then only once an hour.
