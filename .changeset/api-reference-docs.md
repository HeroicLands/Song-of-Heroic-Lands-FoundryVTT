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
- The internal `AIExecutionResult` interfaces are tagged `@internal` so they no
  longer appear in the published API.

The coverage probe reports **0** undocumented symbols across the full in-scope
set — `domain/result/`, `domain/modifier/`, and `SohlActor` — down from a
combined ~623.
