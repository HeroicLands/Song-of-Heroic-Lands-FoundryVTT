---
tags: []
name:
  full: Composite Bow 60
  aliases: []
description: "Sixty-pound compact horse-bow; mounted skirmisher's maneuvrable reach."
img: icons/game-icons/lorc/pocketbow.svg
shortcode: cbw60
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: fltch
    secondary: [wood, hide]
  kbcat: bow
  weaponType: Bow
  system:
    weightBase: 2
    valueBase: 420
    durabilityBase: 11
    heftBase: 11
    strikeModes:
      - shortcode: crush
        type: melee
        name: Crush
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 6
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
        lengthBase: 4
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
          modifier: 2
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
        baseRangeBase: 180
        drawBase: 60
packFolder: weapons
---

A compact bow of laminated horn, wood, and sinew, shorter than a self-bow but powerful for its length, with a sixty-pound pull. The horse-archer's light bow—beloved of mounted skirmishers and raiders who draw from the saddle, favored over the taller self-bow for its manoeuvrability.
