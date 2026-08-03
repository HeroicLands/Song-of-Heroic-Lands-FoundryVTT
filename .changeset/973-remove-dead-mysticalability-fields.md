---
"sohl": patch
---

**Remove dead Mystical Ability fields (`skillBaseFormula`, `assocMysteryCode`)**

Two Mystical Ability fields were exposed but consumed nothing, misleading authors
into thinking an author-entered value had an effect:

- **`skillBaseFormula`** was rendered as a control on the item sheet but had no
  backing schema field and was never used to compute a Skill Base — a Mystical
  Ability's rolled value derives from `masteryLevelBase`, not an attribute-averaged
  Skill Base. The control (and its sheet-context wiring) is removed.
- **`assocMysteryCode`** was a real schema field resolved during `evaluate()` into
  an `assocMystery` link, but nothing in production ever read that link. The field,
  its `assocMystery` resolution, and the getter are removed.

Pre-Beta, so no world migration is required.
