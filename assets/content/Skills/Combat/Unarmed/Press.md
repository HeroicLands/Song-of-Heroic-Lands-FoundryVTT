---
aliases:
    - Press
tags: []
name:
    full: Press
    aliases: []
description: "Shoving an opponent back, off their line and off their feet."
id: UnarmedPress0001
slug: unarmed-press
img: icons/game-icons/lorc/shield-bash.svg
shortcode: press
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
        - core
    strikeMode:
        type: melee
        shortcode: press
        name: Press
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
        lengthBase: 1
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

Winning the Melee test earns an opposed `d6 + STR` roll, at +2 per Impact Tactical Advantage and +2 with a Charge. If the presser wins that roll as well, the margin decides what happens:

| Margin | Effect                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1–4    | Knocked back five feet.                                                                                            |
| 5–9    | Knocked back five feet, and a Stumble mishap roll.                                                                 |
| 10+    | Knocked back ten feet and prone, and a Shock Roll against Shock Index 6 — 7 at a margin of 30–49, 8 at 50 or more. |

Otherwise there is no effect.

Only one opposed `d6 + STR` roll is made per opposed Melee test, and only a combatant who _initiates_ such a roll and wins it may inflict the special effect.
