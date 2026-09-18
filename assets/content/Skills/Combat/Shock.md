---
tags: []
name:
  full: Shock
  aliases: []
description: "Physiological resilience to absorb violent blows without incapacitation."
img: icons/game-icons/lorc/lightningarc.svg
shortcode: shok
type: skill
data:
  templatePriority: 0
subType: combat
sohl:
  kbcat: combat
  system:
    skillBaseFormula: sb(attr.str, attr.end)
    improveFlag: false
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 3
    impairedByRoles:
      - core
      - vital
packFolder: combat
---

Shock is the body's answer to being badly hurt: whether a wound simply hurts or actually stops the character who took it. It is a subskill of Initiative, sharing that skill's Skill Multiple but resting on its own Skill Base of Strength and Endurance — mass and conditioning, which is honestly most of what decides the question.

It is tested whenever a Shock Roll or a Shock Reroll is called for, against a Shock Index set by the injuries the character is carrying. Failure runs down the ladder of shock states — stunned, incapacitated, unconscious — and a character who has been fighting on through accumulated wounds is being asked the same question repeatedly with worse odds each time.

Shock is why two fighters who take the same wound do not have the same afternoon. The wound is identical; what happens next is not.
