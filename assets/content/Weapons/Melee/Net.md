---
tags: []
name:
  full: Net
  aliases: []
description: "Weighted mesh entangles limbs; gladiatorial disarm-and-strike with spear."
shortcode: net
type: weapongear
data:
  icon: fishingnet
  templatePriority: 0
sohl:
  craft:
    skill: txtl
    secondary: [mtlc]
  kbcat: net
  weaponType: Flail
  system:
    weightBase: 4
    valueBase: 50
    durabilityBase: 9
    heftBase: 12
    strikeModes:
      - shortcode: envelop
        type: melee
        name: Envelop
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 0
          modifier: 0
        impactBase:
          numDice: 1
          die: 0
          modifier: 0
          aspect: blunt
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 3
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
          envelop: true
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
        lengthBase: 2
        defense:
          blockMod: 0
          counterstrikeMod: 0
      - shortcode: thrown
        type: missile
        name: Thrown
        assocSkillCode: thro
        minParts: 1
        attack:
          spread: 8
          modifier: 0
        impactBase:
          numDice: 0
          die: null
          modifier: 0
          aspect: blunt
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 3
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
          envelop: true
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
        projectileType: ""
        maxVolleyMult: 2
        baseRangeBase: 10
        drawBase: 0
packFolder: weapons
---

A weighted mesh cast from hand to entangle and pin an opponent's limbs and shield arm. The net spreads wide in flight and clings to armor and flesh alike, leaving the caught foe helpless for a follow-up strike. Fishermen adapted their casting nets to war; gladiatorial fighters paired net with spear for disarm-and-strike tactics.
