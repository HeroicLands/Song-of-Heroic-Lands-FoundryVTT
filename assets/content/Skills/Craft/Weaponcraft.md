---
aliases: []
tags: []
name:
    full: Weaponcraft
    aliases: []
description: "Forging swords, axes, and weapons with superior balance and performance."
id: j33FxOHddwk3WYnE
img: icons/game-icons/lorc/sword-smithing.svg
shortcode: wpnc
type: skill
package: sohl
sohl:
    kbcat: craft
    archetype: 0
    subType: craft
    skillBaseFormula: "sb(attr.dex, attr.str)"
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

Weaponcraft is the making and repair of arms and armour. It is the most exacting of the metal trades because the product is expected to survive being used as intended, and the difference between a sound blade and a brittle one is invisible until somebody is depending on it.

**Making a weapon.**

**Workshop.** The crafter works in a workshop matching the skill tested below, rated one to five stars.

**Expense.** Materials in pence and labour in hours, at up to ten hours a day.

| Weapon         | Cost | Time | Weapon          | Cost | Time |
| -------------- | ---- | ---- | --------------- | ---- | ---- |
| Ball and chain | 6d   | 120h | Maul [w] or [m] | 10d  | 8h   |
| Bastard sword  | 14d  | 360h | Morningstar     | 9d   | 60h  |
| Battleaxe      | 9d   | 190h | Net [t]         | 22d  | 80h  |
| Battlesword    | 22d  | 450h | Pickaxe [m]     | 12d  | 20h  |
| Broadsword     | 12d  | 240h | Pike            | 15d  | 160h |
| Buckler        | 7d   | 30h  | Pitchfork [m]   | 4d   | 10h  |
| Club [w]       | 4d   | 10h  | Poleaxe         | 14d  | 70h  |
| Dagger         | 3d   | 35h  | Roundshield     | 8d   | 60h  |
| Estoc          | 11d  | 250h | Scimitar        | 11d  | 270h |
| Falchion       | 10d  | 230h | Shortsword      | 7d   | 170h |
| Glaive         | 10d  | 90h  | Sickle [m]      | 3d   | 20h  |
| Grainflail [m] | 6d   | 25h  | Spear           | 10d  | 80h  |
| Handaxe        | 12d  | 110h | Staff [w]       | 1d   | 50h  |
| Hatchet [m]    | 3d   | 10h  | Stick [w]       | 1d   | 10h  |
| Javelin        | 4d   | 60h  | Tower shield    | 20d  | 130h |
| Jousting pole  | 2d   | 80h  | Trident         | 10d  | 120h |
| Kite shield    | 16d  | 100h | Warflail        | 5d   | 110h |
| Knife [m]      | 3d   | 10h  | Warhammer       | 12d  | 150h |
| Knight shield  | 14d  | 100h | Whip [h]        | 4d   | 25h  |
| Lance          | 9d   | 220h | Wood axe [m]    | 9d   | 10h  |
| Longknife      | 5d   | 200h |                 |      |      |
| Mace           | 6d   | 140h |                 |      |      |

**Test.** The formula depends on what is being made. Up to two others may assist, provided they are present for the whole of the work.

| Mark      | Success Value test                   |
| --------- | ------------------------------------ |
| (default) | Weaponcraft (Metalcraft, Mineralogy) |
| [h]       | Hideworking                          |
| [m]       | Metalcraft (Woodworking)             |
| [t]       | Textilecraft (Metalcraft)            |
| [w]       | Woodworking                          |

**Result.**

| SV  | Outcome                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 2 | Flawed. The weapon loses one Weapon Quality and one impact for every point of Success Value below 3.                                   |
| 3–4 | The base weapon, exactly as catalogued.                                                                                                |
| 5+  | Masterwork. Each Value Diamond buys either one d10 masterwork roll or a 10% reduction in the time expense, to a maximum 30% reduction. |

A Critical Failure is a setback: crafting time increases by half.

**Masterwork rolls.** Each diamond so committed rolls one d10 against a Target Number equal to the workshop's star quality, rolled separately. Successes are Masterwork Successes.

| Workshop  | TN  | MWS | Result                | Value |
| --------- | --- | --- | --------------------- | ----- |
| Makeshift | 1   | 0   | Base article          | ×1    |
| Sparse    | 2   | 1   | Quality +1            | ×2    |
| Standard  | 3   | 2   | Quality +1, impact +1 | ×3    |
| Plentiful | 4   | 3   | Quality +2, impact +1 | ×4    |
| Ideal     | 5   | 4   | Quality +2, impact +2 | ×5    |
|           |     | 5   | Quality +3, impact +2 | ×6    |

Applicable successes are capped at the weapon's base Weapon Quality minus eight — a WQ 10 weapon takes at most two.

**Repair.** A weapon reduced by only one Weapon Quality can be repaired in the field: a Success Value test of the appropriate skill above, without Secondary Modifiers, taking 10% of the listed time at no cost. **SV 1 or better restores the lost point** — which means field repair almost always works, and is limited by the hours it takes rather than the roll. In a workshop, the same test is made at **+2 SV**, and the quality restored is worked out through the masterwork steps above, never exceeding the weapon's undamaged rating.

**Making armour** follows the same shape — workshop, expense, test, result, masterwork rolls — with the test set by the material rather than the item:

| Material                         | Success Value test                    |
| -------------------------------- | ------------------------------------- |
| Cloth, padded, quilted, gambeson | Textilecraft                          |
| Leather                          | Hideworking                           |
| Kurbul                           | Weaponcraft (Hideworking)             |
| Scale                            | Weaponcraft (Hideworking, Metalcraft) |
| Mail, plate                      | Weaponcraft (Metalcraft, Mineralogy)  |

| SV  | Outcome                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 2 | Flawed. The article loses one Armour Quality and one Armour Value — two of each at SV 0 or less.                                       |
| 3–4 | The base article, exactly as catalogued.                                                                                               |
| 5+  | Masterwork. Each Value Diamond buys either one d10 masterwork roll or a 10% reduction in the time expense, to a maximum 30% reduction. |

Masterwork successes on armour read as Armour Quality and Armour Value in place of weapon quality and impact, and the material itself caps how many can actually be applied:

| Material | Max MWS | Material | Max MWS |
| -------- | ------- | -------- | ------- |
| Cloth    | 1       | Gambeson | 2       |
| Leather  | 1       | Kurbul   | 3       |
| Padded   | 1       | Scale    | 4       |
| Quilted  | 1       | Mail     | 5       |
|          |         | Plate    | 5       |

There is only so much that can be done with a quilted coat, however good the tailor.
