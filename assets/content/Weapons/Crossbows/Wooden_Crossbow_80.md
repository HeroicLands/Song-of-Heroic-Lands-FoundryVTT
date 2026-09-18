---
tags: []
name:
  full: Wooden Crossbow 80
  aliases: []
description: "Light wooden-prod crossbow; hunter's arm for unarmoured targets."
shortcode: wcxbw80
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
    weightBase: 3
    valueBase: 60
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
          modifier: 1
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
        baseRangeBase: 180
        drawBase: 80
packFolder: weapons
---

A light wooden crossbow with an eighty-pound prod, spanned by hand or a simple lever. Used by hunters and scouts for small game and short-range scouting, this weapon trades power for speed and portability. The prod is plain wooden stave, sturdy enough for unarmoured targets and soft game at moderate distance.
