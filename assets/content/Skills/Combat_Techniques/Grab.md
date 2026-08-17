---
aliases:
  - Grab
  - skill-bflkgrab
tags: []
name:
  full: Grab
  aliases: []
description: "Seize a limb — to take the weapon out of it, or to hold it still."
id: T18G4LaTXd0AQ3qM
img: icons/game-icons/lorc/grab.svg
shortcode: bflkgrab
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
    - manipulator
  strikeMode:
    type: melee
    shortcode: grab
    name: Grab
    minParts: 1
    assocSkillCode: melee
    attack:
      disabled: false
      spread: 4
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

A grab is the opening of a wrestle rather than a blow, and the grabber declares which of two things they are attempting before any roll is made:

**Take** an object held by the target in the zone struck — a left or right arm — pulling a weapon out of the hand that holds it. The hit _location_ within that zone is irrelevant; it is the limb you have hold of that matters. Disarming a swordsman ends a fight about as reliably as wounding him, and rather more cheaply.

**Hold** that zone immobile for a round, which is how you pin the arm holding the knife while somebody else deals with it.

Winning the Melee test only earns the attempt. Both combatants then make an opposed **Strength Trial** (`d6 + STR`), at +3 per Impact Tactical Advantage, −2 if you have only one hand on them and −3 off-handed. The manoeuvre happens only if the grabber wins the Trial as well; otherwise the grab simply fails and nothing at all occurs.

**A hold that lands** forces the target to Pass on their next turn, though they may still defend if able. On the grabber's next turn the Strength Trial repeats: win and the hold continues, lose and it is broken. Holding a stronger opponent is therefore a losing game played one round at a time.

Only one Strength Trial is made per opposed Melee test, and only a combatant who _initiates_ one and wins it may inflict the special effect. A counterstriking manoeuvre therefore cancels the attacker's — whoever won the Melee test gets the Trial.
