# Combat Resolution Pipeline

> **Audience:** SoHL maintainers extending tests, opposed rolls, or combat outcomes.

See also: [Extension Points](../how-to/extension-points.md), [Modifier Model](./modifier-model.md), [Body Structure](./body-structure.md).

## Class hierarchy

```
TestResult (abstract)                          src/domain/result/TestResult.ts
├── SuccessTestResult                          src/domain/result/SuccessTestResult.ts
│   └── ImpactResult                           src/domain/result/ImpactResult.ts
│       ├── AttackResult                       src/domain/result/AttackResult.ts
│       └── DefendResult                       src/domain/result/DefendResult.ts
└── OpposedTestResult                          src/domain/result/OpposedTestResult.ts
    └── CombatResult                           src/domain/result/CombatResult.ts
```

## Pipeline overview

A combat exchange flows through these stages:

```
1. Attacker selects strike mode
       ↓
2. MasteryLevelModifier.successTest() → AttackResult
   (d100 roll, success level, pre-defense damage, allowed defenses)
       ↓
3. Defender chooses defense type (block, counterstrike, dodge, ignore)
       ↓
4. MasteryLevelModifier.successTest() → DefendResult
   (d100 roll, success level, defense-specific mishaps)
       ↓
5. CombatResult compares attack vs. defense (opposed test resolution)
   (winner, margin, combined mishaps)
       ↓
6. Impact resolution: margin + pre-defense damage + armor → final injury
   (hit location via BodyStructure, protection per ImpactAspect)
```

Non-combat tests (skill checks, trait tests) use steps 1-2 only, producing a `SuccessTestResult` directly.

## Result classes in detail

### TestResult

Abstract base. Holds speaker identity, title, description, and the parent Logic reference. Defines the `evaluate()` contract.

- Created by test methods on modifiers or logic classes.
- `evaluate()` resolves the outcome — returns `true` if the result should be displayed.
- Results are **transient** — not persisted to the database.

### SuccessTestResult

The standard d100 roll-under mastery level test.

| Property | Type | Description |
|----------|------|-------------|
| `roll` | `SimpleRoll` | The d100 roll |
| `masteryLevelModifier` | `MasteryLevelModifier` | The ML modifier used for this test |
| `successLevel` | `number` | How far above/below the target (positive = success) |
| `isSuccess` | `boolean` | Whether the test passed |
| `isCritical` | `boolean` | Whether a critical result occurred (last-digit match) |
| `mishaps` | `Set<string>` | Fumble/stumble flags from critical failures |
| `movement` | `SuccessTestResultMovement` | Tactical movement state after the test |
| `resultText` / `resultDesc` | `string` | Descriptive output for chat display |

**Evaluation flow:**
1. Roll 1d100 (or reuse prior roll for fate).
2. Success level = constrained ML − roll.
3. Check critical success/failure against last-digit lists.
4. Compute success stars from description table.
5. Populate result text for chat.

**Chat output:** Renders via `templates/chat/standard-test-card.hbs`.

**Prior test results:** When `context.scope.priorTestResult` is provided, the dialog redisplays for modifier adjustment but reuses the prior roll. This supports fate mechanics.

### OpposedTestResult

Two competing SuccessTestResults compared to determine a winner.

| Property | Type | Description |
|----------|------|-------------|
| `sourceTestResult` | `SuccessTestResult` | Initiating actor's test |
| `targetTestResult` | `SuccessTestResult` | Responding actor's test |
| `tieBreak` | `number` | Tie-breaking policy |
| `sourceWins` / `targetWins` | `boolean` | Outcome flags |
| `isTied` / `bothFail` | `boolean` | Edge case flags |

**Two-phase execution:**
1. `opposedTestStart()` — source rolls, result posted to chat with "respond" button.
2. `opposedTestResume()` — target rolls, opposed outcome evaluated and posted.

**Chat output:** Renders via `templates/chat/opposed-request-card.hbs` (phase 1) and `templates/chat/opposed-result-card.hbs` (phase 2).

### ImpactResult

Extends SuccessTestResult with damage information.

| Property | Type | Description |
|----------|------|-------------|
| `impactModifier` | `ImpactModifier` | Damage formula (dice + modifier + aspect) |
| `deliversImpact` | `boolean` | Whether this result actually deals damage |

Base class for both AttackResult and DefendResult. The `impactModifier` carries the damage dice (`SimpleRoll`), the ValueModifier (strength bonus, weapon quality, etc.), and the damage aspect (blunt/edged/piercing/fire).

### AttackResult

The attacker's side of a combat exchange.

| Property | Type | Description |
|----------|------|-------------|
| `allowedDefenses` | `Set<string>` | Defense types the target may use |
| `damage` | `number` | Pre-defense damage value |
| `situationalModifier` | `number` | Player-entered attack modifier |
| `modifiers` | `Map<string, string>` | Named modifier map for audit |

**Evaluation:** Rolls the attack, checks for attack-specific mishaps (weapon break, stumble, fumble, wild swing), and computes pre-defense damage.

### DefendResult

The defender's side of a combat exchange.

| Property | Type | Description |
|----------|------|-------------|
| `situationalModifier` | `number` | Player-entered defense modifier |

**Evaluation:** Rolls the defense (block, counterstrike, or dodge), checks for defense-specific mishaps (shield break, stumble, fumble).

### CombatResult

The full combat exchange — composes AttackResult + DefendResult via opposed test resolution.

| Property | Type | Description |
|----------|------|-------------|
| `attackResult` | `AttackResult` | The attacker's result |
| `defendResult` | `DefendResult` | The defender's result |

**Determines:**
- Whether attacker or defender wins (via inherited opposed resolution).
- The margin of victory (success level difference).
- Combined mishaps from both sides.

**Does NOT determine:** Final damage — that is computed by the impact resolution stage using the CombatResult margin, the attack's pre-defense damage, and the target's armor/body location protection.

## Chat card templates

| Template | Used by | Purpose |
|----------|---------|---------|
| `standard-test-card.hbs` | SuccessTestResult | Standard test outcome |
| `opposed-request-card.hbs` | OpposedTestResult (phase 1) | "Respond to opposed test" prompt |
| `opposed-result-card.hbs` | OpposedTestResult (phase 2) | Final opposed outcome |
| `attack-card.hbs` | AttackResult | Attack-specific display |
| `attack-result-card.hbs` | AttackResult | Attack outcome details |
| `damage-card.hbs` | ImpactResult | Damage display |

## Extension guidance

- **New test type:** Subclass `SuccessTestResult` if you need custom evaluation logic. Override `evaluate()` and `toChat()`.
- **New combat mechanic:** Subclass `ImpactResult` for new damage types, or `CombatResult` for new combat exchange patterns.
- **Custom modifiers:** Add deltas to the `MasteryLevelModifier` before `evaluate()` is called — don't modify the result after evaluation.
- **Keep `evaluate()` deterministic** from input state; avoid hidden side effects.
- **Keep `toChat()` payloads backward-compatible** for template and macro consumers.
