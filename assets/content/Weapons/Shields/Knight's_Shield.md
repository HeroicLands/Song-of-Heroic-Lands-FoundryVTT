---
tags: []
name:
  full: Knight's Shield
  aliases: []
description: "Heater-shield painted with heraldic coat; nobleman's marked defense."
shortcode: knsh
type: weapongear
data:
  icon: shieldbdg
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: shield
  weaponType: Shield
  system:
    weightBase: 5
    valueBase: 60
    durabilityBase: 11
    heftBase: 10
    strikeModes:
      - shortcode: bash
        type: melee
        name: Bash
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 6
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 1
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
          shieldMod: 10
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
        lengthBase: 1
        defense:
          blockMod: 0
          counterstrikeMod: 0
packFolder: weapons
---

A heater shield carved and painted with a knight's coat of arms, this shield marries heraldic display with practical defense in melee. Its broad face and flat-topped shape suit both mounted and foot combat; a nobleman's mark and battlefield defense in one.
