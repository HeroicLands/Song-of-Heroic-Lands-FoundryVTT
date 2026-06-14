---
"sohl": patch
---

**Extract the reusable list-widget component (DRY items/effects/body-location)**

The item, effect, and body-location lists each re-implemented the same skeleton —
scrollable body, header row, reset inner list, control cluster, and the
ellipsis-truncation triple repeated on nearly every column. Extract that skeleton into
shared mixins so the three lists become thin consumers:

- `abstracts/_mixins.scss` gains `truncate` (the `text-overflow`/`white-space`/`overflow`
  ellipsis triple used ~15× across the lists).
- New `components/_list.scss` provides the list mixins: `scroll-body`, `reset`,
  `section-title`, `header-row`, and `controls` (emits no CSS itself).
- `components/_items.scss`, `_effects.scss`, and `_bodyloc.scss` now `@include` those
  mixins and keep only their own columns and accent colors.

Class names are unchanged, so **templates are untouched** and the compiled CSS is
equivalent: the only diff against the previous build is a cosmetic `margin: 7px 0px` →
`margin: 7px 0` normalization (identical computed value) on the body-location list.

Scope note: the header duplication this epic targeted (`.sheet-header-being/-object`) was
already removed in the dead-code pass, and the form field was split into its own partial
in the folder reorg; the remaining BEM-driven shared-class adoption in templates lands in
the naming pass.
