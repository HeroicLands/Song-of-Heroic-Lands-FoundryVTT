---
tags: []
name:
  full: Hatchet
  aliases: []
description: "Light tool-blade for kindling and ambush; road's most common sidearm."
img: icons/game-icons/lorc/battleaxe.svg
shortcode: hcht
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: mtlc
    secondary: [wood]
  kbcat: axe
  weaponType: Axe
  system:
    weightBase: 2
    valueBase: 6
    durabilityBase: 9
    heftBase: 10
    strikeModes:
      - shortcode: cut
        type: melee
        name: Cut
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 8
          modifier: 0
        impactBase:
          numDice: 1
          die: 8
          modifier: 4
          aspect: edged
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 6
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
          blockMod: -5
          counterstrikeMod: -5
      - shortcode: pommel
        type: melee
        name: Pommel
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 4
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 0
          aspect: blunt
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 6
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
          pommel: true
          noStrMod: false
          halfImpact: false
          lowAim: false
        lengthBase: 4
        defense:
          blockMod: -5
          counterstrikeMod: -5
packFolder: weapons
---

A light tool-and-weapon of two to three pounds, hafted short at three to four feet, built to split kindling and hung from a belt as a utility blade and close-quarters sidearm. The hatchet swings fast enough for camp work and quick enough for ambush or skirmish. Soldiers, woodsmen, and hunters all carry one; it is the most common blade on the roads.
