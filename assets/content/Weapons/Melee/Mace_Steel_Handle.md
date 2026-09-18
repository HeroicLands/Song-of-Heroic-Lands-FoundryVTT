---
tags: []
name:
  full: Mace, Steel Handle
  aliases: []
description: "Flanged iron head on steel haft; armored knight's shock-weapon."
img: icons/game-icons/delapouite/flangedmace.svg
shortcode: stlmce
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: wpnc
    secondary: [mtlc, mnrl]
  kbcat: club
  weaponType: Club
  system:
    weightBase: 4
    valueBase: 110
    durabilityBase: 12
    heftBase: 13
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
          modifier: 4
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
          blockMod: -5
          counterstrikeMod: -5
packFolder: weapons
---

A flanged or spiked iron head crowned atop a steel haft, this is the mace of choice for armored knights and heavy infantry. The steel handle resists splintering and adds durability, while the broad flanged head or radiating spikes channel impact across a wide striking surface—ideal for driving through shield bosses and crumpling plate over the collarbone. A weapon of shock and refinement.
