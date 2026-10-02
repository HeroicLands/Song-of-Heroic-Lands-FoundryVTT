---
shortcode: combatresolutionpipeline
name: {full: Combat Resolution Pipeline, aliases: []}
type: doc
subType: reference
description: For SoHL maintainers extending tests, opposed rolls, or combat outcomes.
tags: [rules, core-system, combat, injury]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Combat Resolution Pipeline

> **Audience:** SoHL maintainers extending tests, opposed rolls, or combat outcomes.

## Class hierarchy

```
TestResult (abstract)                          src/entity/result/TestResult.ts
├── SuccessTestResult                          src/entity/result/SuccessTestResult.ts
│   ├── AttackResult                           src/entity/result/AttackResult.ts
│   └── DefendResult                           src/entity/result/DefendResult.ts
└── OpposedTestResult                          src/entity/result/OpposedTestResult.ts
    └── CombatResult                           src/entity/result/CombatResult.ts
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

Non-combat tests (skill checks, attribute tests) use steps 1-2 only, producing a `SuccessTestResult` directly.

### Automated-combat invariants (enforced before step 1)

Automated combat checks these invariants up front and aborts (with a player-facing UI notification) on any violation — both participants must be combatants in the same active combat, the attacker must be the current combatant (it must be its turn), the attacker must not be incapacitated/defeated/dead, and the target must not be out of the fight (dead or vanquished/defeated). Enforcement points:

- **Turn gate:** `startAutomatedAttack` aborts when `outOfTurnAttackReason(getActiveCombat()?.combatant?.id, this.combatant?.id)` returns a reason — there is no active combat turn, or the attacker is not the current combatant. Only the current combatant may _start_ an automated attack; out-of-turn defenses (a counterstrike, a Tactical-Advantage follow-up) run through the `automated*Resume` path, not `startAutomatedAttack`, so the gate never blocks them.
- **Attacker status:** `startAutomatedAttack` (`src/document/combatant/logic/SohlCombatantLogic.ts`) aborts when `attackerBlockingStatus(this.data.statuses, this.data.isDefeated)` (matched against `ATTACK_BLOCKING_STATUSES`) returns a status. The attacker's combat membership is guaranteed by the entry point (`StrikeModeBase.automatedCombatStart` resolves the attacker via `fvttActiveCombatantForActor`; the tracker action is on the combatant itself).
- **Target validity:** `startAutomatedAttack` resolves the target to a combatant (`fvttActiveCombatantForActor(context.target.actorLogic?.actor)`) — aborting if it isn't one — then aborts when `targetInvalidStatus(...)` (matched against `TARGET_INVALID_STATUSES` = `dead` / `vanquished`) returns a status.
- **Incapacitated defender > Ignore-only:** `gateAutomatedDefenseButtons` (`src/document/chat/chat-card-gating.ts`), using `DEFENSE_DISABLING_STATUSES` + `hasAnyStatus`. Render-time gating removes Dodge/Block/Counterstrike for an incapacitated defender, leaving Ignore.

The status sets and predicates (`outOfTurnAttackReason`, `attackerBlockingStatus`, `targetInvalidStatus`, `hasAnyStatus`) are pure and unit-tested; the resolution/gating that consumes them is Foundry glue. The turn gate applies only to _starting_ an attack: automated and assisted combat can still be freely interleaved, and a defender's counterstrike (or a Tactical-Advantage follow-up) resolves within the attacker's exchange without waiting for the defender's own turn.

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
4. Compute value diamonds from description table.
5. Populate result text for chat.

**Chat output:** Renders via `templates/chat/standard-test-card.hbs`.

**Prior test results:** When `context.scope.priorTestResult` is provided, the dialog redisplays for modifier adjustment but reuses the prior roll. This supports fate mechanics.

### OpposedTestResult

Two competing SuccessTestResults compared to determine a winner.

| Property                    | Type                | Description                                                    |
| --------------------------- | ------------------- | -------------------------------------------------------------- |
| `sourceTestResult`          | `SuccessTestResult` | Initiating actor's test                                        |
| `targetTestResult`          | `SuccessTestResult` | Responding actor's test                                        |
| `breakTies`                 | `boolean`           | Whether a tie is settled rather than reported                  |
| `tieBreak`                  | `number`            | Which side a tie was awarded to (`SOURCE` / `NONE` / `TARGET`) |
| `tieBreakReason`            | `string`            | Which rule settled it (`roll` / `ml` / `rolloff`)              |
| `sourceWins` / `targetWins` | `boolean`           | Outcome flags                                                  |
| `isTied` / `bothFail`       | `boolean`           | Edge case flags                                                |
| `isTieBroken`               | `boolean`           | The contest tied, and `tieBreak` then settled it               |
| `victoryStars`              | `number`            | Margin in Victory Stars; `1` for a broken tie, `0` for a tie   |

Winner and margin are compared on the **raw** (unclamped) success levels
(`SuccessTestResult.rawSuccessLevel`), so a `successLevelMod` that pushes a level
past the four-point scale widens the margin with it — the Victory Star count has no
ceiling. `CombatResult.margin` is separate and still normalized (−3..+3).

**Two-phase execution:**

1. `opposedTestStart()` — source rolls (its pre-roll dialog offers **Break Ties**), result posted to chat with "respond" button.
2. `opposedTestResume()` — target rolls, opposed outcome evaluated (settling a tie when asked) and posted.

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

| Property             | Type                                 | Description                         |
| -------------------- | ------------------------------------ | ----------------------------------- |
| `attackResult`       | `AttackResult`                       | The attacker's result               |
| `defendResult`       | `DefendResult`                       | The defender's result               |
| `margin`             | `number`                             | Victory score `VS` (see below)      |
| `tacticalAdvantages` | `{ side, count }`                    | TAs awarded by the exchange         |
| `weaponBreakCheck`   | `"attacker" \| "defender" \| "none"` | Whose weapon must roll for breakage |

**Determines** (via `opposedTestEvaluate()`):

- Who lands a blow — the derived getters `attackerLandsBlow` /
  `defenderLandsBlow` (the defender only via Counterstrike). "Lands a blow" means
  _connected_; the blow may still be fully absorbed by armor during impact
  resolution, so it does not by itself imply damage.
- The **victory score** `VS = attacker.normSuccessLevel − defender.normSuccessLevel`.
  This is the **raw level difference**, deliberately _not_ the inherited
  `sourceWins`/`isTied` getters — those carve out a "both failed" case, whereas
  the SoHL combat tables resolve every exchange by relative margin (a less-bad
  failure still beats a worse one). Winning the exchange is not the same as
  landing a blow: a failed attack takes the margin, and any Tactical Advantages
  with it, without connecting.
- Tactical Advantages and the weapon-break check (display-only for now).

Per-defense outcome. Every attacker cell is additionally conditional on
`attackResult.isSuccess` — **a failed attack never lands**, however badly the
defence blundered:

| Defense       | Attacker delivers                                         | Defender delivers          | Notes                                                          |
| ------------- | --------------------------------------------------------- | -------------------------- | -------------------------------------------------------------- |
| Block         | `VS > 0`                                                  | never                      | a tie wards the blow, and sets `weaponBreakCheck = "defender"` |
| Limb Block    | `VS >= 0`                                                 | never                      | a tie lands on the blocking limb; no weapon-break check        |
| Counterstrike | `VS >= 0`                                                 | when its own roll succeeds | both blows may land                                            |
| Dodge         | `VS > 0`, or tie with a lower dodge roll than attack roll | never                      |                                                                |
| Ignore        | always                                                    | never                      | no defender contest                                            |

A block need only **tie** to ward the blow — and the tie is what the blocker's
weapon-break check exists for, so it fires only when there was a blow to absorb
(a tie between two failures sets no check). A dodge must **win outright**; its
tie goes to the ordinary tiebreak, which the higher roll takes.

Tactical Advantages: the winner of a `|VS| >= 2` exchange earns `|VS| − 1` TAs
(attacker on `VS >= 2`, defender on `VS <= -2`).

### Limb Block {#limb-block}

A block made with a forearm, a shin or a shoulder is marked by the `limbBlock`
trait on the blocking strike mode, which is what
{@link sohl.entity.result.CombatResult.isLimbBlock} reads — so a creature whose
own anatomy gives it an equivalent declares it the same way, with no code change.
It differs from an ordinary block in three places, all in `CombatResult`:

- **It wards only on a clear victory.** `attackerLandsBlow` takes `VS >= 0`, and
  the tie is settled by the level difference alone — it is never sent to the
  tiebreak.
- **A tie lands on the raised limb.** `limbBlockStrikesLimb` is that case, and
  `blockingLimbLocationCode` names the struck location: the limbs the technique
  is performed with are the body-part roles its governing skill lists in
  `impairedByRoles`, one of those parts is drawn by its selection weight, and a
  location within it follows. The code rides the attack-result card's injury
  button as `bodyLocationCode`, so the injury stage uses it rather than drawing
  again — and the limb's own armour is then the armour that answers the blow.
- **Two points come off the impact**, as a named `LmbBlk` delta so the damage
  card shows where they went. The ward is subtracted before armour, which is the
  same arithmetic as subtracting it after.

No limb block sets `weaponBreakCheck`: there is no weapon in it to break.

**Does NOT determine:** Final damage — that is computed by the impact resolution
stage (`src/entity/body/injury-resolution.ts`) using the attack's pre-defense
damage, the aspect, and the target's armor/body-location protection.

### Strength and impact

A strike mode's impact is **not** a constant property of the weapon. The
wielder's Strength Impact Modifier is folded in during the **finalize** phase, by
{@link sohl.entity.strikemode.applyStrengthImpact} via the document-layer wiring
in `src/document/item/logic/wielderStrength.ts`, which both
{@link sohl.document.item.logic.WeaponGearLogic} and
{@link sohl.document.item.logic.SkillLogic} (for combat techniques) call.

Finalize, not evaluate: the rule reads the wielder's Strength attribute across
documents, and attribute scores only settle once every sibling item has
evaluated — the same cross-item read the governing mastery-level wiring makes.
Because it lands there rather than at attack time, the sheet and the attack card
agree, and every contribution arrives as a **named delta** (`StrImp`, `OffHnd`,
`Thrwn`) so the impact breakdown stays auditable.

The rule itself
({@link sohl.entity.strikemode.strengthImpactModifier}) is a closed form rather
than the published lookup table, so it extends without bound in both directions:
`floor((STR − 10) / 2)` at STR ≥ 5, and the steeper `2 × STR − 12` below it. It
applies to melee modes and thrown weapons only — a launcher firing separate
ammunition is excluded, as is anything carrying the `noStrMod` trait.

Off-hand determination runs through
{@link sohl.entity.body.isOffHandGrip}; see
[[doc-bodystructure#laterality-and-dominance|Body Structure > Laterality and dominance]].

### Shield Mod {#shield-mod}

A shield's `shieldMod` trait is a **wielder-level** bonus, so it is applied in the
same **finalize** phase and for the same reason: the shield granting it is a
different document from the weapon blocking with it, and a sibling item's grip is
only settled once every item has evaluated.

The rule is {@link sohl.entity.strikemode.applyShieldDefenseBonus}; the
document-layer wiring is `src/document/item/logic/heldShield.ts`, called by both
{@link sohl.document.item.logic.WeaponGearLogic} and
{@link sohl.document.item.logic.SkillLogic}. It reaches three beneficiaries,
each as a named `Shld` delta:

| Beneficiary             | Where the delta lands                      |
| ----------------------- | ------------------------------------------ |
| Every **Block**         | each melee strike mode's `defense.block`   |
| The wielder's **Dodge** | the Dodge skill's own `masteryLevel`       |
| A **Press**             | the Press technique's strike-mode `attack` |

{@link sohl.document.item.logic.heldShieldMod} supplies the value: the
**highest** `shieldMod` among the strike modes of weapons with at least one limb
gripping them, so two shields grant the better and a stowed one grants nothing.
Re-application restates rather than stacks, and a value of `0` removes the delta,
which is what stowing the shield does within one preparation cycle.

There is no shield subtype; a non-zero `shieldMod` is what identifies a shield,
which is what {@link sohl.entity.strikemode.isShieldStrikeMode} answers.

### The Impact Tactical Advantage value {#impact-tactical-advantage-value}

{@link sohl.entity.strikemode.impactTacticalAdvantageValue} resolves what one
Tactical Advantage spent on Impact is worth behind a strike mode: the `impTA`
trait where it states one, else {@link sohl.entity.strikemode.IMPACT_TA_DEFAULT}
keyed by the mode's aspect. The trait is authored as `0` on every mode stating no
override, so a zero reads as "unset" and defers to the aspect.

The value is exposed as `StrikeModeBase.impactTA` for the strike-mode ledgers and
carried onto the attack-result card beside the Tactical Advantage count, so the
count and its worth arrive together.

**Spending is deliberately unimplemented, and that is the Prime Directive rather
than an omission.** Three of the four Tactical Advantage kinds resolve at the
table, a referee may award one under circumstances no rule enumerates, and only
the player knows what they want from one. So
{@link sohl.entity.strikemode.impactTacticalAdvantageBonus} takes the number
spent as an argument and answers `0` for none: the system offers the arithmetic
and never decides that an advantage was spent.

### How a successful attack resolves {#how-an-attack-resolves}

A strike mode says **how the attack is made**; where its outcome comes from is a
separate axis, with four values already in content and orthogonal to
melee/missile (a grab is melee, a thrown net is missile):

| Resolution kind     | Where the outcome comes from | Modes                          |
| ------------------- | ---------------------------- | ------------------------------ |
| impact              | the mode's own dice          | nearly all of them             |
| projectile-supplied | the ammunition               | bows, crossbows, siege engines |
| trial               | a Strength Trial             | Grab, Press, Trip              |
| entangle            | the Entangle rules           | the Net                        |

An impact-free mode is therefore ordinary rather than anomalous — a longbow has
no impact of its own either. The axis has no schema field: the trait that gates
the manoeuvre is the discriminator, and a parallel field would state the same
thing twice.

### The Strength Trial {#strength-trial}

{@link sohl.entity.strikemode.resolveStrengthTrial} settles the contest a
manoeuvre resolves through: both combatants roll
{@link sohl.entity.strikemode.STRENGTH_TRIAL_DIE} and add their Strength, the
higher total wins, and {@link sohl.entity.strikemode.StrengthTrialOutcome.margin}
carries how decisively. A tie is a **loss for the initiator**, who had to win it,
and a loss produces no effect at all rather than a reduced one.

It is neither a d100 test nor an {@link sohl.entity.result.OpposedTestResult}:
"test" is the d100 family and "contest" the term of art for the d100 opposed
outcome, whose margin is Victory Stars. The Trial has its own name because it is
its own mechanic, and because its margin is on its own scale.

**The die is fixed for every creature.** It models chance in the moment —
footing, leverage, timing — which does not grow with mass, and size is already
the `+ Strength` term. A scaled die would also wreck the margin, which is a
mechanical output compared on one scale from a mouse to a dragon. It follows that
a Strength gap of {@link sohl.entity.strikemode.STRENGTH_TRIAL_SETTLED_BY} cannot
be overturned, the widest swing two dice can produce being one less;
{@link sohl.entity.strikemode.strengthTrialIsSettledByStrength} answers that
directly.

{@link sohl.entity.strikemode.grabTrialModifiers} assembles a Grab's side as
**named deltas** so the arithmetic reads back: the mode's Impact Tactical
Advantage value per advantage spent, then
{@link sohl.entity.strikemode.GRAB_ONE_HANDED_TRIAL_MODIFIER} for one hand on the
target and {@link sohl.entity.strikemode.GRAB_OFF_HANDED_TRIAL_MODIFIER} when
that hand is the off one. A contribution worth nothing is left out rather than
added as a zero. The Impact TA term is **not a Grab constant** — it is
{@link sohl.entity.strikemode.impactTacticalAdvantageValue}, and a grab is blunt.
Each delta is labelled from the shared `SOHL.INFO.*` delta namespace, so the
off-hand cost on a Trial reads as the off-hand reduction on an impact breakdown
does.

**Nothing here rolls a die or spends an advantage.** The Trial is two-party, so
each side is rolled by its own combatant's controlling player, and the spend is
the player's decision and the referee's award. Every function takes the dice and
the spend as arguments and answers only the arithmetic — the same shape, and for
the same reason, as the Impact Tactical Advantage bonus above.

### Strike-mode defence modifiers {#strike-mode-defence-modifiers}

A melee strike mode's `defense.block.modifier` and
`defense.counterstrike.modifier` are folded into
{@link sohl.entity.strikemode.MeleeStrikeMode}'s constructor, as the `BlkMod` and
`CtrMod` deltas on the mode's `defense.block` /
`defense.counterstrike` {@link sohl.entity.modifier.CombatModifier}s. The
defender's automated-combat resume clones the relevant one as the
{@link sohl.entity.result.DefendResult}'s mastery-level modifier, so the authored
number reaches the defence roll with its name intact.

Content authors them in exactly that nested shape, which is the shape the
DataModel declares — `MeleeStrikeMode.schemaFields()`. The strike-mode list is
emitted verbatim by the pack pipeline, so the schema is the only statement of a
strike mode's shape, and Foundry drops any key it does not declare.
`tests/content/strike-mode-shape.test.ts` derives the allowed key set from those
schemas at runtime and fails a note that spells one differently.

That guard stops at `traits`, which is an `ObjectField` and declares no keys at
all, so a trait authored there compiles into the pack and reaches whatever reader
exists — or none. `tests/build/authored-traits-are-read.test.ts` closes that seam:
it derives the authored trait names from the content and the ones `src/`
dereferences, and fails a trait that has neither a reader nor an entry in its
`AWAITING_A_RULE` ratchet. A trait leaves that ratchet when its rule lands, and
one that gains a reader while still listed fails too, so the set can only shrink.

### Injury resolution {#injury-resolution}

The impact stage is a Foundry-free module, shared by both combat modes and the
manual Add Injury flow:

- `resolveInjury(input)` — takes the hit location resolved upstream (an explicit
  `location` from a manual pick or Zone-Die aiming, or a weighted-random draw when
  none is given), subtracts the effective
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

- **New graded / special-result test — do _not_ subclass.** A test that rolls a
  d100 against a mastery level and reports a bespoke set of outcomes ("Keeps
  Footing" / "Stumbles" / "Drops It", a shock state, a fear reaction) is **not** a
  new class. Drive the one generic `MasteryLevelModifier.successTest(context)` and
  pass the outcome mapping as **data** in the action scope:
  `scope.resultDescTable` supplies the
  [[doc-resultdescriptiontables|result-description table]] (label / description / stars per rung),
  and an optional `scope.targetValueFunc` remaps the target when the test grades
  off something other than the raw mastery level. Follow-up **consent buttons** ride
  the same standard card — pass `buttons` to `SuccessTestResult.toChat` (see the
  [[doc-resultdescriptiontables#the-tochat-card-data-contract|card-data contract]]).
  This inherits impairment/fatigue gating, Fate eligibility, `priorTestResult`
  reconstruction, and card rendering for free; a subclass re-implements all of it
  and drifts. Worked example: `keepControlTable` + `BeingLogic.stumbleTest` /
  `fumbleTest`. See [[doc-extensionpoints#3-combat-tests-resolution-pipeline|Extension Points §3]].
- **Subclass `SuccessTestResult` only for genuinely different roll math** — a test
  whose evaluation is not "d100 ≤ constrained mastery level" (a different die, a
  multi-roll resolution, a non-threshold outcome). New result _text_ or a new
  follow-up _button_ is never a reason to subclass. When you do subclass, override
  `evaluate()` and keep `toChat()` payloads compatible.
- **New combat mechanic:** Extend `AttackResult`/`DefendResult` (or `SuccessTestResult`) for new test types, or `CombatResult` for new combat exchange patterns.
- **Custom modifiers:** Add deltas to the `MasteryLevelModifier` before `evaluate()` is called — don't modify the result after evaluation.
- **Keep `evaluate()` deterministic** from input state; avoid hidden side effects.
- **Keep `toChat()` payloads backward-compatible** for template and macro consumers.

# See Also

- [[doc-extensionpoints|Extension Points]]
- [[doc-modifiermodel|Modifier Model]]
- [[doc-bodystructure|Body Structure]].
