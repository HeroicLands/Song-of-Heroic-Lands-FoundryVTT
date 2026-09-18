---
tags: []
name:
  full: Cudgel
  aliases: []
description: "Short heavy-headed bludgeon for close-quarters; sell-sword's preference."
shortcode: cdgl
type: weapongear
data:
  icon: club
  templatePriority: 0
sohl:
  craft:
    skill: wood
    secondary: []
  kbcat: club
  weaponType: Club
  system:
    weightBase: 3
    valueBase: 12
    durabilityBase: 9
    heftBase: 11
    strikeModes:
      - shortcode: crush
        type: melee
        name: Crush
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
          blockMod: 0
          counterstrikeMod: 0
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
          blockMod: 0
          counterstrikeMod: 0
packFolder: weapons
---

A short, thick-headed bludgeon, often weighted with lead or iron bands driven into its wooden core, the cudgel is favored for close-quarters fighting. Shorter and heavier than a club, it trades reach for concentrated force, and fits easily in a clenched fist or at the belt. Common in the hands of sell-swords, tavern-brawlers, and men who prefer no pretense of civility.
