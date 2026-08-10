---
aliases:
    - Kick
tags: []
name:
    full: Kick
    aliases: []
description: "A boot driven out; the longest reach a person has unarmed."
id: UnarmedKick0001
slug: unarmed-kick
img: icons/game-icons/lorc/foot-trip.svg
shortcode: kick
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
        shortcode: kick
        name: Kick
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
            lowAim: true
            strRoll: false
folder: EphAMAfFhWBrJxyF
---

A kick reaches further than any other unarmed strike and carries the weight of the leg behind it. What it cannot do is reach high: a kick aims low, at the legs and the body, and a head is out of its way.

A rigid helm, boot or gauntlet adds 2 to the impact. Used with an off-hand or off-foot, a punch or kick takes a −10 penalty and loses a point of impact.
