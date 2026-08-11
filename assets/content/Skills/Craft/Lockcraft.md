---
aliases: []
tags: []
name:
    full: Lockcraft
    aliases: []
description: "Designing locks; picking or bypassing mechanical locking mechanisms."
id: OWe6jR9RXag7ZMZk
img: icons/game-icons/badges/lock.svg
shortcode: lock
type: skill
package: sohl
sohl:
    kbcat: craft
    archetype: 0
    subType: craft
    skillBaseFormula: "sb(attr.dex, attr.per)"
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

Lockcraft is knowledge of locks and of small, close-tolerance mechanisms generally — which means the same hands that make a strongbox secure are the hands that open somebody else's. Every such device carries a **Complexity from 1 to 9**, and a character may test Lockcraft simply to judge what they are looking at before deciding whether to try it.

Warded and tumbler locks exist on chests and doors, but the padlock is far and away the commonest thing a character will meet.

**Picking.** An attempt with proper picks takes **3d6 rounds** — fifteen to ninety seconds. The lock's **Complexity × 10** is applied as a penalty to Lockcraft Mastery Level, and if that reduces it to zero or less no attempt is permitted at all. Fatigue and impairment then apply to the Effective Mastery Level as usual. Roll the duration after the test, since a Critical Success shortens it.

| Level | Result                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CF    | Complication. The lock does not open, and the picker suffers −20 to Mastery Level on every subsequent attempt on it, cumulative with the Complexity penalty and with any further Critical Failures. |
| MF    | The lock does not open. Another attempt may be made.                                                                                                                                                |
| MS    | The lock opens.                                                                                                                                                                                     |
| CS    | The lock opens in half the rounds — luck, or a raking technique that some locks will tolerate.                                                                                                      |

**Making.** A lock or comparable mechanism needs a lockcraft workshop and a Lockcraft (Metalcraft) Success Value test, following the same routine as weaponmaking. Below SV 3 the result is junk and **2d6 days** are lost. SV 3–4 produces an item of Complexity 1 to 4; each Masterwork Success permits one point beyond that. Cost and time follow from the Complexity chosen, and such items sell for **six times** their cost.

| Complexity | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9    |
| ---------- | --- | --- | --- | --- | --- | --- | --- | --- | ---- |
| Cost       | 2d  | 3d  | 4d  | 6d  | 12d | 24d | 36d | 60d | 120d |
| Time (h)   | 50  | 75  | 100 | 150 | 240 | 400 | 450 | 600 | 1000 |
