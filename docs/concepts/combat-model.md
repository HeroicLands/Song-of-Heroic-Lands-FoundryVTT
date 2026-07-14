# Combat Model

> **Audience:** Developers extending combat — the two combat modes and how the
> combat flow is wired programmatically.

See also: [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md)
(the result classes and opposed-test math), [Scene, Token, and Combatant
Systems](../reference/scene-token-combatant.md) (the combatant model),
[Macros and Actions](./macros-and-actions.md), and the player-facing
[Combat Basics](https://heroiclands.org/sohl/user-guide/) guide.

## Two modes, one rules engine

SoHL runs combat two ways, and both resolve rolls through the **same** engine —
a d100 roll-under against a `MasteryLevelModifier`, producing a
`SuccessTestResult` (see the [pipeline doc](../reference/combat-resolution-pipeline.md)).
They differ only in how much of the exchange the system drives:

|                  | **Assisted**                                                    | **Automated**                                            |
| ---------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| Scope            | A single roll (attack / block / counterstrike / dodge / impact) | The whole attacker↔defender exchange                     |
| Context required | None                                                            | A running combat encounter, combatants, tokens, a target |
| Workflow         | None — posts one test card                                      | Multi-stage, cross-client, chat-driven                   |
| Entry            | Being-sheet Combat-tab cells                                    | `StrikeModeBase.automatedCombatStart` / combatant action |
| Result types     | `SuccessTestResult`                                             | `AttackResult` + `DefendResult` → `CombatResult`         |

The rule of thumb when extending: **assisted combat is a thin wrapper over
`successTest`; automated combat is an orchestration layer on top of the same
results.** Anything that must work "anytime, anywhere" belongs on the assisted
path; anything that coordinates two combatants belongs on the automated path.

## Assisted combat

Assisted combat is deliberately **workflow-free and context-free** — no combat,
combatant, target, turn, or token is required. It is driven entirely from the
Being sheet's Combat tab.

- **`BeingSheet._onRollStrikeModeTest`** (`src/document/actor/foundry/BeingSheet.ts`)
  reads `data-sm-id` / `data-item-id` / `data-test-kind` off the clicked cell,
  resolves the `StrikeModeBase`, and calls
  **`selectStrikeModeModifier(sm, testKind)`** (`being-sheet-view.ts`), which
  maps `attack → sm.attack`, `block → sm.defense.block`,
  `counterstrike → sm.defense.counterstrike`.
- It then builds a bare `SohlActionContext` (shift-click sets `skipDialog`) and
  calls **`mlMod.successTest(context)`** directly. That posts a standard
  success-test card — no opposed resolution, no second party.
- Impact is assisted the same way: **`_onRollStrikeModeImpact`** reads the strike
  mode's `impact` modifier and dispatches the actor's `calcImpact` action
  (`actorLogic.executeAction("calcImpact", …)` with the modifier on
  `context.scope`), posting a damage card. Skills use the identical shape via
  `_onRollSkillTest` → `skillLogic.successTest`.

Because it only touches the strike-mode modifiers and `successTest`, the assisted
path never references combat state. There are **no weapon-level attack/block/
counterstrike actions** — assisted combat is per-strike-mode only (#69), and
dodge is a Dodge-skill test, not a Combat-tab cell.

## Automated combat

Automated combat is an opinionated, chat-card-driven workflow that coordinates an
attacker and a defender across clients. The orchestration lives in
**`SohlCombatantLogic`** (`src/document/combatant/logic/SohlCombatantLogic.ts`),
and every stage exchanges an evaluated result through a chat card.

### Requirements

To _start_ an automated attack:

- **The attacker must be a combatant in the active combat.**
  `StrikeModeBase.automatedCombatStart` resolves the combatant with
  `fvttActiveCombatantForActor(this.parent.actor)` and warns/aborts if the actor
  is not in the active combat (the tracker entry is on the combatant itself).
- **The attacker must not be out of the fight.** `startAutomatedAttack` aborts
  when `attackerBlockingStatus(this.data.statuses, this.data.isDefeated)` (against
  `ATTACK_BLOCKING_STATUSES` — dead, vanquished, unconscious, sleep, restrained,
  paralyzed, frozen, incapacitated) returns a status.
- **A target is required, and must be a valid combatant.**
  `startAutomatedAttack` aborts when `context.target` is absent, when it does not
  resolve to a combatant in the active combat, or when
  `targetInvalidStatus(...)` (against `TARGET_INVALID_STATUSES` — `dead` /
  `vanquished`) reports the target is dead or defeated/surrendered.
- **Range** is computed (`fvttRangeToTarget`) and validated per strike mode
  (melee `reach.effective`, missile `baseRange.effective`); missile _volley_
  beyond base range is explicitly unsupported.

Defender-side gating is likewise fully wired at card-render time (see
[Cross-client handoff](#cross-client-handoff)).

> **Note — no turn gate.** There is deliberately **no "it must be your turn"
> gate**: the attacker/target invariants above are enforced, but automated and
> assisted combat can be freely interleaved (a defender may counterstrike out of
> turn, a fight may drop to assisted mid-exchange). The status sets and the
> `attackerBlockingStatus` / `targetInvalidStatus` predicates are pure and
> unit-tested.

### Entry points

Both converge on one executor, `SohlCombatantLogic.startAutomatedAttack`:

1. **From a weapon/technique** — `StrikeModeBase.automatedCombatStart` stuffs the
   strike mode's `pointerData` into `context.scope.mode` (so only that weapon's
   modes are offered) and delegates:
   `combatantLogic.executeAction("automatedCombatStart", context)`.
2. **From the combat tracker** — the combatant's intrinsic `automatedCombatStart`
   action (`executor: "startAutomatedAttack"`, `visible: "true"`, group
   `ESSENTIAL`) is injected into the tracker row's context menu by
   `combat-tracker-hooks.ts`, gated on `combatant.isOwner`.

### The exchange, stage by stage

| Stage                            | Driver                                                                                                           | What happens                                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Attack roll**               | `startAutomatedAttack` → `commonAttack` (shared attack dialog) → `buildAttackResult` → `attackResult.evaluate()` | The attack is **pre-evaluated on the attacker's client** (the roll is the attacker's). A miss disables impact; impact is _not_ rolled yet.                                                                                                                  |
| **2. Attack card**               | `buildAttackCardData` → `templates/chat/attack-card.hbs`                                                         | Emits **all four** defense buttons; embeds the serialized `AttackResult` in the card's `data-scope`; addresses the **target actor** via `handlerActorUuid`.                                                                                                 |
| **3. Defender responds**         | Defender's intrinsic resume actions (all `visible: "false"`, group `HIDDEN`)                                     | The clicked button runs one of the `*Resume` executors below on the **defender's** combatant, reviving the attacker's result as `context.scope.attackResult`.                                                                                               |
| **4. Defense roll + resolution** | `automated{Block,Dodge,Counterstrike,Ignore}Resume` → `buildCombatResult` → `CombatResult.evaluate()`            | Builds a `DefendResult`, composes it with the (already-evaluated) attack into a `CombatResult`, and runs the opposed test.                                                                                                                                  |
| **5. Impact**                    | `CombatResult` → `rollImpact`                                                                                    | Impact is rolled **only when a blow lands** (this is where damage dice are rolled), producing an `ImpactResult`.                                                                                                                                            |
| **6. Combat-result card**        | `buildCombatCardData` → `attack-result-card.hbs`                                                                 | Two-column (Attack \| Defend) card; one "Calculate Injury" button per landing side.                                                                                                                                                                         |
| **7. Injury**                    | injury button → `BeingLogic.onCreateInjury` → `resolveAutomatedInjury`                                           | Rolls the hit location, applies armor/body-location protection, and **records the Trauma with no dialog** (automated), because the button forwards the attack's aim. See [injury resolution](../reference/combat-resolution-pipeline.md#injury-resolution). |

The four defense resumes:

- **`automatedBlockResume`** — collects blockable melee modes (non-disabled
  `defense.block`), defaults to `lastBlockMode` or the best block ML, optionally
  dialogs, builds a `DefendResult` (`TEST_TYPE.BLOCK`).
- **`automatedDodgeResume`** — resolves the Dodge skill ML
  (`resolveSkillMasteryLevel(actorLogic, SKILL_CODE.DODGE)`); no dialog,
  `TEST_TYPE.DODGE`.
- **`automatedCounterstrikeResume`** — a melee attack _back_ at the original
  attacker (resolved from `attackResult.speaker.tokenLogic`); reuses
  `commonAttack` and posts **two** cards so both sides display; both blows may
  land.
- **`automatedIgnoreResume`** — no contest, `TEST_TYPE.IGNORE`, single card.

Opposed resolution, victory score, tactical advantages, per-defense "lands a
blow" rules, and impact→armor→injury are all detailed in the
[Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md); this
doc does not repeat them.

### Cross-client handoff

The defender's buttons must appear on the _defender's_ client, and the click must
be authorized. The flow (`src/sohl.ts` `renderChatMessageHTML` hook, plus
`src/document/chat/`):

1. **Addressing.** The attack card sets `handlerActorUuid` to the **target
   actor's** uuid (`buildAttackCardData`); the buttons carry it as
   `data-handler-actor-uuid`.
2. **Render-time gating (every client).** `gateAutomatedDefenseButtons`
   (`chat-card-gating.ts`) runs on each client and:
    - removes all buttons unless the viewer is the defender's **owner** (a GM owns
      all);
    - if the defender has any `DEFENSE_DISABLING_STATUSES`, leaves **only Ignore**;
    - shows Block only if there are blockable modes, Counterstrike only if there's
      a melee attack mode, Dodge only if the Dodge skill is usable.
      This is **UX only** — it hides buttons, it does not authorize.
3. **Click-time authorization (the real boundary, #167).**
   `resolveAuthorizedChatCardHandler` (`chat-card-dispatch.ts`) resolves the
   handler doc (uuid precedence `docUuid → handlerUuid → handlerActorUuid →
actionHandlerUuid`) and returns it **only if `isOwner`**; `onChatCardButton`
   re-checks ownership. The button's `data-scope` becomes `context.scope`, so the
   resume reads `context.scope.attackResult`.

Cross-actor writes never happen directly — a resume mutates only its own
combatant/actor and communicates back through the target-addressed card (see
[actor state sovereignty](./architecture.md#actor-state-sovereignty)).

## Combatants and the combat lifecycle

### Combatant properties

`SohlCombatant` (`src/document/combatant/foundry/SohlCombatant.ts`) adds
encounter-scoped state on top of Foundry's Combatant. Key fields the logic reads:

| Field / getter                     | Meaning                                                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `groupId`                          | The combatant's `CombatantGroup` (side). Reads `_source.group` first for a stable id. Drives `isEnemyOf` / `allies`.                                                                        |
| `moveFactor`                       | GM situational move multiplier (run/sprint/terrain); `computedMove()` scales the being's `feetPerRound` by it (#252).                                                                       |
| `displayedMedium`                  | Which movement medium the tracker shows; seeded at `_preCreate` (user-set › corpus default › schema default). _(Not yet honored by `computedMove`, which uses the corpus's active medium.)_ |
| `computedMove()` / `displayedMove` | Tactical feet-per-round from the actor's Corpus `feetPerRound` (scaled by `moveFactor`), or `null` with no corpus.                                                                          |
| initiative                         | `_getInitiativeFormula()` returns the actor's `init` skill mastery as a **fixed string** — SoHL initiative is skill-driven, not a die roll.                                                 |

Combat relationships are computed, not stored: `isEnemyOf` →
`areCombatantsEnemies` (different non-null groups ⇒ enemies), `allies`
(same-group others), and `threatenedBy` → `isThreatening` (an enemy that is not
defeated, carries no `THREAT_NEGATING_STATUSES`, is not hidden, and `reaches`
this combatant — center-to-center grid distance ≤ its greatest melee reach).

### Group seeding

Sides are assigned when combatants are created, GM-authoritatively and
fire-and-forget:

- **`SohlCombat._onCreateDescendantDocuments`** (`src/document/combat/foundry/SohlCombat.ts`)
  — after super, when the created descendants are `combatants` and the caller is
  the active GM, it dispatches **`void this.seedCombatantGroups(documents)`**
  (fire-and-forget — a combatant's `groupId` is _not_ set the instant
  `createEmbeddedDocuments` resolves; poll for it in tests).
- **`seedCombatantGroups`** maps each combatant to
  `{ id, hasGroup, desiredName: actor.system.defaultCombatGroup ?? null }`, then
  the pure **`resolveGroupSeeding`** (`combat/logic/combat-logic.ts`) plans the
  distinct groups to create (case-insensitive dedup; default `"Opponents"`).
  Missing `CombatantGroup`s are batch-created and each combatant's `group` set.

### Turn and round lifecycle

- **`SohlHookBridge`** (`src/core/logic/SohlHookBridge.ts`) fans Foundry's combat
  hooks into system lifecycle events, all GM-gated and routed through the event
  queue: `combatStart`, `combatRound` → `roundEnd` + `roundStart`, `combatTurn`
  → `turnEnd` + `turnStart`, `deleteCombat` → `combatEnd`.
- **`updateCombat`** (`src/sohl.ts`) captures the new current combatant's position
  and resets its per-turn `didAction` on turn/round change. It is the source of
  the turn-start location that `spacesMovedThisTurn` reports.
- The combat tracker (`combat-tracker-hooks.ts`) injects each owned combatant's
  non-hidden intrinsic actions (Automated Attack, Move to Group) into its context
  menu, and renders the group-name and computed-move chips per row.

## Current gaps and caveats

For anyone extending combat, the wired state diverges from the intended/documented
state in a few places (all verified against source):

1. **No "your turn" gate** — the attacker/target status invariants are enforced
   (#387), but automated combat does not require the acting combatant to be the
   current one; this is intentional so the two modes can be interleaved.
2. **`displayedMedium` is not honored by `computedMove`** — it seeds the tracker
   chip but movement always uses the corpus's active medium.
3. **Weapon break is display-only** — `CombatResult.weaponBreakCheck` is computed
   and shown on the card, but no breakage is applied.

## See also

- [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md) — the
  result-class hierarchy, opposed-test math, victory score, tactical advantages,
  and injury resolution.
- [Scene, Token, and Combatant Systems](../reference/scene-token-combatant.md) —
  token/targeting helpers, initiative, movement state.
- [Body Structure](../reference/body-structure.md) — hit location and armor
  aggregation.
- [Macros and Actions](./macros-and-actions.md) — how intrinsic actions (the
  `*Resume` executors) are defined and dispatched.
