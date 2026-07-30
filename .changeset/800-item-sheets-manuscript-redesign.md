---
"sohl": minor
---

**Roll the Manuscript design system onto every Item sheet**

Every Item sheet now wears the same Manuscript skin the Being sheet adopted in
epic #783: a slim, edit-focused header (image + inline name + shortcode lozenge +
type label), and property tabs built from the shared BEM component set rather than
the legacy flex-list widgets.

**What changed**

- A new item-sheet SCSS foundation: `array-list` (editable scalar/object array
  widget), `field-grid` (the property `formGroup` grid + field retune), an
  in-place Manuscript `fieldset`/`legend` treatment, a `prose-panel` card for the
  Description editor, and a slim `sheet-header` under the compound `.sohl.item`
  selector.
- All 18 item property templates plus the shared header, Actions, Effects, Strike
  Modes, and Description partials rewritten to those components. Actions and
  Effects now use the shared `ledger` + `section-legend`, matching the Being
  sheet. Every behavioral hook is preserved: all `data-action` /
  `data-array` / `data-index` / `data-*` attributes, the JS-bound classes, and the
  legacy secondary classes (`strikemodes__row`, `name`, `armor-location`, …) kept
  as e2e selector anchors.
- `SohlItemSheetBase` now adds the `item` frame class (the frame resolves to
  `sohl sheet item`), so the compound `.sohl.item` header rules match.
- Dead legacy CSS superseded by the rewrites was pruned — the `.list-section` /
  `.actions-list` item-list blocks and the non-`ledger` effects-list scaffold —
  while `.gear-list` and the strike-mode secondary hooks (still used by the actor
  gear tab and by e2e) were kept.

No data-model or localization-key changes; the redesign is presentation-only.

Closes #800
Closes #801
Closes #802
Closes #803
Closes #804
Closes #805
Closes #806
Closes #807
