---
"sohl": minor
---

**Combat Technique skill subtype: model + mastery-level wiring**

Foundation for modeling combat techniques as skills (#322/#323). Adds a
`combattechnique` skill subtype and lets a skill carry an **optional embedded
strike mode**, so a trained fighting maneuver (unarmed strike, grapple, etc.) is
a normal, improvable skill whose strike mode's Attack / Block / Counterstrike are
driven by that skill's mastery level.

- New `SKILL_SUBTYPE.combattechnique` (+ localized label).
- `SkillDataModel` gains an optional, nullable `strikeMode` (the discriminated
  melee/missile shape, mirroring `CombatTechniqueDataModel`); `null` for every
  other skill subtype.
- `SkillLogic` builds the strike-mode instance for the subtype, adds the
  wielder's lineage reach (melee), and folds the **governing** mastery level into
  the strike mode's Atk/Blk/CX — the skill's **own** mastery level by default, or
  an override skill named by the strike mode's `assocSkillCode` — with the full
  base→skill-modifiers→technique-modifiers derivation preserved (via the
  completed `ValueModifier.addVM`). A disabled governing mastery level disables
  the derived rolls.

This is the model/logic layer only; the skill-sheet strike-mode editor (#324),
create flow (#325), Combat-tab integration and item-type retirement (#326) build
on it. Existing skills are unaffected (their `strikeMode` defaults to `null`).
