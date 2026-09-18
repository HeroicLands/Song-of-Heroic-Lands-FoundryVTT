---
tags: []
name:
  full: Jumping
  aliases: []
description: "Leaping horizontally and vertically; reaching above normal reach."
shortcode: jump
type: skill
data:
  icon: jumpacross
  templatePriority: 0
subType: physical
sohl:
  kbcat: physical
  system:
    skillBaseFormula: sb(attr.agl, attr.str)
    improveFlag: false
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 3
    impairedByRoles:
      - core
      - vital
      - locomotor
packFolder: physical
---

Jumping is deliberate leaping — across a gap, over an obstacle, up at a ledge just out of reach — and the distance covered is read straight off a Jumping Success Value test.

**Horizontally**, a character clears a number of feet equal to the Success Value plus five. Every five feet of run-up taken in the same turn adds a foot, up to the bonus a full Move could supply.

**Vertically**, a character reaches up with one hand to their own height plus half the Success Value in feet, fractions retained. Actually catching hold of what is up there may call for a Dexterity test of its own.

Whatever distance is jumped counts against the character's movement for the turn. A Critical Failure trips the character before they leave the ground and forces a Stumble Test; any success lets the leap happen, and the Success Value is then read as usual.

Jumping is also one of the two skills — Acrobatics being the other — that decide how well a fall is taken, and a purposeful leap is treated far more kindly than an unexpected drop.
