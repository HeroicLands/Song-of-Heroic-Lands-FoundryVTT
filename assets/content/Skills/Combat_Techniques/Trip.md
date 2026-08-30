---
aliases:
  - Trip
tags: []
name:
  full: Trip
  aliases: []
description: "Taking the legs out from under an opponent, and the fight with them."
id: YtmLuYuVcdNIxu1o
img: icons/game-icons/lorc/hobbling-mace.svg
shortcode: trip
type: skill
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
    - locomotor
  strikeMode:
    type: melee
    shortcode: trip
    name: Trip
    minParts: 1
    assocSkillCode: melee
    attack:
      disabled: false
      spread: 0
      modifier: 0
    impactBase:
      numDice: 0
      die: null
      modifier: 0
      aspect: blunt
    lengthBase: 2
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
      strRoll: true
folder: EphAMAfFhWBrJxyF
---

A hooked ankle, a swept shin, a leg behind the knee. Like the press it does no harm of itself; what it does is put an opponent on the ground, and a prone fighter is a fighter at everyone's mercy — slow to rise, penalised while down, and unable to run.

Winning the Melee test earns an opposed **Strength Trial** (`d6 + STR`), at +4 per Impact Tactical Advantage — the most generous bonus of the three manoeuvres, so a tripper who is thoroughly winning the exchange rarely fails. If the tripper wins the Trial as well, the margin decides what happens:

| Margin | Effect on the opponent                                                                   |
| ------ | ---------------------------------------------------------------------------------------- |
| 1–4    | Knocked prone.                                                                           |
| 5–9    | Thrown five feet and knocked prone.                                                      |
| 10+    | Thrown five feet and knocked prone, and the tripper may succeed automatically on a Grab. |

Otherwise there is no effect.

Only one Strength Trial is made per opposed Melee test, and only a combatant who _initiates_ one and wins it may inflict the special effect. A counterstriking manoeuvre therefore cancels the attacker's — whoever won the Melee test gets the Trial.
