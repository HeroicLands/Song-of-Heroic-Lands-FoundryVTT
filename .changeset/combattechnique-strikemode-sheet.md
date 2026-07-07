---
"sohl": patch
---

**Fix: combattechnique item sheet renders and edits its strike mode**

The combattechnique sheet referenced a strike-mode properties template that did
not exist (`combattechniquestrikemode-properties.hbs`), so opening any
combattechnique item threw `Failed to load template … ENOENT` and the sheet could
not render.

- Add the strike-mode properties template. `strikeMode` is a melee/missile
  discriminated `TypedSchemaField` stored flat as `{ type, ...fields }`, so its
  sub-fields are edited at explicit `system.strikeMode.<field>` paths (with a
  hidden `type` input so the discriminated update stays valid on submit), with
  melee/missile-specific fields rendered conditionally.
- Fix `CombatTechniqueSheet._preparePropertiesContext`, which referenced
  non-existent top-level fields, to expose the resolved strike-mode value/type.

Fixes #147
