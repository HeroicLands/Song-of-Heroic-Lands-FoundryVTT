# SoHL Architecture

> **Audience:** Developers, contributors, and anyone needing a mental model of the system.

See also: [Documentation Hub](../README.md), [Extension Points](../how-to/extension-points.md), [Lifecycle Model](./lifecycle-model.md).

## What SoHL is

Song of Heroic Lands (SoHL) is a Foundry VTT game system implementing HârnMaster-compatible gameplay with deep automation: actors, items, active effects, combat resolution, chat cards, UI sheets, localization, and compendium content. All code targets Foundry VTT v14+.

## Directory structure

```
src/
├── core/                  Foundry-layer foundations
│   ├── FoundryHelpers.ts      Foundry API shim (mock-swapped in tests)
│   ├── SohlSystem.ts          Central registry and CONFIG
│   ├── SohlDataModel.ts       Abstract base for all DataModels
│   ├── SohlLogic.ts           Abstract base for all Logic classes
│   ├── SohlCalendar.ts        Game world calendar
│   ├── SohlSpeaker.ts         Chat message identity
│   ├── SohlActionContext.ts   Context passed to action execution
│   └── SohlEventQueue.ts     Timed event scheduling
│
├── domain/                Pure game-mechanics objects (no Foundry deps)
│   ├── action/                Action definitions (SohlAction)
│   ├── body/                  Body structure (BodyStructure, BodyPart, BodyLocation)
│   ├── modifier/              Value tracking (ValueModifier, MasteryLevelModifier, etc.)
│   ├── movement/              Move-base helpers (readBaseMove)
│   ├── result/                Test results (SuccessTestResult, CombatResult, etc.)
│   └── SkillBase.ts           Skill base formula computation
│
├── document/              Foundry document classes
│   ├── actor/
│   │   ├── foundry/           DataModel + Sheet classes (BeingDataModel, BeingSheet, etc.)
│   │   └── logic/             Logic classes + Data interfaces (BeingLogic, CohortLogic, etc.)
│   ├── item/
│   │   ├── foundry/           DataModel + Sheet classes
│   │   └── logic/             Logic classes + Data interfaces
│   ├── effect/                SohlActiveEffect
│   ├── combat/                SohlCombat
│   ├── combatant/             SohlCombatant + combat tracker hooks
│   ├── token/                 SohlTokenDocument
│   └── scene/                 SohlScene
│
├── utils/                 Shared utilities
│   ├── constants.ts           Type enums, action definitions, metadata
│   ├── helpers.ts             Pure utility functions
│   ├── SimpleRoll.ts          Foundry-free dice primitive
│   ├── SohlContextMenu.ts    Context menu integration
│   └── SohlLogger.ts         Logging
│
├── sohl.ts                Entry point (Foundry hooks, system registration)
│
templates/                 Handlebars templates (.hbs only)
├── actor/                     Actor sheets
├── item/                      Item sheets
├── chat/                      Chat card templates
├── dialog/                    Dialog templates
└── effect/                    Effect config templates

tests/                     Vitest test suite (mirrors src/ structure)
docs/                      Developer documentation
assets/                    Compendium data, icons, templates
lang/                      Localization (en.json)
```

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

## Document types

### Actors (5)

| Type | Class | Description |
|------|-------|-------------|
| `being` | `BeingLogic` | Individual person or creature with full anatomy, skills, and gear |
| `cohort` | `CohortLogic` | Group of actors acting as a unit |
| `structure` | `StructureLogic` | Fixed installation or building |
| `vehicle` | `VehicleLogic` | Movable platform (wagon, ship) |
| `assembly` | `AssemblyLogic` | Item container for grouping related items |

### Items (14)

| Type | Class | Description |
|------|-------|-------------|
| `skill` | `SkillLogic` | Trained capability with mastery level |
| `trait` | `TraitLogic` | Innate characteristic or attribute |
| `affliction` | `AfflictionLogic` | Ongoing condition (disease, poison, curse) |
| `injury` | `InjuryLogic` | Specific harm instance (wound/trauma) |
| `affiliation` | `AffiliationLogic` | Faction or group membership |
| `armorgear` | `ArmorGearLogic` | Wearable protection |
| `weapongear` | `WeaponGearLogic` | Weapon with strike modes |
| `miscgear` | `MiscGearLogic` | General equipment |
| `containergear` | `ContainerGearLogic` | Inventory container |
| `concoctiongear` | `ConcoctionGearLogic` | Consumable mixture |
| `projectilegear` | `ProjectileGearLogic` | Ammunition |
| `combattechnique` | `CombatTechniqueLogic` | Combat maneuver with strike modes |
| `mystery` | `MysteryLogic` | Mystical concept grouping abilities |
| `mysticalability` | `MysticalAbilityLogic` | Specific magical power or spell |

All type constants are defined in `src/utils/constants.ts` via `ACTOR_KIND` and `ITEM_KIND` enums. See the [Type Catalog](../reference/type-catalog.md) for full details.

## Phase-batched lifecycle

Foundry VTT processes each embedded item fully before moving to the next, so sibling items cannot depend on each other. SoHL overrides `prepareEmbeddedData()` to run three **phase-batched** passes across all items with barriers between them:

1. **initialize** — set up base state from persisted data. Cannot read sibling items.
2. **evaluate** — compute derived values using sibling items' initialized state.
3. **finalize** — resolve cross-item dependencies requiring evaluated state.

See [Lifecycle Model](./lifecycle-model.md) for the full rationale and rules.

## Domain objects

Game-mechanics value objects in `src/domain/` are rebuilt from persisted data each preparation cycle. They may be mutated during the lifecycle (e.g., active effects adding modifiers), but mutations are not persisted.

| Directory | Key classes | Purpose |
|-----------|-------------|---------|
| `domain/modifier/` | `ValueModifier`, `MasteryLevelModifier`, `ImpactModifier`, `CombatModifier` | Auditable tracked values with base + deltas |
| `domain/result/` | `SuccessTestResult`, `OpposedTestResult`, `AttackResult`, `DefendResult`, `CombatResult` | Test and combat resolution outcomes |
| `domain/body/` | `BodyStructure`, `BodyPart`, `BodyLocation` | Anatomical structure with weighted hit location selection |
| `domain/movement/` | `readBaseMove` | Per-medium base move lookup used by `BeingLogic.effectiveBaseMove` |
| `domain/action/` | `SohlAction` | Executable action definitions (context menu entries, chat buttons) |
| `domain/` | `SkillBase` | Skill base formula computation from traits |

See [Modifier Model](../reference/modifier-model.md), [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md), [Body Structure](../reference/body-structure.md).

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
