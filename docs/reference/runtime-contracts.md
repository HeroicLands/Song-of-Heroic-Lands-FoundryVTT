# Runtime Contracts

> **Audience:** Maintainers working on system startup, registration, and core object construction.

See also: [SoHL Architecture (Overview)](../concepts/architecture.md), [Extension Points](../how-to/extension-points.md).

**You are here**

- This page is the canonical reference for runtime contracts and invariants.
- If guidance here conflicts with narrative/how-to pages, this page is authoritative.
- For conceptual framing, start with [Architecture Overview](../concepts/architecture.md).

## System-level contracts (`SohlSystem`)

Primary file: `src/core/SohlSystem.ts`

`SohlSystem` defines the static/runtime contract for variants and class wiring:

- Variant registry:
    - `registerVariant(variantId, variant)`
    - `selectVariant(variantId?)`
    - `variants` iterator
- Runtime singleton-like access through `game` getter using world setting `sohl.variant`.
- Shared registries initialized in constructor:
    - `dataModelRegistry`
    - `classRegistry`
- Core config surface (`CONFIG`) for document classes, data models, sheets, and result/modifier constructors.

### Runtime accessor and dynamic constructor dispatch

- `globalThis.sohl` is assigned during init (`src/sohl.ts`) and points to the selected `SohlSystem` variant instance.
- Common runtime code should construct variant-resolved classes through `sohl.CONFIG` mappings rather than hard-coding variant class names.
- Example pattern: `sohl.CONFIG.ImpactModifier({}, { parent: this })`.

This keeps common logic variant-agnostic while still allowing each variant to supply specialized implementations.

### Invariants

- Variant IDs must be unique.
- Selecting an unknown variant is a hard error.
- Core constructor mappings (results/modifiers/data models) must be available before sheet and runtime usage.
- Common code must resolve variant-specific classes through `sohl.CONFIG`/registries, not direct imports from variant folders.

## Data model contract (`SohlDataModel`)

Primary file: `src/core/SohlDataModel.ts`

`SohlDataModel` is the central typed data-layer wrapper over Foundry `TypeDataModel`.

Key contracts:

- Each data model class declares static `kind` and localization prefixes.
- Logic object is created lazily through `create(...)` + `logic` accessor.
- `fromData(...)` resolves model class by `kind` across configured document families and normalizes serialized JSON forms.

## Document/DataModel/Logic contract (Actor and Item)

SoHL intentionally separates persistence from behavior:

- **Document** (`SohlItem`, `SohlActor`) integrates with Foundry document APIs.
- **DataModel** (`document.system`) defines persisted fields/schema only.
- **Logic** (`document.system.logic`) contains lifecycle methods, rules behavior, and synthesized properties.

This pattern applies to both Items and Actors.

Concrete item example (Skill type):

- `Skill` document is represented by `SohlItem` with `type = skill`.
- Persisted state is `SkillDataModel` on `system`.
- Behavior is `SkillLogic` (derived from mastery-level logic).
- UI editor is `SkillSheet`.

Actor classes follow the same split with actor-specific `*DataModel`, `*Logic`, and sheet classes.

Guideline: put stored fields in DataModel, derived behavior in Logic, integration helpers in Document, and presentation/event handling in Sheet classes.

## Sheet mixin contract

`SohlDataModel.SheetMixin(...)` provides shared sheet behavior:

- context build (`variant`, `config`, `system`, `effects`, transferred effects)
- drag/drop hooks and routing by dropped document type
- item/effect context-menu wiring through `SohlContextMenu`

When extending sheets, use this mixin path so behavior remains consistent across actor/item/effect documents.

## Registry contract (`SohlSystem`)

Primary file: `src/core/SohlSystem.ts`

- `SohlSystem` owns runtime registries for constructor/data-model mappings.
- Registry content is initialized in the system constructor and used during variant/runtime setup.
- Variant selection and config wiring depend on these mappings being valid.

Use this as the authoritative registry layer and keep mappings explicit.

## Constants and metadata contract

Primary file: `src/utils/constants.ts`

- Canonical kind IDs (`ACTOR_KIND`, `ITEM_KIND`, `EFFECT_KIND`, `COMBATANT_KIND`).
- Metadata maps (`*_METADATA`) used by registration and UI metadata lookups.
- Test/modifier enums used throughout result/modifier pipelines.

Changing constants is a high-impact operation: treat as migration-sensitive.

## Safe extension checklist

1. Add new kind constant + metadata.
2. Implement data model + logic + (if needed) sheet class.
3. Register mappings in `SohlSystem` config/registries.
4. Verify `fromData(...)` and drag/drop/sheet contexts still resolve correctly.
5. Validate variant selection + startup with world setting changes.
