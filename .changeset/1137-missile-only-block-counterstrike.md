---
"sohl": patch
---

**Block and Counterstrike no longer offered on a missile-only weapon (#1137)**

A weapon whose only strike mode was a missile mode — a bow, a sling — still offered
**Block** and **Counterstrike** while held, and invoking either did nothing at all:
no roll, no chat card, no on-screen message. The only trace was a console warning.
The same held for a missile combat-technique Skill, which shares the executor.

- **The two actions are gated on having a melee strike mode.** `anyMeleeStrikeMode`
  backs a `hasMeleeStrikeMode` getter on `WeaponGearLogic` and `SkillLogic`, and the
  actions' visibility now requires it alongside the existing held / subtype gate. The
  gate is _has at least one melee mode_, not _is melee-only_: a mixed weapon (a spear
  that thrusts **and** throws) keeps offering both, and the strike-mode picker
  resolves which mode.
- **A request that reaches the executor anyway reports why on screen.** A block or
  counterstrike on a missile mode — from a macro, a chat-card button, or a picker
  that landed on the missile mode of a mixed weapon — now raises a UI warning naming
  the item, the mode, and the test, instead of failing silently.
