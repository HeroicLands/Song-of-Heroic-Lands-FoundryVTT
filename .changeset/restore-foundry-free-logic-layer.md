---
"sohl": minor
---

Restore the Foundry-free logic layer and make it enforceable and tested

The logic layer was designed to be unit-testable outside Foundry — logic
classes define Data interfaces that the Foundry DataModels implement, and
all Foundry API access flows through the `FoundryHelpers` shim. That
boundary had silently eroded: the base logic classes and Data interfaces
lived inside the Foundry document monoliths, the core `SohlLogic` root
value-imported Foundry-coupled modules, and a handful of logic/domain files
leaked runtime Foundry references. As a result every item/actor logic class
was un-importable (and untested) outside Foundry.

**Boundary restoration (no behavior change)**

- `SohlItemLogic`/`SohlItemData`/`SohlItemBaseLogic` moved from
  `foundry/SohlItem.ts` to `src/document/item/logic/SohlItemBaseLogic.ts`;
  same for the actor equivalents. The monoliths re-export them, so existing
  imports keep working. Document-type references in the logic layer are
  `import type` only (erased at compile time).
- The pure context-menu primitives (`ContextMenuEntry`, conditions,
  item/actor resolution) moved from the Foundry-coupled `SohlContextMenu`
  UI class into the new Foundry-free `src/utils/ContextMenuEntry.ts`;
  `SohlContextMenu` delegates and re-exports under its namespace.
- `combat-actions.ts` and `automated-combat.ts` moved from
  `actor/foundry/` to `actor/logic/` (they were already Foundry-free except
  for two token-targeting statics, now shimmed as
  `fvttGetTargetedTokens`/`fvttRangeToTarget` in FoundryHelpers).
- Strike-mode schema helpers access `foundry.data.fields` lazily inside
  the schema methods instead of at module load.
- Misc: vestigial/value imports converted to `import type` across the
  logic, domain, and core layers.

**Enforcement**

- New ESLint boundary rule (`@typescript-eslint/no-restricted-imports`,
  `allowTypeImports`) forbids value imports of Foundry-coupled modules
  from the Foundry-free zones. The previously broken `eslint.config.js`
  (uninstalled plugin, ESM `require`, typoed `project`) was rewritten as
  a working flat config; `npm run lint` runs again.
- New purity smoke test (`npm run test:purity`, wired into `build:noci`)
  imports every logic/domain module with **no** Foundry globals present,
  catching any module-level `foundry.*`/`game.*` access the lint patterns
  might miss.

**Unit tests for the logic layer**

- New harness (`tests/mocks/logicHarness.ts`) builds plain-object
  implementations of the Data interfaces, so logic classes construct
  exactly as `SohlDataModel.create()` does in production.
- The `it.todo` scaffolding across `tests/item/`, `tests/actor/`, and
  `tests/core/SohlLogic.test.ts` was converted into real unit tests for
  all implemented logic behavior; Foundry-layer (DataModel schema) stubs
  and unimplemented mechanics remain documented as todos.

**Bug fixes surfaced by the new tests**

- **Situational modifiers were silently dropped everywhere.** Six call
  sites (success/attack/defend tests, automated combat, BeingLogic) keyed
  the player situational-modifier delta as `VALUE_DELTA_ID.PLAYER`, which
  is `undefined` (the map is keyed by shortcode); the dialog-entered
  modifier never reached the roll.
- **`ValueModifier` operators redesigned to make that bug unrepresentable.**
  `add`/`multiply`/`set`/`floor`/`ceiling` previously dispatched on whether
  the first argument was an object, with `...args: any[]` signatures — so a
  two-argument call silently meant `(name, shortcode)` with no value, and the
  `undefined` first arg above slipped through untyped. They now have real
  typed overloads dispatched by arity:
    - `(shortcode, value)` — the shortcode must be a registered
      `VALUE_DELTA_INFO` member; the display name is resolved from the
      registry and an unknown shortcode **throws**.
    - `(name, shortcode, value)` — explicit, for ad-hoc deltas, unvalidated.
  The shortcode-only form takes a `ValueDeltaInfo`-typed argument, so the
  original `add(VALUE_DELTA_ID.PLAYER, value)` is now a compile error rather
  than a silent miss. The six situational-modifier sites become the clean
  `add(VALUE_DELTA_INFO.PLAYER, value)`. (The stricter typing also surfaced
  `DefendResult` adding a possibly-`undefined` modifier value, now guarded.)
- `SohlAction`: the constructor now switches on the merged action data, so
  definitions that omit `scope` get the documented SELF default instead of
  throwing `Unknown action scope: undefined`.
- `SohlAction.toJSON()` serializes the action definition only, fixing an
  infinite recursion when serializing any logic object (action → parent
  logic → actions → …).
- `SkillLogic`: the Aura-based fate bonus was silently dropped (the value
  was passed in the `shortcode` slot of `ValueModifier.add`); it now
  applies as the `FateBns` delta.
- The context-menu `Entry` fallback callback invoked a non-existent
  `_getContextLogic` helper (runtime TypeError when an entry had only a
  `functionName`); it now resolves the context item and invokes the named
  logic method.
