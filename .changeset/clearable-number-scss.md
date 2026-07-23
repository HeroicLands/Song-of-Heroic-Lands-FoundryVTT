---
"sohl": patch
---

**Style the `clearableNumberInput` clear affordance**

Add `scss/components/_clearable-number.scss` (scoped under `.sohl`, mirroring the
`_date-picker.scss` pattern) and wire it into `scss/sohl.scss` in the
`sohl.components` layer. The `clearableNumberInput` helper's wrapper
(`.clearable-number`) now lays out its number input and `×` clear control
(`.clearable-number__clear`) as a flex row — the input flexes to fill, the clear
sits adjacent with spacing, a muted default colour, `cursor: pointer`, and a
`hover`/`focus` danger-colour state. Previously neither class was styled, so the
`×` rendered as an unstyled inline anchor next to the input (visible on the
affliction and trauma item sheets). Styling only; the `clearField` behaviour was
already working.

Closes #631
