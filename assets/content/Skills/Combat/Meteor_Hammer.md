---
tags: []
name:
  full: Meteor Hammer
  aliases: []
description: "Whirling a rope-slung weight through melee and thrown strikes alike; entangling reach for the disciplined."
shortcode: metrhamr
type: skill
data:
  icon: bolas
  templatePriority: 0
subType: combat
sohl:
  kbcat: combat
  system:
    skillBaseFormula: sb(attr.dex, attr.agl)
    improveFlag: false
    combatCategory: meleemissile
    parentSkillCode: ""
    initSkillMult: 0
    impairedByRoles:
      - core
      - vital
      - manipulator
      - locomotor
packFolder: combat
---

The meteor hammer is a weighted head on a long rope or chain, spun around the body to build momentum before it is loosed at a target or brought around in a close strike. One skill covers both uses, because the same whirling control that lets the weight gather force for a crushing blow at arm's length is what lets it be flung out and hauled back without fouling the wielder's own limbs.

The weapon rewards a long apprenticeship and punishes a short one: a poorly timed spin can just as easily entangle the wielder as the opponent, and the weight travels fast enough that a mishandled recovery costs more than a missed strike would.
