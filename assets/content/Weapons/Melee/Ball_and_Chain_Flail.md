---
tags: []
name:
  full: Ball & Chain Flail
  aliases: []
description: "Chain-slung metal sphere slides past shields; heavy cavalry's armor-breaker."
shortcode: bcfl
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
    weightBase: 4
    valueBase: 75
    durabilityBase: 12
    heftBase: 14
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
          modifier: 5
          aspect: blunt
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: -10
          impTA: 3
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
          envelop: false
          couched: false
          long: true
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
          blockMod: -10
          counterstrikeMod: -10
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
          oppDef: -10
          impTA: 3
          AR: 0
          noAttack: false
          noBlock: false
          entangle: false
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
        lengthBase: 5
        defense:
          blockMod: -10
          counterstrikeMod: -10
packFolder: weapons
---

A heavy metal sphere riveted to an iron-bound wooden haft by a length of chain, the ball-and-chain flail is a crush weapon of intimidating reach. The chain's flexibility allows the weighted head to swing freely, sliding past shields and curving around defenses. Heavy-cavalry and foot soldiers of urban garrisons favor it for its ability to overcome shields and armor alike.
