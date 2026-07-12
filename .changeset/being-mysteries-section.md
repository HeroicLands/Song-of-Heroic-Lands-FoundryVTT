---
"sohl": patch
---

**Being Mysteries tab: Mysteries section**

Reimplements the Mysteries section of the Being sheet's Mysteries tab (#310).

- **A header per subtype, always shown.** Each mystery category (Birthsign,
  Blessing, Buff, Fate, Grace, Other, Piety) now renders its own section header
  in declared order, whether or not the being has any mysteries of that kind.
- **Charges as ValueModifiers.** `MysteryLogic.charges.value` and `charges.max`
  are always `ValueModifier`s; a `null` source value leaves the modifier
  disabled, which drives the display rules (first match wins): `max` disabled →
  "×" (no charges); `value` disabled → "∞" (infinite remaining); `max` 0 →
  "_value_/∞" (infinite available); otherwise "_value_/_max_". Level shows "×"
  when `levelBase` is `null`.
- **Associated skill.** Adds an `assocSkillCode` field to the mystery data model
  and resolves it to an `assocSkill` (a `SkillLogic`) during `evaluate`, shown in
  the section's Skill column.
- **Subtype labels.** Adds the `SOHL.Mystery.SubType.*` localization keys the
  subtype choices reference (also fixes the item-sheet subtype dropdown).

Remaining Time (called for on Blessing/Fate) is tracked separately and not yet
wired.
