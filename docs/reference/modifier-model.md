# Modifier Model

> **Audience:** Developers changing target values, impact calculations, or test modifiers.

See also: [Combat Resolution Pipeline](./combat-resolution-pipeline.md), [Extension Points](../how-to/extension-points.md).

## Core types

- `ValueDelta`: `src/domain/modifier/ValueDelta.ts`
- `ValueModifier`: `src/domain/modifier/ValueModifier.ts`
- `MasteryLevelModifier`: `src/domain/modifier/MasteryLevelModifier.ts`
- `CombatModifier`: `src/domain/modifier/CombatModifier.ts`
- `ImpactModifier`: `src/domain/modifier/ImpactModifier.ts`

## How ValueModifier works

A **ValueModifier** tracks a numeric value as a **base** plus **deltas** (modifiers), producing a fully auditable **effective** value.

### Effective value calculation

```
effective = base + deltas (applied in operator order)
modifier  = effective - base  (just the delta contribution)
```

The calculation runs lazily when `effective` is accessed:

1. Start with `base` (from `setBase()`, or 0 if never set).
2. Sort all `ValueDelta` entries by operator priority.
3. Apply in order:
   - **ADD** — add to running total
   - **MULTIPLY** — multiply running total
   - **UPGRADE** (floor) — enforce a minimum: `effective = max(effective, value)`
   - **DOWNGRADE** (ceiling) — enforce a maximum: `effective = min(effective, value)`
   - **OVERRIDE** — replace the computed value entirely
   - **CUSTOM** — delegate to a custom function
4. Round to 3 significant digits.

### Example

```typescript
const vm = new ValueModifier({}, { parent: logic });
vm.setBase(50);                                    // base = 50
vm.add("SOHL.MOD.bonus", "bon", 10);              // +10
vm.multiply("SOHL.MOD.penalty", "pen", 0.5);      // ×0.5
// effective = (50 + 10) × 0.5 = 30
// modifier  = 30 - 50 = -20
```

### Disabled state

Setting `vm.disabled = "reason"` causes `effective` to always return 0, regardless of base or deltas. This distinguishes "value is zero due to modifiers" from "value is inapplicable" (e.g., a skill the character cannot use). Check `vm.disabled` (returns the reason string, or `""` if not disabled).

### Auditability

Every delta carries a `name` and `shortcode` identifying its source:

```typescript
vm.add("SOHL.MOD.fatigue", "FTG", -5);
vm.has("FTG");           // true
vm.get("FTG");           // the ValueDelta instance
vm.delete("FTG");        // removes it
```

The `deltas` array provides the full breakdown of all active modifications.

## Lifecycle

ValueModifiers are **ephemeral** — rebuilt from persisted data on every preparation cycle:

1. **initialize** — Logic creates the ValueModifier and calls `setBase()` with the persisted value.
2. **evaluate / finalize** — Active effects, cross-item dependencies, and other logic add deltas.
3. **Next cycle** — The ValueModifier is discarded and rebuilt from scratch.

Deltas are never persisted. To change the base value permanently, update the underlying DataModel field via `document.update()`.

## API reference

### Construction and base

| Method | Description |
|--------|-------------|
| `new ValueModifier(data, { parent })` | Create with a parent Logic instance (required) |
| `setBase(value)` | Set the base value (number or undefined). Returns `this` for chaining. |
| `base` | Get the current base value (0 if unset) |
| `hasBase` | Whether a base has been explicitly set |
| `effective` | The computed value: base + deltas |
| `modifier` | Just the delta contribution: `effective - base` |

### Delta manipulation

| Method | Description |
|--------|-------------|
| `add(name, shortcode, value)` | Add an additive delta |
| `multiply(name, shortcode, value)` | Add a multiplicative delta |
| `set(name, shortcode, value)` | Add an override delta |
| `floor(name, shortcode, value)` | Add an upgrade (minimum) delta |
| `ceiling(name, shortcode, value)` | Add a downgrade (maximum) delta |
| `get(shortcode)` | Get a delta by shortcode |
| `has(shortcode)` | Check if a delta exists |
| `delete(shortcode)` | Remove a delta by shortcode |

### State

| Property | Description |
|----------|-------------|
| `disabled` | Get/set disabled reason. Set to a string to disable, `false` to enable. |
| `empty` | Whether there are no deltas |
| `parent` | The owning Logic instance |

## MasteryLevelModifier

`MasteryLevelModifier` extends `ValueModifier` for the primary resolution mechanic in SoHL: mastery level tests (d100 roll-under against an effective mastery level).

### Test-specific properties

| Property | Type | Description |
|----------|------|-------------|
| `minTarget` | `number` | Minimum allowed effective ML for tests |
| `maxTarget` | `number` | Maximum allowed effective ML for tests |
| `constrainedEffective` | `number` | Effective ML clamped to min/max range |
| `successLevelMod` | `number` | Flat offset applied to the success level after rolling |
| `critFailureDigits` | `number[]` | Last-digit values that trigger critical failure (e.g., `[0, 5]`) |
| `critSuccessDigits` | `number[]` | Last-digit values that trigger critical success |
| `testDescTable` | `LimitedDescription[]` | Maps success levels to labels and star ratings for chat |
| `svTable` | `LimitedDescription[]` | Maps success levels to success value results |

### Test methods

| Method | Returns | Description |
|--------|---------|-------------|
| `successTest(context)` | `SuccessTestResult \| null \| false` | Standard d100 test. Shows dialog for situational modifiers, rolls, evaluates, posts to chat. Returns `null` if cancelled, `false` on error. |
| `successValueTest(context)` | `SuccessTestResult \| null \| false` | Like `successTest` but produces a quality-of-result value rather than just pass/fail. |
| `opposedTestStart(context)` | `OpposedTestResult \| null` | Starts an opposed test: performs the source actor's success test, creates an `OpposedTestResult` awaiting the target's response. |
| `opposedTestResume(context)` | `OpposedTestResult \| null \| false` | Completes an opposed test: performs the target's success test and evaluates the opposed outcome. |

### Prior test results

All test methods accept a `priorTestResult` in `context.scope`. When provided, the dialog redisplays for modifier adjustment but reuses the prior roll — the dice are not re-rolled. This supports mechanics like fate points that modify an already-rolled test.

## CombatModifier

`CombatModifier` extends `MasteryLevelModifier` with no additional properties or methods. Its purpose is **type discrimination**: combat-specific modifiers (attack rolls, defense rolls, combat technique tests) can be identified and filtered separately from general mastery level modifiers.

Created by `CombatTechniqueLogic` for each strike mode's attack and defense modifiers:

```typescript
this.defense = {
    block: new CombatModifier({}, { parent: this }),
    counterstrike: new CombatModifier({}, { parent: this }),
};
```

## ImpactModifier

`ImpactModifier` extends `ValueModifier` for damage/impact calculation — the harm delivered by an attack before defenses are applied.

### Impact components

An impact has three parts:

1. **Dice** — a `SimpleRoll` defining the random component (e.g., 2d6 for a broadsword)
2. **Modifier** — the ValueModifier base + deltas (strength bonus, weapon quality, etc.)
3. **Aspect** — the damage type (`ImpactAspect`): blunt, edged, piercing, or fire

### Key properties

| Property | Type | Description |
|----------|------|-------------|
| `numDice` | `number` | Number of impact dice |
| `die` | `number` | Die faces (e.g., 6 for d6) |
| `diceFormula` | `string` | Human-readable formula, e.g. `"2d6+3"` |
| `label` | `string` | Formula with aspect suffix, e.g. `"2d6+3e"` (edged) |
| `aspect` | `ImpactAspect` | Damage type — determines which protection values apply |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `evaluate()` | `number` | Rolls the dice (if not already rolled) and returns the total impact value |

### Auto-disable

ImpactModifier is automatically disabled when both dice and effective modifier are zero (the strike deals no damage), in addition to the inherited explicit disabled state.

## Extension guidance

- Add new shortcode deltas rather than overloading existing shortcodes.
- Keep operator semantics stable globally.
- If a subsystem needs special math, subclass `ValueModifier` and keep conversions explicit.
- Keep chat/display formatting (`chatHtml`, abbreviations) aligned with mechanical behavior.
