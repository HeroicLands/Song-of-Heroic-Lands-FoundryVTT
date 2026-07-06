---
"sohl": minor
---

**Consistent null / undefined convention: null at the edges, undefined in the core**

Adopts a single, defensible rule for representing absence and applies it to the
code layer, so `null` and `undefined` are no longer used interchangeably.

**The convention**

- _Persistence and the Foundry API boundary_ use `null` — Foundry mandates it
  (DataModel fields, `DialogV2` dismissal, `getFlag`, document lookups) and `null`
  is JSON-safe.
- _The logic/domain layer_ uses `undefined` for "maybe absent" — matching optional
  parameters/properties (`?:`), which already yield `undefined`.
- The [`FoundryHelpers`]{@link FoundryHelpers} shim _normalizes_ Foundry `null` to
  `undefined` as values cross into the logic layer.
- `== null` / `!= null` (matches both) is the blessed idiom at genuine mixed
  boundaries; an `eqeqeq` lint rule (`{ null: "ignore" }`) now enforces strict
  equality everywhere else.

**Changes**

- Removed the `Optional<T>` (and unused `OptArray<T>`) global type alias in favour
  of native `T | undefined`. An alias cannot express `?:` optional positions, so it
  could never be the single consistent spelling.
- Normalized the remaining `FoundryHelpers` accessors that feed the logic layer
  (`fvttGetActor` / `fvttGetScene` / `fvttGetToken` / `fvttGetUser`,
  `fvttActiveCombatantForActor`, `fvttActiveTokenLogicForActor`, `getContextItem`,
  `fvttGetTargetedTokens`, `fvttRangeToTarget`, `combatantGridDistance`) plus the
  matching `SohlTokenDocument` statics to return `… | undefined` instead of
  `… | null`, matching the already-normalized UUID/scene/combat helpers. The
  `DialogV2` dismissal helpers keep `null`. Test mocks updated in lockstep.
- Added the `eqeqeq` rule to the ESLint config.

**DataModel empty-value representation**

Applies a companion rule to persisted schema fields: represent "empty" with a
typed blank sentinel (`""`, `0`, `[]`) when the empty state is itself a valid
value, and `nullable: true, initial: null` only when "unset / not-applicable"
must be distinguishable from every valid value. Every field now sets `initial`
explicitly.

- Gave explicit `initial: ""` to string fields that previously defaulted to
  `undefined` (Foundry only auto-fills `""` for _required_ strings):
  `skillBaseFormula`, `parentSkillCode`, `material`, `leaderName`, `moveRepName`,
  and `StrikeModeBase.assocSkillCode` (now `blank: true`).
- Set explicit choice defaults where they were missing: `StrikeModeBase.type`
  (`MELEE`) and `impactBase.aspect` (`BLUNT`), and `ProjectileGear.subType`
  (`NONE`).
- Unified the impact-base dice trio between `StrikeModeBase` and
  `ProjectileGearDataModel`, which had inverted representations: `numDice` is
  always a non-null count (`min: 0, initial: 0`; `0` = no dice); `die` is
  nullable (`null` = "does not apply", else an integer ≥ 2); `modifier` is
  nullable (`null` = "does not apply", `0` = none). Data-layer types updated to
  `number | null` accordingly.
- Fixed the lone contradictory field: `ActiveEffect` `changes[].value` was
  `nullable: true` with `initial: ""`; it is now non-nullable (a change value is
  always present).
- Left correctly-nullable fields as-is: `AttributeDataModel.scoreBase` (`null` =
  trait has no score, e.g. Scarred) and `TraitDataModel.score.max` (`null` = no
  cap).
- Made `MysteryDataModel` `charges.max` nullable (`initial: null`) so its
  documented tri-state — `0` = no maximum, `null` = does not use charges — is
  actually representable; the consuming `MysteryLogic` already branched on
  `max !== null`.
