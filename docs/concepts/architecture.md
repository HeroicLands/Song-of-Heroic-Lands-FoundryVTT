# SoHL Architecture (Overview)

> **Audience:** Maintainers, contributors, and AI assistants.  
> **Goal:** Provide a mental model of SoHL’s major subsystems, boundaries, and the “direction of dependency.”

See also: [Documentation Hub](../README.md), [Runtime Contracts](../reference/runtime-contracts.md), [Extension Points](../how-to/extension-points.md)

**You are here**

- This page is the conceptual top-level map.
- For extension implementation guidance, continue with [Extension Points](../how-to/extension-points.md).
- For canonical runtime invariants, continue with [Runtime Contracts](../reference/runtime-contracts.md).

**Common maintainer commands**

- `npm run build` — full build with tests and coverage.
- `npm run push:dev` / `npm run push:qa` / `npm run push:prod` — sync `build/stage` to configured targets.
- `npm run deploy:release` — build and package `build/dist/system.zip` + `build/dist/system.json`.
- `npm run changeset` / `npm run changeset:check` / `npm run changeset:version` — release note + version workflows.

## What SoHL is

Song of Heroic Lands (SoHL) is a Foundry VTT system implementing HârnMaster-compatible gameplay with deep automation: actors/items/effects, combat resolution, chat cards, UI sheets, localization, and compendium content.

SoHL is designed as:

- a **core system** (`src/common`) with reusable abstractions
- plus **setting/system variants** (`src/legendary`, `src/mistyisle`) that extend or specialize the core

In practice, `src/common` functions as a variant-agnostic rules kernel and document framework. Variant folders layer on top of that kernel by overriding specific logic, sheets, modifiers, and result classes.

## High-level layers

### Foundry Layer

SoHL implements documents at the Foundry layer to allow integration with
the core Foundry VTT logic. This includes support for Actors, Items,
Active Effects, and Combatants, as well as things like Journal Entries.

This layer generally consists of the core document classes as well as
data model classes (for Actors, Items and Active Effects) and Sheet
classes.

### Logic Layer

SoHL introduces a business logic layer as well. The business logic classes
are kept segregated from the core Foundry classes so that they can be
easily unit tested outside of the Foundry VTT framework, using only
node.js.

The logic instances are associated with the Data Model. A method on the
data model class allows access to the logic instance for that object.

### Presentation layer (UI + chat)

UI templates and chat cards:

- `templates/chat/*`
- `templates/dialog/*`

## Core Classes

### Documents (Actors, Items, Effects, Combatants)

SoHL integrates and extends the standard Foundry VTT documents, implementing
document models for these documents to store additional information.

For each document, the type-specific business logic is kept distinct from the
data model. These classes consistently are named `*Logic`. The data model is
tightly bound to the Foundry VTT lifecycle
and persistence model, but the logic layer is designed to be completely separate
to enable unit testing of the logic layer in a node-only environment without
the Foundry VTT environment. The implication of this is that all functions
called from the logic layer should not use Foundry VTT functions or classes
directly, but only via shims (see `src/common/FoundryProxy.ts`). In addition
to business logic, the logic layer also contains any derived or synthesized
properties that are not persisted.

The document model class (consistently named `*Model`) contains the
persisted state of the document. No business logic should be present in the
document model, which lives purely in the Foundry VTT space.

The sheet class (consistently named `*Sheet`) contains the UI/Presentation
logic for the document's sheet. Note that this logic is separate from the
actual HTML code, which is kept in the `templates` folder, but they are
tightly integrated. Nevertheless, it is possible for the same sheet class
to have separate HTML presentations.

#### Actors

SoHL extends the Foundry VTT `Actor` class with the `SohlActor` class
(see `src/common/actor/SohlActor.ts`). Among other things, this class
implements:

1. SoHL Lifecycle mechanism
2. Virtual Items collection

The code for all Actors resides in the `src/common/actor` folder (and
parallel folders for each system variant).

#### Items

SoHL extends the Foundry VTT `Item` class with the `SohlItem` class
(see `src/common/item/SohlItem.ts`).

The code for all Items resides in the `src/common/item` folder (and
parallel folders for each system variant).

#### Active Effects

SoHL extends the Foundry VTT `ActiveEffect` class with the `SohlActiveEffect`
class (see `src/common/effect/SohlActiveEffect.ts`).

While the standard Foundry VTT ActiveEffect class only supports effects that
apply to the current document, the `SohlEffectLogic` class implements
extensions that allow Active Effects to target either:

- the current document,
- the Actor associated with the current document, or
- other Item(s) embedded in the Actor associated with the current document

The code for all Effects resides in the `src/common/effect` folder (and
parallel folders for each system variant).

#### Combatants

SoHL extends the Foundry VTT `Combatant` class with the `SohlCombatant` class
(see `src/common/combatant/SohlCombatant.ts`).

Combatants are different from the other documents in that they do not
have data models or sheets or logic layers. Therefore all of the combatant
code is located in the `SohlCombatant` class.

`SohlCombatant` tracks capabilities such as allies, enemy combatants which
are threatening the combatant, whether actions have already been performed
this turn, and how far the combatant has moved this turn.

### Values and Traceable Modifiers

SoHL provides the ability to track integer values that have modifiers
associated with them. This is done through the `ValueModifier` class.
Instances of this class have an `effective` getter that returns the
fully calculated value of the instance. This value is composed of
a "base" value, plus a set of named modifiers to that value.

This allows the system to answer the question: What modifiers have been
applied to this value? This often occurs when for instance trying to
figure out why the weight is a certain value, or why the target number for
a success test is a certain value.

The base `ValueModifier` provides this basic but useful functionality.

Other subclasses of `ValueModifier` build on this to provide specialized
forms of modifiers, such as `ImpactModifier` to track modifiers to impact
values or the `CombatModifier` to track Attack/Defense modifiers or the
`MasteryLevelModifier` to track changes to Mastery Level values.

### Success Test Results

SoHL defines a "success test" as a roll against a target number, the result of
which is a Success Level. At its most basic, if the roll succeeds, the Success
level is set to 1; if it fails, the success level is set to 0. Any success level
greater than 0 is considered success, any success level less than or equal to zero
is failure.

The success level can be affected by critical rules. If a critical success rule
is triggered, the success level is set to 2; if the critical failure rule is triggered,
the success level is set to -1.

Modifiers can be specified to the Success Level of a test, resulting in Success
Levels greater than 2 or less than -1. These represent higher levels of
"criticalness", the meaning of which will depend on what is being tested.

The `SuccessTestResult` class tracks the results of a success test, so that
it may be used and evaluated at a later time. These results can be transferred
over time (by persisting the object), and questions regarding the modifiers
that led to the result can be queried, and the result can even be modified
retroactively by changing the modifiers after the fact without reperforming
the roll (it remembers the results of the roll that resulted in the result).

## Build System

For day-to-day development and release work, the expected workflow is:

1. Run `npm run build`.
    - Compiles typescript into javascript
    - Generates CSS
    - Generates Item and Actor pack source from YAML
    - Generates JournalEntry pack source from markdown documentation
    - Generates system.json file
    - Performs unit tests and generates coverage
    - Bundles and minifies the code into sohl.js file and completes staging

2. If validating in the development Foundry environment, run `npm run push:dev`.

    Push targets are locally-configured via environment variables:
    - `SOHL_DEV_SYSTEM_DIR`
    - `SOHL_QA_SYSTEM_DIR`
    - `SOHL_PROD_SYSTEM_DIR`

    These values are standard `rsync` destinations (local path or `host:/path`).
    If a stage is requested and its variable is unset/blank, the push command exits with an error.

    Do not push these files to GitHub; the paths will differ based on machine
    and should be kept local only.

3. When ready to release, run `npm run deploy:release`.
    - Builds and packages release artifacts (`build/dist/system.zip` and `build/dist/system.json`).

### Versioning with Changesets

SoHL uses Changesets to track release notes and drive version bumps in a
structured way.

- Create a changeset for user-facing changes: `npm run changeset`
- Validate changesets in CI or before merge: `npm run changeset:check`
- Apply queued version bumps/changelog updates: `npm run changeset:version`

Repository config lives in `.changeset/config.json` (base branch `master`,
GitHub changelog integration enabled for `HeroicLands/Song-of-Heroic-Lands-FoundryVTT`).

Typical maintainer flow:

1. Add/update code.
2. Add a changeset if the change should be released.
3. Run `npm run build`.
4. Push to dev (`npm run push:dev`) for system testing.
5. When ready, run `npm run deploy:release`.

When not to add a changeset:

- Pure refactors with no behavior change.
- Test-only changes.
- Documentation-only edits.
- Internal tooling/chore work that does not affect runtime behavior or released content.

## Variants: Legendary and Misty Isle

Variants are complete rules-family implementations built on top of the same core SoHL framework.
They allow SoHL to support different gameplay flavors without forking the entire system.

Why variants matter:

- Keep one shared core for stability, bug fixes, and common tooling.
- Allow variant-specific rules behavior, sheets, and result/modifier logic where needed.
- Preserve portability and maintainability by isolating differences to variant layers.

Variants live under:

- `src/legendary/*`
- `src/mistyisle/*`

Pattern:

- Variant-specific System class (e.g., `LegendarySystem.ts`, `MistyIsleSystem.ts`)
- Variant-specific Actors/Items/Modifiers/Results prefixed with `Lgnd*` / `Isle*`

Intended usage:

- The core (`src/common`) defines general behaviors and contracts.
- Variants override/extend only what differs.

### Variant-invariant types

Many actor and item types are **variant-invariant**: their logic, data model, and sheet are fully defined in `src/common/` and shared across all variants with no overrides. Only types that have genuine variant-specific behavior (e.g., Being, Skill, combat gear types) have Legendary or MistyIsle overrides.

See the [Type Catalog](../reference/type-catalog.md#variant-invariance) for the complete classification of which types are variant-invariant vs. variant-specific.

Runtime selection (implemented in `src/sohl.ts` + `src/common/SohlSystem.ts`):

- Available variants are registered at startup via `SohlSystem.registerVariant(...)`.
- A world setting (`sohl.variant`) selects the active variant.
- `SohlSystem.selectVariant(...)` returns the selected variant.
- The selected variant's `CONFIG` is merged into Foundry `CONFIG` and its sheets are set up.

## Document Lifecycle

The lifecycle is the ordered process SoHL uses to prepare actor and item state each data-preparation pass.
In SoHL, this process is explicitly phased: `initialize` → `evaluate` → `finalize`.

Why this is significant:

- It creates predictable phase boundaries for derived data and cross-item dependencies.
- It ensures virtual and embedded items are fully initialized before evaluation/finalization logic depends on them.
- It defines safe extension timing for hooks and Action items, reducing race conditions and inconsistent state.

Concrete extension flow currently implemented in `src/common/actor/SohlActor.ts`:

1. `prepareBaseData()` resets caches and runs actor logic `initialize()`.
2. `prepareEmbeddedData()` runs **all item `initialize()`** calls (embedded + virtual), then freezes the item cache.
3. `prepareEmbeddedData()` then runs **all item `evaluate()`** calls.
4. `prepareEmbeddedData()` then runs **all item `finalize()`** calls.
5. During each item stage (`postInitialize`, `postEvaluate`, `postFinalize`):

- emits `Hooks.callAll("sohl.<itemType>.<stage>", item, ctx)`
- looks up lifecycle-named Action items and executes them.

6. `prepareDerivedData()` runs actor logic `evaluate()` and then `finalize()`.

This is a phased lifecycle model (`initialize` → `evaluate` → `finalize`) and differs from Foundry's typical per-document "do everything in one pass" mental model.

For full lifecycle invariants and safe extension rules, see `docs/concepts/lifecycle-model.md`.

## Architectural “guardrails”

1. Variants should never create new types, only extend existing types.
2. Data model is specified and locked by the common Data Model classes. Variants may not modify or extend the data model; if they have additional properties to persist, they should be placed in flags on the document under `sohl.<variant>.<whatever>`.
3. Keep localization keys stable.
4. Keep system initialization predictable and explicit.

## Where to learn more

- Developer docs index: `docs/dev/README.md`
- Developer extension points: `docs/how-to/extension-points.md`
- House rule implementation patterns: `docs/how-to/house-rules-cookbook.md`
- Lifecycle model: `docs/concepts/lifecycle-model.md`
- Combat resolution details: `docs/reference/combat-resolution-pipeline.md`
- Modifier internals: `docs/reference/modifier-model.md`
- Effects internals: `docs/reference/effects-integration.md`
- Runtime contracts and registries: `docs/reference/runtime-contracts.md`
- Scene/token/combatant systems: `docs/reference/scene-token-combatant.md`
- API reference (generated): TypeDoc HTML output (see build docs)
