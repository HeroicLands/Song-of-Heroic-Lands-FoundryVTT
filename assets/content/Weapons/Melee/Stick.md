---
shortcode: stk
name: {full: Stick, aliases: []}
type: weapongear
description: "Plain ashwood walking-staff pressed into service by travelers in scuffle."
tags: []
data: {icon: club, templatePriority: 0, packFolder: weapons}
sohl:
  craft: {skill: wood, secondary: []}
  kbcat: club
  weaponType: Club
  system:
    weightBase: 1
    valueBase: 6
    durabilityBase: 8
    heftBase: 9
    strikeModes:
      - shortcode: crush
        type: melee
        name: Crush
        assocSkillCode: melee
        minParts: 1
        attack: {spread: 4, modifier: 0}
        impactBase: {numDice: 1, die: 6, modifier: 0, aspect: blunt}
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: -10
          impTA: 3
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
          envelop: false
          couched: false
          long: true
          onlyInClose: false
          shieldMod: 0
          slow: false
          thrust: false
          swung: true
          halfSword: false
          bleed: false
          twoHndLen: 0
          shaft: false
          pommel: false
          noStrMod: false
          halfImpact: false
          lowAim: false
        lengthBase: 3
        defense: {block: {modifier: -10}, counterstrike: {modifier: -10}}
      - shortcode: pommel
        type: melee
        name: Pommel
        assocSkillCode: melee
        minParts: 1
        attack: {spread: 4, modifier: 0}
        impactBase: {numDice: 1, die: 6, modifier: 0, aspect: blunt}
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: -10
          impTA: 3
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
          envelop: false
          couched: false
          long: true
          onlyInClose: false
          shieldMod: 0
          slow: false
          thrust: false
          swung: false
          halfSword: false
          bleed: false
          twoHndLen: 0
          shaft: false
          pommel: true
          noStrMod: false
          halfImpact: false
          lowAim: false
        lengthBase: 3
        defense: {block: {modifier: -10}, counterstrike: {modifier: -10}}
---

A walking stick or pilgrim's staff pressed into service—no more than an ashwood pole, plain and unadorned. In a scuffle it delivers a blow with its own modest weight, but it is clumsy in the hands of the untrained and fragile against true war-gear. Carried by beggars, tinkers, and travelers who may need a walking aid and a cudgel in a single piece of wood.
