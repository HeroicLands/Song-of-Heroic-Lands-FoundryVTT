# SoHL Architecture

> **Audience:** Developers, contributors, and anyone needing a mental model of the system.

See also: [Documentation Hub](../README.md), [Extension Points](../how-to/extension-points.md), [Lifecycle Model](./lifecycle-model.md).

> **New to the codebase? Start here.** Read this page top to bottom for the mental model, then branch out through the [Where to learn more](#where-to-learn-more) index at the end.

## What SoHL is

Song of Heroic Lands (SoHL) is a Foundry VTT game system implementing HârnMaster-compatible gameplay with deep automation: actors, items, active effects, combat resolution, chat cards, UI sheets, localization, and compendium content. All code targets Foundry VTT v14+.

## Directory structure

```
src/
├── core/        Foundry-layer foundations: system registration, the DataModel
│                and Logic base classes, the FoundryHelpers shim, calendar, events.
├── domain/      Pure, Foundry-free game-mechanics objects: modifiers, test
│                results, body structure, actions, movement, skill base.
├── document/    Foundry document classes, grouped by kind:
│   ├── actor/       actors — foundry/ holds DataModel + Sheet, logic/ holds Logic + Data
│   ├── item/        items  — same foundry/ + logic/ split
│   └── effect/ · combat/ · combatant/ · token/ · scene/   the other document kinds
├── apps/        Standalone Foundry application windows.
├── utils/       Shared utilities: constants/enums, helpers, dice, context menus, logging.
└── sohl.ts      Entry point: Foundry hooks and system registration.

templates/       Handlebars (.hbs) templates: actor, item, chat, dialog, effect.
tests/           Vitest suite (mirrors src/).
docs/            Developer & API documentation.
assets/          Compendium data, icons, templates.
lang/            Localization (en.json).
```

This map stays at the **directory level** on purpose. Directories are stable; the specific files inside them get added, renamed, and moved between `foundry/` and `logic/`. For the actual classes in any folder, consult the API reference, whose navigation mirrors this layout (see next section) and is regenerated from source on every build.

## How the API reference is organized

The generated [API reference](https://api.heroiclands.org/latest) mirrors this directory layout. Its sidebar groups every public symbol the same way the source is grouped — **Core**, **Documents** (`Actor`, `Item`, `Combat`, `Combatant`, `Chat`, `Effect`, `Scene`, `Token`), **Domain** (`Action`, `Body`, `Modifier`, `Movement`, `Result`, `StrikeMode`, `SkillBase`), **Utility** (`AI`, `Collection`, `Constants`, `Helpers`), and **Applications** — so a folder here maps directly to a navigation group there. Start from the group that matches the area you're working in.

## Three-layer architecture

### Foundry layer

Document classes (`SohlActor`, `SohlItem`, `SohlActiveEffect`) handle Foundry VTT integration: persistence, data preparation lifecycle, sheet rendering, and document operations. These live in `src/document/*/foundry/` and `src/core/`.

### Logic layer

Logic classes handle game rules, calculations, and actions — separated from Foundry persistence. They live in `src/document/*/logic/` and must **never** import Foundry globals directly. All Foundry API access goes through `src/core/FoundryHelpers.ts`, which is mock-swapped during testing.

### Domain layer

Pure game-mechanics objects in `src/domain/` — modifiers, test results, body structure, move-base helpers, skill base computation. These have no Foundry dependency at all and are fully unit-testable.

### Presentation layer

Sheet classes and Handlebars templates (`.hbs`) handle UI. Sheets extend `SohlActorSheetBase` or `SohlItemSheetBase`. Chat cards use templates in `templates/chat/`.

## Three-class pattern

Every actor and item type is split into three classes across two directories:

1. **Logic class** (e.g., `SkillLogic` in `item/logic/SkillLogic.ts`) — business logic, calculations, actions. Participates in the phase-batched lifecycle: `initialize()` → `evaluate()` → `finalize()`. Also contains the Data interface.

2. **DataModel class** (e.g., `SkillDataModel` in `item/foundry/SkillDataModel.ts`) — extends Foundry `TypeDataModel`, defines the persisted schema via `defineSchema()`.

3. **Sheet class** (e.g., `SkillSheet` in `item/foundry/SkillSheet.ts`) — UI presentation, extends the appropriate sheet base class.

The `logic/` directory contains code that can run and be tested without Foundry VTT. The `foundry/` directory contains code that depends on the Foundry runtime.

### Accessing a document's data and logic

At runtime, `document.system` is the **DataModel** instance and `document.logic` (≡ `document.system.logic`) is the **Logic**. The DataModel implements the type's `*Data` interface, so the persisted fields are the same object whichever way you reach them.

For typed, documented access, prefer **`document.logic.data`**. `SohlLogic.data` returns the `*Data` interface — e.g. `skillItem.logic.data` is typed `SkillData` — so editors autocomplete the fields and the API reference links straight to the shape. `document.system` holds the identical object but is typed as the Foundry-internal DataModel class (excluded from the API docs).

- `actor.logic.data.foo` — fully typed via the public `*Data` interface (**recommended**).
- `actor.system.foo` — the same value, but typed as the internal DataModel.

So to discover what's available on a document, read its `*Data` interface (the shape of `system` / `logic.data`) and its Logic class (computed properties, intrinsic actions). The DataModel and Sheet classes are Foundry binding and are intentionally absent from the API docs.

## Document types

SoHL defines several **actor** and **item** types, each following the three-class pattern above. The exact set drifts as types are added or renamed, so this page does not enumerate them — consult the authoritative sources instead:

- `ACTOR_KIND` and `ITEM_KIND` in `src/utils/constants.ts` — the canonical set of type codes.
- [Type Catalog](../reference/type-catalog.md) — what each type is and how they interact.
- The API reference — every type's classes, under **Documents → Actor** and **Documents → Item**.

In short: **actors** model the entities in the world — individual beings and creatures, groups, structures, vehicles, and item-container assemblies. **Items** model the capabilities and possessions an actor carries — skills, traits, gear, afflictions and injuries, combat techniques, and mystical abilities.

## Phase-batched lifecycle

Foundry VTT processes each embedded item fully before moving to the next, so sibling items cannot depend on each other. SoHL overrides `prepareEmbeddedData()` to run three **phase-batched** passes across all items with barriers between them:

1. **initialize** — set up base state from persisted data. Cannot read sibling items.
2. **evaluate** — compute derived values using sibling items' initialized state.
3. **finalize** — resolve cross-item dependencies requiring evaluated state.

See [Lifecycle Model](./lifecycle-model.md) for the full rationale and rules.

## Domain objects

Game-mechanics value objects in `src/domain/` are rebuilt from persisted data each preparation cycle. They may be mutated during the lifecycle (e.g., active effects adding modifiers), but mutations are not persisted.

| Directory | Purpose |
|-----------|---------|
| `domain/modifier/` | Auditable tracked values built from a base plus ordered deltas. |
| `domain/result/` | Test and combat resolution outcomes. |
| `domain/body/` | Anatomical structure with weighted hit-location selection. |
| `domain/movement/` | Per-medium base-move lookup. |
| `domain/action/` | Executable action definitions (context-menu entries, chat buttons). |
| `domain/` (top level) | Skill-base formula computation. |

For the classes in each area, see **Domain** in the API reference, and [Modifier Model](../reference/modifier-model.md), [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md), and [Body Structure](../reference/body-structure.md).

## Active Effects

`SohlActiveEffect` extends Foundry's ActiveEffect with an extended targeting model:

- `targetType`: `this` (self), `actor` (owning actor), or `<itemType>` (other items on actor)
- `targetName`: regex pattern matched against item shortcodes

See [Effects Integration](../reference/effects-integration.md).

## Extension mechanisms

SoHL provides two levels of extension for customizing behavior without modifying core source:

1. **Modules via lifecycle hooks** — Foundry modules listen for hooks emitted at each lifecycle phase to augment behavior broadly across items or actors. See [Lifecycle Hooks](../how-to/lifecycle-hooks.md).

2. **Action items** — document-attached executable logic for per-item overrides. See [Actions](../how-to/actions.md).

## FoundryHelpers shim

`src/core/FoundryHelpers.ts` wraps all Foundry VTT globals (`game`, `canvas`, `Hooks`, `Roll`, etc.) behind a stable API. During testing, vitest swaps it for a mock. Logic classes must import from FoundryHelpers, never from Foundry directly.

Shim exports use the `fvtt` prefix (e.g., `fvttGetSetting`, `fvttCallHook`). Functions that don't wrap globals (e.g., `inputDialog`, `getContextItem`) use plain names.

For UI notifications, use `sohl.log.uiWarn` / `sohl.log.uiError` (SohlLogger), not the shim.

## Build system

```bash
npm run build              # Full pipeline: types → test → bundle
npm run build:types        # TypeScript compilation only
npm run build:code         # Vite bundle
npm run build:css          # Sass compilation
npm run test               # Vitest
npm run push:qa            # Sync to QA Foundry instance
npm run docs               # Generate TypeDoc
```

Build output goes to `build/stage/`, which mirrors the Foundry system directory. `system.json` is generated from `assets/templates/system.template.json`.

## Actor state sovereignty

**An actor — together with its token and combatant — is the sole authority over its own state.** An actor's logic or client may mutate only **itself**; it must never write directly to another actor (or another actor's token or combatant).

Any effect one actor would impose on another is mediated by a **chat-message handshake**:

1. The **source** resolves its own side — rolls the attack, the spell-success test, etc. — mutating only itself.
2. On success it posts a chat card with a button **addressed to the target's owner**, whose label states unambiguously what is being acknowledged or applied.
3. The **target's owning client** clicks it, runs any required test first (e.g. a resistance roll), and applies the change **to itself**.

Example: a wizard casts Sleep on a victim. The wizard rolls to land the spell; on success the card shows the *victim's* owner a button ("Acknowledge you fall asleep", possibly gated behind a resistance test). The victim's client marks the victim asleep — the wizard never touches the victim's state.

**Why:** Foundry permissions — a client can only reliably update documents it owns — and player accountability: each player (the GM owns all actors) stays in control of, and every cross-actor consequence stays visible in chat for, their own character.

This already underlies automated combat: defense buttons dispatch to the *defender's* client, and the "Calculate Injury" button resolves on the *target's* client. To implement a new cross-actor mechanic, follow [Extension Points → Cross-actor effects](../how-to/extension-points.md#cross-actor-effects-the-acknowledge-button-pattern).

## Architectural rules

1. **Logic layer stays Foundry-free.** All Foundry API calls go through `FoundryHelpers.ts`.
2. **Extension over rewrites.** Use hooks and action items, not source modifications.
3. **Backwards compatibility.** Never rename data fields without a migration strategy.
4. **No global search-and-replace.** Cross-cutting changes must be scoped and validated.
5. **Stable localization keys.** Never rename keys in `lang/en.json` — add new ones.
6. **Small, focused changes.** One feature or fix per PR.
7. **Complete implementations.** No placeholder stubs.
8. **Actor state sovereignty.** An actor mutates only itself; cross-actor effects go through a target-addressed chat acknowledge button (see above).

## Where to learn more

| Topic | Document |
|-------|----------|
| Lifecycle phases | [Lifecycle Model](./lifecycle-model.md) |
| Extending SoHL | [Extension Points](../how-to/extension-points.md) |
| Lifecycle hooks | [Lifecycle Hooks](../how-to/lifecycle-hooks.md) |
| Action items | [Actions](../how-to/actions.md) |
| Combat resolution | [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md) |
| Modifier system | [Modifier Model](../reference/modifier-model.md) |
| Body anatomy | [Body Structure](../reference/body-structure.md) |
| Active effects | [Effects Integration](../reference/effects-integration.md) |
| Testing | [Testing Guide](../how-to/testing.md) |
| Type catalog | [Type Catalog](../reference/type-catalog.md) |
| Runtime contracts | [Runtime Contracts](../reference/runtime-contracts.md) |
