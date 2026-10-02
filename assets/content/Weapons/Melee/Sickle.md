---
shortcode: skl
name: {full: Sickle, aliases: []}
type: weapongear
description: "Curved harvest-tool-blade for slash and entangle; peasant levy's accessible reach."
tags: []
data: {icon: sickle, templatePriority: 0, packFolder: weapons}
sohl:
  craft: {skill: mtlc, secondary: [wood]}
  kbcat: axe
  weaponType: Axe
  system:
    weightBase: 1
    valueBase: 10
    durabilityBase: 9
    heftBase: 9
    strikeModes:
      - shortcode: cut
        type: melee
        name: Cut
        assocSkillCode: melee
        minParts: 1
        attack: {spread: 6, modifier: 0}
        impactBase: {numDice: 1, die: 10, modifier: 2, aspect: edged}
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 5
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
        lengthBase: 3
        defense: {block: {modifier: -5}, counterstrike: {modifier: -5}}
      - shortcode: pommel
        type: melee
        name: Pommel
        assocSkillCode: melee
        minParts: 1
        attack: {spread: 4, modifier: 0}
        impactBase: {numDice: 1, die: 6, modifier: 0, aspect: blunt}
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
        lengthBase: 3
        defense: {block: {modifier: -5}, counterstrike: {modifier: -5}}
---

A curved iron blade hafted short on a handle, the sickle is first a harvest tool, second a weapon. Farmers and peasant-levies swing it to cut grain and flesh alike, effective against the lightly armored or unarmoured. Its curve favors slashing over thrusting; it catches on shield rims and garrottes at close work. Common among irregular troops lacking coin for proper arms.
