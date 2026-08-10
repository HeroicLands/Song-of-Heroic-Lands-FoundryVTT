---
aliases:
    - Bite
tags: []
name:
    full: Bite
    aliases: []
description: "Teeth to whatever is nearest; a last resort with surprising bite."
id: UnarmedBite0001
slug: unarmed-bite
img: icons/game-icons/lorc/fangs.svg
shortcode: bite
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
        shortcode: bite
        name: Bite
        minParts: 1
        assocSkillCode: melee
        attack:
            disabled: false
            spread: 2
            modifier: 0
        impactBase:
            numDice: 1
            die: 4
            modifier: 0
            aspect: piercing
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
            impTA: 3
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

Biting is what is left when both hands are held and the head is not. It reaches no distance at all — the target must already be against you — and it is precise, because a mouth goes where the head turns. Its virtue is that teeth are pointed where a fist is not, so a bite that lands on something soft tells.
