---
aliases:
    - skill-wpnc
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

# Crafting {#crafting}

Arms and armour are made by the common [[doc-crafting|crafting routine]] — workshop, expense, test, result, masterwork rolls, repair. A weaponsmith works in a workshop matching the skill tested below. What follows is what is particular to this bench.

## Weapons

**Expense.**

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

**Test.** The formula depends on what is being made.

| Mark      | Success Value test                   |
| --------- | ------------------------------------ |
| (default) | Weaponcraft (Metalcraft, Mineralogy) |
| [h]       | Hideworking                          |
| [m]       | Metalcraft (Woodworking)             |
| [t]       | Textilecraft (Metalcraft)            |
| [w]       | Woodworking                          |

**A flaw** costs the weapon one Weapon Quality and one impact for every point of Success Value below 3.

**Masterwork** reads as Weapon Quality and impact — impact being this trade's modifier. Applicable successes are capped at the weapon's base Weapon Quality minus eight, so a WQ 10 weapon takes at most two.

## Armour

Armour follows the same shape, with the test set by the material rather than by the article. It carries no separate expense table; the article's catalogue entry gives its cost.

| Material                         | Success Value test                    |
| -------------------------------- | ------------------------------------- |
| Cloth, padded, quilted, gambeson | Textilecraft                          |
| Leather                          | Hideworking                           |
| Kurbul                           | Weaponcraft (Hideworking)             |
| Scale                            | Weaponcraft (Hideworking, Metalcraft) |
| Mail, plate                      | Weaponcraft (Metalcraft, Mineralogy)  |

**A flaw** costs the article one Armour Quality and one Armour Value — two of each at SV 0 or less.

**Masterwork** reads as Armour Quality and Armour Value in place of weapon quality and impact, and the material itself caps how many successes can actually be applied:

| Material | Max MWS | Material | Max MWS |
| -------- | ------- | -------- | ------- |
| Cloth    | 1       | Gambeson | 2       |
| Leather  | 1       | Kurbul   | 3       |
| Padded   | 1       | Scale    | 4       |
| Quilted  | 1       | Mail     | 5       |
|          |         | Plate    | 5       |

There is only so much that can be done with a quilted coat, however good the tailor.
