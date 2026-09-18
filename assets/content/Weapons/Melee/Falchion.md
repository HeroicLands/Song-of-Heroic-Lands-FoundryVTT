---
tags: []
name:
  full: Falchion
  aliases: []
description: "Single-edged curved blade favors overhead chop; sailor and soldier's steel."
shortcode: falcn
type: weapongear
data:
  icon: broadsword
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: sword
  weaponType: Sword
  system:
    weightBase: 3
    valueBase: 120
    durabilityBase: 12
    heftBase: 12
    strikeModes:
      - shortcode: cut
        type: melee
        name: Cut
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 6
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

A single-edged blade curved slightly forward with a blade spine that thickens toward the tip, the falchion splits the difference between saber and cleaver. The weight favors the cutting edge, making it deadly in the overhand chop while retaining enough geometry for a cautious thrust. Soldiers and ships' crews alike carry this steel.
