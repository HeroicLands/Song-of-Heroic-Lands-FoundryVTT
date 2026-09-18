---
tags: []
name:
  full: Composite Crossbow 200
  aliases: []
description: "Two-hundred pound horn-and-sinew crossbow; siege crew wall-assault weapon."
shortcode: ccxbw200
type: weapongear
data:
  icon: crossbow
  templatePriority: 0
sohl:
  craft:
    skill: fltch
    secondary: [wood, timb]
  kbcat: crossbow
  weaponType: Crossbow
  system:
    weightBase: 7
    valueBase: 145
    durabilityBase: 11
    heftBase: 0
    strikeModes:
      - shortcode: ranged
        type: missile
        name: Ranged
        assocSkillCode: archery
        minParts: 2
        attack:
          spread: 0
          modifier: 0
        impactBase:
          numDice: 0
          die: null
          modifier: 4
          aspect: piercing
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
        projectileType: bolt
        maxVolleyMult: 4
        baseRangeBase: 270
        drawBase: 200
packFolder: weapons
---

A laminated prod of horn and sinew glued to a wooden back, drawing two hundred pounds and shorter, more powerful than plain wood for its length. Spanned by windlass and mounted by siege crews and heavy infantry for wall assault and formed ranks. The composite construction offers superior range and armor-piercing force, though slower to span than lighter bows.
