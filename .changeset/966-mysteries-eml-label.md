---
"sohl": patch
---

**Label the Mystical Abilities mastery column "EML" on the Being sheet**

On the Being sheet's Mysteries tab, the Mystical Abilities ledger column that
shows the mastery-level value is now labelled **EML** (tooltip _Effective
Mastery Level_) instead of **ML**. The value in that column is the
`masteryLevel` `ValueModifier`'s _effective_ value — the mastery level after
modifiers — so **EML** is the correct term, matching the Skills tab and the
print sheet. The header now reuses the shared
`SOHL.Skill.Heading.EffectiveMasteryLevel` localization keys.

Closes #966
