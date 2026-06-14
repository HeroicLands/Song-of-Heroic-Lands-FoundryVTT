---
aliases:
    - Combat Resolution Pipeline
tags:
    - rules
    - core-system
    - combat
    - injury
audience: SoHL maintainers extending tests, opposed rolls, or combat outcomes.
---

# Combat Resolution Pipeline

> **Audience:**

## Class hierarchy

```
TestResult (abstract)                          src/domain/result/TestResult.ts
├── SuccessTestResult                          src/domain/result/SuccessTestResult.ts
│   ├── AttackResult                           src/domain/result/AttackResult.ts
│   └── DefendResult                           src/domain/result/DefendResult.ts
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

### Automated-combat invariants (enforced before step 1)

Automated combat checks the [Automated Combat Invariants](./combat.md#automated-combat-invariants) up front and aborts (with a player-facing UI notification) on any violation — both participants must be combatants in the same active combat, the attacker must not be incapacitated/defeated/dead, and the target must not be dead. Enforcement points:

- **Attacker + target resolution and the attacker/target status checks:** `resolveAttackContext` (`src/document/actor/foundry/automated-combat.ts`), using `ATTACK_BLOCKING_STATUSES` + `firstStatusIn` from `combat-actions.ts`.
- **Incapacitated defender → Ignore-only:** `gateAutomatedDefenseButtons` (`src/document/chat/chat-card-gating.ts`), using `DEFENSE_DISABLING_STATUSES` + `hasAnyStatus`. Render-time gating removes Dodge/Block/Counterstrike for an incapacitated defender, leaving Ignore.

The status sets and predicates are pure and unit-tested; the resolution/gating that consumes them is Foundry glue.

## Result classes in detail

### TestResult

Abstract base. Holds speaker identity, title, description, and the parent Logic reference. Defines the `evaluate()` contract.

- Created by test methods on modifiers or logic classes.
- `evaluate()` resolves the outcome — returns `true` if the result should be displayed.
- Results are **transient** — not persisted to the database.

### SuccessTestResult

The standard d100 roll-under mastery level test.

| Property                    | Type                        | Description                                           |
| --------------------------- | --------------------------- | ----------------------------------------------------- |
| `roll`                      | `SimpleRoll`                | The d100 roll                                         |
| `masteryLevelModifier`      | `MasteryLevelModifier`      | The ML modifier used for this test                    |
| `successLevel`              | `number`                    | How far above/below the target (positive = success)   |
| `isSuccess`                 | `boolean`                   | Whether the test passed                               |
| `isCritical`                | `boolean`                   | Whether a critical result occurred (last-digit match) |
| `mishaps`                   | `Set<string>`               | Fumble/stumble flags from critical failures           |
| `movement`                  | `SuccessTestResultMovement` | Tactical movement state after the test                |
| `resultText` / `resultDesc` | `string`                    | Descriptive output for chat display                   |

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

| Property                    | Type                | Description             |
| --------------------------- | ------------------- | ----------------------- |
| `sourceTestResult`          | `SuccessTestResult` | Initiating actor's test |
| `targetTestResult`          | `SuccessTestResult` | Responding actor's test |
| `tieBreak`                  | `number`            | Tie-breaking policy     |
| `sourceWins` / `targetWins` | `boolean`           | Outcome flags           |
| `isTied` / `bothFail`       | `boolean`           | Edge case flags         |

**Two-phase execution:**

1. `opposedTestStart()` — source rolls, result posted to chat with "respond" button.
2. `opposedTestResume()` — target rolls, opposed outcome evaluated and posted.

**Chat output:** Renders via `templates/chat/opposed-request-card.hbs` (phase 1) and `templates/chat/opposed-result-card.hbs` (phase 2).

### AttackResult

The attacker's side of a combat exchange.

| Property              | Type                  | Description                      |
| --------------------- | --------------------- | -------------------------------- |
| `allowedDefenses`     | `Set<string>`         | Defense types the target may use |
| `damage`              | `number`              | Pre-defense damage value         |
| `situationalModifier` | `number`              | Player-entered attack modifier   |
| `modifiers`           | `Map<string, string>` | Named modifier map for audit     |

**Evaluation:** Rolls the attack, checks for attack-specific mishaps (weapon break, stumble, fumble, wild swing), and computes pre-defense damage.

### DefendResult

The defender's side of a combat exchange.

| Property              | Type     | Description                     |
| --------------------- | -------- | ------------------------------- |
| `situationalModifier` | `number` | Player-entered defense modifier |

**Evaluation:** Rolls the defense (block, counterstrike, or dodge), checks for defense-specific mishaps (shield break, stumble, fumble).

### CombatResult

The full combat exchange — composes AttackResult + DefendResult via opposed test resolution.

| Property       | Type           | Description           |
| -------------- | -------------- | --------------------- |
| `attackResult` | `AttackResult` | The attacker's result |
| `defendResult` | `DefendResult` | The defender's result |

| `margin` | `number` | Victory score `VS` (see below) |
| `tacticalAdvantages` | `{ side, count }` | TAs awarded by the exchange |
| `weaponBreakCheck` | `"attacker" \| "defender" \| "none"` | Whose weapon must roll for breakage |

**Determines** (via `opposedTestEvaluate()`):

- Who lands a blow — the derived getters `attackerLandsBlow` /
  `defenderLandsBlow` (the defender only via Counterstrike). "Lands a blow" means
  _connected_; the blow may still be fully absorbed by armor during impact
  resolution, so it does not by itself imply damage.
- The **victory score** `VS = attacker.normSuccessLevel − defender.normSuccessLevel`.
  This is the **raw level difference**, deliberately _not_ the inherited
  `sourceWins`/`isTied` getters — those carve out a "both failed" case, whereas
  the SoHL combat tables resolve every exchange by relative margin (a less-bad
  failure still beats a worse one).
- Tactical Advantages and the weapon-break check (display-only for now).

Per-defense outcome:

| Defense       | Attacker delivers                                         | Defender delivers          | Notes                                         |
| ------------- | --------------------------------------------------------- | -------------------------- | --------------------------------------------- |
| Block         | `VS >= 0`                                                 | never                      | tie also sets `weaponBreakCheck = "defender"` |
| Counterstrike | `VS >= 0`                                                 | when its own roll succeeds | both blows may land                           |
| Dodge         | `VS > 0`, or tie with a lower dodge roll than attack roll | never                      |                                               |
| Ignore        | the attack itself succeeds                                | never                      | no defender contest                           |

Tactical Advantages: the winner of a `|VS| >= 2` exchange earns `|VS| − 1` TAs
(attacker on `VS >= 2`, defender on `VS <= -2`).

**Does NOT determine:** Final damage — that is computed by the impact resolution
stage (`src/domain/body/InjuryResolution.ts`) using the attack's pre-defense
damage, the aspect, and the target's armor/body-location protection.

### Injury resolution

The impact stage is a Foundry-free module, shared by both combat modes and the
manual Add Injury flow:

- `resolveInjury(input)` — picks the hit location (explicit override, aimed
  `targetPart` + `spread`, or weighted random), subtracts the effective
  protection (`armorValue − armorReduction`, floored at 0), maps the effective
  impact to a level (≤0 none · 1–4 M1 · 5–9 S2 · 10–14 S3 · 15–19 G4 · 20+ G5),
  and derives the Shock Index, glancing blow, stumble/fumble, bleeding, and
  amputation. Armor value is the location's natural protection plus any worn
  armor folded on by `aggregateArmor()` during the lifecycle.
- `buildTraumaData(injury)` — the `system.*` shape for a new Trauma item.

## Chat card templates

| Template                   | Used by                     | Purpose                                 |
| -------------------------- | --------------------------- | --------------------------------------- |
| `standard-test-card.hbs`   | SuccessTestResult           | Standard test outcome                   |
| `opposed-request-card.hbs` | OpposedTestResult (phase 1) | "Respond to opposed test" prompt        |
| `opposed-result-card.hbs`  | OpposedTestResult (phase 2) | Final opposed outcome                   |
| `attack-card.hbs`          | AttackResult                | Attack-specific display                 |
| `attack-result-card.hbs`   | AttackResult                | Attack outcome details                  |
| `damage-card.hbs`          | `buildDamageCardData`       | Rolled impact + Calculate Injury button |
| `injury-card.hbs`          | `buildInjuryCardData`       | Resolved injury (level, shock, mishaps) |

## Extension guidance

- **New test type:** Subclass `SuccessTestResult` if you need custom evaluation logic. Override `evaluate()` and `toChat()`.
- **New combat mechanic:** Extend `AttackResult`/`DefendResult` (or `SuccessTestResult`) for new test types, or `CombatResult` for new combat exchange patterns.
- **Custom modifiers:** Add deltas to the `MasteryLevelModifier` before `evaluate()` is called — don't modify the result after evaluation.
- **Keep `evaluate()` deterministic** from input state; avoid hidden side effects.
- **Keep `toChat()` payloads backward-compatible** for template and macro consumers.

# See Also

- [Extension Points](../how-to/extension-points.md)
- [Modifier Model](./modifier-model.md)
- [Body Structure](./body-structure.md).
