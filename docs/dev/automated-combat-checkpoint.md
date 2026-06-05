# Automated Combat — Session Checkpoint

**Branch:** `feat/automated-combat`
**Date:** 2026-06-05
**Purpose:** Resume point for the automated-combat work. Captures what is done,
the design decisions made, and what remains — so work can continue on another
machine.

---

## 1. Goal

Implement **Automated Combat** for SoHL: an attacker invokes an attack on a
weapon/combat technique; a chat card offers the defender Block / Dodge /
Counterstrike / Ignore; the chosen defense resolves on the defender's client;
a combined result card shows the exchange; if a hit lands, an injury is
calculated and auto-applied. Cross-client: the attacker's result is serialized
into the card's buttons and rehydrated on the defender's client.

The canonical expected flow (from the user's `auto-combat.pdf` reference) is
summarized in **Section 6**.

---

## 2. Commits on this branch (this work)

- `e8ea13d cleanup and refactor` — (pre-existing at session start; committed by
  the user) **generic `SohlActionContext<S>`** refactor + `BeingLogic`
  scope typing (`opposedTestResume` uses `Partial<OpposedTestResult.ContextScope>`,
  the `automated*` stubs use `SohlActionContext<EmptyObject>`).
- `e32f1e5 feat(combat): kind-registry round-trip for result serialization`
- `2c91d6f feat(combat): attack-result assembly, snapshot contract, faithful clone`

Everything below `e8ea13d` is pushed to `origin/feat/automated-combat`.

---

## 3. What is DONE (with tests)

### 3a. Kind registry + serialization round-trip (commit `e32f1e5`)
The dormant `__kind` infrastructure is now completed so domain instances survive
a **serialize → JSON string → rehydrate** trip (an `AttackResult` embedded in a
chat-card data attribute, reconstructed on the defender's client).

- **`src/utils/kindRegistry.ts`** (new, leaf module): `registerKind(kind, ctor)`,
  `getKindForCtor(ctor)`, `getCtorForKind(kind)`. Imports nothing → no cycles.
  Classes **self-register** at module load, so importing a class makes it
  serializable.
- **`src/utils/helpers.ts`**:
  - `instanceToJSON` stamps `__kind` via the registry (falls back to a legacy
    static `kind`) and **skips the transient `_parent` back-reference** (it is
    re-supplied via `options.parent`; serializing it bloated the payload / could
    recurse the logic graph).
  - `defaultFromJSON(value, ctx?)` now revives registered instances **bottom-up**
    (children first, so a constructor receives live nested instances), threading
    `ctx.parent`.
  - `instanceFromJSON<T>(jsonOrString, parent)` — the public rehydrate entry point.
- **Self-registered classes:** `SimpleRoll`, `ValueDelta`, `MasteryLevelModifier`,
  `ImpactModifier`, `SuccessTestResult`, `AttackResult` (and later `CombatModifier`,
  `SohlActionContext`, `SohlSpeaker`).
- **Bug fixed:** `TestResult.get parent()` returned `this.parent` (infinite
  recursion) instead of `this._parent`. Latent until results were first
  constructed in a test.
- Tests: `tests/domain/result/result-roundtrip.test.ts`.

### 3b. Snapshot contract (commit `2c91d6f`, items "#2a/#2b")
The attacker's `AttackResult` crosses to the defender as a **read-only,
already-evaluated snapshot**; the defender never re-runs the attacker's gated
`evaluate()`.

- **`SuccessTestResult` constructor** now restores `_successLevel` from data
  (`data.successLevel ?? MARGINAL_FAILURE`) — was hardcoded to `MARGINAL_FAILURE`,
  which discarded the attacker's evaluated outcome on rehydrate.
- **`CombatResult.evaluate()`** overridden to evaluate **only the defender's
  side** (`this.defendResult.evaluate()`), then `opposedTestEvaluate()`. The
  inherited `OpposedTestResult.evaluate()` evaluates *both* children, which would
  trip the attacker's `_speaker.isOwner` gate on the defender's machine.
  (`CombatResult` is not constructed anywhere live yet, so this is safe.)
- Tests: snapshot round-trip in `result-roundtrip.test.ts`; evaluate behavior in
  `tests/domain/result/CombatResult.test.ts`.

### 3c. Attack-result assembly — "#1 core" (commit `2c91d6f`)
Foundry-free, in **`src/document/actor/foundry/combat-actions.ts`** (beside the
existing `resolveStrikeModeML` / `resolveStrikeModeImpact`):

- **`buildAttackResult(input)`** — assembles an `AttackResult` from a strike
  mode's resolved attack ML + impact, rolling a fresh d100 (injectable for
  tests). **Clones the modifiers via `.clone()`** so the result is independent of
  (and serializable without) the live strike mode. Result is *not yet evaluated*
  — caller runs `evaluate()` on the attacker's client before posting.
- **`resolveAttackTarget(targeted, isInCombat)`** — the rule: exactly one
  targeted token, which must be in combat, else throws (user-facing messages).
- Tests: `tests/document/actor/combat-actions.test.ts`.

### 3d. Central `clone` fix + registrations (commit `2c91d6f`)
`.clone()` was broken (serialized but never revived → nested deltas/Sets/rolls
came back as inert plain objects). `AttackResult` never had a `clone` at all.

- **`cloneInstance`** reimplemented via `toJSON` → `defaultFromJSON`: prefers a
  custom `toJSON` (e.g. `SohlSpeaker`'s id-based one), merges `data` overrides,
  then revives. Registered top-level types reconstruct to their concrete class;
  unregistered ones get children revived and are rebuilt via their constructor.
  `parent` defaults to the source's own parent — this **un-breaks**
  `MasteryLevelModifier.successTest`'s `this.clone()`.
- **Registered `CombatModifier`, `SohlActionContext`, `SohlSpeaker`.**
  `SohlSpeaker.toJSON` now carries a `__kind` tag (its serialization is custom,
  emitting ids), so it revives as a live `SohlSpeaker`.
- `buildAttackResult` now uses `.clone()` (dropped its bespoke round-trip helper).
- Tests: implemented the two previously-blocked `it.todo`s in
  `tests/domain/modifier/ValueModifier.test.ts` (clone is now a faithful,
  independent copy); round-trip tests in `SohlActionContext.test.ts` and
  `SohlSpeaker.test.ts`.

### 3e. `SohlActionContext` generic (commit `e8ea13d`)
`SohlActionContext<S extends UnknownObject = UnknownObject>` with `scope: S` as
an explicit field (was a `...rest` capture that double-nested a `scope:` key and
broke clone round-trips). Default stays `UnknownObject` (widest accurate type);
`EmptyObject` is the explicit "takes no scope" opt-in; `Partial<…ContextScope>`
for typed scope. `BeingLogic.opposedTestResume` typed + guarded against the
existing `OpposedTestResult.ContextScope`.

---

## 4. Key design decisions (the "why")

- **Re-test ≠ re-roll.** A re-test keeps the stored dice and re-applies
  modifiers/choices, recomputing the outcome (`SuccessTestResult.evaluate()` is
  idempotent over the stored `_roll`). `priorTestResult` carries the full prior
  state. Two levers: `successLevelMod` (post-roll delta) and additive deltas via
  `.add()` (changes the effective target, so the roll-vs-target comparison and
  last-digit crit can flip).
- **Cross-client transfer ≠ re-test.** The attacker's result crosses as a
  finished **snapshot** (read-only). Only the owner re-tests on their own client.
  This is why `_successLevel` is restored on rehydrate and `CombatResult` does not
  re-evaluate the attacker.
- **Speakers:** each result's `_speaker` is its own actor; each **card is
  authored/spoken by the client that produces it** (attack card → attacker;
  defense/combat/injury cards → defender/target). The single-speaker look in the
  reference screenshots was a GM artifact (GM owned both tokens). No client ever
  needs to own the other actor's speaker.
- **Ownership gate:** `SuccessTestResult.evaluate()` bails unless
  `this._speaker.isOwner` (Foundry document ownership). The defender evaluates
  only its own `DefendResult`; the `CombatResult` reads the attacker snapshot.
- **`Aim`** (attack dialog) is a select whose options are the **target's body
  parts** — `BodyStructure.parts` (`BodyPart.name` as label). Not a fixed list.
- **`clone()` is now the faithful deep-copy** primitive (via the registry
  round-trip); prefer it over hand-rolled serialize/rehydrate.

---

## 5. What's LEFT — next steps

### #1 orchestration — `automatedCombatStart` (Foundry glue, not yet started)
Entry stubs exist on `WeaponGearLogic`, `CombatTechniqueLogic`, and `BeingLogic`
(all `automatedCombatStart(context: SohlActionContext<EmptyObject>)`, empty).
Wire: resolve target (`resolveAttackTarget`) → show attack dialog (Aim +
Additional Modifier; strike-mode select if invoked on a weapon) → `buildAttackResult`
→ `evaluate()` (attacker owns speaker) → post the attack card with the serialized
`AttackResult` in the defense buttons.

**Three decisions still open (need user input):**
1. **`allowedDefenses` derivation** — proposed: dodge + ignore always; block /
   counterstrike only if the *defender* has a strike mode with that defense
   enabled (not `noBlock` / `noCounterstrike`). CONFIRM.
2. **Attack dialog template** — reuse `standard-test-dialog.hbs`, or a new
   `attack-dialog.hbs` with the Aim (body-part) select + Additional Modifier?
3. **Card serialization** — `attack-card.hbs` buttons reference a `jsonStringify`
   helper that is NOT registered (only `toJSON` is, in `src/sohl.ts`). Plan:
   register it (or reuse `toJSON`) and embed the whole `AttackResult` via
   `instanceToJSON` in `data-attack-result-json`, rehydrated by the resume action
   with `instanceFromJSON`. CONFIRM.

### Defense slices (after orchestration)
Resume actions on `BeingLogic` (stubs exist):
- **Ignore** first (no dialog, no defense roll) — simplest full vertical slice.
  NOTE: Ignore is processed without defender participation; decide which client
  builds/evaluates the `CombatResult` (the `CombatResult.evaluate` override
  currently assumes the defender evaluates `defendResult` — revisit for Ignore).
- **Dodge** (no dialog), **Block** (strike-mode-select dialog), **Counterstrike**
  (a *second attack*, not a defense → two `AttackResult`s, two cards, injury
  button gated per target).

### Injury pipeline
`Calculate <Token> Injury` button → location, armor reduction, effective impact,
injury level (e.g. S3), auto-create Injury item, conditional Fumble/Shock roll
buttons. (See `injury-actions.ts`, `buildDamageCardData` in `combat-actions.ts`,
`src/domain/body/InjuryResolution.ts`.)

### Render-time button gating
Defense buttons visible only to the defender's OWNER; injury buttons to the
target's owner + GM (token name in the label). Decided at chat-card render time
from a target actor/token uuid on the button.

### Loose ends
- Register the remaining result classes (`DefendResult`, `OpposedTestResult`,
  `CombatResult`) when their flows are wired (needed for their round-trip).
- `SuccessTestResult` rebuilds `_speaker` from its token (ignores `data.speaker`);
  confirm that's right for rehydrated cross-client results.
- The `CombatResult.evaluate()` override is defender-centric — generalize when
  Ignore / Counterstrike paths are built.

---

## 6. Expected flow (from `auto-combat.pdf`)

1. Attacker picks a strike mode → dialog: **Aim** (target body part) + Additional
   Modifier (Aspect comes from the strike mode in SoHL).
2. Attack card (speaker = attacker): shows Aim, Aspect, AML, and the params.
   Four defender buttons — rendered only for OWNERs of the defender token.
3. Defense (defender's client): Block (pick blocking strike mode + modifier),
   Dodge (no dialog), Ignore (no dialog, no participation), Counterstrike (a
   second attack → two cards).
4. Combat result card: Attack vs Defend side by side (strike modes, Eff AML /
   Eff DML, rolls, success levels, impact formula + total if a hit). A hit shows
   "Calculate <TargetName> Injury" (owner + GM).
5. Injury: location, armor reduction, effective impact, injury level; Injury item
   auto-created; Fumble/Shock follow-ups by severity.

---

## 7. Map of relevant files

| Area | Files |
|---|---|
| Serialization / registry | `src/utils/kindRegistry.ts`, `src/utils/helpers.ts` (`instanceToJSON`/`defaultFromJSON`/`instanceFromJSON`/`cloneInstance`) |
| Action context | `src/core/SohlActionContext.ts` (generic + registered) |
| Speaker | `src/core/SohlSpeaker.ts` (registered; custom toJSON w/ `__kind`) |
| Results | `src/domain/result/{TestResult,SuccessTestResult,ImpactResult,AttackResult,DefendResult,OpposedTestResult,CombatResult}.ts` |
| Modifiers | `src/domain/modifier/{ValueDelta,ValueModifier,MasteryLevelModifier,CombatModifier,ImpactModifier}.ts` |
| Strike modes | `src/domain/strikemode/{StrikeModeBase,MeleeStrikeMode,MissileStrikeMode}.ts` |
| Combat helpers (Foundry-free) | `src/document/actor/foundry/combat-actions.ts` (`buildAttackResult`, `resolveAttackTarget`, `resolveStrikeModeML/Impact`, `buildDamageCardData`) |
| Action stubs | `src/document/{item/logic/WeaponGearLogic,item/logic/CombatTechniqueLogic,actor/logic/BeingLogic}.ts` |
| Body / injury | `src/domain/body/{BodyStructure,BodyPart,BodyLocation,InjuryResolution}.ts`, `src/document/actor/foundry/injury-actions.ts` |
| Chat cards | `templates/chat/{attack-card,attack-result-card,damage-card}.hbs`; helpers in `src/sohl.ts` (`toJSON` registered; `jsonStringify` NOT) |
| Chat button handler | `src/document/item/foundry/SohlItem.ts` `onChatCardButton` (copies `btn.dataset` → `context.scope`) |

---

## 8. Build / test commands

```
npm run build       # types -> vitest -> bundle  (pre-commit gate, must pass)
npm run docs        # TypeDoc (must pass; the 2 README license-link warnings are pre-existing)
npm run build:types # fast TS check only
npm run test        # vitest
```

Many domain test files are `it.todo` stubs; the full suite currently passes
(855 tests) with 478 todos. The result/modifier round-trip and combat-action
tests added this session all pass.
