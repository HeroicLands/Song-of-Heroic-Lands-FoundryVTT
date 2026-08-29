---
aliases:
  - Automated Attack
  - macro-autoattack
tags: []
description: "Runs the combat attack workflow for the combatant whose turn it is."
type: macro
name:
  full: Automated Attack
  aliases: []
id: HSNwLca3kMYLN3Ag
shortcode: autoattack
img: icons/game-icons/lorc/crossed-swords.svg
folder: null
---

Runs the combat attack workflow for the combatant whose turn it is, so a GM can
start an exchange from the macro bar rather than from the combatant's sheet.

# Script {#script}

```js
await CONFIG.SOHL.class.Utility.currentCombatantAttack();
```
