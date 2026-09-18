---
tags: []
name:
  full: Shuriken
  aliases: []
description: "Iron star-spikes thrown for distraction and wound; assassin's surprise reach."
img: icons/game-icons/darkzaitzev/shurikendrkz.svg
shortcode: shrkn
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: thrown
  weaponType: Knife
  system:
    weightBase: 0.3
    valueBase: 5
    durabilityBase: 11
    heftBase: 6
    strikeModes:
      - shortcode: cut
        type: melee
        name: Cut
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 4
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 2
          aspect: edged
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
        lengthBase: 3
        defense:
          blockMod: 0
          counterstrikeMod: 0
      - shortcode: thrown
        type: missile
        name: Thrown
        assocSkillCode: thro
        minParts: 1
        attack:
          spread: 4
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 2
          aspect: edged
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
        projectileType: none
        maxVolleyMult: 2
        baseRangeBase: 25
        drawBase: 0
packFolder: weapons
---

Small iron stars or spikes forged with flat or pointed arms, shuriken are thrown at close range to distract and wound. Lightweight and easy to hide, they favor assassins, footpads, and duelists seeking surprise advantage. Few soldiers carry them; their effect is more psychological than devastating, but a shuriken in the eye buys time to flee or close.
