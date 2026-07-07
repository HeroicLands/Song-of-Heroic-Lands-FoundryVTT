---
"sohl": patch
---

**Fix: form-select fields with array `choices` submitted invalid values**

A DataModel `StringField({ choices })` used the enum `values` array, but Foundry
builds `<option>` values from `Object.entries(choices)`, so array choices render
option values as indices (`0`, `1`, `2`, …). Rendered as an editable select,
`submitOnChange` then submitted the index, validation rejected the whole form
update (`X is not a valid choice`), and no edit persisted — this broke the trait,
affliction, projectilegear, and concoctiongear item sheets.

`defineType` now emits a value-keyed `choices` label map, and the affected fields
use it: trait `subType`/`intensity`, affliction `transmission`, projectilegear
`impactBase.aspect`, and concoctiongear `potency`.

Remaining array-`choices` fields that do not yet render as editable selects are
tracked in #148; combattechnique's sheet is separately blocked on a missing
strike-mode template (#147).

Refs #141
