---
"sohl": patch
---

**Style the Being sheet's non-fieldset list headers (#515)**

The compact list-header styling added for #515 was scoped to `fieldset
.list__header`, but the Gear ("On Body") and Combat weapon-group lists put their
`.list__header` inside a `.list` div rather than a `<fieldset>`. Their header's
`.list__name` heading therefore rendered at full Cinzel size with no header bar.
The rule is now keyed on `.list__header` directly, so every Being list header
gets the same compact label bar.
