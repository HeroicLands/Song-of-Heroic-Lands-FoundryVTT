---
tags: []
name:
  full: Onager
  aliases: []
description: "Single-arm torsion stone-thrower; kicks like the wild ass it is named for."
img: icons/game-icons/lorc/fallingboulder.svg
shortcode: onagr
type: weapongear
data:
  templatePriority: 0
sohl:
  craft:
    skill: wood
    secondary: []
  kbcat: siege
  weaponType: Siege
  system:
    weightBase: 2000
    valueBase: 2000
    durabilityBase: 15
    heftBase: 0
    strikeModes:
      - shortcode: shoot
        type: missile
        name: Shoot
        assocSkillCode: slng
        minParts: 2
        attack:
          spread: 0
          modifier: 0
        impactBase:
          numDice: 0
          die: null
          modifier: 30
          aspect: blunt
        traits:
          meleeMod: 0
          blockSLMod: 0
          durabilityMod: 0
          cxSLMod: 0
          oppDef: 0
          impTA: 0
          AR: 0
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
        projectileType: bullet
        maxVolleyMult: 4
        baseRangeBase: 175
        drawBase: 0
packFolder: weapons
---

A single throwing arm driven by one great torsion skein, stopped against a padded beam so hard that the whole frame leaps off the ground at each shot — which is how it came by the name of the wild ass. It lobs its stone rather than aiming it, so it is a weapon against walls, roofs and crowds rather than against any one man, and a crew learns a target by walking shots onto it.

Everything it throws arcs. Inside its Base Range a crew can shoot flat at a wall, but the engine's useful work begins past that, where the shot becomes a Volley against a fifteen-foot area rather than an aimed strike at any one man.

Six crew winch the arm down, load the sling and stand clear, and a well-drilled team gets a stone away every five minutes.
