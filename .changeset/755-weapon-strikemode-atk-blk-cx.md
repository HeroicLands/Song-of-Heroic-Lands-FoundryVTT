---
"sohl": patch
---

**Weapon strike-mode Atk/Blk/CX now derive from the associated skill**

On the Being Combat tab, a weapon's strike-mode **Atk**, **Blk**, and **CX**
columns showed `0` even when the governing skill's mastery level was non-zero.
Weapon strike modes were only ever seeded with their own flat Atk/Blk/CX
modifiers and never folded in the mastery level of the skill named by each mode's
`assocSkillCode`, so the derived rolls stayed at those flat values.

`WeaponGearLogic.finalize()` now resolves each strike mode's associated skill on
the wielder and folds its mastery level (base + labeled deltas) into the mode's
attack, block, and counterstrike modifiers — the same derivation combat
techniques already use. Unlike a combat technique there is no self-fallback: a
weapon has no mastery level of its own, so a mode whose `assocSkillCode` resolves
to nothing keeps only its flat modifiers.

The two shared steps are now single helpers used everywhere the pattern occurs:
`applyGoverningMasteryLevel` folds a governing mastery level into a strike mode's
Atk/Blk/CX, and `resolveAssocSkill` resolves an `assocSkillCode` to its skill on
the actor. Weapon and combat-technique strike modes, mystical abilities, and
mysteries all resolve their associated skill through the one null-safe helper.

Closes #755
