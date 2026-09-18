---
tags: []
name:
  full: Pickaxe
  aliases: []
description: "Mining tool with point and adze; siege and armor-cracking weapon."
shortcode: pkaxe
type: weapongear
data:
  icon: mining
  templatePriority: 0
sohl:
  craft:
    skill: mtlc
    secondary: [wood]
  kbcat: axe
  weaponType: Axe
  system:
    weightBase: 7
    valueBase: 18
    durabilityBase: 9
    heftBase: 18
    strikeModes:
      - shortcode: impale
        type: melee
        name: Impale
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 8
          modifier: 0
        impactBase:
          numDice: 1
          die: 8
          modifier: 5
          aspect: piercing
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 6
          AR: 3
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
        lengthBase: 5
        defense:
          blockMod: -15
          counterstrikeMod: -15
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
          AR: 3
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
        lengthBase: 5
        defense:
          blockMod: -15
          counterstrikeMod: -15
packFolder: weapons
---

A mining tool with two opposed heads—a sharp point and a flat adze—hafted to five feet, pressed into war-service to crack armor and stone alike. The point punches through mail and plate; the adze chops or levers. Slow and unwieldy for a duelist, but deadly in the press of a siege or tunnel-breach where armor clusters thick.
