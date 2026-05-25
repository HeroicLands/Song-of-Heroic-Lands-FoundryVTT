# Runtime Contracts

> **Audience:** Maintainers working on system startup, registration, and core object construction.

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](../how-to/extension-points.md).

This page is the canonical reference for runtime contracts and invariants. If guidance here conflicts with narrative/how-to pages, this page is authoritative.

## System-level contracts (`SohlSystem`)

Primary file: `src/core/SohlSystem.ts`

- `globalThis.sohl` is assigned during init (`src/sohl.ts`) and provides the runtime system instance.
- Core config surface (`CONFIG`) exposes document classes, data models, sheets, and result/modifier constructors.
- Calendar registry (see [Extension Points — Calendar Registration](../how-to/extension-points.md#8-calendar-registration)).

### CONFIG structure

`sohl.CONFIG` defines which classes are active at runtime:

#### Modifier classes

| CONFIG key | Default class | Description |
|------------|---------------|-------------|
| `CONFIG.ValueModifier` | `ValueModifier` | Base auditable value tracker |
| `CONFIG.CombatModifier` | `CombatModifier` | Combat-specific modifier |
| `CONFIG.ImpactModifier` | `ImpactModifier` | Damage/impact modifier |
| `CONFIG.MasteryLevelModifier` | `MasteryLevelModifier` | Test mastery level modifier |

#### Result classes

| CONFIG key | Default class | Description |
|------------|---------------|-------------|
| `CONFIG.SuccessTestResult` | `SuccessTestResult` | Single test result |
| `CONFIG.OpposedTestResult` | `OpposedTestResult` | Opposed test result |
| `CONFIG.ImpactResult` | `ImpactResult` | Impact/damage result |
| `CONFIG.AttackResult` | `AttackResult` | Attack resolution |
| `CONFIG.DefendResult` | `DefendResult` | Defense resolution |
| `CONFIG.CombatResult` | `CombatResult` | Full combat outcome |

#### Document sheets

`CONFIG.Actor.documentSheets` and `CONFIG.Item.documentSheets` map actor/item type strings to sheet classes.

### Invariants

- Core constructor mappings (results/modifiers/data models) must be available before sheet and runtime usage.
- Common code should construct classes through `sohl.CONFIG` mappings when available.

## Data model contract (`SohlDataModel`)

Primary file: `src/core/SohlDataModel.ts`

`SohlDataModel` is the typed data-layer wrapper over Foundry `TypeDataModel`.

Key contracts:

- Each data model class declares static `kind` and localization prefixes.
- Logic object is created lazily through `create(...)` + `logic` accessor.
- `fromData(...)` resolves model class by `kind` across configured document families and normalizes serialized JSON forms.

## Document/DataModel/Logic contract

SoHL separates persistence from behavior:

- **Document** (`SohlItem`, `SohlActor`) — integrates with Foundry document APIs.
- **DataModel** (`document.system`) — defines persisted fields/schema only.
- **Logic** (`document.system.logic`) — contains lifecycle methods, rules behavior, and derived properties.

Concrete example (Skill type):

- `SohlItem` with `type = skill`
- `SkillDataModel` on `system` (persisted fields)
- `SkillLogic` on `system.logic` (lifecycle, calculations)
- `SkillSheet` (UI/editor)

**Guideline:** Stored fields in DataModel, derived behavior in Logic, integration helpers in Document, presentation in Sheet.

## Sheet mixin contract

`SohlDataModel.SheetMixin(...)` provides shared sheet behavior:

- Context build (`config`, `system`, `effects`, transferred effects)
- Drag/drop hooks and routing by dropped document type
- Item/effect context-menu wiring through `SohlContextMenu`

Use this mixin for consistent behavior across actor/item/effect sheets.

## Constants and metadata contract

Primary file: `src/utils/constants.ts`

- Canonical kind IDs (`ACTOR_KIND`, `ITEM_KIND`).
- Metadata maps (`*_METADATA`) for registration and UI lookups.
- Test/modifier enums used throughout result/modifier pipelines.

Changing constants is a high-impact operation: treat as migration-sensitive.

## Safe extension checklist

1. Add new kind constant + metadata.
2. Implement data model + logic + (if needed) sheet class.
3. Register mappings in `SohlSystem` config/registries.
4. Verify `fromData(...)` and drag/drop/sheet contexts resolve correctly.
5. Validate startup.
