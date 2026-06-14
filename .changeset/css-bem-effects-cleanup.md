---
"sohl": patch
---

**Finish the BEM pass: effects component, dead-CSS deletion (part 3 of #94)**

Completes the naming capstone of the CSS refactor (epic #95).

- **Effects component** → BEM `effects` block: `effects-list → effects__list`,
  `effects-header → effects__header`, `effect-list → effects__items`,
  `effect → effects__row`, `effect-controls → effects__controls`,
  `effect-control → effects__control`, renamed in lockstep across the effect templates
  and `scss/components/_effects.scss`. The `.effects-list` `SearchFilter`
  `contentSelector` in `BeingSheet.ts` is updated to match. Event hooks
  (`effect-toggle`, `effect-create`, `effect-contextmenu`) and generic columns are kept.
- **Dead CSS removed:** the entire `scss/components/_bodyloc.scss` (every rule was
  mis-scoped under `.bodylocations .zone-list` ancestors that the body-structure template
  never renders, so none of it matched), plus the unused `.nocarry` / `.overmaxcap` /
  `.overencumberedcap` state rules.

**Intentionally kept** (documented in the styleguide): generic leaf columns (`.name`,
`.detail`, `.type`, …) scoped under their block, and the standard state classes
`.active` / `.disabled` / `.danger` — `.active`/`.disabled` are Foundry/template
conventions and renaming them would break tab/disabled behavior.

Note: the effects search filter was already non-functional before this change —
`_displayFilteredResults` queries `.item`, but effect rows are `.effects__row` (were
`.effect`). That pre-existing bug is left as-is (separate fix); the rename keeps the
filter wiring internally consistent.
