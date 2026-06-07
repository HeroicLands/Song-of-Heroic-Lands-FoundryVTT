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

### 3e. `SohlActionContext` generic + scope typing (commit `e8ea13d`)
This was the **pre-automated-combat work** in the session. `SohlActionContext`
became `SohlActionContext<S extends UnknownObject = UnknownObject>` with
`scope: S` as an **explicit named field** (was a `...rest` capture).

**The bug that drove it (two manifestations, both fixed):**
1. Callers passing a `scope: {...}` key (`SkillLogic`, `MasteryLevelModifier`)
   had it swallowed by the `...rest` and re-nested as `scope.scope` — silently
   lost, since read sites spread `context.scope` flat.
2. `toJSON` emits a `scope` key; feeding it back through the rest-capture
   constructor re-nested it, so `clone()` corrupted scope on every round-trip.
   The explicit named field fixes both.

**Migration:** `SohlItem.onChatCardButton` changed `...btn.dataset` →
`scope: { ...btn.dataset }` (the one site relying on the old flat-via-rest
behavior); `MasteryLevelModifier` dropped its `clone<SohlActionContext>()` cast.
The lost-scope call sites were inert (redundant-with-defaults or fed dead code),
so the fix was behavior-preserving.

**Typing convention chosen:**
- **Default `UnknownObject`** — "scope unspecified / heterogeneous." The plumbing
  (`ActionExecutorFn`, `execute()`) carries every action's context, so the
  honest default is the *weakest accurate* statement, not "empty."
- **`SohlActionContext<EmptyObject>`** — explicit "takes no scope." Applied to the
  `automated*` resume stubs: `automatedCombatStart`, `automatedBlockResume`,
  `automatedDodgeResume`, `automatedCounterstrikeResume`, `automatedIgnoreResume`.
  (`EmptyObject = Record<string, never>` — a global alias; satisfies the
  `extends UnknownObject` constraint where a bare `interface`/`{}` would not.)
- **`SohlActionContext<Partial<…ContextScope>>`** — typed scope. `BeingLogic.opposedTestResume`
  uses `Partial<OpposedTestResult.ContextScope>` (fields `priorTestResult` /
  `sourceSuccessTestResult`), with a runtime guard requiring at least one. Its
  JSDoc was corrected to match (field names + removed a stale `@returns`).

**Design rationale (kept here because it won't survive in the code):**
- **Stays a class, not an interface** — the constructor enforces invariants an
  interface can't: validation (speaker required → throws), coercion (target
  `Token|Actor|TokenDocument` → normalized `TokenDocument`; plain speaker data →
  `SohlSpeaker`), derived getters (`character`, `token`), and behavior
  (`clone`/`toJSON`). It's a value object with invariants, not a data bag.
- **Generic param, not subclasses** — dispatch is polymorphic *by data*: the
  action system matches the `type` **string** to an action and hands every
  executor the base type. A subclass buys nothing at that boundary (the executor
  still downcasts), so inheritance would just relocate the cast. A generic types
  the existing `…ContextScope` interfaces at the container instead.
- Constraint gotcha: a bare `interface` does **not** satisfy
  `S extends Record<string, unknown>`; use a `type` alias / `Partial<Interface>`
  / `Record<string, never>`. Construction sites get the real type-checking
  payoff; consumption stays structurally typed to avoid generic-variance friction
  with the bound-executor registry (which binds via `as any`, so narrowing a
  method param is safe but the dispatcher passes the base type).

---

## 4. Key design decisions (the "why")

- **Transparency is a first-class requirement.** This automates a true tabletop
  RPG; players must never suspect anyone is pulling a "fast one." So **every
  choice a user makes in a dialog is rendered into a chat card as soon as
  reasonably possible**, where everyone can see it — Aim, additional modifiers,
  selected strike mode, etc. — and numeric roll results are shown plainly (the
  roll value, the target, the breakdown). The attack card is the canonical
  example: it echoes the attacker's Aim and modifiers so there is no room for
  funny business. Bias toward over-disclosure in card layouts.
  - **The one exception is GM hidden rolls.** A GM may legitimately want certain
    rolls concealed. That is **not** a bespoke mechanism here — it goes through
    Foundry's normal chat-message visibility (blind / private / whisper roll
    modes). Build cards so they cooperate with those visibility modes rather than
    hard-coding disclosure.
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

### #1 orchestration — `automatedCombatStart` (IMPLEMENTED 2026-06-05)
The attacker entry flow is wired end-to-end (needs in-Foundry verification — the
glue is Foundry-dependent and not unit-testable):
- **`src/document/actor/foundry/automated-combat.ts`** (new glue module, kept
  apart from the pure `combat-actions.ts`): `startAutomatedAttack(params)` does
  resolve target (`resolveAttackTarget` + `getActiveCombat` membership) → attack
  dialog (Aim + Additional Modifier, `attack-dialog.hbs`) → `buildAttackResult` →
  add the situational modifier to the cloned ML → `evaluate()` (attacker owns
  speaker) → post `attack-card.hbs` via `speaker.toChat`. Plus
  `startAutomatedAttackFromItem` (weapon/technique entry; strike-mode picker when
  >1 attackable mode) and `startAutomatedAttackFromActor` (gathers every
  attackable mode across the actor's weapons + combat techniques, then picks).
- **Pure, unit-tested** `buildAttackCardData(input)` added to `combat-actions.ts`
  (mirrors `buildDamageCardData`): assembles the card render context from the
  evaluated `AttackResult`, embedding it kind-stamped as `attackResultData`
  (`instanceToJSON`). Tests in `tests/document/actor/combat-actions.test.ts`.
- The three `automatedCombatStart` stubs now delegate to those helpers.
- **`attack-dialog.hbs`** and **`attack-card.hbs`** were both **stale** (old
  zone-die design, malformed buttons, unregistered `jsonStringify`, wrong action
  names) and were **rewritten** to the new contract.
- **`aim` is carried separately** (a `data-aim` button attribute + card field),
  NOT added to `AttackResult` — that class is in the do-not-touch result pipeline.
  If aim must auto-thread into the injury card later, adding a field to
  `AttackResult` needs explicit do-not-touch sign-off.

Original wiring sketch (now done): resolve target (`resolveAttackTarget`) → show
attack dialog → `buildAttackResult` → `evaluate()` → post the attack card with
the serialized `AttackResult` in the defense buttons.

**Decisions — RESOLVED (user, 2026-06-05):**
1. **`allowedDefenses` derivation** → **gate by capability, at RENDER time.** At
   attack-card *build* time we do **not** know which strike mode (if any) the
   defender will use, so the card is generated with **all four buttons**. The
   gating happens when the card *renders on a client*: if that user has OWNER
   permission on the defender token, additionally show **Block** only if the
   defender has a strike mode that allows blocking (not `noBlock`), and show
   **Counterstrike** only if the defender has a strike mode that allows attacking
   (not `noAttack` — a counterstrike *is* an attack). **Dodge + Ignore are always
   shown** (to the defender owner). The same capability checks already back the
   resume-dialog filtering (`BeingLogic.automatedBlockResume` filters `noBlock`;
   `automatedCounterstrikeResume` filters `noAttack` — see the JSDoc at
   `BeingLogic.ts:543-604`).
2. **Attack dialog template** → **dedicated `attack-dialog.hbs`.** Just the Aim
   (body-part) select + Additional Modifier (Aspect derived from the strike mode,
   see §9).
3. **Card serialization** → **reuse the registered `toJSON` helper.** Do NOT add a
   `jsonStringify` helper; update `attack-card.hbs` to use `toJSON`. Embed the
   whole `AttackResult` via `instanceToJSON` in `data-attack-result-json`,
   rehydrated by the resume action with `instanceFromJSON`.

### Defense slices (after orchestration)
Resume actions on `BeingLogic` (stubs exist):
- **Ignore** — **IMPLEMENTED (see §12).** First full defender vertical.
  RESOLVED: the **Ignore button lives on the defender's card**, so clicking it
  runs `automatedIgnoreResume` **on the defender's client**, exactly like any
  other defense button. The `AttackResult` is already evaluated (the roll happened
  on the attacker's side), so the defender's job is simply to **output the result
  of the ignore** — it is a defender responsibility even though the "defense" is
  to do nothing. This means the current defender-centric `CombatResult.evaluate()`
  override is **correct as-is and stays** — no special-casing for Ignore.
- **Dodge** — **IMPLEMENTED (see §13).** No dialog; the defender rolls their
  Dodge skill.
- **Block** — **IMPLEMENTED (see §14).** Strike-mode-select dialog (bypassable);
  rolls the chosen mode's `defense.block`.
- **Counterstrike** (a *second attack*, not a defense → the defender slot is an
  `AttackResult`; injury button gated per target) — still to do.

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
- **`noCounterstrike` / `defense.counterstrike` are LEGACY** (user, 2026-06-05).
  A counterstrike is purely a normal attack: gated by `noAttack`, resolved with
  the strike mode's **`attack` ML** (not a separate counterstrike modifier). The
  `NOCOUNTERSTRIKE: "NoCX"` constant (`constants.ts:379`), the `defense.counterstrike`
  modifier, and the `data.traits?.noCounterstrike` check (`MeleeStrikeMode.ts:73-79`)
  are dead/to-be-removed — do **not** wire new automated-combat logic to them.
  Separate cleanup PR (don't fold into the combat feature; respect "small, focused
  changes" + "no cosmetic refactors").
- Register the remaining result classes (`DefendResult`, `OpposedTestResult`,
  `CombatResult`) when their flows are wired (needed for their round-trip).
- `SuccessTestResult` rebuilds `_speaker` from its token (ignores `data.speaker`);
  confirm that's right for rehydrated cross-client results.
- The `CombatResult.evaluate()` override is defender-centric — this now **stays**
  (Ignore was resolved to keep the defender's client building/evaluating the
  result, see Defense slices). Counterstrike produces two independent
  `AttackResult`s with no defend side, so it does not exercise this override
  either. No generalization needed.

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
| Results | `src/domain/result/{TestResult,SuccessTestResult,AttackResult,DefendResult,OpposedTestResult,CombatResult}.ts` |
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

---

## 9. UI & data layout spec (from `auto-combat.pdf`)

This is the visual/data contract for the dialogs and cards. The PDF screenshots
show the original (HarnMaster-style) flow; the SoHL deltas are called out below.

### Impact formula — source of truth
The impact formula (`XdY+Z` and aspect) lives on the **strike mode**, **not**
derived from the opposed-test margin. `StrikeModeBase` builds
`impact: ImpactModifier` in its constructor from the persisted `impactBase`
schema (`src/domain/strikemode/StrikeModeBase.ts:59-93` and the schema at
`:146-163`):
- `numDice` — the `X` in `XdY+Z`
- `die` — die faces (`Y`); **`null`** when the mode contributes no dice of its
  own (e.g. a bow whose impact dice come from the projectile)
- `modifier` — the flat `+Z`
- `aspect` — the `ImpactAspect` (e.g. Edged), also sourced here

The differing dice counts across the PDF result cards (`1d6+5` / `2d6+5` /
`3d6+5`) are **separate illustrative examples**, not a margin-scaled mechanic.
`buildAttackResult` / `resolveStrikeModeImpact` should treat the strike mode's
`ImpactModifier` as authoritative for the formula.

### Attack dialog (SoHL)
Two fields only: **Aim** (body-part select from `BodyStructure.parts`,
`BodyPart.name` as label) + **Additional Modifier**. Weapon Aspect is **omitted**
(derived from the strike mode). Title carries attacker, defender, and weapon
(e.g. "Char1 vs. Char2 Attack with Bastard Sword").

### Attack card
- Title `<Weapon> <Mode> Attack`; subtitle `<Attacker> vs. <Defender>`.
- Body shows **Aim**, **Aspect**, **AML** (plain AML at this stage — Eff. AML/DML
  appear only on the result card).
- Four defender buttons in a **2×2 grid**: Dodge / Counterstrike / Block /
  Ignore. Rendered only for OWNERs of the defender token (decided at render time).

### Block dialog (SoHL)
Select a **Strike Mode** (not a weapon) + **Addl Defense Modifier**. Title
`<Defender> Select …`.

### Result card (shared layout for all four defenses)
Two columns **Attack | Defend**, rows:
- strike mode name
- **Eff. AML** / **Eff. DML**
- Roll
- success level (e.g. Marginal Success, Critical Failure)

Then an outcome line — `Attacker strikes for XdY+Z impact.` on a hit, or
`Attack misses.` — followed (on a hit) by the impact breakdown
`Attack Impact (Base + Roll): 5 + (3 + 4) = 12` and a `Calculate <Token> Injury`
button (token name in the label). **Ignore and Counterstrike show dashes (—) in
the entire Defend column** (no defense roll occurs).

### Counterstrike → two cards
Treated as two independent attacks, producing two cards:
- "Attack Result / `<Attacker>` vs `<Defender>`"
- "Counterstrike Result / `<Defender>` vs `<Attacker>`"

Each card carries its own `Calculate <Token> Injury` button, gated to that
target's owner (Char1's owner sees "Calculate Char1 Injury", not Char2's, and
vice versa).

### Injury card
- Header `<Location> Injury` + target name (e.g. "Left Shoulder Injury" / Char2).
- Rows: **Aim**, **Aspect**, **Armor Layers (prot)** (e.g. "None (0)"),
  **Eff Impact** as `impact − armor = net` (e.g. `12 - 0 = 12`), **Injury Level**
  (e.g. `S3`), and "Injury recorded on character sheet".
- Conditional **Fumble Roll** and **Shock Roll** buttons, shown by severity/index
  (serious arm injury → fumble; high injury index → shock).

---

## 10. Result-pipeline merge + dialog-bypass pattern (2026-06-06)

### `ImpactResult` collapsed, then **reintroduced source-agnostic**
The old `ImpactResult` (a `SuccessTestResult` subclass bolting impact onto the
combat test) was **deleted**, and its members rehomed (below). It was then
**reintroduced as a fundamentally different class** (2026-06-06): a
**source-agnostic** `extends TestResult` (NOT a `SuccessTestResult`) representing
*the result of computing an impact from any source* — a hit, a fall, a spell, a
trap. It carries `impactModifier`, the rolled `roll`, `aimBodyPartCode`, and a
`source` label; `get total()` / `get aspect()`. It is rolled on creation and
feeds injury resolution. Pipeline: `<source>` → `ImpactResult` (raw, pre-armor) →
injury resolution → injury. Registered in `SohlSystem` Result config + the
public-api `.d.ts`. Tests: `tests/domain/result/ImpactResult.test.ts`.

Rehoming of the **old** class's members:
- **`impactModifier`** → lives on `AttackResult` only, **renamed `impact`**
  (the attack's damage *formula/capability*; `DefendResult` has no impact).
  `AttackResult` also gained **`aimBodyPartCode`** (aim travels *on* the result).
  `AttackResult` **no longer rolls impact** — `impactRoll` was removed (it was
  rolled in the attack test, before the blow was known to land, and read
  nowhere). The roll now happens when the blow lands, producing an `ImpactResult`
  (see §11). `AttackResult` also dropped `allowedDefenses`,
  `situationalModifier`, `damage`, `modifiers`.
- **`deliversImpact`** → **removed entirely** from the result classes (it does
  not belong on a `SuccessTestResult`/`AttackResult`/`DefendResult` — whether a
  blow lands is an *exchange* outcome, not a single test's). Replaced by derived
  getters on `CombatResult`: **`attackerLandsBlow` / `defenderLandsBlow`**
  (defender only via Counterstrike), computed from `margin` / `defendResult.testType`
  / `isSuccess` / rolls. "Lands a blow" means *connected* — the blow may still be
  fully absorbed by armor in impact resolution, so it does not imply damage. The
  `CombatResult` calculators (`calcMeleeCombatResult`/`calcDodgeCombatResult`)
  were removed; `opposedTestEvaluate` now computes only margin / TAs / weapon-break.
- `AttackResult`/`DefendResult` now `extends SuccessTestResult` directly (the
  intermediate combat-coupled `ImpactResult` base is gone; the new `ImpactResult`
  is unrelated to them — it's a sibling under `TestResult`).

**Knock-on reconciliation:** `buildAttackResult`/`buildAttackCardData`
(`combat-actions.ts`) and `automated-combat.ts` now use `impact` +
`aimBodyPartCode` (the earlier "carry aim separately to avoid touching
do-not-touch `AttackResult`" workaround is **gone** — aim is on the result).
The card always emits **all four** defense buttons (render-time gating handles
capability), so `allowedDefenses` is no longer needed on the result. Tests in
`combat-actions.test.ts` and `result-roundtrip.test.ts` updated to the new shape.

### Do-not-touch list
`CLAUDE.md` no longer lists `src/domain/result/*` or `src/domain/modifier/*`
(removed at the user's request — these are now freely editable). The other
foundations (`SohlSystem`, `SohlDataModel`, `SohlItem`/`SohlActor`, `SohlLogic`,
world migration, `sohl.ts`) remain off-limits.

### Dialog-bypass / testability pattern (`skipDialog` + `scope`)
General rule for intrinsic actions that show a dialog: support running headlessly
by setting **`context.skipDialog`** (already a top-level field, also set by
shift-click) and supplying the would-be dialog values in **`context.scope`**.
- New leaf helper **`src/utils/actionInput.ts` → `resolveActionInput(ctx, {fromScope, dialog})`**:
  `skipDialog` → values from `scope` (`fromScope` must be total/defaulted);
  else → the dialog. Dialog callbacks are **side-effect-free** (return data); the
  action applies the values at **one site**. Unit-tested in
  `tests/utils/actionInput.test.ts`.
- **Retrofitted:** `MasteryLevelModifier.successTest` and the `automated-combat.ts`
  dialogs (attack dialog + strike-mode picker). `opposedTestStart` is covered
  transitively (it routes through `successTest`).
- **Deliberately NOT retrofitted:** `SuccessTestResult.testDialog` /
  `AttackResult.testDialog` are **vestigial** (no caller, no `context` param) —
  candidates for deletion in a separate cleanup. `SohlActor.ts:190`'s dialog is
  in a **do-not-touch foundation** file — needs explicit sign-off.

---

## 11. Counterstrike model + impact rolled on landing (2026-06-06)

### `CombatResult` defender side is now a union
A `CombatResult` is **one `AttackResult` (attacker) + one defender response**,
where the defender's **class** encodes the defense:
- **Block / Dodge** → a `DefendResult` (defensive test, no impact).
- **Counterstrike** → an **`AttackResult`** — mechanically a second attack
  ("offense is the best defense"): own strike mode, aim, bonuses, and **impact**.
- **Ignore** → a non-rolling **`DefendResult(IGNORE)`** placeholder (the defender
  takes no part; renders as `—`). Kept as a placeholder rather than `null` so
  `OpposedTestResult`'s non-null `targetTestResult` invariant is untouched.

`CombatResult.defendResult` is typed `AttackResult | DefendResult`. Defenses are
discriminated **by class + testType**: `defendResult instanceof AttackResult` ⇒
counterstrike; otherwise a `DefendResult`, block vs dodge vs ignore by `testType`.
`attackerLandsBlow`/`defenderLandsBlow` updated accordingly (`defenderLandsBlow`
= the defender is an `AttackResult` and its roll succeeds).

### Impact is rolled when the blow lands
`opposedTestEvaluate` now produces an `ImpactResult` (see §10) for each side that
lands a blow, rolling the impact at that point:
- `CombatResult.attackerImpact?` — from `attackResult.impact` when `attackerLandsBlow`.
- `CombatResult.defenderImpact?` — from the counterstrike `AttackResult`'s impact
  when `defenderLandsBlow` (now possible because the counterstrike carries impact).

Production is guarded on the side actually carrying an impact formula, so a
`DefendResult` (block/dodge/ignore) yields no impact, and lightweight test
stand-ins without an impact are skipped. Tests:
`tests/domain/result/CombatResult.test.ts` ("impact rolled on the blow landing").

---

## 12. Ignore defense resume — first defender vertical (2026-06-06)

The first end-to-end defense slice. Defender clicks **Ignore** → resolves on the
defender's client → posts the combat-result card with a "Calculate Injury" button.

- **`SohlActor.onChatCardButton`** (was a stub handling only `createInjury`) now
  does the same **generic logic-dispatch** as `SohlItem`: builds a
  `SohlActionContext` with `scope: {...btn.dataset}`, finds the action by name on
  `this.logic.actions`, and executes it (falling back to a method by name). This
  is the foundational T1-1 wiring for **all** defender chat-card actions.
  (`SohlActor.ts` is do-not-touch; this edit was explicitly authorised.)
- **`BeingLogic.automatedIgnoreResume`** (glue): rehydrate the attacker's
  `AttackResult` snapshot from `scope.attackResultJson` (`instanceFromJSON`) →
  build a non-rolling `DefendResult(IGNORE)` placeholder → `CombatResult` →
  `opposedTestEvaluate()` → post `attack-result-card.hbs` as the defender.
- **`buildCombatCardData`** (pure, in `combat-actions.ts`, tested): render context
  for `attack-result-card.hbs` from a `CombatResult` — two columns, Ignore dashes
  the Defend column, and a per-landing-side **`createInjury`** button (assisted:
  `{ impact, aspect }`; aim auto-threading is a follow-up — needs `accuracy` on
  `AttackResult`). The attacker's weapon label rides on `AttackResult.title`
  (set by `buildAttackResult`); the attacker name comes from the rehydrated
  speaker.
- **`attack-result-card.hbs`**: removed the duplicate licence header; replaced the
  stale zone-die "damage" / stumble / fumble / TA buttons with the `createInjury`
  injury buttons. (Stumble/Fumble/TA follow-up buttons deferred — the card still
  shows them as text.)

### Modifier name/shortcode validation removed (per user, 2026-06-06)
`ValueModifier._oper` and `ValueDelta`'s constructor used to require the delta
**name** to start with `"SOHL.INFO."` (and a non-empty shortcode). Real callers
pass `VALUE_DELTA_ID.*` (names `"SOHL.ValueDelta.INFO.*"`) and plain display
strings, so the checks threw the moment any real modifier was added (latent —
e.g. it blocked constructing a `DefendResult`). Per the user, **name/shortcode are
now passed through unvalidated** (they are display / identity labels, not
localization keys). Note: the **situational modifier** is, by convention, just
the delta whose shortcode is `VALUE_DELTA_ID.PLAYER` (`"SitMod"`) — a separate
`situationalModifier` property is optional, not required.

---

## 13. Dodge defense resume (2026-06-06)

Second defender vertical; reuses the Ignore infrastructure (§12). Unlike Ignore,
the defender actually **rolls** a Dodge test.

- **`resolveSkillMasteryLevel(actor, shortcode)`** (new pure helper in
  `combat-actions.ts`, tested): finds the actor's `type: "skill"` item whose
  `system.shortcode` matches and returns its `logic.masteryLevel`. The shortcode
  is static / non-localized.
- **`SKILL_CODE`** (new `defineType` in `constants.ts`): well-known skill
  shortcodes — `DODGE = "dge"`, `INITIATIVE = "init"` — so code keys off a
  constant, not a magic string.
- **`BeingLogic.automatedDodgeResume`**: rehydrate the attacker snapshot → build a
  **rolling** `DefendResult(DODGE)` from a clone of the Dodge skill's
  `masteryLevel` → `CombatResult` → `await combatResult.evaluate()` (rolls the
  dodge on the defender's client, then resolves) → post the combat-result card.
- **Refactor:** Ignore + Dodge now share `BeingLogic` privates
  `_rehydrateAttackResult`, `_buildCombatResult`, `_postCombatResultCard`. Ignore
  uses `opposedTestEvaluate()` (no defender roll); Dodge uses `evaluate()`.

Dodge tie-break (attack lands when the dodge roll is lower than the attack roll)
is already encoded in `CombatResult.attackerLandsBlow` (§11).

---

## 14. Block defense resume (2026-06-06)

Third defender vertical. Like Dodge (defender rolls), but it adds a strike-mode
select dialog and rolls the chosen mode's block modifier instead of a skill.

- **`collectBlockableStrikeModes(actor)`** (new pure helper in `combat-actions.ts`,
  tested): gathers melee modes across the actor's weapons + combat techniques
  whose `defense.block` exists and isn't disabled (not `noBlock`); returns
  `{ itemId, smId, itemName, label, ml }` (the live block modifier).
- **`showDefenseDialog(title, selectLabel, choices)`** (new glue in
  `automated-combat.ts`): a select + Additional Modifier dialog, side-effect-free
  → `{ key, situationalModifier } | null`.
- **`BeingLogic.automatedBlockResume`**: rehydrate snapshot → list blockable
  modes → `resolveActionInput` (dialog, or `scope.itemId`+`strikeModeId`+
  `situationalModifier` when `skipDialog`) → build a rolling `DefendResult(BLOCK)`
  from a clone of the chosen block modifier → `CombatResult.evaluate()` → post
  the card with `defenseLabel = "Block w/ <itemName>"`.
- Block's tie weapon-break check is already in `CombatResult.opposedTestEvaluate`
  (§11): a tie sets `weaponBreakCheck = "defender"`.

Defenders done: **Ignore (§12), Dodge (§13), Block (§14).** Remaining:
**Counterstrike** — defender slot is an `AttackResult` (model in place, §11); the
attack-card Counterstrike button would resolve to a second attack with its own
impact + injury button.

---

## 15. Missile range / accuracy foundations + injury auto-resolution (2026-06-06)

Pure, tested primitives in `combat-actions.ts` (for the upcoming attack-flow
restructure):
- **`collectAttackableStrikeModes(actor, distanceFeet)`** — attackable modes by
  range: melee limited by `reach.effective`, missile by `baseRange.effective`
  (beyond base range = volley = excluded — automated combat does not support
  volley). Empty ⇒ target out of range of every mode.
- **`classifyMissileRange(distance, baseRange)`** — `≤ baseRange/2` = point blank
  (accuracy 6, impact +2); `≤ baseRange` = direct (accuracy 8); beyond =
  `direct:false` (volley).
- **`indexOfBestMastery(entries, ml)`** — the "best chance" default (highest
  effective ML).

Accuracy now travels to injury resolution, completing **aim auto-threading**:
- `AttackResult.accuracy` and `ImpactResult.accuracy` added (melee = strike
  mode `spread`; missile = 6/8). `buildAttackResult` / `CombatResult.rollImpact`
  forward it.
- `buildCombatCardData`'s injury button now emits `targetPart` + `accuracy` when
  the blow was aimed, so `createInjury` resolves the hit location **automatically**
  (falls back to the assisted dialog when unaimed).

Still to wire (next): the attacker flow restructure (resolve target + distance →
range-filtered mode list → out-of-range short-circuit → point-blank impact/accuracy
→ melee accuracy = spread → recent/best default), `SohlCombatantDataModel`
persistence of last attack/block mode, Block defaults, and the user-facing
"volley unsupported" doc note.
