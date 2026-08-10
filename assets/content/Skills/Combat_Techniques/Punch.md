---
aliases:
    - Punch
tags: []
name:
    full: Punch
    aliases: []
description: "A closed fist; the plainest thing a person can do in a fight."
id: UnarmedPunch0001
slug: unarmed-punch
img: icons/game-icons/lorc/punch-blast.svg
shortcode: bflkpunch
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
        - manipulator
    strikeMode:
        type: melee
        shortcode: punch
        name: Punch
        minParts: 1
        assocSkillCode: melee
        attack:
            disabled: false
            spread: 4
            modifier: 0
        impactBase:
            numDice: 1
            die: 6
            modifier: -3
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
            impTA: 2
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
            strRoll: false
folder: EphAMAfFhWBrJxyF
---

The plainest attack there is, and the weakest — a bare fist does little against anything padded, and rather less against anything rigid. What it has is speed and the fact that you are never without it.

A rigid helm, boot or gauntlet adds 2 to the impact. Used with an off-hand or off-foot, a punch or kick takes a −10 penalty and loses a point of impact.
