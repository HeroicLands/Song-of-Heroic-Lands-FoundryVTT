---
shortcode: slngsht
name: {full: Slingshot, aliases: []}
type: weapongear
description: "Y-framed pouch-cord; concealed, silent, favored by hunters and footpads."
tags: []
data: {icon: slingshot, templatePriority: 0, packFolder: weapons}
sohl:
  craft: {skill: hide, secondary: []}
  kbcat: thrown
  weaponType: Sling
  system:
    weightBase: 0.7
    valueBase: 12
    durabilityBase: 9
    heftBase: 7
    strikeModes:
      - shortcode: crush
        type: melee
        name: Crush
        assocSkillCode: melee
        minParts: 1
        attack: {spread: 4, modifier: 0}
        impactBase: {numDice: 1, die: 4, modifier: 0, aspect: blunt}
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 0
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
          envelop: false
          couched: false
          long: false
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
        lengthBase: 1
        defense: {block: {modifier: 0}, counterstrike: {modifier: 0}}
      - shortcode: ranged
        type: missile
        name: Ranged
        assocSkillCode: archery
        minParts: 2
        attack: {spread: 0, modifier: 0}
        impactBase: {numDice: 1, die: 6, modifier: 0, aspect: blunt}
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 0
          AR: 0
          noAttack: false
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
        projectileType: bullet
        maxVolleyMult: 3
        baseRangeBase: 120
        drawBase: 60
---

A Y-shaped frame of wood with cord or leather cord stretched between the upper arms, held at the base and drawn back with a pouch at the fork. Hunters and footpads favor it for its ease of make and concealment; a child can fashion one from a branch and cord. Quick-draw and silent, though lacking range of its larger cousins.
