---
tags: []
name:
  full: Longbow 150
  aliases: []
description: "Hundred-fifty pound border-garrison warbow; armor-penetrating distance-carrier."
img: icons/game-icons/lorc/pocketbow.svg
shortcode: lbw150
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
    weightBase: 4
    valueBase: 75
    durabilityBase: 11
    heftBase: 14
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
        lengthBase: 7
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
          modifier: 5
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
        baseRangeBase: 270
        drawBase: 150
packFolder: weapons
---

A strong self-bow of yew or ash, a span taller than a standing man, drawn to the ear with a hundred-fifty pound pull. This is the warbow of the border muster—a heavy-hitting weapon in the hands of experienced garrison and castle archers, capable of penetrating armor at close range and carrying far across open ground.
