---
aliases: []
tags: []
name:
  full: Timbercraft
  aliases: []
description: "Forest knowledge for selecting timber and managing woodland for sustainable yield."
id: VoZDMnV29TjcrO4T
img: icons/game-icons/delapouite/wood-pile.svg
shortcode: timb
type: skill
subType: nature
sohl:
  kbcat: craft
  archetype: 0
  skillBaseFormula: "sb(attr.per, attr.rea)"
  combatCategory: none
  parentSkillCode: ""
  initSkillMult: 0
  masteryLevelBase: null
  improveFlag: false
  impairedByRoles:
    - core
    - vital
    - manipulator
    - locomotor
folder: gqRvjlrWbuCwGy3N
---

Timbercraft is tree lore and the axe work that follows from it: knowing the species, judging a standing tree's health and soundness, planting and managing a wood for yield decades out, and then felling, limbing and bucking what is ready. It is the skill that decides whether a bow stave is worth cutting, and the skill that keeps a wood producing instead of being mined out in a generation.

Mature trees are rated by **volume** of usable lumber (1 vol = 100 cubic feet), trunk **diameter** in feet, **hardness**, and wholesale **value** in pence per volume — retail runs about triple.

| Hardwood  | Vol | Dia | Har | Value | Softwood  | Vol | Dia | Har | Value |
| --------- | --- | --- | --- | ----- | --------- | --- | --- | --- | ----- |
| Ash       | 18  | 5   | 9   | 40d   | Cedar     | 3   | 2   | 2   | 25d   |
| Birch     | 3   | 2   | 7   | 15d   | Elm, soft | 20  | 5   | 5   | 30d   |
| Cherry    | 1   | 1   | 6   | 80d   | Fir       | 15  | 4   | 2   | 40d   |
| Elm, hard | 6   | 3   | 8   | 35d   | Larch     | 8   | 3   | 4   | 20d   |
| Maple     | 7   | 3   | 9   | 45d   | Pine      | 3   | 2   | 3   | 25d   |
| Oak       | 20  | 5   | 7   | 60d   | Spruce    | 19  | 4   | 2   | 20d   |

**Felling.** With proper axes and saws, a Timbercraft Success Value test is made every ten minutes and the Success Values accumulate. Up to two people may work the same tree, adding their results together. The tree comes down when the accumulated total exceeds **diameter × hardness** — so a great oak is a morning's work for two and a birch is barely an interruption.

Limbing needs the same total again; bucking needs **twice** it. Depending on trunk diameter, two to six workers may share those tasks.

An unskilled character may swing at it with a **Strength** Success Value test instead, each result reduced by 4 to a floor of SV 1. Progress is possible; it is simply very slow.

Every ten minutes of felling accrues Personal Fatigue, reduced by five on a successful Endurance Secondary Roll, and recovered afterwards as weariness.
