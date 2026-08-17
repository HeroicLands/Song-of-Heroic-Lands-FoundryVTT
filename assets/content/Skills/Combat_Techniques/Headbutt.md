---
aliases:
  - Headbutt
  - skill-bflkheadbutt
tags: []
name:
  full: Folk Headbutt
  aliases: []
description: "The forehead driven into a face, from too close for anything else to work."
id: UnarmedHeadbutt1
img: icons/game-icons/lorc/wrecking-ball.svg
shortcode: bflkheadbutt
type: skill
package: sohl
sohl:
  kbcat: unarmed
  archetype: 0
  subType: combattechnique
  skillBaseFormula: "sb(attr.dex, attr.agl)"
  combatCategory: melee
  parentSkillCode: ""
  initSkillMult: 2
  masteryLevelBase: null
  improveFlag: false
  impairedByRoles:
    - vital
  strikeMode:
    type: melee
    shortcode: headbutt
    name: Headbutt
    minParts: 1
    assocSkillCode: melee
    attack:
      disabled: false
      spread: 4
      modifier: 0
    impactBase:
      numDice: 1
      die: 6
      modifier: -2
      aspect: blunt
    lengthBase: 0
    defense:
      block:
        disabled: true
        modifier: 0
        successLevelMod: 0
      counterstrike:
        disabled: false
        modifier: 0
        successLevelMod: 0
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
      strRoll: false
folder: EphAMAfFhWBrJxyF
---

Delivered from inside a grapple, a press of bodies, or any place where there is no room to draw a fist back. Like the bite it has no reach at all — but where a bite needs a mouth free, a headbutt needs only that your head can move, so it survives being held by both arms.

The skull is the heaviest bone a person has and the forehead the thickest part of it, so a headbutt lands harder than a punch. The cost is obvious: it puts your own head, and the thing inside it, into the exchange. A helm turns that trade considerably in your favour.

A rigid helm, boot or gauntlet adds 2 to the impact — which is why a gauntleted fist is worth so much more than a bare one. Thrown with an off-hand or off-foot, the strike takes −10 and loses a point of impact.
