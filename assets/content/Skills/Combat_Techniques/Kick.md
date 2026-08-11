---
aliases:
    - Kick
tags: []
name:
    full: Folk Kick
    aliases: []
description: "A boot driven out — the longest reach a person has without a weapon."
id: UnarmedKick0001
img: icons/game-icons/lorc/foot-trip.svg
shortcode: bflkkick
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

A kick reaches twice as far as a punch and carries the weight of the leg and hip behind it, which makes it the strongest opening an unarmed fighter has against someone who has not closed yet.

What it cannot do is reach high. A kick aims low, at the legs and the body, and a head is simply out of its way — the low aim is a property of the attack, not a choice. It is also slow to recover from: a leg in the air is a leg not holding you up, which is why a kick that misses so often ends with the kicker on the ground.

A rigid helm, boot or gauntlet adds 2 to the impact — which is why a gauntleted fist is worth so much more than a bare one. Thrown with an off-hand or off-foot, the strike takes −10 and loses a point of impact.
