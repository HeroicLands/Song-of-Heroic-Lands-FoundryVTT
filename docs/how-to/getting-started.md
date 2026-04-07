# Getting Started (New Developer Guide)

> **Audience:** Someone who just cloned the repo and wants to understand the codebase.

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](./extension-points.md).

## Prerequisites

- Node.js (LTS)
- Git
- A local Foundry VTT v14+ installation (for testing in-browser)

## Setup

```bash
git clone <repo-url>
cd Song-of-Heroic-Lands-FoundryVTT
cp .env.local.example .env.local
# Edit .env.local to set FOUNDRYVTT_DEV_DATA, FOUNDRYVTT_QA_DATA, etc.
npm ci
npm run build
```

If the build succeeds, you're ready. If tests fail, check `tests/setup.ts` — it configures the mock Foundry environment.

## Key commands

| Command | What it does |
|---------|-------------|
| `npm run build` | Full pipeline: types → test → bundle |
| `npm run build:types` | TypeScript compilation only (fast check) |
| `npm run test` | Run vitest |
| `npm run test:watch` | Watch mode |
| `npm run push:qa` | Sync build to QA Foundry instance |
| `npm run docs` | Generate TypeDoc |

## How to read the codebase

### Start here

1. **[Architecture Overview](../concepts/architecture.md)** — the mental model. Read this first.
2. **[src/core/SohlLogic.ts](../../src/core/SohlLogic.ts)** — the abstract base for all Logic classes. The class-level JSDoc explains the phase-batched lifecycle.
3. **Pick one item type** and trace through its three classes:
   - Logic: `src/document/item/logic/SkillLogic.ts` (business rules)
   - DataModel: `src/document/item/foundry/SkillDataModel.ts` (persisted schema)
   - Sheet: `src/document/item/foundry/SkillSheet.ts` (UI)

### The three-class pattern

Every actor and item type follows the same split:

```
Logic class (in logic/)     — game rules, calculations, lifecycle methods
DataModel class (in foundry/) — Foundry schema, persisted fields
Sheet class (in foundry/)     — UI presentation
```

Logic classes are Foundry-free and unit-testable. DataModel and Sheet classes depend on the Foundry runtime.

### Data flow

```
Persisted data (DataModel schema)
    ↓ prepareBaseData
Actor logic.initialize()
    ↓ prepareEmbeddedData (overridden)
All items: logic.initialize()  ← phase 1
All items: logic.evaluate()    ← phase 2 (can read sibling items)
All items: logic.finalize()    ← phase 3 (can read evaluated state)
    ↓ prepareDerivedData
Actor logic.evaluate()
Actor logic.finalize()
    ↓
Sheet reads logic properties for rendering
```

See [Lifecycle Model](../concepts/lifecycle-model.md) for why this ordering matters.

### Domain objects

Pure game-mechanics objects live in `src/domain/`:

| Directory | What's there |
|-----------|-------------|
| `domain/modifier/` | `ValueModifier` — the core tracked-value primitive. Almost every derived number is a ValueModifier. |
| `domain/result/` | Test and combat results — the output of skill checks, attacks, defenses. |
| `domain/body/` | Body structure — anatomy, hit locations, aimed strike resolution. |
| `domain/movement/` | Movement profiles per medium. |
| `domain/action/` | Action definitions — context menu entries and executable logic. |
| `domain/SkillBase.ts` | Skill base formula computation from traits. |

These are rebuilt from persisted data each preparation cycle and may be mutated during the lifecycle, but mutations are not persisted.

### FoundryHelpers shim

`src/core/FoundryHelpers.ts` wraps all Foundry globals. Logic classes import from it (e.g., `import { fvttGetSetting } from "@src/core/FoundryHelpers"`). During testing, vitest swaps it for a mock at `tests/mocks/foundry/core/FoundryHelpers.ts`.

Exports that wrap Foundry globals use the `fvtt` prefix. Functions that don't (e.g., `inputDialog`, `getContextItem`) use plain names.

For UI notifications, use `sohl.log.uiWarn` / `sohl.log.uiError`, not the shim.

## How to make a change

### Bug fix or small feature

1. Read the relevant Logic class and its tests.
2. Write a failing test first (TDD).
3. Make the minimal code change.
4. Run `npm run build:types && npm run test`.
5. Update JSDoc if you changed public API.

### New item type

See [Extension Points — Item type extension](./extension-points.md#2-actor-and-item-type-extension) for the full checklist.

### Adding a domain object

Follow the pattern in `src/domain/body/`:
1. Create the class with a `Data` interface for the persisted shape.
2. Construct it during `initialize()` from DataModel data.
3. Add `updatePath` and array helper methods if it wraps persisted arrays.
4. Write tests in `tests/domain/`.

## Testing

Tests use vitest with a Node environment — no Foundry VTT running.

- Logic classes are tested by providing mock parent objects.
- Domain objects (modifiers, results, body structure) are tested directly.
- Foundry globals are shimmed via the `FoundryHelpers` mock.

See [Testing Guide](./testing.md) for the full setup.

## Documentation structure

```
docs/
├── concepts/     Architecture, lifecycle model, assembly design
├── how-to/       Extension points, hooks, actions, testing, this guide
├── reference/    Type catalog, modifier model, combat pipeline, body structure,
│                 effects integration, runtime contracts
└── dev/          Developer docs index
```

User guide source: `assets/packs/journals/data/user-guide/*.md` — compiled into Foundry journal entries during build.

## Where to find things

| I want to... | Look at... |
|--------------|-----------|
| Understand the architecture | [Architecture](../concepts/architecture.md) |
| See all actor/item types | [Type Catalog](../reference/type-catalog.md) |
| Understand how values are tracked | [Modifier Model](../reference/modifier-model.md) |
| Understand combat resolution | [Combat Pipeline](../reference/combat-resolution-pipeline.md) |
| Understand hit locations | [Body Structure](../reference/body-structure.md) |
| Add house rules via module | [Lifecycle Hooks](./lifecycle-hooks.md) |
| Add per-item behavior | [Actions](./actions.md) |
| Write tests | [Testing](./testing.md) |
| Understand active effects | [Effects Integration](../reference/effects-integration.md) |
