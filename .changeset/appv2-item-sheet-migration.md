---
"sohl": patch
---

**Fix: complete the ApplicationV2 item-sheet migration (render + persist edits)**

Item sheets now render, and all sheets persist field edits on change with no
button press. Previously every item sheet failed to render
(`Template part "tabs" must render a single HTML element`) and no sheet saved
field edits.

- Add `form.submitOnChange` to the base sheet mixin so `DocumentSheetV2` persists
  a field edit as soon as it changes — fixes both actor and item sheets.
- Migrate `SohlItemSheetBase.TABS` from the legacy v1 shape
  (`navSelector`/`contentSelector`) to the v13 `ApplicationTabsConfiguration`, and
  render the tab navigation from the core `tab-navigation.hbs` part (mirroring the
  being sheet).
- Fix the item content-section templates: correct `data-tab`/`data-group`/active
  wiring and replace a non-existent `length` Handlebars helper with property
  access.

Resolves the render and edit-persistence failures tracked in #141. A few item
kinds remain (their whole-form submit is rejected when a required `subType` is
unsatisfied; `combattechnique` has no properties template) and stay tracked under
#141.
