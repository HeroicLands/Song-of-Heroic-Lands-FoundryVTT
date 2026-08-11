---
aliases:
    - Limb Block
tags: []
name:
    full: Limb Block
    aliases: []
description: "Warding a blow with a limb — desperate bare-armed, deliberate in a mail sleeve."
id: UnarmedLimbBlock
img: icons/game-icons/lorc/arm-bandage.svg
shortcode: limbblock
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

The defence of last resort: no weapon in hand, no shield on the arm, and something already coming at you. An unarmed Block, made by putting a forearm, a shin or a shoulder in the way.

**This is genuinely dangerous, and against an armed opponent it is close to desperate.** A block only wards the blow safely on a **clear victory** — a higher success level than the attacker, without benefit of a tiebreak. On **tied successes** the attack lands on the blocking limb itself: the weapon strikes that limb's zone, a `d10` deciding where within it, and a mere **2** is subtracted from the strike impact for the partial ward. Two points is nothing against a sword. Blocking a blade with a bare forearm means, most of the time, that the blade is now in your forearm — and an edged weapon at a limb is how people lose hands.

Against a fist, a club or a kick it is a reasonable thing to do, because the worst case is a bruised arm. Against anything with an edge and a bare arm it should be a choice made only when the alternative is worse — a blade in the arm being better than a blade in the throat.

**Armour changes the arithmetic entirely.** A limb block is the only defence that decides _where_ the blow lands, and a fighter armoured unevenly can use that. A gladiator in a mail sleeve and little else, or a soldier with vambraces over an unprotected body, is not gambling at all when they raise that arm: they are steering the strike off the parts of them that would be opened by it and onto the one part that will turn it. The limb's own armour applies as normal, and the block's 2 points of mitigation come off on top of it. Done deliberately and often, it is how a lightly armoured fighter survives a heavily armed one.

Apply **−20** to the Melee test where the limb is at odds with the weapon's trajectory: a leg raised against a punch, for instance. The GM may disallow the block outright where it would be radically awkward, as a leg is against a bite.
