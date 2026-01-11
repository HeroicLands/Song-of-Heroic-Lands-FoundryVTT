# Song of Heroic Lands (SoHL) - AI Coding Agent Instructions

This is a **Foundry VTT game system** implementing HârnMaster-compatible rules. The codebase uses TypeScript with Vite build tooling and follows a variant-based architecture pattern.

## Architecture Overview

### Variant System Pattern

The system supports multiple rule variants (e.g., "legendary", "mistyisle") through a registration pattern:

- Base implementations live in `src/common/`
- Variant-specific extensions live in `src/legendary/` and `src/mistyisle/`
- [`src/sohl.ts`](src/sohl.ts) registers variants via `SohlSystem.registerVariant()` and selects based on world settings
- Each variant extends common classes (e.g., `LgndBeingLogic extends BeingLogic`)

### Data Model Architecture

All entities follow a **three-class pattern** (see examples in `src/common/actor/` and `src/common/item/`):

1. **Logic class** (e.g., `SkillLogic`) - business logic, calculations, actions
2. **DataModel class** (e.g., `SkillDataModel`) - extends FoundryVTT `DataModel`, defines schema via `defineSchema()`
3. **Sheet class** (e.g., `SkillSheet`) - UI presentation, extends `SohlItemSheetBase` or `SohlActorSheetBase`

Key base classes:

- [`SohlDataModel`](src/common/SohlDataModel.ts) - abstract base for all data models
- [`SohlLogic`](src/common/SohlLogic.ts) - abstract base for all logic classes
- [`SohlSystem`](src/common/SohlSystem.ts) - central system registry and configuration

### Actor & Item Types

- **Actors**: `being`, `cohort`, `structure`, `vehicle`, `assembly` (defined in `documentTypes` in system.json)
- **Items**: ~30+ types including `skill`, `trait`, `weapongear`, `armorgear`, `mystery`, etc.
- All types are catalogued in [`@utils/constants`](src/utils/constants.ts) via `ACTOR_KIND` and `ITEM_KIND` enums

### Path Aliases

TypeScript uses critical path aliases defined in [`tsconfig.json`](tsconfig.json) and [`vite.config.ts`](vite.config.ts):

```typescript
@common/* → src/common/*
@legendary/* → src/legendary/*
@mistyisle/* → src/mistyisle/*
@utils/* → src/utils/*
@types/* → types/*
```

## Build & Development Workflow

### Essential Commands

```bash
npm run build          # Full build: types → prepare → test → code
npm run build:noci     # Build without npm ci (for local dev)
npm run build:css      # Compile SCSS to CSS (sass compiler)
npm run test:coverage  # Run vitest with coverage
```

### Build Process Flow (from package.json)

1. `build:types` - TypeScript compilation (`tsc`)
2. `build:prepare` - Parallel: CSS compilation, system.json generation, compendium packing
3. `test:coverage` - Vitest tests
4. `build:code` - Vite bundles to `build/stage/sohl.js`

Output directory: `build/stage/` (mirrors FoundryVTT system structure)

### Compendium Data

- Source data: `assets/packs/*/` (JSON files)
- Build script: [`utils/packs/build-compendiums.mjs`](utils/packs/build-compendiums.mjs)
- Commands: `build:compiledb` (validate), `build:packdb` (pack to LevelDB), `build:unpackdb` (extract)

### system.json Generation

[`utils/build-system-json.mjs`](utils/build-system-json.mjs) merges `assets/templates/system.template.json` with `package.json` version and URLs.

## Critical Conventions

### File Headers

All TypeScript files require GPL-3.0 license headers (see any `.ts` file for template).

### Schema Definition Pattern

Data models use static `defineSchema()` returning a Foundry `DataSchema`:

```typescript
static defineSchema() {
    return {
        ...ParentDataModel.defineSchema(),  // Inherit parent schema
        newField: new foundry.data.fields.NumberField({ initial: 0 }),
    };
}
```

### Handlebars Templates

- Location: `templates/` (organized by chat/, dialog/, effect/, legendary/, mistyisle/)
- Loaded via Foundry's `loadTemplates()` in system initialization
- Access via `Handlebars.partials` or direct `renderTemplate()`

### Testing

- Test framework: Vitest
- Test location: `tests/**/*.test.ts`
- Mock Foundry globals in [`tests/mocks/foundry/`](tests/mocks/foundry/)
- Alias `@common/foundry-helpers` swapped during tests (see [`vitest.config.ts`](vitest.config.ts))

## Integration Points

### FoundryVTT API

- Version compatibility: v13+ (see `system.json` compatibility field)
- Core classes extend: `Actor`, `Item`, `ActiveEffect`, `Combat`, `Combatant`
- Config object: Merged in `setupVariant()` at init

### External Dependencies

- **Sass** for CSS compilation (not PostCSS)
- **Vite** for bundling (single entry point: `src/sohl.ts`)
- **TypeDoc** for documentation generation (see `docs:*` scripts)
- **FoundryVTT types** from `@league-of-foundry-developers/foundry-vtt-types`

### Document Lifecycle Hooks

Common hooks used: `init`, `setup`, `ready`, `renderActorSheet`, `preCreateActor`, etc. Search `Hooks.on` in [`src/sohl.ts`](src/sohl.ts) for registration patterns.

## Key Files to Reference

- [`src/sohl.ts`](src/sohl.ts) - System entry point, hook registration
- [`src/common/SohlSystem.ts`](src/common/SohlSystem.ts) - Variant registration and CONFIG merging
- [`src/common/SohlDataModel.ts`](src/common/SohlDataModel.ts) - Base data model with context menu and dialog utilities
- [`src/utils/constants.ts`](src/utils/constants.ts) - All enums, constants, actor/item type definitions
- [`vite.config.ts`](vite.config.ts) - Build configuration and path aliases
- [`build/stage/system.json`](build/stage/system.json) - Generated system manifest (do not edit directly)

## Common Pitfalls

1. **Never edit `build/stage/system.json` directly** - it's generated from `assets/templates/system.template.json`
2. **Path aliases must match** in both tsconfig.json and vite.config.ts for builds to work
3. **Logic classes need corresponding Logic export** - Logic classes are registered in `SohlSystem` constructor via `COMMON_ACTOR_LOGIC`, `COMMON_ITEM_LOGIC` maps
4. **Schema inheritance** - Always spread parent schema: `...ParentDataModel.defineSchema()`
5. **Variant pattern** - Common code goes in `src/common/`, variant-specific in `src/legendary/` or `src/mistyisle/`
