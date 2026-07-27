---
"sohl": patch
---

**Fix: unchecked checkboxes no longer render as a filled box**

Follow-up to #756, which did not fully resolve #752. Foundry v13+ does not paint
the checkbox on the `<input>` itself — it draws a Font Awesome glyph in `::before`
(`fa-square` unchecked, `fa-square-check` checked) colored by
`--checkbox-background-color`, and its unchecked square is _filled_, so it reads as
selected. #756 gave the input its own `appearance: none` border/background box but
never overrode `::before`, so core's filled glyph kept painting on top — the
unchecked control still showed a filled/double-square (visible on the Skill sheet's
Improvement Flag).

The checkbox now keeps core's glyph-as-control model but draws its own `::after`
glyph in the SoHL palette: a hollow `far fa-square` when unchecked and a solid
`fas fa-square-check` (filled box with a knockout checkmark) when checked, with
core's `::before` suppressed via `content: none`. Because SoHL's `sohl.base`
cascade layer outranks core's `elements` layer, a single unscoped-state rule
suppresses core's glyph across unchecked, checked, and indeterminate. This also
retires the hand-rolled border-and-rotated-checkmark box from the first fix.

Closes #752
