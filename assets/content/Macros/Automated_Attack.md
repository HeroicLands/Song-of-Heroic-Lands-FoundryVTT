---
shortcode: autoattack
name: {full: Automated Attack, aliases: []}
type: macro
description: "Runs the combat attack workflow for the combatant whose turn it is."
tags: []
data: {icon: crossedswords}
---

Runs the combat attack workflow for the combatant whose turn it is, so a GM can
start an exchange from the macro bar rather than from the combatant's sheet.

# Script {#script}

```js
await CONFIG.SOHL.class.Utility.currentCombatantAttack();
```
