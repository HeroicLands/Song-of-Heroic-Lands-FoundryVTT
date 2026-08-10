---
aliases:
    - Trip
tags: []
name:
    full: Trip
    aliases: []
description: "Taking an opponent's legs from under them."
id: UnarmedTrip0001
slug: unarmed-trip
img: icons/game-icons/lorc/hobbling-mace.svg
shortcode: bflktrip
type: skill
package: sohl
sohl:
    kbcat: unarmed
    archetype: 0
    subType: combattechnique
    skillBaseFormula: "sb(attr.dex, attr.agl)"
    combatCategory: melee
    parentSkillCode: ""
    initSkillMult: 2
    masteryLevelBase: null
    improveFlag: false
    impairedByRoles:
        - locomotor
    strikeMode:
        type: melee
        shortcode: trip
        name: Trip
        minParts: 1
        assocSkillCode: melee
        attack:
            disabled: false
            spread: 0
            modifier: 0
        impactBase:
            numDice: 0
            die: null
            modifier: 0
            aspect: blunt
        lengthBase: 2
        defense:
            block:
                disabled: true
                modifier: 0
                successLevelMod: 0
            counterstrike:
                disabled: false
                modifier: 0
                successLevelMod: 0
        traits:
            meleeMod: 0
            blockSLMod: 0
            durabilityMod: 0
            cxSLMod: 0
            oppDef: 0
            impTA: 0
            AR: 0
            noAttack: false
            noBlock: true
            entangle: false
            envelop: false
            couched: false
            long: false
            onlyInClose: false
            shieldMod: 0
            slow: false
            thrust: false
            swung: false
            halfSword: false
            bleed: false
            twoHndLen: 0
            shaft: false
            pommel: false
            noStrMod: false
            halfImpact: false
            lowAim: false
            strRoll: true
folder: EphAMAfFhWBrJxyF
---

Winning the Melee test earns an opposed `d6 + STR` roll, at +4 per Impact Tactical Advantage. If the tripper wins that roll as well, the margin decides what happens:

| Margin | Effect                                                                                   |
| ------ | ---------------------------------------------------------------------------------------- |
| 1–4    | Knocked prone.                                                                           |
| 5–9    | Thrown five feet and knocked prone.                                                      |
| 10+    | Thrown five feet and knocked prone, and the tripper may succeed automatically on a Grab. |

Otherwise there is no effect.

Only one opposed `d6 + STR` roll is made per opposed Melee test, and only a combatant who _initiates_ such a roll and wins it may inflict the special effect.
