---
tags: []
name:
  full: Buckler
  aliases: []
description: "Small light shield for rapid parries; duelist's off-hand ward."
shortcode: bklr
type: weapongear
data:
  icon: roundshield
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: shield
  weaponType: Shield
  system:
    weightBase: 3
    valueBase: 30
    durabilityBase: 9
    heftBase: 8
    strikeModes:
      - shortcode: bash
        type: melee
        name: Bash
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
          shieldMod: 5
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

A small round shield held by a central grip or worn on the forearm, the buckler is light and quick. Its narrow face suits rapid parries and punches; duellists and swordsmen favor it for one-handed blade work, using the buckler's weight and rim to deflect cuts and thrust the boss at close range.
