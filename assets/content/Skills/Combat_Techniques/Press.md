---
aliases:
  - Press
  - skill-press
tags: []
name:
  full: Press
  aliases: []
description: "A shove: putting an opponent where you want them, and sometimes on the ground."
id: weH4SaOm6o870mBY
img: icons/game-icons/lorc/shield-bash.svg
shortcode: press
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
    - core
  strikeMode:
    type: melee
    shortcode: press
    name: Press
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
    lengthBase: 1
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

A press is not an attack on the body but on the footing — a shoulder or both hands driven into an opponent to move them off their line. It wounds nobody. What it does is break a shield wall, shove a spearman off a bridge, or open the ground between you and a doorway.

Winning the Melee test earns an opposed **Strength Trial** (`d6 + STR`), at +2 per Impact Tactical Advantage and +2 if you pressed out of a Charge. If the presser wins the Trial as well, the margin decides what happens:

| Margin | Effect on the opponent                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1–4    | Knocked back five feet.                                                                                            |
| 5–9    | Knocked back five feet, and a Stumble mishap roll.                                                                 |
| 10+    | Knocked back ten feet and prone, and a Shock Roll against Shock Index 6 — 7 at a margin of 30–49, 8 at 50 or more. |

Otherwise there is no effect at all. A press against someone markedly stronger is simply a wasted turn.

Only one Strength Trial is made per opposed Melee test, and only a combatant who _initiates_ one and wins it may inflict the special effect. A counterstriking manoeuvre therefore cancels the attacker's — whoever won the Melee test gets the Trial.
