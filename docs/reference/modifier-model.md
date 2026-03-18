# Modifier Model

> **Audience:** Developers changing target values, impact calculations, or test modifiers.

See also: [Combat Resolution Pipeline](./combat-resolution-pipeline.md), [Extension Points](../how-to/extension-points.md).

## Core types

- `ValueDelta`: `src/modifier/ValueDelta.ts`
- `ValueModifier`: `src/modifier/ValueModifier.ts`
- `MasteryLevelModifier`: `src/modifier/MasteryLevelModifier.ts`
- `CombatModifier`: `src/modifier/CombatModifier.ts`
- `ImpactModifier`: `src/modifier/ImpactModifier.ts`

## Conceptual model

- A **ValueModifier** represents a computed numeric value.
- It is built from:
    - optional base value,
    - many `ValueDelta` entries,
    - optional disabled state.
- `effective` is recomputed lazily via `_apply()` when dirty.

## Delta operations and order

`ValueModifier` sorts deltas by operator and then applies them in sequence. Operationally:

- additive deltas modify current value,
- multiplicative deltas scale it,
- upgrade/downgrade deltas impose min/max constraints,
- override can force a final explicit value,
- result is rounded to bounded precision.

This means extension code should prefer adding explicit deltas instead of writing direct final values unless override semantics are intended.

## API patterns

Common mutation helpers on `ValueModifier`:

- `add(...)`
- `multiply(...)`
- `set(...)` (override)
- `floor(...)` (minimum)
- `ceiling(...)` (maximum)
- `delete(shortcode)` / `has(shortcode)` / `get(shortcode)`

All of these feed the same recalculation path.

## Mastery-level tests

`MasteryLevelModifier` extends the generic value model with test-specific state:

- constrained target range (`minTarget`, `maxTarget`),
- critical success/failure digit lists,
- success-level modifier offsets,
- description/value tables for result text/stars.

Major entry points:

- `successTest(context)`
- `successValueTest(context)`
- `opposedTestStart(context)`
- `opposedTestResume(context)`

These methods produce `SuccessTestResult`/`OpposedTestResult` instances and are the preferred integration path for new test workflows.

## Impact-specific modifiers

`ImpactModifier` extends `ValueModifier` with:

- optional roll payload (`SimpleRoll`),
- impact aspect metadata,
- `diceFormula`/`label` helpers,
- `evaluate()` that rolls/returns impact value.

This is the correct extension point for non-standard damage/impact math.

## Extension guidance

- Introduce new shortcode deltas rather than overloading existing shortcodes.
- Keep operator semantics stable globally.
- If a subsystem needs special math, subclass `ValueModifier` and keep conversions explicit.
- Keep chat/display formatting (`chatHtml`, abbreviations) aligned with mechanical behavior.
