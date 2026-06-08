---
"sohl": patch
---

Expand API reference documentation (TSDoc)

Add accurate TSDoc across high-value public API surfaces so developers building
against SoHL get complete, trustworthy reference docs. This is a comments-only,
non-behavioral effort (no runtime logic, signatures, or data fields change), run
in reviewable batches per the API documentation coverage plan.

**Documented so far:**

- **All result types (`domain/result/`)** — complete coverage of `TestResult`
  (the abstract base), `SuccessTestResult`, `OpposedTestResult`, `AttackResult`,
  `DefendResult`, `CombatResult`, and `ImpactResult`: class members,
  constructors (parameters and `@throws`), the success-level and
  opposed-resolution getters, the `evaluate` / `testDialog` / `toChat` overrides
  (each documenting only what it adds over the base), and the `Data` / `Options`
  / `ContextScope` / `LimitedDescription` namespace types.
- **All modifier types (`domain/modifier/`)** — complete coverage of
  `ValueModifier` (the base + deltas model: operators, inspection/mutation
  methods, disabled state, chat rendering), `MasteryLevelModifier` (target
  clamping, critical digits, success-level offset, and the success /
  success-value / opposed test methods), `ImpactModifier` (dice, aspect,
  formula, evaluation), `CombatModifier`, and the `ValueDelta` building block —
  including their namespace types. Internal plumbing is tagged `@internal`.
- **The rest of the Domain layer** — the anatomy/hit-location model
  (`BodyStructure`, `BodyPart`, `BodyLocation`, armor aggregation, injury
  resolution, weighted hit-location selection), the strike-mode combat types
  (`StrikeModeBase`/`MeleeStrikeMode`/`MissileStrikeMode`: reach, attack,
  impact, block/counterstrike), the `SohlAction` action system, the per-medium
  movement helpers, and the `SkillBase` formula — classes, exported functions,
  and namespace/`Data` interfaces. With this, the entire `domain/` layer is
  documented.
- **The `SohlActor` document module** (`document/actor/foundry/SohlActor.ts`) —
  the actor document's lifecycle and data-preparation overrides
  (`prepareBaseData`, `prepareEmbeddedData`'s phase-batched lifecycle,
  `prepareDerivedData`), creation hooks (`_preCreate`, `_onCreate`,
  `createUniqueName`), the `SohlActorLogic` / `SohlActorData` interfaces, the
  `SohlActorDataModel` base, and the `SohlActorSheetBase` render/context hooks.
- **The `SohlLogic` core base** (`core/SohlLogic.ts`) — the abstract logic base
  every actor/item logic class extends: the document accessors
  (`id`/`name`/`type`/`item`/`actor`/`speaker`/`label`), the `actions`
  collection and context-menu/default-action helpers, the phase-batched
  lifecycle methods, the intrinsic-action exports, and the `SohlLogicData`
  interface. Documenting the base cascades to every subclass's inherited members.
- **All actor and item Logic classes** (`document/actor/logic/*` and
  `document/item/logic/*`) — every Logic class and its `*Data` interface: class
  summaries, the data interfaces and all their members (including nested
  object-literal fields), synthesized properties (documented in terms of the
  data field they derive from — e.g. a `ValueModifier` seeded from a `*Base`
  number, or a resolved logic object from a shortcode), getters, constructors,
  and the intrinsic-action / test methods where the business logic lives. The
  inherited lifecycle methods (`initialize`/`evaluate`/`finalize`) are
  deliberately left to inherit their base-class documentation.
- **The Foundry binding layer is marked `@internal`** — every DataModel and
  Sheet class (concrete and base, plus core `SohlDataModel` and its
  `SheetMixin`) is tagged `@internal` and excluded from the published API. The
  supported extension surface is hooks, action items, and the Logic / domain
  classes — not the Foundry persistence/UI binding. The data *shape* remains
  documented through the public `*Data` interfaces.
- **Documented the data-access pattern** — every `*Data` interface is marked as
  the shape of `system` for its document type, and the architecture overview
  explains that `document.logic.data` (typed as the `*Data` interface) is the
  recommended, fully-typed path to a document's fields — equivalent to
  `document.system`, which is the same object but typed as the now-internal
  DataModel.
- The internal `AIExecutionResult` interfaces are tagged `@internal` so they no
  longer appear in the published API.
- **The `utils` layer** (`utils/`, excluding `constants.ts`) — the shared helper
  classes and functions developers reach for when traversing documents and
  building actions: `helpers.ts` (type guards, brand types, name/uuid utilities,
  the `AsyncFunction` compiler), `SimpleRoll`, `SohlMersenneTwister`,
  `SohlLogger`, `SohlLocalize`, `SohlContextMenu`, `SourceMapResolver`, `Itr`,
  and `collection/SohlMap` — class summaries, members, parameters/returns, and
  the meaningful structural members of return shapes and type-guard predicates.
  The `utils/ai/` agent-plumbing module is tagged `@internal` and excluded from
  the published API.
- **The `sohl.*` runtime surface** — the global `sohl` object is a `SohlSystem`
  singleton, so its public surface is now documented: the `SohlSystem` class
  (the `CONFIG` registry getter — documented lightly — plus `i18n`, `log`,
  `events`, `utils`, `constants`, `game`, `calendar`, `setupSheets`, and the
  calendar-registry statics), the `SohlSystem.Config` namespace and its
  per-document-type registration blocks, and the actor/item DataModel / Logic /
  sheet registry barrel exports. The world calendar (`SohlCalendarData`,
  `SohlCalendarComponents`) and the event-trigger taxonomy (`SohlEventQueue`
  was already documented; `SohlTriggerContext` is now covered) round out
  `sohl.calendar` and `sohl.events`.

The coverage probe reports **0** undocumented symbols across the full in-scope
set — `domain/`, `core/SohlLogic`, `core/SohlSystem`, `core/SohlCalendar`, the
event system, the actor/item Logic classes, `SohlActor`, and `utils/`
(excluding `constants.ts`).
