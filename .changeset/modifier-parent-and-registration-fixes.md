---
"sohl": patch
---

**Curated `toJSON` serialization across the entity layer; retire `instanceToJSON`**

Now that modifiers and results are `SohlEntity` subclasses (which require an
owning `parent`), several construction and serialization paths were broken.
These are real runtime bugs, not just stale tests.

_ValueModifier / ValueDelta:_

- **`ValueModifier` operators created parentless deltas.** `_oper` (backing
  `add`/`multiply`/`floor`/`ceiling`/`set`) built `new ValueDelta(...)` without a
  parent, so every modifier mutation threw `SohlEntity requires a parent`. It now
  passes the modifier's own parent. The active-effect path
  (`pushDeltaToValueModifier`) had the same bug and is likewise fixed, and
  `changeTypeToOperator` is now correctly typed `ValueDeltaOperator`.
- **`ValueDelta` and `ValueModifier` were never registered** with the kind
  registry, so serialization round-trips (and `clone`) revived their deltas as
  plain objects — dropping every delta and collapsing the effective value to the
  base. Both now call `registerKind`, so deltas rehydrate as live `ValueDelta`s.
- **`clone` requires an explicit parent.** `cloneInstance` no longer falls back
  to the source's parent — the cloner must decide what the copy attaches to. Use
  `x.clone(x.parent)` to keep the same owner; `clone(...)` without a resolvable
  parent throws (by design, since a `SohlEntity` must have one).
- Removed a dead `Symbol("ValueDelta")` and the removed static `ValueDelta.isA`.

_Serialization model:_

Serialization now flows through a single driver, `defaultToJSON` (paired with
`defaultFromJSON`), which honors each object's curated `toJSON` and stamps the
`__kind` discriminator through the `SohlEntity` chain. The reflective
`instanceToJSON` helper is **removed** — it bypassed each class's curated
`toJSON` and would leak internal representation (a resolved logic/skill instead
of the uuid/shortcode it was resolved from) and transient cache fields.

- **Every entity now serializes its own state.** Curated `toJSON` overrides were
  added where a subclass carried fields an ancestor's `toJSON` didn't emit:
  `ImpactModifier` (roll, aspect), `MasteryLevelModifier` (target clamps, crit
  digits, tables), `ImpactResult`, `SuccessTestResult` (with uuid/pointer mapping
  for its token and mastery modifier), `AttackResult`, `DefendResult`,
  `OpposedTestResult`, and `CombatResult`. Each `toJSON` emits keys matching its
  `Data` interface so its output is valid constructor input; the situational
  modifier is carried by the mastery modifier's deltas rather than re-emitted
  (which would double-apply on revival).
- **`SimpleRoll` is now a `SohlEntity`** (moved to `src/entity/roll/`). It is
  owned by a `parent` Logic and serializes through the shared entity machinery;
  `SimpleRoll.fromFormula(formula, parent)` now takes that owner.
- **A Logic serializes as a resolvable reference.** `SohlLogic.toJSON` no longer
  reflects its internals; a logic is a behavior wrapper over a live Foundry
  document and is never revived from its own JSON, so it emits a compact
  `{ uuid, name, kind }` reference (re-resolved via `fvttLogicFromUuidSync`).

Combat/opposed cards and clones now round-trip faithfully: nested rolls,
modifiers, and results rehydrate as live instances with their computed values
intact, and an embedded `AttackResult`/`CombatResult` is self-contained (its
`combatantUuid` travels with the payload).

_Body / Lineage construction:_

The body entities are `SohlEntity` subclasses owned by their `LineageLogic`, but
two construction paths didn't thread the parent through — a runtime break at
lineage initialize:

- **`LineageLogic.initialize` passed the logic as the options object** rather
  than `{ parent: this }`, so `BodyStructure` received no parent and threw
  `Requires a Lineage parent`. It now passes `{ parent: this }`.
- **`BodyLocation` called `super()` with no arguments**, dropping the validated
  parent before it reached `SohlEntity` (and its `Data` now extends
  `SohlEntity.Data`, consistent with `BodyPart`/`BodyStructure`).

_Action context and chat-card scope:_

`SohlActionContext` is no longer a `SohlEntity`. It is a runtime value object —
built fresh at every action dispatch, never revived from its own JSON — so
forcing it to be an owned, parented entity was wrong. It drops `extends
SohlEntity`, the parent requirement, the kind registration, and its
whole-object `toJSON`, and gains a purpose-built `clone(overrides?)`.

The serializable part of an action is its **`scope`**, and it now crosses the
client boundary as a single `data-scope` blob:

- Chat cards emit one `data-scope` attribute — `JSON.stringify(defaultToJSON(scope))`
  — carrying the rich per-action payload (an `AttackResult`, `OpposedTestResult`,
  or injury request) with its `__kind` tags. Routing/dispatch metadata
  (`data-action`, the `data-*-handler-uuid` keys) stays in its own flat
  attributes.
- The four `onChatCardButton` handlers revive that blob through a shared
  `buildActionScope` helper (`defaultFromJSON`), so a flow reads
  `context.scope.attackResult` / `.opposedTestResult` as a **live** instance
  rather than re-parsing a per-payload JSON string.
- This removed the hand-rolled per-payload plumbing: `opposedTestResume`'s
  `instanceFromJSON(scope.opposedTestResultJson)`, the dead
  `rehydrateAttackResult` helper (the attack/defense resumes already read
  `scope.attackResult`), and the `data-*-result-json` attributes. A latent
  damage-card bug is fixed along the way — it serialized an `ImpactResult` where
  the injury handler expected a plain injury request, so the parsed impact came
  through as `0`; both injury cards now emit the same `{ impact, aspect, … }`
  request shape.
