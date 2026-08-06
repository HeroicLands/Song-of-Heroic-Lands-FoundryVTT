---
"sohl": patch
---

**Automated Combat starts again from the combat tracker**

Choosing **Automated Combat** on a combatant always failed with "… automated attack
requires a target combatant," even with an enemy token targeted, so the whole flow was
unreachable from the interface. Four defects on that one path are fixed:

- **The target is resolved from what the player has targeted.** The tracker's
  context-menu entry builds its action context with a speaker only, so
  `startAutomatedAttack` now falls back to the user's targeted token — the same seam
  opposed tests already use — instead of aborting. Targeting remains the human
  trigger: with nothing targeted the attack still refuses rather than picking an
  opponent.
- **The resolved target is passed to the attack dialog as the defender.** The dialog
  step derived the defender from an attack result in scope, which only the
  counterstrike path carries, so a fresh attack aborted a step later with "requires a
  valid defender combatant." The defender is now supplied explicitly by each caller —
  the target for an attack, the original attacker for a counterstrike.
- **A combatant's token logic reads the combatant document.** It read the data model
  instead, so every access threw before the range measurement could run.
- **Range measurement no longer crashes on undrawn tokens or system-less scenes.** It
  falls back to the TokenDocument's own centre when a token has no drawn placeable,
  and a scene carrying no SoHL system data now yields no scene logic instead of
  throwing from inside the accessor.

Automated Combat is fenced for the Being-centric beta, so this is off the frozen path;
producing the attack card itself still needs a canvas.

Closes #1079
