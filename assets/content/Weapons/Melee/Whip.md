---
tags: []
name:
  full: Whip
  aliases: []
description: "Leather lash reaching beyond guard; reaches, entangles, intimidates and wounds."
shortcode: whp
type: weapongear
data:
  icon: whip
  templatePriority: 0
sohl:
  craft:
    skill: hide
    secondary: []
  kbcat: whip
  weaponType: Flail
  system:
    weightBase: 2
    valueBase: 12
    durabilityBase: 9
    heftBase: 9
    strikeModes:
      - shortcode: lash
        type: melee
        name: Lash
        assocSkillCode: melee
        minParts: 1
        attack:
          spread: 10
          modifier: 0
        impactBase:
          numDice: 1
          die: 6
          modifier: 0
          aspect: edged
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 2
          AR: 0
          noAttack: false
          noBlock: false
          entangle: true
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
          pommel: false
          noStrMod: false
          halfImpact: false
          lowAim: false
        lengthBase: 10
        defense:
          blockMod: -20
          counterstrikeMod: -20
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
          impTA: 2
          AR: 0
          noAttack: false
          noBlock: false
          entangle: true
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
        lengthBase: 10
        defense:
          blockMod: -20
          counterstrikeMod: -20
packFolder: weapons
---

A long leather lash bound to a wooden grip, the whip cracks to deliver stinging cuts and sharp shocks that sting even through armor. It reaches beyond a sword's guard and entangles limbs or weapons to distract and wound. Circus performers, duelists, and intimidators favor it—it demands practice and open space, but offers reach and psychological bite.
