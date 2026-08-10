---
aliases:
    - Limb Block
tags: []
name:
    full: Limb Block
    aliases: []
description: "Warding a blow with a bare limb, and taking what comes of it."
id: UnarmedLimbBlock
slug: unarmed-limb-block
img: icons/game-icons/lorc/arm-bandage.svg
shortcode: bflklmbblk
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
        shortcode: limbblock
        name: Limb Block
        minParts: 1
        assocSkillCode: melee
        attack:
            disabled: true
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
                disabled: false
                modifier: 0
                successLevelMod: 0
            counterstrike:
                disabled: true
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
            noAttack: true
            noBlock: false
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

An unarmed Block, made with a limb. Apply −20 to the Melee test where the limb is at odds with the weapon's trajectory — a leg raised against a punch — and the GM may disallow it outright where it is radically awkward, as a leg is against a bite.

**On tied successes** the blocking limb's zone is struck by the attacker's weapon, though 2 is subtracted from the strike impact for the partial ward.

**On a clear victory** — a higher success level without benefit of a tiebreak — the blow is warded safely and the attack fails.
