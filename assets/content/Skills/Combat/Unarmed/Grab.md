---
aliases:
    - Grab
tags: []
name:
    full: Grab
    aliases: []
description: "Seize a limb to take what it holds, or hold it still."
id: UnarmedGrab0001
slug: unarmed-grab
img: icons/game-icons/lorc/grab.svg
shortcode: grab
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
        shortcode: grab
        name: Grab
        minParts: 1
        assocSkillCode: melee
        attack:
            disabled: false
            spread: 4
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

A grab attempts one of two things: to **take** an object held in the zone struck — a left or right arm, the hit location within it being irrelevant — or to **hold** that zone immobile for a round.

Winning the Melee test only earns the attempt. Both combatants then make an opposed `d6 + STR` roll, at +3 per Impact Tactical Advantage, −2 one-handed and −3 off-handed. The manoeuvre happens only if the grabber wins that roll too; otherwise nothing does.

**A hold that lands** forces the target to Pass on their next turn, though they may still defend. On the grabber's next turn the opposed roll repeats: win and the hold continues, lose and it is broken.

Only one opposed `d6 + STR` roll is made per opposed Melee test, and only a combatant who _initiates_ such a roll and wins it may inflict the special effect.
