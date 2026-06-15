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

| CONFIG key                    | Default class          | Description                  |
| ----------------------------- | ---------------------- | ---------------------------- |
| `CONFIG.ValueModifier`        | `ValueModifier`        | Base auditable value tracker |
| `CONFIG.CombatModifier`       | `CombatModifier`       | Combat-specific modifier     |
| `CONFIG.ImpactModifier`       | `ImpactModifier`       | Damage/impact modifier       |
| `CONFIG.MasteryLevelModifier` | `MasteryLevelModifier` | Test mastery level modifier  |

#### Result classes

| CONFIG key                 | Default class       | Description                              |
| -------------------------- | ------------------- | ---------------------------------------- |
| `CONFIG.SuccessTestResult` | `SuccessTestResult` | Single test result                       |
| `CONFIG.OpposedTestResult` | `OpposedTestResult` | Opposed test result                      |
| `CONFIG.AttackResult`      | `AttackResult`      | Attack resolution (carries impact + aim) |
| `CONFIG.DefendResult`      | `DefendResult`      | Defense resolution                       |
| `CONFIG.CombatResult`      | `CombatResult`      | Full combat outcome                      |

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

## Chat-card dispatch contract

Chat-card buttons (inside `.card-buttons`) and `a.edit-action` links are routed by the `renderChatMessageHTML` hook in `src/sohl.ts`. The handler document is resolved from the clicked element's dataset by `resolveChatCardHandlerUuid(dataset)` (`src/document/chat/chat-card-dispatch.ts`), which normalizes the differing attribute conventions across cards with this precedence:

1. `data-doc-uuid` (standard-test, fate, edit-action cards)
2. `data-handler-uuid` (damage, injury, attack-result cards)
3. `data-handler-actor-uuid` (attack-card defender responder)
4. `data-action-handler-uuid` (opposed-request / opposed-result cards)

The resolved document's `onChatCardButton(btn)` (or `onChatCardEditAction`) is then invoked; handlers switch on `btn.dataset.action`. New card buttons must emit one of the attributes above and add an `action` case rather than introducing a new attribute name. For the procedure, see [Extension Points — Adding a chat-card button](../how-to/extension-points.md#adding-a-chat-card-button).

## Safe extension checklist

To add a new actor or item type, follow the worked example in [Extension Points — Actor and Item type extension](../how-to/extension-points.md#2-actor-and-item-type-extension): add the kind constant + metadata → data model + logic + sheet → register in `SohlSystem` → verify `fromData(...)`/drag-drop/sheet contexts resolve → validate startup.
