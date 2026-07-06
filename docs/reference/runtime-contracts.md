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

## Entity serialization contract

Primary files: `src/entity/SohlEntity.ts`, `src/utils/helpers.ts`, `src/utils/kindRegistry.ts`

Domain entities — results (`SuccessTestResult`, `AttackResult`, …), modifiers (`ValueModifier`, `ImpactModifier`, …), and dice (`SimpleRoll`) — all extend `SohlEntity` and share one serialization mechanism. There is no reflective serializer; a class serializes exactly what its `toJSON` emits.

- **Ownership.** Every `SohlEntity` requires a `parent` Logic (`options.parent`); the constructor throws `SohlEntity requires a parent` otherwise. `parent` is transient — never serialized — and is re-supplied on revival.
- **Serialize / revive through `defaultToJSON` / `defaultFromJSON`.** `JSON.stringify(defaultToJSON(entity))` is the wire form; `defaultFromJSON(parsed, { parent })` rebuilds it. `defaultToJSON` honors each object's `toJSON` (and stamps a `__kind` tag through the `SohlEntity` chain); `defaultFromJSON` revives nested `__kind`-tagged children bottom-up, then calls `new Ctor(data, { parent })` via the kind registry.
- **Curated `toJSON`, `Data`-shaped.** Each subclass that adds state overrides `toJSON` (chaining `...super.toJSON()`) and emits keys matching its `Data` interface in **persisted** representation — a uuid/shortcode where the implementation holds a _resolved_ object (`combatantUuid`, not the live combatant), the raw value where a getter normalizes it. The governing rule: **`toJSON()` output must be valid `data` for the constructor**, i.e. `new Ctor(x.toJSON(), { parent })` reconstructs `x`. Emit special-typed fields (`Map`, `Set`, `Date`, nested entities) through `defaultToJSON` or the child's `toJSON` so the tree is fully JSON-safe. Do **not** re-emit a value that a nested modifier already carries (e.g. a situational modifier folded into `masteryLevelModifier`) — it would double-apply on revival.
- **Register for revival.** A class rehydrates to its concrete type only if it calls `registerKind(X.Kind, X)`. Without it, `defaultFromJSON` leaves the serialized form as inert data — dropping deltas, collapsing computed values back to the base.
- **Cloning is explicit.** `entity.clone(parent)` deep-copies and re-parents; there is no implicit "reuse my parent". Use `entity.clone(entity.parent)` for a same-owner copy; cloning without a resolvable parent throws (a `SohlEntity` must have one).
- **A Logic is a reference, not a payload.** `SohlLogic.toJSON` emits a compact `{ uuid, name, kind }` reference. A logic wraps a live Foundry document and is re-resolved by uuid (`fvttLogicFromUuidSync`), never revived from its own JSON — which is why an entity's owning `parent` is supplied on revival rather than serialized.

## Chat-card dispatch contract

Chat-card buttons (inside `.card-buttons`) and `a.edit-action` links are routed by the `renderChatMessageHTML` hook in `src/sohl.ts`. The handler document is resolved from the clicked element's dataset by `resolveChatCardHandlerUuid(dataset)` (`src/document/chat/chat-card-dispatch.ts`), which normalizes the differing attribute conventions across cards with this precedence:

1. `data-doc-uuid` (standard-test, fate, edit-action cards)
2. `data-handler-uuid` (damage, injury, attack-result cards)
3. `data-handler-actor-uuid` (attack-card defender responder)
4. `data-action-handler-uuid` (opposed-request / opposed-result cards)

The resolved document's `onChatCardButton(btn)` (or `onChatCardEditAction`) is then invoked; handlers switch on `btn.dataset.action`. New card buttons must emit one of the attributes above and add an `action` case rather than introducing a new attribute name. For the procedure, see [Extension Points — Adding a chat-card button](../how-to/extension-points.md#adding-a-chat-card-button).

A card button carries three kinds of data, and only the first two are flat attributes:

1. **Display fields** — rendered into the card body; never read by dispatch.
2. **Routing metadata** — `data-action` plus one `data-*-handler-uuid` (above), read off the dataset _before_ scope exists.
3. **Scope** — the per-action payload, carried as a single `data-scope` attribute.

### The action context (`SohlActionContext`)

`SohlActionContext` is a **runtime value object**, not a `SohlEntity`: it is built fresh at every dispatch (`new SohlActionContext({ speaker, type, scope })`) and is never revived from its own JSON. Only its `scope` crosses the client boundary; the rest — `speaker`, `target`, `skipDialog`, `noChat` — is runtime state. `scope` stays a per-action `ContextScope` **interface**, not an entity: its entity-valued members already round-trip through `defaultToJSON` / `defaultFromJSON`, so the bag itself needs no `toJSON` and no owning parent. Fork a received context with `context.clone(overrides?)`.

### Passing `scope` to a button

An action's `scope` travels as one serialized `data-scope` blob, not a spray of bespoke attributes:

- The **card-creation logic** sets `data-scope` = `JSON.stringify(defaultToJSON(scope))`. In templates the registered `{{toJSON scopeData}}` helper does the `JSON.stringify`, so the card-data field stays an object (`scopeData: defaultToJSON({ attackResult })`) and the template renders `data-scope="{{toJSON scopeData}}"`.
- The **handler** revives it through `buildActionScope(dataset, parent)` (`src/utils/helpers.ts`) — `defaultFromJSON(JSON.parse(dataset.scope), { parent })` — so the action reads live objects (`context.scope.attackResult`, `context.scope.opposedTestResult`), never a per-payload JSON string.
- **Do not** add per-payload `data-*-json` attributes or read individual pieces off the dataset; put the whole payload in `data-scope` and let `defaultToJSON`/`defaultFromJSON` carry it (see [Entity serialization contract](#entity-serialization-contract)).

## Safe extension checklist

To add a new actor or item type, follow the worked example in [Extension Points — Actor and Item type extension](../how-to/extension-points.md#2-actor-and-item-type-extension): add the kind constant + metadata → data model + logic + sheet → register in `SohlSystem` → verify `fromData(...)`/drag-drop/sheet contexts resolve → validate startup.
