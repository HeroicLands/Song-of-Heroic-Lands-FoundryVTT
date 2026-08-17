---
aliases:
  - skill-agri
tags: []
name:
  full: Agriculture
  aliases: []
description: "Cultivating crops, tending orchards, assessing land and harvest value."
id: i0ILSAgGcKWCKFa4
img: icons/game-icons/lorc/wheat.svg
shortcode: agri
type: skill
package: sohl
sohl:
  kbcat: nature
  archetype: 0
  subType: nature
  skillBaseFormula: "sb(attr.per, attr.wil)"
  combatCategory: none
  parentSkillCode: ""
  initSkillMult: 0
  masteryLevelBase: null
  improveFlag: false
  impairedByRoles:
    - core
    - vital
    - locomotor
    - manipulator
folder: N5ozne3RRF0qSEdF
---

Agriculture is the knowledge of growing crops and of managing everything on a holding that is not under the plough — pasture, orchard, coppice and wood. A character knows the plants native to their own country, can judge the condition of land and equipment, and can put a price on a standing crop.

In temperate country the principal crops are wheat, barley, rye, oats, vetch, hay and flax. The basic unit of land is the **acre**, roughly two hundred feet square. Beyond a cottage garden, holdings run something like this:

| Occupation           | Acres | Occupation | Acres |
| -------------------- | ----- | ---------- | ----- |
| Unfree: serf         | 0     | Beadle     | 15    |
| Unfree: cottar       | 5     | Reeve      | 30    |
| Unfree: half-villein | 15    | Freeholder | 65    |
| Unfree: villein      | 30    | Yeoman     | 80    |

**Weather lore.** Anyone whose livelihood depends on the sky learns to read it. An Agriculture test predicts the weather for the next four-hour watch — a Critical Success reaching **2d3 watches** ahead — and the success level sets how good the forecast is:

| CF      | MF         | MS      | CS       |
| ------- | ---------- | ------- | -------- |
| Unknown | Incomplete | General | Specific |

A forecast covers three qualities. **Temperature** falls into six bands: freezing, cold, cool, warm, hot, sweltering. **Precipitation** is dry, showers, or continuous rain or snow, under clear, cloudy or overcast skies. **Wind** is a direction and one of five forces:

| WF  | Force    | Effect         | kph   | d100  |
| --- | -------- | -------------- | ----- | ----- |
| 0   | Light    | Leaves rustle  | 0–8   | 01–15 |
| 1   | Moderate | Branches move  | 9–24  | 16–55 |
| 2   | Strong   | Treetops sway  | 25–48 | 56–84 |
| 3   | Gale     | Branches break | 49–88 | 85–99 |
| 4   | Storm    | Trees uprooted | ≥ 89  | 100   |

For a given **3d4-hour** period the GM may generate the windforce from that d100 column, and roll 1d12 for its quarter: 1–2 north, 3 northeast, 4–5 southeast, 6–7 south, 8–10 southwest, 11–12 northwest.

Wind force matters well beyond the farm — it is what decides whether open water can be swum, and Piloting, Seamanship and Survival all read the sky by exactly this procedure.
