---
"sohl": minor
---

**Node template-render test harness + shared pure Handlebars helpers**

Make SoHL's card and dialog templates renderable in Node so the card/dialog-building
actions can be unit-tested by asserting the emitted HTML — no running Foundry.

- **Extract SoHL's pure Handlebars helpers** (`selectArray`, `endswith`,
  `optionalString`, `setHas`, `contains`, `toJSON`, `toLowerCase`, `arrayToString`,
  `injurySeverity`, `array`) out of system init into a Foundry-free module,
  `registerPureHandlebarsHelpers(H)`, registered through an injected Handlebars
  instance. System init and the test harness register the **same** code, so
  template rendering never drifts. Behavior-preserving; the Foundry-coupled helpers
  (`getProperty`, `textInput`, `clearableNumberInput`, `datePicker`,
  `displayWorldTime`) stay in system init.
- **Render harness** (`tests/mocks/hbs-helpers.ts`): `renderTemplateReal(path, data)`
  reads a `.hbs` off disk and renders it with the shared pure helpers, Foundry's
  logic helpers (copied verbatim), faithful option-list builders (`selectOptions` /
  `selectArray`), and param-placeholder stubs for the Foundry DOM/form builders
  (`formGroup` + `formField`, `formInput`, `numberInput`, `editor`, `filePicker`,
  `radioBoxes`, `rangePicker`) and impure SoHL helpers. `localize` reads the real
  `lang/en.json`.
- Fidelity: **cards** and **dialogs** render fully (option lists are real); **sheet**
  form builders render as binding placeholders (name/value/disabled) — the right
  level for a unit test.
- Tests: card/dialog render assertions for the treatment, shock, attack-result cards
  and the injury / treat-injury dialogs; the attack-card action test renders the real
  card through the harness.

Closes #582
