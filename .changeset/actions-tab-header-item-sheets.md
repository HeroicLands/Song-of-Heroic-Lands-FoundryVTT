---
"sohl": patch
---

**Fix the Actions tab header rows on item sheets**

The "Custom Actions" and "Intrinsic Actions" section headers on item sheets
(e.g. Skill) rendered as oversized, wrapping Cinzel headings instead of the
compact grey header-row bar used elsewhere. The shared `.list__*` list styling
lived only under the Being sheet's `.sohl.being` scope, so item sheets — whose
Actions tab uses the same markup — fell back to the default heading.

Add a scoped `.actions-list` style block so the actions lists get the same
compact header row, column widths, and row chrome the other item lists and the
Being sheet already have. Closes #708.
