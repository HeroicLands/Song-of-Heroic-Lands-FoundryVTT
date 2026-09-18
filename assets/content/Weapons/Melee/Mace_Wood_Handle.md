---
tags: []
name:
  full: Mace, Wood Handle
  aliases: []
description: "Flanged iron head on wooden shaft; footman and guard's bone-cracker."
img: icons/game-icons/delapouite/flangedmace.svg
shortcode: wdmce
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
    weightBase: 3
    valueBase: 85
    durabilityBase: 11
    heftBase: 11
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
          modifier: 3
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

A flanged or spiked iron head lashed to a wooden haft with leather and iron bindings, this is the common mace of footmen, fyrdsmen, and city guards. Lighter than its steel-handled cousin and easier to maintain, it nonetheless delivers bone-cracking force to crush shields and helm. The wood shaft flexes slightly on impact, distributing shock upward through the wielder's arms.
