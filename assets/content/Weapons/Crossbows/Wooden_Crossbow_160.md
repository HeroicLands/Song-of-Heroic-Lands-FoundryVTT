---
tags: []
name:
  full: Wooden Crossbow 160
  aliases: []
description: "Heavy prod spanning by cranequin; castle-wall and convoy suppression weapon."
shortcode: wcxbw160
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
    weightBase: 5
    valueBase: 100
    durabilityBase: 10
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
          modifier: 3
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
        baseRangeBase: 240
        drawBase: 160
packFolder: weapons
---

A heavy wooden-prod crossbow drawing one hundred and sixty pounds, spanned by cranequin or windlass-lever and mounted on castle walls or convoy wagons. Its longer range and deeper penetration suit defense against massed charge or suppression of distant targets; the spanning mechanism is slow but robust enough for field service when protection is paramount.
