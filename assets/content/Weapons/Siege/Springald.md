---
tags: []
name:
  full: Springald
  aliases: []
description: "Light torsion bolt-thrower; two-crew wall-top engine for picking men off a rampart."
shortcode: sprngld
type: weapongear
data:
  icon: spearhook
  templatePriority: 0
sohl:
  craft:
    skill: wood
    secondary: []
  kbcat: siege
  weaponType: Siege
  system:
    weightBase: 300
    valueBase: 600
    durabilityBase: 14
    heftBase: 0
    strikeModes:
      - shortcode: shoot
        type: missile
        name: Shoot
        assocSkillCode: archery
        minParts: 2
        attack:
          spread: 0
          modifier: 0
        impactBase:
          numDice: 0
          die: null
          modifier: 14
          aspect: piercing
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 0
          AR: 6
          noAttack: false
          noBlock: true
          entangle: false
          envelop: false
          couched: false
          long: false
          onlyInClose: false
          shieldMod: 0
          slow: true
          thrust: false
          swung: false
          halfSword: false
          bleed: false
          twoHndLen: 0
          shaft: false
          pommel: false
          noStrMod: true
          halfImpact: false
          lowAim: false
        projectileType: bolt
        maxVolleyMult: 4
        baseRangeBase: 120
        drawBase: 0
packFolder: weapons
---

A torsion engine of two skeins of twisted sinew driving a pair of stiff arms, spanned by a windlass and loosing a yard-long bolt. Light enough to be carried up a stair and mounted on a wall-top or a tower platform, and worked by two. Against a formation it punches through a file of men; against a gate it does nothing worth the name. Its virtue is that it is aimed rather than lobbed, so a crew that can see a target can hit it.

Two crew work it: one to wind the windlass and lay the stock, one to load. Spanning and loading is the better part of a minute between shots.
