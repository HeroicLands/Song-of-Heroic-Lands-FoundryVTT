---
tags: []
name:
  full: Tower Shield
  aliases: []
description: "Man-tall standing shield providing total cover against arrow storms."
shortcode: twrsh
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
    weightBase: 8
    valueBase: 100
    durabilityBase: 11
    heftBase: 12
    strikeModes:
      - shortcode: bash
        type: melee
        name: Bash
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 8
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
          shieldMod: 20
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

A large standing shield, tall as a man and wide as an ox, the tower shield provides nearly total cover when braced or planted. Crossbowmen and siege troops plant these to form walls against arrow storms; foot-archers shelter behind them to reload and return fire.
