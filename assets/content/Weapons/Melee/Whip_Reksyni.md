---
tags: []
name:
  full: Whip, Reksyni
  aliases: []
description: "Sinew-and-leather tribal lash; barbed, heavy, breaking mounted formations."
shortcode: rwhp
type: weapongear
data:
  icon: whip
  templatePriority: 0
sohl:
  craft:
    skill: hide
    secondary: []
  kbcat: whip
  weaponType: Flail
  system:
    weightBase: 3
    valueBase: 25
    durabilityBase: 10
    heftBase: 10
    strikeModes:
      - shortcode: lash
        type: melee
        name: Lash
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 10
          modifier: 0
        impactBase:
          numDice: 1
          die: 8
          modifier: 1
          aspect: edged
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
          entangle: true
          envelop: false
          couched: false
          long: true
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
        lengthBase: 10
        defense:
          blockMod: -20
          counterstrikeMod: -20
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
          impTA: 4
          AR: 0
          noAttack: false
          noBlock: false
          entangle: true
          envelop: false
          couched: false
          long: true
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
        lengthBase: 10
        defense:
          blockMod: -20
          counterstrikeMod: -20
packFolder: weapons
---

The Reksyni whip is a tribal variant favored by the Reksyni peoples of the high grasslands, woven from sinew and leather strips to achieve greater weight and cutting edge than the standard lash. Twisted with barbed cord along its length, it tears flesh and carries more momentum for shock tactics. Nomadic raiders prize it for breaking loose formations and entangling mounted foes.
