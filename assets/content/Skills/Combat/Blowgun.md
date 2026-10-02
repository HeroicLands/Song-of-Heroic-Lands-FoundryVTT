---
tags: []
name:
  full: Blowgun
  aliases: []
description: "Breath-driven darts from a hollow tube; silent range work for hunters and stealthy strikes."
shortcode: blgn
type: skill
data:
  icon: straightpipe
  templatePriority: 0
subType: combat
sohl:
  kbcat: combat
  system:
    skillBaseFormula: sb(attr.per, attr.dex)
    improveFlag: false
    combatCategory: missile
    parentSkillCode: ""
    initSkillMult: 0
    impairedByRoles:
      - core
      - vital
      - manipulator
packFolder: combat
---

The blowgun sends a dart on a controlled breath, and the skill lies in the breath as much as the aim: too hard a push wastes the shot wide, too soft lets the dart drop short. A tube held and sighted along its own length needs no drawn string or spanned mechanism to betray the shooter, which is why hunters stalking game and anyone working where a bowstring's creak would carry favor it.

Shots are resolved through the missile sequence, with the blowgun carrying its own base range, volley multiplier and impact. A dart's light weight limits what it can deliver on its own, so blowgun hunters commonly rely on a poisoned tip to finish what the dart itself only starts.
