---
"sohl": minor
---

Major Overhaul of Active Effects System

A ground-up rebuild of how SoHL applies ActiveEffects, with three composable change-key prefixes and a scope-driven targeting model.

- **Scope Vocabulary** (`SohlActiveEffectDataModel.scope`):
  - `"this"` — the owning document
  - `"actor"` — the owning actor
  - `<itemKind>` — every item of that kind on the actor, filtered by the `test` predicate

  The previous `"test"` scope is retired (it conflated scope with filter). Scope determines the EFFECT_KEY namespace shown in the changes UI, so the dropdown is always deterministic.

- **Change-key Prefix System**
  | Prefix | Semantics |
  |---|---|
  | `mod:<path>` | Push a `ValueDelta` onto the `ValueModifier` at `<path>` on the target doc |
  | `sm:<path>` | Set `<path>` on each strike mode of the target weapon, filtered by `strikeModePredicate` (WeaponGear only) |
  | `mod:sm:<path>` | Composes the above: push a delta on each matching strike mode's ValueModifier |

  `strikeModePredicate` is a new per-change SafeExpression field with `sm` as the variable binding; empty means all strike modes.

- **Pull-model Dispatch**:
  - `SohlItem#transferredActiveEffects()` and `SohlActor#transferredActiveEffects()` — phaseless gather of effects living elsewhere that target this doc.
  - `SohlItem#allApplicableEffects()` and `SohlActor#allApplicableEffects()` (override) — own self-targeting effects + transferred. Foundry's stock `Actor#applyActiveEffects(phase)` consumes the override unchanged.
  - `SohlItem#applyActiveEffects(phase)` — SoHL-driven dispatch since transfer is off; called from `SohlActor.prepareEmbeddedData` between item Phase I (initialize) and Phase II (evaluate).

- **Schema**: `SohlActiveEffectDataModel` now mirrors v14 Foundry's `changes` ArrayField verbatim (key/type/value/phase/priority) and adds the SoHL-only `strikeModePredicate`.

- **WeaponGear Effect Keys**: 9 new `SM_*` keys (ATTACK, IMPACT, SPREAD, LENGTH, REACH, BASE_RANGE, DRAW, BLOCK, COUNTERSTRIKE).

- **Status registration fix**: `SohlSystem` now spreads Foundry's default `statusEffects` (dead, unconscious, sleep, stun, prone, restrain, paralysis, frozen, …) alongside the custom `incapacitated`/`vanquished` entries. Previously the config array replaced the defaults wholesale (because `mergeObject` overwrites arrays), leaving combat conditions like `stun`/`prone` unrepresentable at runtime.

- **Aural Shock status**: added as a registered `statusEffect` (`auralShock`, "Aural Shock", `shock.svg`) — toggleable from the token HUD. The Being sheet header status panel now renders short condition abbreviations (e.g. `STN`, `ASHK`) with full-name tooltips and an active-state highlight, and corrects the `stunned`→`stun` id.

- **Effect Key Catalog**: `*_EFFECT_KEY` blocks added or completed for: Attribute, Affliction, ArmorGear, CombatTechnique, ConcoctionGear, ContainerGear, Lineage, MiscGear, Mystery, MysticalAbility, ProjectileGear, Skill, Trait, Trauma, WeaponGear. Each block lists the modifier-target paths consumable by `mod:`-prefixed effect changes. Matching lang entries shipped in `lang/en.json`.

