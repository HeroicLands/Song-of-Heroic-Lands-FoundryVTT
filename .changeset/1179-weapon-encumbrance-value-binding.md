---
"sohl": patch
---

**Weapon sheet: show the stored Encumbrance instead of a blank field**

The Weapon Properties tab's Encumbrance control bound its displayed value to
`system.encumbrance`, which `WeaponGearDataModel` does not define — the schema
field is `encumbranceBase`. The edit persisted correctly, but reopening the sheet
rendered the input empty, so a weapon's encumbrance read as though it had never
saved.

Bind the control to `system.encumbranceBase`, matching the field it edits. Covered
by a unit test that renders the real properties template and asserts the
field/value pair for every gear control on the tab.

Closes #1179
