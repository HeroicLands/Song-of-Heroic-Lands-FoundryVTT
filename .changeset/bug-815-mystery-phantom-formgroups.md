---
"sohl": patch
---

**Fix Mystery & Mystical Ability properties tabs binding to nonexistent schema fields (#815)**

The Mystery and Mystical Ability item-sheet Properties tabs rendered `formGroup`
controls bound to schema fields that do not exist, so the controls silently
rendered nothing (Foundry's `formGroup` no-ops on an `undefined` field):

- `mystery-properties.hbs` and `mysticalability-properties.hbs` bound a `Domain`
  control to `system.domainCode`, a field neither DataModel defines (the
  Domain-registry integration is still incomplete).
- `mysticalability-properties.hbs` additionally bound a control to
  `system.isImprovable`, a mis-named duplicate of the real `improveFlag` field
  (already rendered in the same tab).

Both phantom controls are removed. Node HTML-render tests assert the dead
`system.domainCode` / `system.isImprovable` references are gone while the real
controls still render, matching the coverage added for #808 and #709.
