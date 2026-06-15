# Getting Started (New Developer Guide)

> **Audience:** Someone who just cloned the repo and wants to understand the codebase.

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](./extension-points.md).

## Prerequisites

- Node.js ≥ 24 (see `engines` in `package.json`)
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

| Command               | What it does                             |
| --------------------- | ---------------------------------------- |
| `npm run build`       | Full pipeline: types → test → bundle     |
| `npm run build:types` | TypeScript compilation only (fast check) |
| `npm run test`        | Run vitest                               |
| `npm run test:watch`  | Watch mode                               |
| `npm run push:qa`     | Sync build to QA Foundry instance        |
| `npm run docs`        | Generate TypeDoc                         |

## How to read the codebase

### Start here

1. **[Architecture Overview](../concepts/architecture.md)** — the mental model. Read this first.
2. **[src/core/SohlLogic.ts](../../src/core/SohlLogic.ts)** — the abstract base for all Logic classes. The class-level JSDoc explains the phase-batched lifecycle.
3. **Pick one item type** and trace through its three classes:
    - Logic: `src/document/item/logic/SkillLogic.ts` (business rules)
    - DataModel: `src/document/item/foundry/SkillDataModel.ts` (persisted schema)
    - Sheet: `src/document/item/foundry/SkillSheet.ts` (UI)

### The mental model

The design and rationale live in the concept docs — read them there rather than duplicated here, so there's a single source of truth that can't drift:

- **[Three-class pattern](../concepts/architecture.md#three-class-pattern)** — every actor/item type splits into a Foundry-free Logic class (game rules), a DataModel (persisted schema), and a Sheet (UI), plus how to reach a document's data via `logic.data`.
- **[Phase-batched lifecycle](../concepts/architecture.md#phase-batched-lifecycle)** and **[Lifecycle Model](../concepts/lifecycle-model.md)** — how `initialize → evaluate → finalize` map onto Foundry's `prepare*` hooks, and the barriers that let sibling items depend on one another.
- **[Domain objects](../concepts/architecture.md#domain-objects)** — the `src/domain/` value objects (modifiers, results, body, movement, actions), rebuilt from persisted data each preparation cycle.
- **[FoundryHelpers shim](../concepts/architecture.md#foundryhelpers-shim)** — how Logic stays Foundry-free: the `fvtt` prefix convention, and `sohl.log.uiWarn` / `sohl.log.uiError` for notifications.

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
└── contributing/ Contribution workflow, changesets, system development
```

User guide content is authored in the HeroicLands Obsidian vault, committed here as JSON under `assets/packs/journals/_source/`, and compiled into Foundry journal entries during build (see [Build & Deployment §5](./build-and-deployment.md#5-compendium-packs-and-the-obsidian-vault)).

## Where to find things

| I want to...                      | Look at...                                                    |
| --------------------------------- | ------------------------------------------------------------- |
| Understand the architecture       | [Architecture](../concepts/architecture.md)                   |
| See all actor/item types          | [Type Catalog](../reference/type-catalog.md)                  |
| Understand how values are tracked | [Modifier Model](../reference/modifier-model.md)              |
| Understand combat resolution      | [Combat Pipeline](../reference/combat-resolution-pipeline.md) |
| Understand hit locations          | [Body Structure](../reference/body-structure.md)              |
| Add house rules via module        | [Lifecycle Hooks](./lifecycle-hooks.md)                       |
| Add per-item behavior             | [Macros and Actions](./macros-and-actions.md)                 |
| Write tests                       | [Testing](./testing.md)                                       |
| Understand active effects         | [Effects Integration](../reference/effects-integration.md)    |
