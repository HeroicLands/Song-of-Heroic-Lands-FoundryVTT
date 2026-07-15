---
"sohl": minor
---

**Add a reusable clear control for nullable number fields on sheets**

Emptying an `<input type="number">` does not reliably reset a nullable field to
`null` (Foundry reads `valueAsNumber` = `NaN`; coercion depends on attributes and
`submitOnChange`/re-render). Adds a general, reusable control:

- a `clearableNumberInput` Handlebars helper that wraps the standard number-input
  builder (`field.toInput` / `createNumberInput`) — passing every option through —
  and renders a "×" clear affordance when the field has a value;
- a `clearField` action on the item and actor base sheets that writes `null`
  explicitly via `document.update`, using the control's `data-field-path`.

Usable for any nullable field on any SoHL sheet.

Closes #479.
