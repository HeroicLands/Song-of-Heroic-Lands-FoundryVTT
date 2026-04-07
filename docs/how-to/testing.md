# Testing

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](./extension-points.md)

SoHL uses **test-driven development (TDD)**. Tests are written before the code they verify. This ensures that every new feature, bug fix, or refactor starts with a clear specification of expected behavior, and that regressions are caught immediately.

## Running tests

```bash
npm run test           # Run vitest once
npm run test:watch     # Watch mode (re-runs on file changes)
npm run test:coverage  # Generate coverage report
```

Tests live in `tests/` mirroring the `src/` directory structure:

```
tests/
  setup.ts                          # Global test setup (runs before all tests)
  mocks/foundry/core/
    FoundryHelpers.ts               # Mock of the Foundry runtime shim
  utils/
    helpers.test.ts                 # Tests for src/utils/helpers.ts
    SimpleRoll.test.ts              # Tests for src/utils/SimpleRoll.ts
    ...
  common/
    modifier/
      ValueDelta.test.ts
      ValueModifier.test.ts
      ...
    result/
      SuccessTestResult.test.ts
      ...
    item/
      Action.test.ts
      ...
    actor/
      Being.test.ts
      ...
    SkillBase.test.ts
    SohlLogic.test.ts
    ...
```

## TDD workflow

1. **Write the test first.** Define what the code should do via test cases before writing any implementation.
2. **Run the test — it should fail.** This confirms the test is actually checking something.
3. **Write the minimum code** to make the test pass.
4. **Refactor** if needed, keeping tests green.
5. **Repeat** for the next behavior.

For placeholder tests, use `it.todo("description")` to document intended behavior that hasn't been implemented yet. These appear in test output as skipped items, serving as a backlog of work.

## Testing without Foundry VTT

SoHL tests run in Node.js via vitest — no browser, no Foundry VTT server. This is possible because of two mechanisms:

### 1. The Foundry runtime shim (`FoundryHelpers.ts`)

The file `src/core/FoundryHelpers.ts` is a thin wrapper around Foundry VTT globals that are only available inside a running Foundry environment:

- `game.*` (settings, user, actors, scenes, time)
- `canvas.*` (tokens)
- `Hooks.*` (callAll, onError)
- `foundry.utils.*` (mergeObject)
- `fromUuid` / `fromUuidSync` (document resolution)
- `Roll` (dice — converting `SimpleRoll` to Foundry Roll for chat display)
- `ChatMessage.*` (chat operations)
- `TextEditor.enrichHTML()` (rich text)
- `DialogV2.*` (dialogs)
- `DocumentSheetConfig` (sheet registration)

All exports that wrap Foundry globals use the `fvtt` prefix (e.g., `fvttGetSetting`, `fvttCallHook`). Functions that don't wrap globals (e.g., `inputDialog`, `getContextItem`) use plain names.

For UI notifications, use `sohl.log.uiWarn` / `sohl.log.uiError` (SohlLogger) instead of wrapping `ui.notifications` directly.

During testing, vitest swaps this module for a mock at `tests/mocks/foundry/core/FoundryHelpers.ts` via the alias configuration in `vitest.config.ts`:

```typescript
// vitest.config.ts
{
    find: "@src/core/FoundryHelpers",
    replacement: isTest
        ? path.resolve(__dirname, "tests/mocks/foundry/core/FoundryHelpers.ts")
        : undefined, // falls through to the normal @src/* alias
}
```

**What goes through the shim:** Only globals that Foundry VTT provides and that do not exist in Node.js. These are things you cannot construct or control yourself.

**What does NOT go through the shim:** The `globalThis.sohl` object (a `SohlSystem` instance) is entirely under SoHL's control. It provides localization (`sohl.i18n`), logging (`sohl.log`), variant configuration (`sohl.CONFIG`), and system identity (`sohl.id`). Since we own this object, we set it up directly in the test setup file rather than shimming it.

### 2. The test setup file (`tests/setup.ts`)

This file runs before all tests and provides:

- **`globalThis.sohl`** — A minimal `SohlSystem`-like object with working i18n (pass-through), logging (no-op), and CONFIG stubs.
- **`globalThis.foundry`** — Minimal stubs for `foundry.data.fields.*` (schema field constructors), `foundry.utils.*`, and other compile-time dependencies.
- **`globalThis.game`** — Stub game state (settings, user, actors, scenes).
- **Other Foundry globals** — `ui`, `Hooks`, `CONST`, `Roll`, `ChatMessage`, `Dialog`, etc.

### Design principle

The boundary is clear: **if SoHL controls it, test it directly. If Foundry provides it, shim it.**

| Dependency | Approach | Reason |
|---|---|---|
| `sohl.i18n.localize()` | Direct access | We own the SohlSystem object |
| `sohl.log.warn()` | Direct access | We own the logger |
| `sohl.CONFIG.ValueModifier` | Direct access | We own the CONFIG registry |
| `game.settings.get()` | Shim | Foundry game state |
| `ui.notifications.warn()` | Shim | Foundry UI |
| `Hooks.callAll()` | Shim | Foundry hook system |
| `Roll.create()` | Shim | Foundry dice engine |
| `fromUuidSync()` | Shim | Foundry document resolution |
| `foundry.data.fields.StringField` | Neither (type-only) | Compile-time schema constructors |

## Adding new shim functions

When production code needs a new Foundry global:

1. Add the wrapper function to `src/core/FoundryHelpers.ts` (use the `fvtt` prefix for the export name, e.g., `fvttGetSetting`)
2. Add the corresponding mock to `tests/mocks/foundry/core/FoundryHelpers.ts`
3. Import directly in the consuming file (e.g., `import { fvttGetSetting } from "@src/core/FoundryHelpers"`)
4. Do NOT shim `sohl.*` access — use it directly (e.g., `sohl.log.uiWarn` instead of wrapping `ui.notifications.warn`)

## Writing tests for Logic classes

Logic classes typically require parent data models, which require actors/items. For unit testing:

- **Pure computation** (e.g., `ValueDelta.apply()`, `SimpleRoll.median`) can be tested directly.
- **Logic with parent dependency** — create a minimal mock parent: `const mockParent = { id: "test", name: "Test" } as any;`
- **Logic that reads `sohl.CONFIG`** — set up the needed CONFIG entries in `globalThis.sohl.CONFIG` in a `beforeEach` block.
- **Complex integration tests** — use `it.todo()` placeholders to document what should be tested once more infrastructure is available.
