---
tags: []
name:
  full: Longknife
  aliases: []
description: "Extended single-edged blade for close-quarters reach; soldier's secondary weapon."
shortcode: lkni
type: weapongear
data:
  icon: broadsword
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: sword
  weaponType: Knife
  system:
    weightBase: 2
    valueBase: 100
    durabilityBase: 13
    heftBase: 7
    strikeModes:
      - shortcode: impale
        type: melee
        name: Impale
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 4
          modifier: 0
        impactBase:
          numDice: 1
          die: 8
          modifier: 3
          aspect: piercing
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 4
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
          thrust: true
          swung: false
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
          blockMod: 5
          counterstrikeMod: 5
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
          die: 10
          modifier: 2
          aspect: edged
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 5
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
          blockMod: 5
          counterstrikeMod: 5
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
          blockMod: 5
          counterstrikeMod: 5
packFolder: weapons
---

An elongated single-edged or double-edged blade longer than a dagger but shorter than a sword, the longknife extends reach without the weight of a full blade. Fighters favor it as a secondary weapon worn at the belt, drawn when a longer steel meets close quarters or a first blade breaks. Worn by soldiers and rovers alike.
