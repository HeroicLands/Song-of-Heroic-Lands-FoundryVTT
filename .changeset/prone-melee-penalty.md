---
"sohl": minor
---

**Prone combat penalty (#562)**

Wire the core mechanical effect of the prone condition: a **−20 to all melee
attacks and defenses**. When a wielder carries the `prone` status, each melee
strike mode's **attack**, **Block**, and **Counterstrike** modifiers take a −20
penalty — applied imperatively during preparation (in `WeaponGearLogic.evaluate`
for weapons, and in `SkillLogic.finalize` for combat techniques that carry their
own strike mode), the same way body reach is folded in, so the penalty is visible
in the combat-tab effective mastery level as well as at roll time.

The pure application lives in a Foundry-free `prone` strike-mode helper
(`applyProneMeleePenalty` / `PRONE_MELEE_PENALTY`). The remaining prone effects —
the Engagement-Zone, body-part-selection, and Outnumbered interactions, and the
quarter-Move cost to rise — belong to those subsystems and are follow-ups.

Part of #548. Closes #562.
