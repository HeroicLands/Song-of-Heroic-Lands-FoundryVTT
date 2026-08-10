---
aliases:
    - Punch
tags: []
name:
    full: Folk Punch
    aliases: []
description: "A closed fist — the plainest thing a person can do in a fight, and the weakest."
id: UnarmedPunch0001
slug: folk-punch
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

The plainest attack there is, and the feeblest on the table: a bare fist does little against anything padded and rather less against anything rigid, and a hand is a poor instrument for hitting hard things with. Boxers wrap their hands for a reason.

What a punch has is speed, a free hand to follow it with, and the fact that you are never without one. It is also the readiest unarmed attack to convert into something better — a gauntlet turns a punch from a nuisance into a real blow, and its Impact Tactical Advantage rewards a fighter who is winning the exchange.

A rigid helm, boot or gauntlet adds 2 to the impact — which is why a gauntleted fist is worth so much more than a bare one. Thrown with an off-hand or off-foot, the strike takes −10 and loses a point of impact.
