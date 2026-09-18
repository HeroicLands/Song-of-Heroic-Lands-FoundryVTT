---
tags: []
name:
  full: Longbow 100
  aliases: []
description: "Hundred-pound yew warbow; footman archer's competent field standard."
img: icons/game-icons/lorc/pocketbow.svg
shortcode: lbw100
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: fltch
    secondary: [wood, timb]
  kbcat: bow
  weaponType: Bow
  system:
    weightBase: 3
    valueBase: 55
    durabilityBase: 10
    heftBase: 13
    strikeModes:
      - shortcode: crush
        type: melee
        name: Crush
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 8
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 0
          aspect: blunt
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: -5
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
        lengthBase: 6
        defense:
          blockMod: 0
          counterstrikeMod: 0
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
        projectileType: arrow
        maxVolleyMult: 4
        baseRangeBase: 210
        drawBase: 100
packFolder: weapons
---

A tall, well-crafted self-bow of yew or ash, drawn to the ear with a hundred-pound pull. This is the competent archer's warbow—the standard issue of muster-trained footmen and border garrison archers, capable of striking at armored targets at considerable range.
