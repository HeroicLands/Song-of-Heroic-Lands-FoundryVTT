---
"sohl": patch
---

**Fix the Mystery sheet's broken "Affected Skills" editor (#808)**

The Mystery item sheet's Properties tab rendered an "Affected Skills" array-list
editor bound to `system.skills` — a field the `MysteryDataModel` schema never
defined. The list always rendered empty and adding a row had no persistent
effect. A Mystery carries a single associated skill (`assocSkillCode`), not an
array of affected skills, so the phantom array editor is removed and the existing
`assocSkillCode` field is surfaced as an "Associated Skill" control instead. No
data-model change or migration is involved.
