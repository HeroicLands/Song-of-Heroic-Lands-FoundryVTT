---
tags: []
name:
  full: Knife
  aliases: []
description: "Single-edged blade for camp work and brawl alike."
img: icons/game-icons/lorc/plaindagger.svg
shortcode: kni
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: mtlc
    secondary: [wood]
  kbcat: knife
  weaponType: Knife
  system:
    weightBase: 1
    valueBase: 6
    durabilityBase: 10
    heftBase: 6
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
          modifier: 2
          aspect: piercing
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
        lengthBase: 2
        defense:
          blockMod: -10
          counterstrikeMod: -10
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
          modifier: 0
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
        lengthBase: 2
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
        lengthBase: 2
        defense:
          blockMod: -10
          counterstrikeMod: -10
packFolder: weapons
---

A single-edged blade of four to seven inches, fitted to a simple handle for cutting cord, meat, and leather equally. Useful in camp, kitchen, and hand, the knife is a cheap and widespread tool that finds its way into a brawl when need arises. Worn openly or hidden by anyone who might need to cut.
