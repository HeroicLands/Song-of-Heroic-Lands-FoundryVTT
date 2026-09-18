---
tags: []
name:
  full: Warflail
  aliases: []
description: "Spiked chain-joined heads bypassing guard; armor-defeating reach for professionals."
shortcode: wfl
type: weapongear
data:
  icon: flail
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: flail
  weaponType: Flail
  system:
    weightBase: 5
    valueBase: 60
    durabilityBase: 11
    heftBase: 17
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
          modifier: 6
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
        lengthBase: 6
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
        lengthBase: 6
        defense:
          blockMod: 0
          counterstrikeMod: 0
packFolder: weapons
---

A combat evolution of the agricultural flail, the warflail pairs a wooden haft with two or three spiked iron heads joined by lengths of heavy chain. The chain's play allows the heads to swing past a defender's guard and strike from unexpected angles. Popular among professional soldiers for its armor-defeating reach, it demands room to swing and a steady grip.
