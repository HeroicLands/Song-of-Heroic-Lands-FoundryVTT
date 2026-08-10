---
aliases:
    - Headbutt
tags: []
name:
    full: Headbutt
    aliases: []
description: "The crown of the skull, driven into whatever is close enough."
id: UnarmedHeadbutt1
slug: unarmed-headbutt
img: icons/game-icons/lorc/wrecking-ball.svg
shortcode: headbutt
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
        - vital
    strikeMode:
        type: melee
        shortcode: headbutt
        name: Headbutt
        minParts: 1
        assocSkillCode: melee
        attack:
            disabled: false
            spread: 4
            modifier: 0
        impactBase:
            numDice: 1
            die: 6
            modifier: -2
            aspect: blunt
        lengthBase: 0
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
            strRoll: false
folder: EphAMAfFhWBrJxyF
---

Delivered from inside a grapple or a crowd, where there is no room to draw a fist back. The skull is heavy and the forehead hard, and a headbutt hits accordingly — but it puts your own head where the damage is.

A rigid helm, boot or gauntlet adds 2 to the impact. Used with an off-hand or off-foot, a punch or kick takes a −10 penalty and loses a point of impact.
