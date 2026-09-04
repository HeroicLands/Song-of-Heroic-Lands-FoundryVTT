---
"sohl": patch
---

**Áldrik Hárvenar no longer ships with two Swimming skills.** The actor embedded
`skill:swim` twice — once opened at `masteryLevelBase: 30`, once unopened at
`initSkillMult: 1` — and neither entry overrode `system.shortcode`, so both
inherited `swim` from the template and compiled to two `skill` items keyed
`swim` on one actor.

`(type, shortcode)` is a logical identity, unique within an actor's own items of
one type, so two entries sharing it made "the same thing" ambiguous — and
compendium↔world reconciliation, archetype shadowing,
`fvttFindItemByShortcode`, cohort membership and expression/effect references
all resolve by exactly that key.

The unopened entry is removed and the authored score kept: his `sohl.items`
holds two alphabetical runs, opened skills carrying an explicit
`masteryLevelBase` and unopened ones carrying `initSkillMult`, and `swim`
appeared once in each — a default left behind when the skill was given a score.

Closes #1827
