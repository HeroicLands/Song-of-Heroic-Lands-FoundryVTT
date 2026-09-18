---
tags: []
name:
  full: Kite Shield
  aliases: []
description: "Tall teardrop shield protects mounted leg; cavalry skirmisher's deep coverage."
shortcode: kish
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
    weightBase: 7
    valueBase: 75
    durabilityBase: 11
    heftBase: 11
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
          shieldMod: 15
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

A tall teardrop shield that extends from shoulder to shin, the kite shield favors mounted warriors and skirmishers with its deep coverage. The point hangs below the horse's flank, protecting the rider's leg; the wide upper face deflects sword and lance blows while maintaining mobility on horseback.
