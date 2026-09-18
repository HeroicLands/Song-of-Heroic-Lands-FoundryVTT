---
tags: []
name:
  full: Crowbar
  aliases: []
description: "Carpenter's iron tool; claw hooks and shaft bludgeons alike."
shortcode: crwbr
type: weapongear
data:
  icon: club
  templatePriority: 0
sohl:
  craft:
    skill: mtlc
    secondary: [wood]
  kbcat: club
  weaponType: Club
  system:
    weightBase: 6
    valueBase: 9
    durabilityBase: 11
    heftBase: 16
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
          modifier: 3
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
          impTA: 3
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
          blockMod: 0
          counterstrikeMod: 0
packFolder: weapons
---

An iron pry-bar with a curved claw at one end and a tapered or flat striking end at the other, the crowbar is a carpenter's tool and a thief's friend. In a skirmish, it serves as a crude lever-weapon—the claw can hook and wrench, while the shaft makes a heavy bludgeon. Not a weapon by design, but deadly enough when wielded by a man driven to fight with whatever lies at hand.
