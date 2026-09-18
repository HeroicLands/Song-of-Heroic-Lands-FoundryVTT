---
tags: []
name:
  full: Whip, Teamster
  aliases: []
description: "Short cord lash stinging rather than cutting; driver's incidental combat tool."
shortcode: twhp
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
    weightBase: 1
    valueBase: 6
    durabilityBase: 9
    heftBase: 9
    strikeModes:
      - shortcode: lash
        type: melee
        name: Lash
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 8
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 0
          aspect: edged
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 2
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
        lengthBase: 4
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
          impTA: 2
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
        lengthBase: 4
        defense:
          blockMod: -20
          counterstrikeMod: -20
packFolder: weapons
---

A short, stout cord or rawhide whip bound to a wooden handle, the teamster's whip is primarily a driver's tool for commanding ox-teams and wagon-spans. Light and fast to crack, it stings rather than cuts, used for noise and sharp warnings. Drivers pressed into militia sometimes arm themselves with what they carry, giving the whip incidental combat service.
