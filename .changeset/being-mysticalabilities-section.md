---
"sohl": patch
---

**Being Mysteries tab: Mystical Abilities section**

Reimplements the Mystical Abilities section of the Being sheet's Mysteries tab
(#311).

- **A header per subtype, always shown.** Each ability category (Shamanic Rite,
  Spirit Action, Spirit Power, Benediction, Ritual Devotion, Divine/Arcane
  Incantation, Arcane/Spirit Talent, Alchemy, Divination) renders its own
  section header in declared order, whether or not the being has any abilities of
  that kind, with Skill / Level / ML / Charges / Improve / Notes columns.
- **Charges as ValueModifiers.** `charges.value`/`charges.max` are always
  `ValueModifier`s with `null` → disabled, driving the same ×/∞ display rules as
  the Mysteries section. The data model's `charges.value`, `charges.max`, and
  `levelBase` are now nullable so "no charges", "infinite", and "no level" are
  representable.
- **Mastery level uses `MasteryLevelModifier`.** `masteryLevel` is now a
  `MasteryLevelModifier`. When the ability names no skill it uses its own
  internal mastery level (`masteryLevelBase`); when a skill is associated,
  `finalize` copies the skill's mastery level in via `addVM`, so the ability's
  own modifiers still stack on top rather than being replaced.
- Cleans up a double `level` assignment in `initialize`.
