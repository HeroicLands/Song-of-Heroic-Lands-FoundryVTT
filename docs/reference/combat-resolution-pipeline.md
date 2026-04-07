# Combat Resolution Pipeline

> **Audience:** SoHL maintainers extending tests, opposed rolls, or combat outcomes.

See also: [Extension Points](../how-to/extension-points.md), [Rules Variants and Extension Mechanisms](../concepts/rules-variants.md).

## Core classes

- Base result contract: `src/domain/result/TestResult.ts`
- Standard test flow: `src/domain/result/SuccessTestResult.ts`
- Opposed test orchestration: `src/domain/result/OpposedTestResult.ts`
- Impact-capable results: `src/domain/result/ImpactResult.ts`
- Combat-specific result specializations:
    - `src/domain/result/AttackResult.ts`
    - `src/domain/result/DefendResult.ts`
    - `src/domain/result/CombatResult.ts`

## Pipeline shape

At runtime, most combat/test workflows follow this shape:

1. Build a `MasteryLevelModifier` context (targets, crit digits, situational deltas).
2. Create a `SuccessTestResult` (or derived result) and optionally show dialog.
3. Call `evaluate()`:
    - validates ownership (`speaker.isOwner`),
    - computes success level from roll vs constrained effective mastery,
    - applies success-level modifiers,
    - computes critical/marginal labels and derived text.
4. For opposed flows, evaluate both source and target test results via `OpposedTestResult`.
5. Push output to chat via `toChat()` (card template + roll payload + speaker routing).

## Result responsibilities

### `TestResult`

- Base data holder for speaker/name/title/description.
- Requires a `parent` logic object in options.
- Defines `evaluate()` contract (default allow).

### `SuccessTestResult`

- Handles roll mode, test type, movement, mishaps, and mastery-level modifier.
- Implements the main success/critical algorithm.
- Supports "re-evaluate with same roll" behavior via `options.testResult` merge.
- Renders `standard-test-card.html`.

### `OpposedTestResult`

- Wraps two success results (`sourceTestResult`, `targetTestResult`).
- Evaluates both sides and exposes tie/winner helpers.
- Emits opposed request/result chat card templates.

### `ImpactResult` and subclasses

- `ImpactResult` adds `impactModifier` and `deliversImpact`.
- `AttackResult` adds attack-specific mishap logic and impact situational modifiers.
- `DefendResult` adds defense-specific mishap logic.
- `CombatResult` exists as an opposed-combat specialization point.

## Chat serialization contract

- Result objects are passed into chat cards as object + JSON payload (for follow-up interactions).
- `toChat()` is part of each result type contract; custom results should preserve this pattern.
- Current templates used by core include:
    - `templates/chat/standard-test-card.html`
    - `templates/chat/opposed-request-card.html`
    - `templates/chat/opposed-result-card.html`

## Extension guidance

- Add a new result type when behavior diverges materially from existing classes.
- Prefer subclassing `SuccessTestResult` or `ImpactResult` over branching call sites.
- Keep `evaluate()` deterministic from input state; avoid hidden side effects.
- Keep `toChat()` payloads backward-compatible for template/macro consumers.

## Known implementation boundaries (current code)

- `CombatResult` currently serves primarily as a type anchor/extension point.
- Tie-break metadata exists on `OpposedTestResult`; consumers must apply explicit tie policies.
- Dialog-driven modifier editing is implemented in `SuccessTestResult.testDialog()` and modifier helpers.
