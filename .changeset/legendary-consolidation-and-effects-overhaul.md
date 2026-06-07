---
"sohl": minor
---

Consolidation onto Legendary, scene/lifecycle modernization, and a ground-up ActiveEffect dispatch overhaul. Pre-1.0 release with deliberate breaking changes (no live worlds, no migration shims).

**System architecture**

- **Variants removed.** The `MistyIsle`/`Lgnd*` variant split is gone — every document, logic class, and pack now targets the single Legendary ruleset. Hooks remain for module-side extension.
- **Logic extraction.** Document classes (`SohlItem`, `SohlActor`) are thin Foundry wrappers; per-type rules live in `*Logic` classes under `src/document/*/logic/`. All Foundry API access funnels through `src/core/FoundryHelpers.ts`.
- **Folder reorg.** All document classes live under `src/document/`; old `src/actor/`, `src/item/`, `src/effect/` directories are gone. Tests mirror the new layout.
- **New document types.** `Assembly` actors (variant-invariant composition containers) and a `Disposition` item type were added.
- **Per-actor cohort handling.** Cohort drop logic now goes through a dialog (`CohortDataModel.handleCohortDrop`) instead of a token placement no-op.

**Scene & combat system**

- **`SohlScene` replaces `SohlRegion`/`SohlEncounter`/region-behavior.** New `SohlSceneDataModel`, `SohlSceneConfig`, `SohlSceneLogic` along with combat-tracker hooks (`combat-tracker-hooks.ts`) that inject `moveFactor` / `displayedMedium` fields and computed move display per tracker row.
- **Combat group allegiance on Foundry-native `CombatantGroup`.** Adopts v14's `CombatantGroup` as the single source of truth for combat allegiance under one invariant: two combatants are enemies iff they belong to different groups. Replaces the unused custom `groups[]` / `groupStances` faction-matrix system (discharges roadmap **T2-4**).
  - New `tokenDocument.flags.sohl.defaultCombatGroup` (free-form string, default `"Opponents"`) with a "Default Combat Group" field injected into both the Token and Prototype Token config sheets (`combat-group-hooks.ts`).
  - Combatants are auto-seeded into a `CombatantGroup` on creation (`SohlCombat#_onCreateDescendantDocuments`, batch-aware, case-insensitive find-or-create).
  - `SohlCombatant.isEnemyOf()`, a reworked `allies` getter (same group = ally), and a real `threatenedBy` getter: an enemy threatens unless it is defeated, incapacitated (`unconscious`/`sleep`/`stun`/`restrain`/`paralysis`/`frozen` — `THREAT_NEGATING_STATUSES`), hidden, or out of reach. Weapon reach is a documented placeholder (`reaches()` returns `true`) pending a separate roadmap item.
  - **Status registration fix:** `SohlSystem` now spreads Foundry's default `statusEffects` (dead, unconscious, sleep, stun, prone, restrain, paralysis, frozen, …) alongside the custom `incapacitated`/`vanquished` entries. Previously the config array replaced the defaults wholesale (because `mergeObject` overwrites arrays), leaving combat conditions like `stun`/`prone` unrepresentable at runtime.
  - **Aural Shock status** added as a registered `statusEffect` (`auralShock`, "Aural Shock", `shock.svg`) — toggleable from the token HUD. The Being sheet header status panel now renders short condition abbreviations (e.g. `STN`, `ASHK`) with full-name tooltips and an active-state highlight, and corrects the `stunned`→`stun` id.
  - A "Move to Group…" combat-tracker context-menu entry and a per-row group-name label (display only — no group-based turn ordering).
- **`move-helpers`** replaces `MovementFactorDefaults` / `MovementProfile` — a single source of truth for medium-aware movement math.
- **Lineage** moved up to the top-level item path; new `lineage-properties` sheet part and per-medium movement bindings.
- **Size-based melee reach.** Lineage gains a `reachBase` field (feet; medium creatures = 0) surfaced as a `reach` ValueModifier on `LineageLogic`. A melee strike mode's `reach` ValueModifier is seeded from the weapon's `lengthBase`, and the wielder's lineage reach is added on top during the owning logic's evaluate phase (`WeaponGearLogic.evaluate` and `CombatTechniqueLogic.evaluate`; the latter now holds its strike-mode instance, exposed via `CombatTechniqueDataModel.strikeModeInstance`). Lineage is a Being-only concept: a non-Being (or absent) lineage adds nothing (reach stays at length), while a Being that lacks a lineage logs a warning in `BeingLogic.finalize` (it cannot move, wield weapons, etc., and should be treated as unusable).
- **Actor & combatant reach.** `BeingLogic.reach` is the greatest reach among the actor's currently *available* melee strike modes: combat-technique modes are intrinsic (always available); a weapon mode counts only while the weapon is held in at least its `minParts` limbs (`canHoldItem` body parts). `SohlCombatant.reach` surfaces that value for the combatant. The availability + max logic lives in the Foundry-free `reach-helpers.ts` (`computeActorReach`). `SohlCombatant.reaches(other)` returns whether this combatant's reach covers the center-to-center grid distance to `other`, so `threatenedBy` now reports an enemy `c` as a threat when `c`'s melee reach extends to the combatant.
- **Combat resolution (assisted & automated).** Implements the two combat modes documented in `docs/reference/combat-modes.md`.
  - **Chat-card dispatch fix.** The `renderChatMessageHTML` handler read only `data-doc-uuid`, but the combat/injury cards emit `data-handler-uuid` / `data-handler-actor-uuid` / `data-action-handler-uuid`, so none of their buttons dispatched. A new Foundry-free `resolveChatCardHandlerUuid()` (`src/document/chat/chat-card-dispatch.ts`) normalizes the reader across all card conventions without renaming any template attribute.
  - **Injury-resolution pipeline.** New Foundry-free `src/domain/body/InjuryResolution.ts` (`resolveInjury` / `buildTraumaData` / `injuryLevelFromImpact`) — the shared core for both modes. Resolves the hit location (explicit override, aimed scatter, or weighted random), subtracts aspect-specific armor, maps effective impact to an injury level (≤0 none · 1–4 M1 · 5–9 S2 · 10–14 S3 · 15–19 G4 · 20+ G5), and evaluates bleeding/amputation via the existing `InjuryDefaults` tables. `INJURY_LEVELS` moved to `constants.ts` so the domain layer can consume it (re-exported from `TraumaLogic` for back-compat).
  - **Armor aggregation & shock/glancing/fumble.** Worn armor is folded onto body locations each lifecycle cycle (`ArmorAggregation.ts`, wired into `BeingLogic`): every location knows its summed protection per aspect, whether any rigid armor covers it, and the list of covering materials. `resolveInjury` now splits total armor value (natural + worn) from a manual armor reduction and derives the **Shock Index** (`location shock + injury level`, +1 for a glancing blow), **glancing blows** (edged/piercing 1–4 impact against rigid armor → no injury, +10 Shock Roll), and **stumble/fumble** dispositions (roll at Serious, automatic at Grievous) at flagged locations. All zone-die machinery was dropped from the injury model and cards.
  - **Assisted impact roll.** The Combat tab's Impact cell is now clickable (`rollStrikeModeImpact`): it rolls the strike mode's impact dice and posts a `damage-card.hbs`. When a single token is targeted, the card's Calculate Injury button forwards `{ impact, aspect }` to the target, opening the assisted Add Injury dialog. `damage-card.hbs` was flattened onto a real render context (the previous template referenced impact fields that never existed). Pure helpers `resolveStrikeModeImpact` / `buildDamageCardData` added to `combat-actions.ts`; a read-only `aspectType` getter was added to `ImpactModifier`.
  - **Injury cards & Add Injury flow.** `injury-card.hbs` / `injury-dialog.hbs` rewritten to the new model. `SohlActor.onChatCardButton` dispatches the `createInjury` action: an automated request (aimed `targetPart` + `accuracy` forwarded in `data-test-result-json`) resolves with no dialog, while an assisted request opens the Add Injury dialog. The Trauma tab gains a manual **Add Injury** action. Pure, unit-tested helpers (`parseInjuryRequest`, `readInjuryDialogForm`, `buildInjuryCardData`, `resolveAutomatedInjury`) live in `src/document/actor/foundry/injury-actions.ts`.
  - **CombatResult resolution.** `CombatResult.opposedTestEvaluate` / `calcMeleeCombatResult` / `calcDodgeCombatResult` are implemented against the live `OpposedTestResult` API (the previous bodies were commented-out legacy referencing a dead API). Outcomes key off the victory score `VS = attacker.normSuccessLevel − defender.normSuccessLevel` (raw level difference, so the tables resolve every exchange by relative margin): Block lands the attack on `VS >= 0` (a tie also forces a defender weapon-break roll); Counterstrike lands the attacker on `VS >= 0` and the defender whenever its own roll succeeds (both may land); Dodge lands on `VS > 0`, or a tie with a lower dodge roll; Ignore lands the attack when it succeeds. Tactical Advantages (`|VS|−1` to the winner of a 2+ margin) and the weapon-break check are surfaced as display-only fields. Fully unit-tested.
- **Domain registry** (`SohlDomains` / `builtinDomains`) added as a cross-cutting registry for cohorts, beings, and assemblies.

**ActiveEffect system (largest single change)**

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

**Effect key catalog**

`*_EFFECT_KEY` blocks added or completed for: Attribute, Affliction, ArmorGear, CombatTechnique, ConcoctionGear, ContainerGear, Lineage, MiscGear, Mystery, MysticalAbility, ProjectileGear, Skill, Trait, Trauma, WeaponGear. Each block lists the modifier-target paths consumable by `mod:`-prefixed effect changes. Matching lang entries shipped in `lang/en.json`.

**Event queue (`SohlEventQueue`)**

- **Generalized from time-only to trigger-based dispatch.** Subscriptions identify a trigger (`updateWorldTime`, `combatStart`, `turnStart`, etc.) plus optional `fireAt` for time scheduling; `mod:` / `sm:` change application is integrated.
- **Substantial expansion** in scope (`c6bf726`) with matching test coverage.
- The retired `SOHL_EVENT` constants are gone in favor of the generalized trigger taxonomy.

**Calendar (`SohlCalendar`)**

- Substantially expanded with parallel test coverage growth.
- `seasons` system removed.

**Type system & utilities**

- **`SafeExpression`** added (`src/utils/SafeExpression.ts`, 710 LOC) — a sandboxed expression evaluator used by ActiveEffect predicates (`test`, `strikeModePredicate`), context conditions, and visibility tests across actions/triggers.
- **`defineType` labels** switched from value-form to KEY_NAME-form. Value-form produced ugly multi-segment lang keys when enum values contained `.` or `:` (e.g., `mod:logic.score`) and `[object Object]` for object-typed values. KEY-form labels are always valid identifiers. All 27 affected lang prefixes were migrated to KEY-form keys.
- **`ValueModifier` bug fix**: `_oper` required `"SOHL.MOD."` prefix while `ValueDelta` required `"SOHL.INFO."` — mutually incompatible, leaving the convenience API (`add`/`multiply`/`set`/`floor`/`ceiling`) unusable. Aligned to `"SOHL.INFO."`.
- **AfflictionLogic** gains `levelLabel` and `categoryLabel` getters that surface the qualitative meaning of FEAR/MORALE levels (Brave..Catatonic) and FATIGUE/PRIVATION categories.
- Various other unused-constant cleanups (`MYSTICALABILITY_DEGREE`, `SOHL_EVENT`, MasteryLevel effect keys, etc.) and orphan lang-key removals.

**Compendiums**

- Actors compendium now supported.
- "Human" actor consolidated into "Basic Folk".
- Items added/removed across packs.

**Sheets & templates**

- Templates moved up from `legendary/*` to top-level paths.
- New `templates/effects/details.hbs` and `templates/effects/changes.hbs` with the conditional `strikeModePredicate` row (helper: `isSmKey`).

**Documentation**

- `docs/reference/effects-integration.md` rewritten for the new scope model, dispatch lifecycle, and prefix system.
- `docs/reference/event-queue.md` rewritten for the generalized trigger model.
- `docs/concepts/architecture.md`, `lifecycle-model.md`, extension docs and various other reference pages updated or added.
- `docs/reference/combat-resolution-pipeline.md` updated for the implemented `CombatResult` resolution (VS-based per-defense table, Tactical Advantages, weapon-break) and the injury-resolution stage; `docs/how-to/extension-points.md` gains the chat-card button dispatch contract. New `docs/user/` guides (`README.md`, `combat.md`: running an assisted attack and recording an injury), registered in the docs hub.
- Test files extended with parallel coverage (~8.8k LOC across 59 test files, e.g., `SafeExpression`, `helpers`, `SohlMap`, `SohlArray`, `constants`, `move-helpers`).

**Breaking changes (no migration; no live worlds)**

- `ACTIVE_EFFECT_SCOPE.TEST` removed; existing effects with `scope: "test"` will resolve to no targets after upgrade.
- `defineType` labels keyed by `${prefix}.${KEY_NAME}` instead of `${prefix}.${value}`. Any module/world that read `someTypeLabels.SOME_KEY` and looked up the resulting string in a custom lang pack will need updated lang entries.
- Variant system removed; `MistyIsle`/`Lgnd*` namespaces gone.
- `SohlRegion` / `SohlEncounter` / region-behavior removed; replaced by `SohlScene`.
- Custom combat-group system removed in favor of Foundry-native `CombatantGroup`: the `SohlCombatant` `groups: string[]` field, the `SohlCombat` `groupStances` field and stance methods (`setGroupStance`/`allyGroups`/`enemyGroups`/`removeGroup`/`getGroupStances`), the `GROUP_STANCE` constant, and `combatant-logic#expandAllyGroups` / `combat-logic` stance helpers are gone. Allegiance is now expressed purely by group membership.
- `SohlEventQueue` API replaced (`registerEvent`/`unregisterEvent`/`processDueEvents` → `subscribe`/`unsubscribe`/`scheduleAt`/`fire`).
- `SohlItem.handleSohlEvent` / `SohlActor.handleSohlEvent` signature changed from `(kind, time, payload?)` to `(kind, context, payload?)` with a typed trigger context.
- `MovementFactorDefaults` / `MovementProfile` replaced by `move-helpers`.
- Numerous internal type renames and folder moves; module authors should regrep imports.
