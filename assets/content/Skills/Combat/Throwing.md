---
tags: []
name:
  full: Throwing
  aliases: []
description: "Hurling daggers, axes, javelins, and projectiles with accuracy and force."
shortcode: thro
type: skill
data:
  icon: throwingball
  templatePriority: 0
subType: combat
sohl:
  kbcat: combat
  system:
    skillBaseFormula: sb(attr.dex, attr.per)
    improveFlag: false
    combatCategory: missile
    parentSkillCode: ""
    initSkillMult: 2
    impairedByRoles:
      - core
      - vital
      - manipulator
packFolder: combat
---

Throwing covers weapons and objects sent by the arm alone — daggers, hand axes, javelins, rocks, a lit pot of pitch — whether flung flat at something in view or lobbed for distance at something that is not. Each item carries its own base range, volley multiplier and impact characteristics, and throws are resolved through the missile sequence.

The skill rewards a very particular kind of practice, because a thrown weapon must arrive at the right rotation as well as the right place: a knife that reaches the target sideways has still missed. That is why a character who has drilled sleight of hand throws better than one who has not — twice a character's Legerdemain Index applies as a bonus to Throwing tests.
