---
"sohl": minor
---

Consolidation onto Legendary, scene/lifecycle modernization, and a ground-up ActiveEffect dispatch overhaul. Pre-1.0 release with deliberate breaking changes (no live worlds, no migration shims).

## System architecture

- **Variants removed.** The `MistyIsle`/`Lgnd*` variant split is gone — every document, logic class, and pack now targets the single Legendary ruleset. Hooks remain for module-side extension.
- **Logic extraction.** Document classes (`SohlItem`, `SohlActor`) are thin Foundry wrappers; per-type rules live in `*Logic` classes under `src/document/*/logic/`. All Foundry API access funnels through `src/core/FoundryHelpers.ts`.
- **Folder reorg.** All document classes live under `src/document/`; old `src/actor/`, `src/item/`, `src/effect/` directories are gone. Tests mirror the new layout.
- **New document types.** `Assembly` actors (variant-invariant composition containers) and a `Disposition` item type were added.
- **Per-actor cohort handling.** Cohort drop logic now goes through a dialog (`CohortDataModel.handleCohortDrop`) instead of a token placement no-op.

## Scene & combat system

- **`SohlScene` replaces `SohlRegion`/`SohlEncounter`/region-behavior.** New `SohlSceneDataModel`, `SohlSceneConfig`, `SohlSceneLogic` along with combat-tracker hooks (`combat-tracker-hooks.ts`) that inject `moveFactor` / `displayedMedium` fields and computed move display per tracker row.
- **`move-helpers`** replaces `MovementFactorDefaults` / `MovementProfile` — a single source of truth for medium-aware movement math.
- **Lineage** moved up to the top-level item path; new `lineage-properties` sheet part and per-medium movement bindings.
- **Domain registry** (`SohlDomains` / `builtinDomains`) added as a cross-cutting registry for cohorts, beings, and assemblies.

## ActiveEffect system (largest single change)

A ground-up rebuild of how SoHL applies ActiveEffects, with three composable change-key prefixes and a scope-driven targeting model.

**Scope vocabulary** (`SohlActiveEffectDataModel.scope`):
- `"this"` — the owning document
- `"actor"` — the owning actor
- `<itemKind>` — every item of that kind on the actor, filtered by the `test` predicate

The previous `"test"` scope is retired (it conflated scope with filter). Scope determines the EFFECT_KEY namespace shown in the changes UI, so the dropdown is always deterministic.

**Change-key prefix system** (intercepted by `SohlActiveEffect._applyChangeUnguided`):

| Prefix | Semantics |
|---|---|
| `mod:<path>` | Push a `ValueDelta` onto the `ValueModifier` at `<path>` on the target doc |
| `sm:<path>` | Set `<path>` on each strike mode of the target weapon, filtered by `strikeModePredicate` (WeaponGear only) |
| `mod:sm:<path>` | Composes the above: push a delta on each matching strike mode's ValueModifier |

`strikeModePredicate` is a new per-change SafeExpression field with `sm` as the variable binding; empty means all strike modes.

**Pull-model dispatch**:
- `SohlItem#transferredActiveEffects()` and `SohlActor#transferredActiveEffects()` — phaseless gather of effects living elsewhere that target this doc.
- `SohlItem#allApplicableEffects()` and `SohlActor#allApplicableEffects()` (override) — own self-targeting effects + transferred. Foundry's stock `Actor#applyActiveEffects(phase)` consumes the override unchanged.
- `SohlItem#applyActiveEffects(phase)` — SoHL-driven dispatch since transfer is off; called from `SohlActor.prepareEmbeddedData` between item Phase I (initialize) and Phase II (evaluate).

**Schema**: `SohlActiveEffectDataModel` now mirrors v14 Foundry's `changes` ArrayField verbatim (key/type/value/phase/priority) and adds the SoHL-only `strikeModePredicate`.

**WeaponGear effect keys**: 9 new `SM_*` keys (ATTACK, IMPACT, SPREAD, LENGTH, REACH, BASE_RANGE, DRAW, BLOCK, COUNTERSTRIKE).

## Effect key catalog

`*_EFFECT_KEY` blocks added or completed for: Attribute, Affliction, ArmorGear, CombatTechnique, ConcoctionGear, ContainerGear, Lineage, MiscGear, Mystery, MysticalAbility, ProjectileGear, Skill, Trait, Trauma, WeaponGear. Each block lists the modifier-target paths consumable by `mod:`-prefixed effect changes. Matching lang entries shipped in `lang/en.json`.

## Event queue (`SohlEventQueue`)

- **Generalized from time-only to trigger-based dispatch.** Subscriptions identify a trigger (`updateWorldTime`, `combatStart`, `turnStart`, etc.) plus optional `fireAt` for time scheduling; `mod:` / `sm:` change application is integrated.
- **Substantial expansion** in scope (`c6bf726`) with matching test coverage.
- The retired `SOHL_EVENT` constants are gone in favor of the generalized trigger taxonomy.

## Calendar (`SohlCalendar`)

- Substantially expanded with parallel test coverage growth.
- `seasons` system removed.

## Type system & utilities

- **`SafeExpression`** added (`src/utils/SafeExpression.ts`, 710 LOC) — a sandboxed expression evaluator used by ActiveEffect predicates (`test`, `strikeModePredicate`), context conditions, and visibility tests across actions/triggers.
- **`defineType` labels** switched from value-form to KEY_NAME-form. Value-form produced ugly multi-segment lang keys when enum values contained `.` or `:` (e.g., `mod:logic.score`) and `[object Object]` for object-typed values. KEY-form labels are always valid identifiers. All 27 affected lang prefixes were migrated to KEY-form keys.
- **`ValueModifier` bug fix**: `_oper` required `"SOHL.MOD."` prefix while `ValueDelta` required `"SOHL.INFO."` — mutually incompatible, leaving the convenience API (`add`/`multiply`/`set`/`floor`/`ceiling`) unusable. Aligned to `"SOHL.INFO."`.
- **AfflictionLogic** gains `levelLabel` and `categoryLabel` getters that surface the qualitative meaning of FEAR/MORALE levels (Brave..Catatonic) and FATIGUE/PRIVATION categories.
- Various other unused-constant cleanups (`MYSTICALABILITY_DEGREE`, `SOHL_EVENT`, MasteryLevel effect keys, etc.) and orphan lang-key removals.

## Compendiums

- Actors compendium now supported.
- "Human" actor consolidated into "Basic Folk".
- Items added/removed across packs.

## Sheets & templates

- Templates moved up from `legendary/*` to top-level paths.
- New `templates/effects/details.hbs` and `templates/effects/changes.hbs` with the conditional `strikeModePredicate` row (helper: `isSmKey`).

## Documentation

- `docs/reference/effects-integration.md` rewritten for the new scope model, dispatch lifecycle, and prefix system.
- `docs/reference/event-queue.md` rewritten for the generalized trigger model.
- `docs/concepts/architecture.md`, `lifecycle-model.md`, extension docs and various other reference pages updated or added.
- Test files extended with parallel coverage (~8.8k LOC across 59 test files, e.g., `SafeExpression`, `helpers`, `SohlMap`, `SohlArray`, `constants`, `move-helpers`).

## Breaking changes (no migration; no live worlds)

- `ACTIVE_EFFECT_SCOPE.TEST` removed; existing effects with `scope: "test"` will resolve to no targets after upgrade.
- `defineType` labels keyed by `${prefix}.${KEY_NAME}` instead of `${prefix}.${value}`. Any module/world that read `someTypeLabels.SOME_KEY` and looked up the resulting string in a custom lang pack will need updated lang entries.
- Variant system removed; `MistyIsle`/`Lgnd*` namespaces gone.
- `SohlRegion` / `SohlEncounter` / region-behavior removed; replaced by `SohlScene`.
- `SohlEventQueue` API replaced (`registerEvent`/`unregisterEvent`/`processDueEvents` → `subscribe`/`unsubscribe`/`scheduleAt`/`fire`).
- `SohlItem.handleSohlEvent` / `SohlActor.handleSohlEvent` signature changed from `(kind, time, payload?)` to `(kind, context, payload?)` with a typed trigger context.
- `MovementFactorDefaults` / `MovementProfile` replaced by `move-helpers`.
- Numerous internal type renames and folder moves; module authors should regrep imports.
