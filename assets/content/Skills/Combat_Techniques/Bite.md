---
aliases:
    - Bite
    - skill-bflkbite
tags: []
name:
    full: Folk Bite
    aliases: []
description: "Teeth, at the range where nothing else will reach; small, precise, and it draws blood."
id: UnarmedBite0001
img: icons/game-icons/lorc/fangs.svg
shortcode: bflkbite
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

Biting is what remains when both arms are held and the head is not — in a grapple, on the ground, pinned under a shield. It reaches no distance whatever: the target must already be pressed against you, which is why it never appears in an opening exchange and often decides a closing one.

What it lacks in force it makes up in point. Teeth are piercing where a fist is blunt, so a bite that finds a throat, a wrist or a face does a kind of harm a punch cannot, and it carries the best Impact Tactical Advantage of any unarmed attack. It is also the most precise thing a person owns: a mouth goes exactly where the head turns, and its zone die is the tightest on the table.

Against armour it is close to useless, and it puts your face inside your opponent's reach to deliver. Bite when you have nothing else, and bite something soft.
