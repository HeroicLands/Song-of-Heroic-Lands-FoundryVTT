---
aliases: []
tags: []
name:
    full: Climbing
    aliases: []
description: "Scaling cliffs, walls, trees using handholds, ropes, body technique."
id: cJnD2VAKWuxSdo5s
img: icons/game-icons/caro-asercion/mountain-climbing.svg
shortcode: clmb
type: skill
package: sohl
sohl:
    kbcat: physical
    archetype: 0
    subType: physical
    skillBaseFormula: "sb(attr.agl, attr.dex)"
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 3
    masteryLevelBase: null
    improveFlag: false
    impairedByRoles:
        - core
        - vital
        - locomotor
        - manipulator
folder: Yt9THlZ0NT8H6aSK
---

Climbing covers everything from swinging up into a tree to working a sheer rock face on fingertips. What separates the two is not effort but resolution: an easy climb is folded into ordinary movement, while a hard one is fought a minute at a time.

**Easy climbs** — a low wall, a ledge, a branch overhead — are a Climbing test made as part of the Move action.

| Level | Result                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| CF    | The climb fails, costs a full round, and forces a Stumble Test.                                                                 |
| MF    | The climb fails at the cost of a turn; or, at the climber's option, succeeds after a full round and a successful Strength test. |
| MS    | Succeeds as difficult movement, to a half-Move ceiling.                                                                         |
| CS    | Succeeds, to a half-Move ceiling.                                                                                               |

**Difficult climbs** are a Climbing (Endurance SR) Success Value test made once per minute. The climber makes headway only when the Success Value at least meets what the face demands; every test accrues windedness Personal Fatigue, reduced by five when the Endurance SR succeeds.

| SV  | The face the climber can hold                                                     |
| --- | --------------------------------------------------------------------------------- |
| 1–2 | Steep — at least 20° and under 40°.                                               |
| 3–4 | Very steep — at least 40° and under 60°.                                          |
| 5   | Sheer — 60° or more, with large and plentiful holds: ledges, protrusions, cracks. |
| 6   | Sheer, with holds that are small, or few.                                         |
| 7   | Sheer, with occasional overhangs.                                                 |
| 8   | Sheer, with frequent overhangs.                                                   |
| 9+  | Sheer and holdless — passable only with aid.                                      |

A Critical Failure forces a Fumble Test on a units digit of 0 or a Stumble Test on a 5; failing either starts a fall.

**Rate.** A Success Value exactly meeting the requirement carries the climber, over that minute, a distance set by the incline: double Move on a steep slope, full Move on a very steep one, half Move on a sheer face. Every point of Success Value above the minimum adds that same distance again.

**Aid.** Pitons take ten minutes to set per thirty feet, after which the setter makes a Survival (Climbing) Success Value test; each Value Diamond grants a +1 SV bonus to everyone who follows. A fixed rope is worth +2 SV. Climbing a bare rope is its own problem — a Strength (Climbing) Success Value test needing at least SV 4 if the rope is knotted, SV 6 if it is not.

**Falling.** A fall from anything less than sheer is softened. On a steep incline a Marginal or Critical Success on the fall test means no impact at all, and otherwise the strike impact is halved before armour; on a very steep incline the impact is halved regardless.
