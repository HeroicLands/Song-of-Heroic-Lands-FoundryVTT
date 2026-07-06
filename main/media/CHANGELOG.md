# sohl

## 0.7.0

### Minor Changes

- 2436ecc: **Event Queue**

    Prior simple time-based event queue replaced with trigger-oriented event queue
    - **Generalized from time-only to trigger-based dispatch.** Subscriptions identify
      a trigger (`updateWorldTime`, `combatStart`, `turnStart`, etc.) plus optional
      `fireAt` for time scheduling; `mod:` / `sm:` change application is integrated.
    - **Substantial expansion** in scope (`c6bf726`) with matching test coverage.
    - The retired `SOHL_EVENT` constants are gone in favor of the generalized trigger taxonomy.

- d87fd75: **Restructure and improve the developer/user documentation for readability and usability**

    An intentional, major reorganization of the developer/API documentation. The
    goal is a clearer information architecture, consistent per-document framing,
    better lateral cross-linking, and refreshed navigation so developers can find
    the right document for their goal quickly. The documentation set is now scoped
    as _developer/contributor/API-facing only_ — player- and GM-facing rules live at
    heroiclands.org and are linked to rather than duplicated.
    - **API navigation grouped by architecture** — the generated TypeDoc site
      (api.heroiclands.org) previously rendered the entire public API as a single
      flat, alphabetical class list. The entry-point generator
      (`utils/build-docs-entry.mjs`) now emits a tree of barrel modules that mirrors
      `src/`, so the API sidebar groups symbols as **Core**, **Documents**
      (`Actor`, `Item`, `Combat`, `Combatant`, `Chat`, `Effect`, `Scene`, `Token`),
      **Domain** (`Action`, `Body`, `Modifier`, `Movement`, `Result`, `StrikeMode`,
      `SkillBase`), **Utility** (`AI`, `Collection`, `Constants`, `Helpers`), and
      **Applications**. Each barrel is a TypeDoc `@module` whose full slashed name
      drives folder nesting via `navigation.includeFolders`; `constants.ts` and
      `SkillBase` get dedicated modules so no single node is overwhelming. The HTML
      and Markdown TypeDoc configs and `tsconfig.docs.json` are updated to consume
      the bundle tree via an `expand` entry-point strategy.
    - **A real API landing page with in-site guides** — the TypeDoc site no longer
      uses the project `README.md` as its home (which pitched the game, not the
      API). A dedicated `docs/api-home.md` introduces the reference, keeps the
      banner image, explains the Core/Documents/Domain/Utility layout, and links to
      the guides. The concept, how-to, reference, and contributing guides are pulled
      into the site via TypeDoc `projectDocuments`, so they appear in the left
      navigation alongside the generated modules instead of being unreachable.
    - **Generated type catalog** — `docs/reference/type-catalog.md` is now generated
      (`utils/build-type-catalog.mjs`, wired into `docs:prepare`) from authoritative
      sources: the `ACTOR_KIND`/`ITEM_KIND` enums (the type set), `lang/en.json`
      (display names), and each Logic class's TSDoc summary (descriptions). It can
      no longer drift from the code — adding a type adds a row — and it picked up the
      `attribute`, `trauma`, and `lineage` types the hand-maintained version had
      dropped.
    - **Drift-resistant architecture overview** — `concepts/architecture.md` is the
      canonical "start here". Its hand-maintained inventories (per-file directory
      annotations, the actor/item type tables, the domain class lists) are replaced
      by directory-level descriptions plus links to the generated reference, so the
      page does not go stale as files are added, renamed, or moved.
    - **Cleaner class documentation** — the boilerplate "Logic for the **X** … type
      —" lead-in is removed from all twenty-one actor and item Logic class TSDoc
      comments; each now opens directly with its description.
    - **Single hub and tidied tree** — `docs/README.md` is the one developer/API
      hub (the redundant `docs/dev/` index is retired); a `docs/contributing/` area
      holds maintainer/meta docs; working notes and player-facing rules content that
      duplicated heroiclands.org were removed from the repository.
    - **Local preview** — new `docs:serve` and `docs:watch` scripts serve the built
      site (and rebuild on change) via `http-server`.
    - **Readability** — documents are sorted into the appropriate Di&#225;taxis
      bucket (concepts, how-to, reference), given consistent "who is this for"
      framing, and cross-linked; stable localization keys, data fields, and code
      remain untouched.

- 2436ecc: **Folder Reorganization**

    All document classes live under `src/document/`; old `src/actor/`, `src/item/`, `src/effect/` directories are gone. Tests mirror the new layout.

- ea32d8d: **Expose `getContextOptions()` as public API; keep the Foundry binding internal**

    The instance `getContextOptions()` method is now **public** on `SohlActor`,
    `SohlItem`, `SohlActiveEffect`, and `SohlLogic`, so external code can enumerate
    the actions currently available on a document — e.g. `actor.getContextOptions()`
    or `actor.logic.getContextOptions()`. Each returned entry corresponds to an
    action whose visibility predicate currently passes; `SCRIPT` actions remain
    permission-gated at execution. (This replaces the former internal
    `_getContextOptions`; the static factory wrappers stay internal.)

    In the same pass, the document classes' Foundry framework hooks and internal
    helpers (`_preCreate`, `_onCreate`, `_preUpdate`, `_onCreateDescendantDocuments`,
    `_getInitiativeFormula`, the static `_getContextOptions`, …) are marked
    `protected`, and the scene-config sheet is marked `@internal`, so the Foundry
    persistence/UI binding stays out of the published API. No runtime behavior
    changes.

- 2436ecc: **Calendar**
    - Substantially expanded with parallel test coverage growth.
    - `seasons` system removed.

- 2b490e6: **Define and Initialize Intrinsic Actions Workflow**

    **Executor wiring.** Intrinsic actions resolve their executor by
    case-sensitive method lookup on the scoped logic object at construction
    time, throwing when the method is missing. This release fixes the base
    `postfinalize` action (its executor string now matches the `postFinalize`
    method) and implements the well-defined executors that were declared but
    missing:
    - `SkillLogic.successTest` / `SkillLogic.opposedTestStart` — delegate to the
      skill's `MasteryLevelModifier`.
    - `SkillLogic.setImproveFlag` / `SkillLogic.unsetImproveFlag` — toggle
      `system.improveFlag` via item update.
    - `GearLogic.setCarried` / `GearLogic.setNotCarried` — toggle
      `system.isCarried` via item update.

    Executors for mechanics that are still roadmap work (e.g. WeaponGear
    `attack`/`block`/`counterstrike`, Mystery `useMystery`, MysticalAbility
    `perform`, several Affliction/Trauma tests) remain unimplemented; their
    classes' unit tests document each gap with a focused `it.todo`.

- 606d5fc: **Automated combat resolution**

    Implements the **Automated** combat mode described in
    `docs/reference/combat-modes.md`: a single attack → defend → resolve → injury
    chain walked through chat cards with minimal player input. Builds on the
    assisted pipeline and the `CombatResult` resolution engine.
    - **Attack initiation** — an automated attack resolves the target and distance
      first, then offers only the strike modes that can reach right now: melee by the
      mode's reach, missile by the weapon's **base range**. **Volley** (a missile
      beyond base range) is an area attack with no aim and is **not supported**; a
      wholly out-of-range target short-circuits. The picker defaults to the
      most-recently-used mode, else the best chance to hit. Posts an attack card.
    - **Missile mechanics** — a direct shot at **point-blank** range (≤ half base
      range) is more precise (spread 6) and hits a little harder (impact +2); a
      normal direct shot is spread 8. Melee precision is the strike mode's `spread`.
    - **Defender response** — the attack card's **Block / Counterstrike / Dodge /
      Ignore** buttons each resolve on the _defender's_ client, assemble the
      `CombatResult`, and post the combined outcome. **Counterstrike** is modelled as
      a second attack (the defender slot becomes an `AttackResult`), so both sides can
      land and the card can carry two injury buttons. Buttons are gated at render
      time: only the defender's owner (the GM owns all) sees them, Block/Counterstrike
      appear only when the defender has a capable mode, and an **incapacitated**
      defender (unconscious/asleep/restrained/paralyzed/frozen/incapacitated) is
      reduced to **Ignore** only.
    - **Injury** — the result card forwards the full aim payload (`targetPart` +
      `spread`) so the wound resolves with no dialog, reusing the existing injury
      pipeline.
    - **Combatant-based model** — automated combat is between **combatants**, not
      arbitrary tokens. Targeting keeps only the targeted tokens that are combatants
      of the active combat (exactly one required); the orchestration API takes a
      `SohlCombatant` throughout (token/actor/distance derived from it). The
      most-recently-used attack/block mode persists on `SohlCombatantDataModel`.
    - **Invariants** — checked up front, aborting immediately with a player-facing
      notification: attacker and defender must be combatants in the same active
      combat; the attacker must not be dead/defeated/unconscious/asleep/restrained/
      paralyzed/frozen/incapacitated; the target must not be dead. Documented in
      `docs/reference/combat.md`.
    - **Status effects** — a single `STATUS_EFFECT` constant lists every status
      (Foundry standard + SoHL), a new **Evading** status (`evade`) was registered,
      and the combat call sites use the constant instead of string literals.
    - **Architecture & docs** — established **actor state sovereignty** (an actor
      mutates only itself; cross-actor effects go through a target-addressed chat
      acknowledge button resolved on the target's client) and a **message-channel**
      discipline (in-world events → chat cards; client/player errors → UI
      notification + console; dev diagnostics → console). Both documented in the
      concept/how-to/reference docs and the user guide.

    Resolution helpers (range/spread classification, mode gathering, best-mastery,
    status predicates, card assembly) are Foundry-free and unit-tested; the
    orchestration glue (dialogs, tokens, chat posting, persistence) is Foundry-bound
    and requires in-app verification.

- 2436ecc: **Per-actor cohort handling**

    Cohort drop logic now goes through a dialog (`CohortDataModel.handleCohortDrop`) instead of a token placement no-op.

- a659b3c: **Safe Expressions**
    - a sandboxed expression evaluator
    - synatax based on JS, but does not use a JS evaluator, instead uses a custom highly limited evaluator
    - significantly improves safety for common simple evaluations

- 2436ecc: **Reorganized to remove variants**

    The `MistyIsle`/`Lgnd*` variant split is gone — every document, logic class, and pack now targets the single Legendary ruleset. Hooks remain for module-side extension.

- 2436ecc: **Combat resolution (assisted & automated)**

    Implements the two combat modes documented in `docs/reference/combat-modes.md`.
    - **Chat-card dispatch fix.** The `renderChatMessageHTML` handler read only `data-doc-uuid`, but the combat/injury cards emit `data-handler-uuid` / `data-handler-actor-uuid` / `data-action-handler-uuid`, so none of their buttons dispatched. A new Foundry-free `resolveChatCardHandlerUuid()` (`src/document/chat/chat-card-dispatch.ts`) normalizes the reader across all card conventions without renaming any template attribute.
    - **Injury-resolution pipeline.** New Foundry-free `src/domain/body/InjuryResolution.ts` (`resolveInjury` / `buildTraumaData` / `injuryLevelFromImpact`) — the shared core for both modes. Resolves the hit location (explicit override, aimed scatter, or weighted random), subtracts aspect-specific armor, maps effective impact to an injury level (≤0 none · 1–4 M1 · 5–9 S2 · 10–14 S3 · 15–19 G4 · 20+ G5), and evaluates bleeding/amputation via the existing `InjuryDefaults` tables. `INJURY_LEVELS` moved to `constants.ts` so the domain layer can consume it (re-exported from `TraumaLogic` for back-compat).
    - **Armor aggregation & shock/glancing/fumble.** Worn armor is folded onto body locations each lifecycle cycle (`ArmorAggregation.ts`, wired into `BeingLogic`): every location knows its summed protection per aspect, whether any rigid armor covers it, and the list of covering materials. `resolveInjury` now splits total armor value (natural + worn) from a manual armor reduction and derives the **Shock Index** (`location shock + injury level`, +1 for a glancing blow), **glancing blows** (edged/piercing 1–4 impact against rigid armor → no injury, +10 Shock Roll), and **stumble/fumble** dispositions (roll at Serious, automatic at Grievous) at flagged locations. All zone-die machinery was dropped from the injury model and cards.
    - **Assisted impact roll.** The Combat tab's Impact cell is now clickable (`rollStrikeModeImpact`): it rolls the strike mode's impact dice and posts a `damage-card.hbs`. When a single token is targeted, the card's Calculate Injury button forwards `{ impact, aspect }` to the target, opening the assisted Add Injury dialog. `damage-card.hbs` was flattened onto a real render context (the previous template referenced impact fields that never existed). Pure helpers `buildDamageCardData` added to `combat-actions.ts`; a read-only `aspectType` getter was added to `ImpactModifier`.
    - **Injury cards & Add Injury flow.** `injury-card.hbs` / `injury-dialog.hbs` rewritten to the new model. `SohlActor.onChatCardButton` dispatches the `createInjury` action: an automated request (aimed `targetPart` + `accuracy` forwarded in `data-test-result-json`) resolves with no dialog, while an assisted request opens the Add Injury dialog. The Trauma tab gains a manual **Add Injury** action. Pure, unit-tested helpers (`parseInjuryRequest`, `readInjuryDialogForm`, `buildInjuryCardData`, `resolveAutomatedInjury`) live in `src/document/actor/foundry/injury-actions.ts`.
    - **CombatResult resolution.** `CombatResult.opposedTestEvaluate` / `calcMeleeCombatResult` / `calcDodgeCombatResult` are implemented against the live `OpposedTestResult` API (the previous bodies were commented-out legacy referencing a dead API). Outcomes key off the victory score `VS = attacker.normSuccessLevel − defender.normSuccessLevel` (raw level difference, so the tables resolve every exchange by relative margin): Block lands the attack on `VS >= 0` (a tie also forces a defender weapon-break roll); Counterstrike lands the attacker on `VS >= 0` and the defender whenever its own roll succeeds (both may land); Dodge lands on `VS > 0`, or a tie with a lower dodge roll; Ignore lands the attack when it succeeds. Tactical Advantages (`|VS|−1` to the winner of a 2+ margin) and the weapon-break check are surfaced as display-only fields. Fully unit-tested.

- 2436ecc: **New `Assembly` and `Disposition` Document Types**

    `Assembly` actors (variant-invariant composition containers) and a `Disposition` item type were added.

- 5b09577: **Remove legacy counterstrike behavior**

    A counterstrike shares the **same skill base mastery level** as a normal attack
    but carries its **own modifier deltas** (it can be at a circumstantial
    disadvantage an attack isn't), so `defense.counterstrike` remains a legitimate,
    separate `CombatModifier`. The only legacy here is the **`noCounterstrike`
    trait** — there is no such trait; a counterstrike is gated by `noAttack`, since
    it _is_ an attack.
    - **`MeleeStrikeMode`** — the counterstrike defense is now disabled by the
      `noAttack` trait (or its own `defense.counterstrike.disabled` flag), not by a
      `noCounterstrike` trait.
    - **Constants / localization** — removed the orphaned `VALUE_DELTA_ID.NOCOUNTERSTRIKE`
      (`"NoCX"`) and its two lang keys (`SOHL.Key.NoCounterstrike`,
      `SOHL.ValueDelta.INFO.NoCX`).
    - **`automatedCounterstrikeResume`** — the automated Counterstrike defense now
      rolls the strike mode's `defense.counterstrike` modifier (not its `attack`
      modifier); the best-chance default ranks by it, and modes whose counterstrike
      is independently disabled are excluded.

    Gate counterstrike by `noAttack`; remove the dead `noCounterstrike` trait

    The `defense.counterstrike` modifier, the `SM_COUNTERSTRIKE` ActiveEffect key,
    `TEST_TYPE.COUNTERSTRIKE`, and the assisted **CX** column are all retained.

- 2b490e6: **Restore the Foundry-free logic layer and make it enforceable and tested**

    The logic layer was designed to be unit-testable outside Foundry — logic
    classes define Data interfaces that the Foundry DataModels implement, and
    all Foundry API access flows through the `FoundryHelpers` shim. That
    boundary had silently eroded: the base logic classes and Data interfaces
    lived inside the Foundry document monoliths, the core `SohlLogic` root
    value-imported Foundry-coupled modules, and a handful of logic/domain files
    leaked runtime Foundry references. As a result every item/actor logic class
    was un-importable (and untested) outside Foundry.

    **Boundary restoration (no behavior change)**
    - `SohlItemLogic`/`SohlItemData`/`SohlItemBaseLogic` moved from
      `foundry/SohlItem.ts` to `src/document/item/logic/SohlItemBaseLogic.ts`;
      same for the actor equivalents. The monoliths re-export them, so existing
      imports keep working. Document-type references in the logic layer are
      `import type` only (erased at compile time).
    - The pure context-menu primitives (`ContextMenuEntry`, conditions,
      item/actor resolution) moved from the Foundry-coupled `SohlContextMenu`
      UI class into the new Foundry-free `src/utils/ContextMenuEntry.ts`;
      `SohlContextMenu` delegates and re-exports under its namespace.
    - `combat-actions.ts` and `automated-combat.ts` moved from
      `actor/foundry/` to `actor/logic/` (they were already Foundry-free except
      for two token-targeting statics, now shimmed as
      `fvttGetTargetedTokens`/`fvttRangeToTarget` in FoundryHelpers).
    - Strike-mode schema helpers access `foundry.data.fields` lazily inside
      the schema methods instead of at module load.
    - Misc: vestigial/value imports converted to `import type` across the
      logic, domain, and core layers.

    **Enforcement**
    - New ESLint boundary rule (`@typescript-eslint/no-restricted-imports`,
      `allowTypeImports`) forbids value imports of Foundry-coupled modules
      from the Foundry-free zones. The previously broken `eslint.config.js`
      (uninstalled plugin, ESM `require`, typoed `project`) was rewritten as
      a working flat config; `npm run lint` runs again.
    - New purity smoke test (`npm run test:purity`, wired into `build:noci`)
      imports every logic/domain module with **no** Foundry globals present,
      catching any module-level `foundry.*`/`game.*` access the lint patterns
      might miss.

    **Unit tests for the logic layer**
    - New harness (`tests/mocks/logicHarness.ts`) builds plain-object
      implementations of the Data interfaces, so logic classes construct
      exactly as `SohlDataModel.create()` does in production.
    - The `it.todo` scaffolding across `tests/item/`, `tests/actor/`, and
      `tests/core/SohlLogic.test.ts` was converted into real unit tests for
      all implemented logic behavior; Foundry-layer (DataModel schema) stubs
      and unimplemented mechanics remain documented as todos.

    **Bug fixes surfaced by the new tests**
    - **Situational modifiers were silently dropped everywhere.** Six call
      sites (success/attack/defend tests, automated combat, BeingLogic) keyed
      the player situational-modifier delta as `VALUE_DELTA_ID.PLAYER`, which
      is `undefined` (the map is keyed by shortcode); the dialog-entered
      modifier never reached the roll.
    - **`ValueModifier` operators redesigned to make that bug unrepresentable.**
      `add`/`multiply`/`set`/`floor`/`ceiling` previously dispatched on whether
      the first argument was an object, with `...args: any[]` signatures — so a
      two-argument call silently meant `(name, shortcode)` with no value, and the
      `undefined` first arg above slipped through untyped. They now have real
      typed overloads dispatched by arity:
        - `(shortcode, value)` — the shortcode must be a registered
          `VALUE_DELTA_INFO` member; the display name is resolved from the
          registry and an unknown shortcode **throws**.
        - `(name, shortcode, value)` — explicit, for ad-hoc deltas, unvalidated.
          The shortcode-only form takes a `ValueDeltaInfo`-typed argument, so the
          original `add(VALUE_DELTA_ID.PLAYER, value)` is now a compile error rather
          than a silent miss. The six situational-modifier sites become the clean
          `add(VALUE_DELTA_INFO.PLAYER, value)`. (The stricter typing also surfaced
          `DefendResult` adding a possibly-`undefined` modifier value, now guarded.)
    - `SohlAction`: the constructor now switches on the merged action data, so
      definitions that omit `scope` get the documented SELF default instead of
      throwing `Unknown action scope: undefined`.
    - `SohlAction.toJSON()` serializes the action definition only, fixing an
      infinite recursion when serializing any logic object (action → parent
      logic → actions → …).
    - `SkillLogic`: the Aura-based fate bonus was silently dropped (the value
      was passed in the `shortcode` slot of `ValueModifier.add`); it now
      applies as the `FateBns` delta.
    - The context-menu `Entry` fallback callback invoked a non-existent
      `_getContextLogic` helper (runtime TypeError when an entry had only a
      `functionName`); it now resolves the context item and invokes the named
      logic method.

- 2436ecc: **Combat group allegiance on Foundry-native CombatantGroup**

    Adopts v14's `CombatantGroup` as the single source of truth for combat allegiance under one invariant: two combatants are enemies iff they belong to different groups. Replaces the unused custom `groups[]` / `groupStances` faction-matrix system (discharges roadmap **T2-4**).
    - New `tokenDocument.flags.sohl.defaultCombatGroup` (free-form string, default `"Opponents"`) with a "Default Combat Group" field injected into both the Token and Prototype Token config sheets (`combat-group-hooks.ts`).
    - Combatants are auto-seeded into a `CombatantGroup` on creation (`SohlCombat#_onCreateDescendantDocuments`, batch-aware, case-insensitive find-or-create).
    - `SohlCombatant.isEnemyOf()`, a reworked `allies` getter (same group = ally), and a real `threatenedBy` getter: an enemy threatens unless it is defeated, incapacitated (`unconscious`/`sleep`/`stun`/`restrain`/`paralysis`/`frozen` — `THREAT_NEGATING_STATUSES`), hidden, or out of reach. Weapon reach is a documented placeholder (`reaches()` returns `true`) pending a separate roadmap item.
    - A "Move to Group…" combat-tracker context-menu entry and a per-row group-name label (display only — no group-based turn ordering).

- 2436ecc: **Logic Extraction**

    Document classes (`SohlItem`, `SohlActor`) are thin Foundry wrappers; per-type rules live in `*Logic` classes under `src/document/*/logic/`. All Foundry API access funnels through `src/core/FoundryHelpers.ts`.

- 2436ecc: **Major Overhaul of Active Effects System**

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

- 2436ecc: **Scene Enhancements**

    **`SohlScene` replaces `SohlRegion`/`SohlEncounter`/region-behavior.** New `SohlSceneDataModel`, `SohlSceneConfig`, `SohlSceneLogic` along with combat-tracker hooks (`combat-tracker-hooks.ts`) that inject `moveFactor` / `displayedMedium` fields and computed move display per tracker row.

- 2436ecc: Actor & combatant reach

    BeingLogic.reach`is the greatest reach among the actor's currently *available* melee strike modes: combat-technique modes are intrinsic (always available); a weapon mode counts only while the weapon is held in at least its`minParts` limbs (`canHoldItem`body parts).`SohlCombatant.reach`surfaces that value for the combatant. The availability + max logic lives in the Foundry-free`reach-helpers.ts` (`computeActorReach`). `SohlCombatant.reaches(other)`returns whether this combatant's reach covers the center-to-center grid distance to`other`, so `threatenedBy`now reports an enemy`c`as a threat when`c`'s melee reach extends to the combatant.

- 2436ecc: **Lineage Item**

    A new item representing the anatomy and movement characteristics of a being.
    - **`move-helpers`** replaces `MovementFactorDefaults` / `MovementProfile` — a single source of truth for medium-aware movement math.
    - **Size-based melee reach.** Lineage gains a `reachBase` field (feet; medium creatures = 0) surfaced as a `reach` ValueModifier on `LineageLogic`. A melee strike mode's `reach` ValueModifier is seeded from the weapon's `lengthBase`, and the wielder's lineage reach is added on top during the owning logic's evaluate phase (`WeaponGearLogic.evaluate` and `CombatTechniqueLogic.evaluate`; the latter now holds its strike-mode instance, exposed via `CombatTechniqueDataModel.strikeModeInstance`). Lineage is a Being-only concept: a non-Being (or absent) lineage adds nothing (reach stays at length), while a Being that lacks a lineage logs a warning in `BeingLogic.finalize` (it cannot move, wield weapons, etc., and should be treated as unusable).
    - **Domain registry** (`SohlDomains` / `builtinDomains`) added as a cross-cutting registry for cohorts, beings, and assemblies.

### Patch Changes

- ea32d8d: **Expand API reference documentation (TSDoc)**

    Add accurate TSDoc across high-value public API surfaces so developers building
    against SoHL get complete, trustworthy reference docs. This is a comments-only,
    non-behavioral effort (no runtime logic, signatures, or data fields change), run
    in reviewable batches per the API documentation coverage plan.

    **Documented so far:**
    - **All result types (`domain/result/`)** — complete coverage of `TestResult`
      (the abstract base), `SuccessTestResult`, `OpposedTestResult`, `AttackResult`,
      `DefendResult`, `CombatResult`, and `ImpactResult`: class members,
      constructors (parameters and `@throws`), the success-level and
      opposed-resolution getters, the `evaluate` / `testDialog` / `toChat` overrides
      (each documenting only what it adds over the base), and the `Data` / `Options`
      / `ContextScope` / `LimitedDescription` namespace types.
    - **All modifier types (`domain/modifier/`)** — complete coverage of
      `ValueModifier` (the base + deltas model: operators, inspection/mutation
      methods, disabled state, chat rendering), `MasteryLevelModifier` (target
      clamping, critical digits, success-level offset, and the success /
      success-value / opposed test methods), `ImpactModifier` (dice, aspect,
      formula, evaluation), `CombatModifier`, and the `ValueDelta` building block —
      including their namespace types. Internal plumbing is tagged `@internal`.
    - **The rest of the Domain layer** — the anatomy/hit-location model
      (`BodyStructure`, `BodyPart`, `BodyLocation`, armor aggregation, injury
      resolution, weighted hit-location selection), the strike-mode combat types
      (`StrikeModeBase`/`MeleeStrikeMode`/`MissileStrikeMode`: reach, attack,
      impact, block/counterstrike), the `SohlAction` action system, the per-medium
      movement helpers, and the `SkillBase` formula — classes, exported functions,
      and namespace/`Data` interfaces. With this, the entire `domain/` layer is
      documented.
    - **The `SohlActor` document module** (`document/actor/foundry/SohlActor.ts`) —
      the actor document's lifecycle and data-preparation overrides
      (`prepareBaseData`, `prepareEmbeddedData`'s phase-batched lifecycle,
      `prepareDerivedData`), creation hooks (`_preCreate`, `_onCreate`,
      `createUniqueName`), the `SohlActorLogic` / `SohlActorData` interfaces, the
      `SohlActorDataModel` base, and the `SohlActorSheetBase` render/context hooks.
    - **The `SohlLogic` core base** (`core/SohlLogic.ts`) — the abstract logic base
      every actor/item logic class extends: the document accessors
      (`id`/`name`/`type`/`item`/`actor`/`speaker`/`label`), the `actions`
      collection and context-menu/default-action helpers, the phase-batched
      lifecycle methods, the intrinsic-action exports, and the `SohlLogicData`
      interface. Documenting the base cascades to every subclass's inherited members.
    - **All actor and item Logic classes** (`document/actor/logic/*` and
      `document/item/logic/*`) — every Logic class and its `*Data` interface: class
      summaries, the data interfaces and all their members (including nested
      object-literal fields), synthesized properties (documented in terms of the
      data field they derive from — e.g. a `ValueModifier` seeded from a `*Base`
      number, or a resolved logic object from a shortcode), getters, constructors,
      and the intrinsic-action / test methods where the business logic lives. The
      inherited lifecycle methods (`initialize`/`evaluate`/`finalize`) are
      deliberately left to inherit their base-class documentation.
    - **The Foundry binding layer is marked `@internal`** — every DataModel and
      Sheet class (concrete and base, plus core `SohlDataModel` and its
      `SheetMixin`) is tagged `@internal` and excluded from the published API. The
      supported extension surface is hooks, action items, and the Logic / domain
      classes — not the Foundry persistence/UI binding. The data _shape_ remains
      documented through the public `*Data` interfaces.
    - **Documented the data-access pattern** — every `*Data` interface is marked as
      the shape of `system` for its document type, and the architecture overview
      explains that `document.logic.data` (typed as the `*Data` interface) is the
      recommended, fully-typed path to a document's fields — equivalent to
      `document.system`, which is the same object but typed as the now-internal
      DataModel.
    - The internal `AIExecutionResult` interfaces are tagged `@internal` so they no
      longer appear in the published API.
    - **The `utils` layer** (`utils/`, excluding `constants.ts`) — the shared helper
      classes and functions developers reach for when traversing documents and
      building actions: `helpers.ts` (type guards, brand types, name/uuid utilities,
      the `AsyncFunction` compiler), `SimpleRoll`, `SohlMersenneTwister`,
      `SohlLogger`, `SohlLocalize`, `SohlContextMenu`, `SourceMapResolver`, `Itr`,
      and `collection/SohlMap` — class summaries, members, parameters/returns, and
      the meaningful structural members of return shapes and type-guard predicates.
      The `utils/ai/` agent-plumbing module is tagged `@internal` and excluded from
      the published API.
    - **The `sohl.*` runtime surface** — the global `sohl` object is a `SohlSystem`
      singleton, so its public surface is now documented: the `SohlSystem` class
      (the `CONFIG` registry getter — documented lightly — plus `i18n`, `log`,
      `events`, `utils`, `constants`, `game`, `calendar`, `setupSheets`, and the
      calendar-registry statics), the `SohlSystem.Config` namespace and its
      per-document-type registration blocks, and the actor/item DataModel / Logic /
      sheet registry barrel exports. The world calendar (`SohlCalendarData`,
      `SohlCalendarComponents`) and the event-trigger taxonomy (`SohlEventQueue`
      was already documented; `SohlTriggerContext` is now covered) round out
      `sohl.calendar` and `sohl.events`.
    - **The action-execution context** — `SohlActionContext` (the context every
      intrinsic action receives: `speaker`, `target`, `skipDialog`/`noChat`,
      `type`/`title`, the generic `scope` payload, plus `toJSON`/`clone` and the
      `character`/`token` accessors) and `SohlSpeaker` (who is acting and how its
      voice is rendered to chat: identifier resolution, `toChat`,
      `getChatMessageSpeaker`, `isOwner`, and the `ChatOptions`/`Data` namespace
      types). Underscore-prefixed internal helpers are kept out of the public API
      (`_prepareChat` is `protected`; the `_speaker` cache field is `@internal`).
    - **The `SohlItem` document** — the item document class plus the base
      `SohlItemData` members (`item`, `label`, `notes`, `docHtml`) whose docs
      cascade to every concrete item type's `*Data` interface, completing the
      actor/item document pair alongside `SohlActor`.
    - **The `FoundryHelpers` isolation layer** — the supported wrappers the codebase
      routes Foundry API calls through (e.g. `getGame`/`getCanvas`/`getCurrentUser`/
      `getCurrentScene`, the HTML/template renderers, and the dialog config types
      `DialogConfig`/`DialogButton`/`AwaitDialogResult` and their callbacks).
    - **Combat/scene document + logic stragglers** — `SohlCombat`, `SohlCombatant`
      (+ `StrikeModeRef`), `SohlActiveEffect`, `SohlSceneLogic`, the combat/combatant
      logic view interfaces, the strike-mode helpers, `SohlDomains.getChoices`,
      `URLField`.
    - **The settings-menu UIs are marked `@internal`** — `DomainManagerApp` and
      `CalendarSettingsMenu` are Foundry `ApplicationV2` bindings, not part of the
      hook-based extension surface, so they are excluded from the published API
      (same treatment as the sheets and DataModels).
    - **`constants.ts` top-level tables + `defineType`** — every top-level exported
      enum/table, value union, and helper in `constants.ts` now carries a concise
      one-line description (`ACTOR_KIND`, `ITEM_KIND`, `TRAIT_CODE`, `SKILL_CODE`,
      `VALUE_DELTA_OPERATOR`, the `*_METADATA`/`*_EFFECT_KEY`/`*_SUBTYPE` groups,
      …). `defineType` — the foundation nearly every constant set is declared with —
      and its `DefinedType` result are documented in depth (with `@typeParam`,
      `@example`, and `@remarks`). The thousands of self-describing individual
      members of those tables are intentionally **not** documented per-member; that
      reference data lives in CLAUDE.md and the player rules site.
    - **A documentation-coverage gate** (`npm run docs:coverage`,
      `utils/docs-coverage.mjs`) runs the TypeDoc `notDocumented` validation and
      fails on any undocumented symbol outside `constants.ts`, so the "fully
      documented" state is now enforceable rather than manually checked.

- fc3c528: **Enforce explicit `override` modifiers with `noImplicitOverride`**

    Enable the TypeScript `noImplicitOverride` compiler option and add the `override`
    keyword to every class member that overrides a base-class member — 67 members
    across 39 files. This is a non-behavioral, compile-time-only change: no runtime
    logic, method signatures, or data fields are affected, and the full test suite
    is unchanged and green.

    The members affected span methods, getter/setter accessors, and properties.
    Constructors, `private`/`#private` members, and interface implementations are
    intentionally untouched — `noImplicitOverride` only governs `extends`-based
    inheritance.

    **Why:** explicit `override` makes inheritance intent visible and safe. Renaming
    or removing a base-class member now produces a compile error at every stale
    override (rather than silently leaving a new, disconnected member behind), and
    overrides that no longer match a base member are caught immediately. With the
    flag enabled, the compiler enforces the keyword on all future overrides, so the
    codebase stays consistent without manual review.

    **Scope:** the keyword is applied wherever the compiler can prove a base member
    exists. Members that override loosely-typed Foundry base classes (via
    `fvtt-types/lenient`) or classes produced by the sheet mixins may not all be
    marked, because the base member isn't visible to the type checker; this is
    expected and harmless.

- 3e931a1: **Fix the release automation so versioned changes actually publish.**

    The release workflow's build-and-publish job was gated on a `published` output
    that `changeset version` never sets, so the GitHub Release and packaged
    `system.zip` / `system.json` were never produced. The job now triggers once the
    **Version Packages** PR merges — detected via `hasChangesets == false` plus an
    untagged `package.json` version — and creates the `v<version>` tag and Release
    with the manifest attached.

    Also removes the redundant `changeset-pr.yml` workflow, which referenced a
    nonexistent `npm run version` script; opening the Version Packages PR is now
    handled solely by the consolidated release workflow (with the
    `pull-requests: write` permission it needs).

    Finally, the release prints a reminder (in the run summary) with the exact
    `gh workflow run deploy-docs.yml --ref v<version>` command to publish the
    versioned API docs — needed because a Release created with `GITHUB_TOKEN`
    can't auto-trigger `deploy-docs.yml`. That manual dispatch now mirrors the
    build to `/latest` (matching the automatic release behavior) when run against
    a tag.

- ea32d8d: **Normalize member visibility to the underscore naming convention**

    Align member visibility with the project's underscore naming convention so the
    two always agree: a leading underscore means `protected`, while `private`
    members carry no underscore.
    - **Public underscore members → `protected`.** Every underscore-prefixed
      class member that was `public` (by omission) is now `protected`. Foundry
      framework overrides keep their underscore names; the compiler confirmed each
      can be `protected` (their fvtt-types bases are already protected), and Foundry
      still invokes them at runtime since TypeScript visibility is erased.
    - **Private underscore members → de-underscored.** Members that were `private`
      stay `private` and have the leading underscore removed (e.g. `_subs` →
      `subs`, `_dispatchOne` → `dispatchOne`). The exception is a private backing
      field paired with a public getter of the same name (e.g. `_parent` ↔
      `get parent()`, `_logic` ↔ `get logic()`); those keep the underscore, since
      the field and accessor cannot share a name.
    - **`skillBaseForRoll` → `_skillBaseForRoll`.** The one `protected` member that
      lacked an underscore is renamed to match.
    - Constructor parameters (including underscore-prefixed unused parameters) are
      unaffected.

    This is an encapsulation/hygiene change with no runtime behavior change. The
    public underscore members were already internal by convention; making them
    `protected` also removes them from the published API reference (TypeDoc excludes
    protected members).

- 4e0a3fb: **Overhaul the generated API documentation: working cross-references, a
  hierarchical navigation tree, and links out to the Foundry API.**

    **Cross-reference resolution.** A docs build surfaced 178 unresolved `{@link}`
    warnings. TypeDoc's link resolver degrades as the API is split across multiple
    entry-point modules, so the previous per-group barrel tree stranded valid links
    between, e.g., `Documents/Item` and `Domain/Modifier`. The entry point is now a
    single flat module (`utils/build-docs-entry.mjs`), which resolves every internal
    link — **178 → 0**.

    **Hierarchical navigation, preserved.** Architecture grouping is restored at the
    navigation layer instead of via modules: `typedoc-plugin-source-category.mjs`
    assigns each symbol a `@category` from its `src/` path (a hand-written
    `@category` always wins), and `typedoc-plugin-nested-nav.mjs` splits the
    slash-encoded category names into a real nested tree at render time. The sidebar
    shows `Documents ▸ Actor`, `Domain ▸ Modifier`, etc. — the folder-tree feel,
    with zero broken links.

    **Links to the Foundry API.** `typedoc-plugin-foundry-links.mjs` resolves
    `fvtt-types` symbols to the official Foundry API site, in both doc comments and
    rendered type signatures, so `{@link Scene}` links to
    `foundryvtt.com/api/classes/foundry.documents.Scene.html`.

    **Structure and authoring.** The symbol API is one module renamed **API
    Reference**, whose landing page is authored by hand in `docs/api-module.md`
    (pulled in via `{@include}`). All guides now live under a top-level
    **Documentation** node that mirrors the `docs/` layout (Concepts, How-to,
    Reference, Contributing), built with TypeDoc document `children` frontmatter.

    Source changes are comments-only (broken/inappropriate `{@link}`s reworded or
    de-linked); no runtime code, types, or behavior change.
