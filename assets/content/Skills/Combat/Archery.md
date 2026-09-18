---
tags: []
name:
  full: Archery
  aliases: []
description: "Striking distant targets with bows and crossbows; reading windage and elevation."
shortcode: archery
type: skill
data:
  icon: pocketbow
  templatePriority: 0
subType: combat
sohl:
  kbcat: combat
  system:
    skillBaseFormula: sb(attr.per, attr.dex)
    improveFlag: false
    combatCategory: melee
    parentSkillCode: ""
    initSkillMult: 1
    impairedByRoles:
      - core
      - vital
      - manipulator
packFolder: combat
---

Archery is the use of hand-drawn, stringed missile weapons — bows of every construction and crossbows alike. It rests on eyesight and on touch, and with most such weapons it is not a thing that can be improvised: the bow that a strong beginner can barely bend is the bow an archer looses forty times in an afternoon.

Shots are resolved through the missile sequence, with each weapon carrying its own base range, volley multiplier and impact.

**Crossbows** are the exception to the training requirement, and deliberately so. A crossbow is spanned once and then aimed like a tool, so an untrained shooter is far less handicapped by it than by a bow. A character shooting a crossbow tests the better of their Archery Mastery Level or an Effective Mastery Level equal to three times their Archery Skill Base — which is to say that anyone at all can pick one up and hit something with it, while only an archer improves.

Heavy-draw crossbows are spanned with mechanical aid — a belt and claw, a lever, a windlass — and the quality of the spanner bears directly on what draw weight the shooter can manage.
