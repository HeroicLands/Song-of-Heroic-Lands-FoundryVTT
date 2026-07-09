# sohl

## 0.8.0

### Minor Changes

- 70a1b16: **Actor-first data preparation with post-phase action executors**

    `SohlActor.prepareDerivedData` now interleaves the actor's own logic phases with
    its items' phases instead of running the actor entirely after every item, and it
    dispatches post-phase intrinsic-action executors.
    - Order per preparation cycle: actor `initialize` → items `initialize` (then
      items' initial Active Effects) → actor `evaluate` → items `evaluate` → items
      `finalize` → actor `finalize`. The actor's `initialize` and `evaluate` now
      precede the items' corresponding phases, so actor-level state (e.g. `pull` and
      the body structure) is ready before weapons resolve their available strike
      modes.
    - After each phase, the matching `postInitialize` / `postEvaluate` /
      `postFinalize` intrinsic action (when one is defined) is executed for the actor
      and for each item, alongside the existing `sohl.*.post*` hooks.

- 45d5ef6: **Automated combat start on the combatant; opposed tests on the token**

    Two entry points move to the document that owns them, paralleling the earlier
    relocation of the automated-combat defenses to the combatant.

    _Automated combat start_ becomes a single entry point on the combatant:
    - `CombatantLogic.automatedCombatStart` is the canonical (ESSENTIAL) action. It
      branches on scope: an `itemLogic`-scoped start (a `logicUuid` naming a weapon
      or combat technique, with an optional `smId`) offers only that item's in-range
      strike modes; a combatant-scoped start offers every in-range mode.
    - `WeaponGearLogic` / `CombatTechniqueLogic` `automatedCombatStart` now delegate
      into the attacker's combatant action, passing `{ logicUuid, smId }`, via the
      new `fvttActiveCombatantForActor` helper. The orphaned `BeingLogic.automatedCombatStart`
      is removed.
    - `startAutomatedAttackFromActor` is renamed to `startAutomatedAttackFromCombatant`
      and takes the combatant logic. `SohlLogic` gains a `uuid` getter.

    _Opposed tests_ (skill-vs-skill, skill-vs-attribute, attribute-vs-attribute)
    become token-based:
    - `SohlTokenDocument` is registered as `CONFIG.Token.documentClass` and gains a
      transient `.logic` adapter (no DataModel — tokens persist no SoHL state) plus
      `onChatCardButton`.
    - New `SohlTokenDocumentLogic` hosts `opposedTestStart` (resolves the source
      skill/attribute by `logicUuid` and runs its test) and `opposedTestResume` (the
      opposed-request card's Respond button addresses the **target token**;
      reconstructs the prior result, lets the defender pick the responding skill or
      attribute, and resolves the contest). The actor is always derived from the
      token.
    - `SkillLogic` and `AttributeLogic` `opposedTestStart` delegate into the actor's
      token logic via the new `fvttActiveTokenLogicForActor` helper; the stubbed
      `BeingLogic.opposedTestResume` is removed. The opposed-request card now renders
      a Respond button addressed by token UUID.

- baf8b3b: **Relocate the automated combat defenses to the combatant**

    A defender's automated-combat defenses are a combatant concern, so they move
    off the actor and the attack card dispatches them to the combatant.
    - The automated **Block** / **Dodge** / **Counterstrike** / **Ignore** resumes
      move from `BeingLogic` to `CombatantLogic` as intrinsic actions; `this` is the
      defender combatant and `this.actorLogic` supplies strike-mode capability.
      `BeingLogic` keeps only the attacker entry (`automatedCombatStart`).
    - `SohlCombatant` gains `onChatCardButton`, dispatching generically to its
      logic. The attack card's defense buttons now address the defender's
      **combatant**, and `chat-card-gating` reaches the actor (statuses, capability)
      through it. The "Calculate Injury" buttons still address the **actor**.
    - `SohlLogic.actor` resolves the owning actor from the document, so it works for
      a combatant (or effect) instead of throwing.

- 45d5ef6: **Combatant actions on the combat-tracker context menu**

    Right-clicking a combatant in the combat tracker now lists that combatant's
    available actions, so the automated-combat start (added alongside) is actually
    reachable from the UI.
    - A `getCombatantContextOptions` hook maps each row combatant's
      `getContextOptions()` into the tracker menu, reusing the same delegation
      contract `SohlActor`/`SohlItem` use (`SohlCombatant.getContextOptions()` →
      `CombatantLogic.getContextOptions()`). Entries are gated on `combatant.isOwner`
      (owner + GM).
    - **Automated Attack** appears for the combatant's owner; **Move to Group…** is
      now a first-class GM-only `CombatantLogic.moveToGroup` intrinsic action
      (replacing the previous bespoke context-menu entry), so it flows through the
      same mechanism.
    - Action `visible` predicates gain an `isGM` binding, letting an action declare
      `visible: "isGM"`.

- 7b24271: **CSS foundation: design tokens, cascade layers, and a single scoping model**

    Lay the foundation the rest of the CSS refactor (epic #95) builds on. No visual change
    is intended — the compiled CSS is computed-value-equivalent to before, apart from the
    dead-rule deletions and the redundant-`!important` removal noted below.

    **Design tokens.** New `scss/abstracts/_tokens.scss` is the single source of truth for
    the palette, spacing, and font stacks as SCSS maps, emitted to CSS custom properties on
    `:root` (`--sohl-color-*`, `--sohl-space-*`, `--sohl-font-*`). Every component now
    consumes the custom properties (`var(--sohl-color-…)`) instead of SCSS color variables,
    so the system is themeable at runtime without recompiling. `utils/_colors.scss` and
    `utils/_variables.scss` are removed (folded into the tokens layer); `utils/_foundry-vars.scss`
    now maps the Foundry `--color-*` overrides onto the new tokens.

    **Cascade layers.** `scss/sohl.scss` declares a documented layer order
    (`sohl.base, sohl.layout, sohl.components, sohl.apps, sohl.utilities`). Foundry v14 core
    is fully layered, so SoHL's own `sohl.*` layers — registered after Foundry's stack — beat
    core without `!important` or deep nesting. Current rules map to `base` (Foundry-core
    overrides + global UI) and `components` (the `.sohl` namespace block, in unchanged order);
    `layout`/`apps`/`utilities` are reserved for the file reorg (#92) and component
    extraction (#93). The now-redundant `!important` flags on the disabled-input focus reset
    are dropped (specificity + layer already win).

    **Scoping model.** Settled on the compound `.sohl.sheet` pattern for frame classes and
    documented it. Removed the dead `.item-form` and `.macro-sheet` selectors (the classes
    no longer exist under ApplicationV2), and de-duplicated `.window-content` so the parchment
    background/font/color have a single owner (`components/_top.scss`) while the sheet frame
    adds only its overflow/padding.

    The styleguide (`docs/concepts/css-architecture.md`) is updated to match: tokens emit on
    `:root`, and the cascade-layer section now reflects Foundry v14's layered core.

- 45d5ef6: **Default Combat Group moves from a token flag to the actor**

    The combatant group an actor auto-joins when it enters combat is now a typed
    `defaultCombatGroup` field on the actor data model, set on the actor sheet's
    **Combat** tab (GM-only), instead of a `flags.sohl.defaultCombatGroup` token
    flag.
    - `SohlCombat`'s combatant-group seeding reads `actor.system.defaultCombatGroup`;
      blank still falls back to the default group (`Opponents`).
    - The Token / Prototype-Token config field is removed; the value is edited on
      the actor. TokenDocument has no typed system data, so the actor (which exists
      before the combatant) is the better-integrated, pre-configurable home.

    _Note:_ any value previously set via the old token field is not migrated — set
    the actor's Default Combat Group instead.

- 70a1b16: **Rename `SohlDomains` to `DomainRegistry`**

    The domain registry class is renamed from `SohlDomains` to `DomainRegistry` and
    moved to `src/entity/domain/DomainRegistry.ts`. Its static surface is unchanged
    under the new name — `DomainRegistry.getAll()`, `.get(shortcode)`,
    `.getByFamily(family)`, `.getChoices(family?)`, `.register(...)`, and
    `.remove(shortcode)`.

    The Domain Manager app and its view model are updated to the new name; behavior
    is otherwise unchanged.

- baf72ac: **Make every entity class overridable via a two-mechanism registry**

    Completes the `sohl.entity` registry so a variant module can subclass any
    registered entity class and have that subclass built everywhere, and routes
    _all_ construction through the registry so no site silently bypasses an override.

    **The override API**
    - `sohl.entity.register(name, cls)` — install an override. `cls` must extend (or
      be) the canonical base for `name`; the call throws on an unknown name, a class
      that does not extend the base, or a base that has not yet loaded. Call it from
      a module's `init`/`setup` hook, before the first construction of that class.
    - `sohl.entity.base(name)` — the canonical SoHL base for `name`, ignoring any
      override, for a module that wants to extend the original.

    **Two construction mechanisms**
    - **Inside SoHL** — `import { entity }` then `new entity.X(...)`. A static import
      that resolves through the module graph, so unit tests construct these classes
      with no runtime global wired.
    - **Outside SoHL** (macros / variant modules) — the same surface on the runtime
      global: `new sohl.entity.X(...)` and `sohl.entity.register(...)`.

    Both read one backing record, so an override is honored no matter which
    constructs the object.

    **How it fits together**

    Classes self-register (`registerEntity("X", X)`, mirroring `registerKind`) into a
    cycle-free leaf (`entityRegistry.ts`) that value-imports none of them. `registry.ts`
    is an eager-load barrel that pulls in every class module and re-exports the
    surface; most internal code imports `entity` from it. The handful of base classes
    whose own subclasses are registered import the leaf directly (the barrel would
    evaluate `class Sub extends Base` mid-load) and add bare side-effect imports of
    their construction targets.

    An ESLint `no-restricted-syntax` rule bans a bare `new` of any registered entity
    class so the discipline holds; the member-expression forms `new entity.X` /
    `new sohl.entity.X` pass. The mechanisms are documented under **Entity class
    registry** in `docs/reference/runtime-contracts.md`.

    Closes #83 — the final task of epic #80.

- cdade28: **feat(combat): add assisted dodge — make skill ML cells rollable on the Skills tab (#187)**

    The skills tab now has a clickable mastery-level value for every skill (displayed in the `ML` column). Clicking the ML rolls a success test via `SkillLogic.successTest`, matching the roll pattern of the combat tab's attack/block/counterstrike cells. Hold Shift to skip the dialog.

    **Changes:**
    - `BeingSheet` — adds a `rollSkillTest` action handler (`_onRollSkillTest`) that reads the skill item from the clicked row's `data-item-id`, then calls `skillLogic.successTest(context)`.
    - `templates/actor/being/skills.hbs` — the ML cell gains `class="rollable"` and `data-action="rollSkillTest"`.

    _The Dodge skill is the primary consumer (it is the only defensive skill offered in the automated-combat flow), but all skills in the tab are now directly rollable._

- 64d0d60: **feat(chat): implement chat-card edit-action dispatch (#66)**

    Clicking the edit icon on a posted chat card (standard-test, opposed-result) now re-runs the named action on the owning document instead of silently doing nothing.

    **Changes:**
    - `chat-card-dispatch.ts` — adds `dispatchChatCardAction(logic, btn)`: reads `dataset.action`, builds an `SohlActionContext`, looks up the action in `logic.actions` (by name, executor id, or title), falls back to a direct method call, and warns via `sohl.log.warn` when nothing matches. The two dead no-op exports (`onChatCardButton`/`onChatCardEditAction`) are removed.
    - `SohlItem.onChatCardEditAction` — replaces the `TODO(#66)` stub: ownership-gated (`this.isOwner`), then delegates to `dispatchChatCardAction(this.logic, btn)`.
    - `BeingLogic.onChatCardEditAction` — same pattern: ownership-gated (`this.actor?.isOwner`), then delegates to `dispatchChatCardAction(this, btn)`.

    _Ownership check applies per #167's guidance (edit path only; the button path is tracked separately under #167)._

- 665ec2e: **Combat Technique skill subtype: model + mastery-level wiring**

    Foundation for modeling combat techniques as skills (#322/#323). Adds a
    `combattechnique` skill subtype and lets a skill carry an **optional embedded
    strike mode**, so a trained fighting maneuver (unarmed strike, grapple, etc.) is
    a normal, improvable skill whose strike mode's Attack / Block / Counterstrike are
    driven by that skill's mastery level.
    - New `SKILL_SUBTYPE.combattechnique` (+ localized label).
    - `SkillDataModel` gains an optional, nullable `strikeMode` (the discriminated
      melee/missile shape, mirroring `CombatTechniqueDataModel`); `null` for every
      other skill subtype.
    - `SkillLogic` builds the strike-mode instance for the subtype, adds the
      wielder's lineage reach (melee), and folds the **governing** mastery level into
      the strike mode's Atk/Blk/CX — the skill's **own** mastery level by default, or
      an override skill named by the strike mode's `assocSkillCode` — with the full
      base→skill-modifiers→technique-modifiers derivation preserved (via the
      completed `ValueModifier.addVM`). A disabled governing mastery level disables
      the derived rolls.

    This is the model/logic layer only; the skill-sheet strike-mode editor (#324),
    create flow (#325), Combat-tab integration and item-type retirement (#326) build
    on it. Existing skills are unaffected (their `strikeMode` defaults to `null`).

- 582a1c8: **Feature: custom item creation from the Being sheet via a `createDialog` flow**

    Reimplements the prototype's item-create mechanism for the current TS / Foundry
    v14 code. Clicking an item-create control now opens a dialog that collects a
    name, type, and (when the chosen type has one) subtype, then creates the item
    and opens its sheet.

    **What's new**
    - `SohlItem.createDialog` — a v14-compatible override that computes the allowed
      types (excluding the base type, honoring an optional `types` restriction),
      decides whether to ask for the type and subtype (a valid pre-seeded
      `data.type` / `data.system.subType` locks and hides that field), and renders
      the shared create dialog through the `dialog()` boundary. A `render` hook
      repopulates the subtype `<select>` from the newly-chosen type's DataModel
      `subType` choices whenever the type changes.
    - `SohlActor.createDialog` — the same flow for world actors (parent always
      `null`); it shares the implementation, so any future actor subtype is picked
      up automatically.
    - `BeingSheet` gains a `createItem` ApplicationV2 action reading `data-type` and
      `data-sub-type` off the clicked control. The gear-tab "Add Gear" anchor is
      wired to it (`data-action="createItem"`) to prove the flow end-to-end; other
      tabs' anchors are wired separately.
    - `create-item.hbs` is now progressive-ready: the subtype form-group has a
      stable wrapper the render hook repopulates and is hidden when the type has no
      subtypes; the type group hides when the type is pre-seeded/locked.

    Subtype choices are read at the boundary from
    `CONFIG.Item.dataModels[type].schema` (the `subType` field's value-keyed
    `choices` map) and mapped to localized options by the new pure
    `subTypeOptionsFromChoices` helper.

- 56fd1df: **feat(combat): gate armor aggregation and combat-tab weapons on equip/hold state (#180)**

    The combat tab now only shows weapons the character is actively holding (gripped by a body part), and armor protection is only aggregated onto body locations for armor that is currently equipped. Previously both operations ignored equip/hold state entirely, so an unequipped suit of plate armor would still protect the wearer and an unheld weapon would appear in the strike-mode list.

    **Changes:**
    - `BeingLogic.aggregateArmorProtection` — filters to `isEquipped` armor before building the layer list; unequipped armor no longer contributes to `bodyLocation.armorProtection`.
    - `being-sheet-view.ts` — adds the pure `filterHeldWeapons` helper (testable without Foundry).
    - `BeingSheet._prepareBeingContext` — applies `filterHeldWeapons` before `splitWeaponsByRange`; only held weapons reach the melee/missile display lists.

    _This is a consistency fix: `reach` and `availableStrikeModes` already required the weapon to be held; armor aggregation and the combat-tab weapon rows now follow the same rule._

- d5dd877: **Feat #179:** Add `setEquipped`, `setNotEquipped`, `holdItem`, and `releaseItem` intrinsic actions to `GearLogic`.

    Previously there was no write path to `system.isEquipped` or to `bodyPart.heldItemId` — the fields existed and were read by derived logic, but nothing in the system ever wrote them. This left equip state and weapon-hold state permanently inert.

    `setEquipped` / `setNotEquipped` mirror the existing `setCarried` / `setNotCarried` pattern and write `system.isEquipped` on the gear item. `holdItem` finds the first free hold-capable body part(s) on the owning actor's lineage and writes `heldItemId`; `releaseItem` clears `heldItemId` on every part gripping this item. The minimum grip count is controlled by the protected `minPartsToHold` getter (default 1), which weapon subclasses can override. All four actions are registered in `defineIntrinsicActions` and have `lang/en.json` titles.

- d7a7a4c: **Being Profile — Affiliations section**

    The Profile tab's Affiliations section now renders as a full sectioned list — **Rank / Society / Office / Title / Notes** columns — with a per-row context-menu kebab and a **+ Add** control that creates a new affiliation via the create dialog. The section is always shown (even with no affiliations) so the first one can be added directly from the sheet, and rich-text notes are reduced to a plain-text snippet so they read cleanly in the table. Row shaping lives in a pure, Foundry-free `buildAffiliationRows` helper.

- a5a0494: **Being Profile tab: Attributes section**

    The Being sheet's Profile tab now renders the character's attributes as a grid of
    score boxes. Each box shows the attribute's effective **score**, its descriptor
    band label, and its **TL** (target mastery level), plus a per-item context-menu
    kebab. The section header carries a **+ Add** control that creates a new
    attribute on the being.

    The descriptor is resolved from the attribute's `valueDesc` bands: the label of
    the first band (in ascending `maxValue` order) whose `maxValue` is at least the
    score, falling back to the highest band when the score exceeds all bands, or an
    empty string when no bands are defined. This shaping lives in a Foundry-free
    helper (`attributeDescriptor`) and is unit-tested.

- 7d8e964: **Being Profile — Traits section**

    The Profile tab now renders a character's traits grouped by subtype. Each group shows a legend with the localized subtype label and a per-section **+ Add** control that creates a new trait pre-seeded with that subtype. Traits render in **Intensity / Value / Notes** columns (intensity shown as its localized label; value as the numeric mastery level for numeric traits or the free-text value otherwise), each with a context-menu kebab. Groups are ordered by the trait-subtype definition order, and every defined subtype is always shown — even with no traits — so its **+ Add** control is always available.

- 809a552: **Skill sheet: strike-mode editor for combat-technique skills**

    The Skill item sheet now shows a strike-mode editor — Strike Mode (name, min
    parts, length, and an optional governing-skill override), Attack (spread,
    modifier), Impact (dice/die/modifier), and, for melee, Defense (block,
    counterstrike) — but **only** when the skill's subtype is `combattechnique`. It
    is hidden for every other skill subtype. Leaving the governing-skill override
    blank drives the technique's Attack/Block/Counterstrike from the skill's own
    mastery level; setting it to another skill's code borrows that skill's mastery
    level instead.

- 7cd74aa: **Reimplement the Being sheet Skills tab**

    The Being sheet's Skills tab now renders skills grouped by subtype, matching the
    Traits and Affiliations sections.
    - **Grouped sections.** Skills are grouped into the six display subtypes
      (Social, Nature, Craft, Lore, Language, Script), each shown as its own
      fieldset with a localized legend. Every defined subtype is always emitted —
      even when empty — so its seeded **"+ Add"** control stays reachable. Any
      additional subtype present on a skill but outside the display order is
      appended after the ordered ones, so nothing is dropped.
    - **Columns.** Each row shows **SB / ML / Index / EML / Fate**. When a skill's
      mastery level is disabled, the Index and EML cells render an ✕ in place of the
      number. The ML cell remains rollable (shift-click skips the dialog).
    - **Skill-development star.** Skills eligible for improvement show a star in the
      row controls that toggles the skill's `improveFlag` — a filled star when set,
      an outline star when not.

    The pure grouping logic lives in a new Foundry-free `buildSkillGroups` helper,
    unit-tested alongside `buildTraitGroups`.

- e84ddda: **Sanitize chat/dialog HTML with Foundry's allowlist sanitizer**

    Fixes [#161](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/161):
    `toSanitizedHTML` — the single sanitizer for all chat-card and dialog content —
    was a tag/attribute **denylist**, which is bypassable via whitespace/entity-obfuscated
    `javascript:` URLs, `<base>`, SVG `xlink:href`, and mutation-XSS on the
    sanitize→serialize→reparse round-trip. It now delegates to Foundry's built-in
    **allowlist** sanitizer `foundry.utils.cleanHTML` (the same one Foundry applies to
    dialog and journal HTML), which keeps only allowlisted tags/attributes and validates
    URL schemes via `URL.parse`.
    - New `fvttCleanHTML` shim in `FoundryHelpers` wraps `foundry.utils.cleanHTML`
      (a real v14 client API that is currently absent from `fvtt-types`).
    - `toSanitizedHTML` moves from `helpers.ts` into the Foundry-coupled
      `FoundryHelpers` (where its only callers already live), since sanitization is a
      DOM/browser operation. **It is therefore no longer exposed on `sohl.utils.*`** —
      it was never intended as public API.
    - Chat-card dispatch is unaffected: `data-*` attributes are on Foundry's global
      attribute allowlist, so button routing (`data-action`/`data-scope`/`data-handler-uuid`)
      is preserved.
    - `data:` URLs and inline `style` remain permitted, matching Foundry's system-wide
      stance rather than being additionally blocked.
    - Neutralization is verified by a Cypress e2e spec against the live browser
      sanitizer (`cypress/e2e/html-sanitization.cy.js`).

- baf8b3b: **Foundry-free combat strike-mode collection and chat addressing**

    The combat helpers and the Being combat-resume flow no longer reach the Foundry
    actor for items or chat-target identity.
    - `collectBlockableStrikeModes`, `collectAttackableStrikeModes`,
      `hasMeleeAttackStrikeMode`, and `resolveSkillMasteryLevel` now take the actor
      **logic** and iterate `logicTypes` / `getItemLogic` rather than `itemTypes`.
    - Combat chat cards address the defender via the logic's own `name` and (opaque)
      `uuid`, and the opponent via an opaque `attackerAddress` (name + uuid) carried
      on the counterstrike context and resolved in the scene layer. Emission still
      goes through `SohlSpeaker#toChat`.

- baf8b3b: **Foundry-free combatant logic (`CombatantLogic`)**

    The Combatant now has a logic layer on the same footing as actors and items,
    consolidating combat logic that was previously split across the document,
    `combatant-logic.ts`, and the combat-action helpers.
    - `SohlCombatantDataModel` extends `SohlDataModel` (gaining the `SohlLogicData`
      port); a new `CombatantLogic` is registered and resolved by
      `SohlDataModel.create`, so `combatant.logic` returns a `CombatantLogic`.
    - `CombatantLogic` owns the combatant's combat-scoped state (last attack/block
      mode, `didAction`, move factor), capability (`reach`, `computedMove` via
      `this.actorLogic`), relational queries (`groupId`, `allies`, `isEnemyOf`,
      `threatenedBy` over sibling combatant logics), and spatial queries
      (`reaches`, `spacesMovedThisTurn`). `SohlCombatant` delegates to it.
    - The token-center geometry moves to `FoundryHelpers`
      (`combatantGridDistance` / `combatantSpacesMoved`) — the one scene-coupled
      edge — and **`sohl.currentCombatCombatantLogics`** exposes the
      `CombatantLogic` of every combatant in the active combat.

- baf8b3b: **Foundry-free logic-layer data port**

    The logic layer now reaches its owning document through the `SohlLogicData`
    data interface (a port implemented by the Foundry data model) instead of the
    Foundry document directly, so logic classes can be unit tested without Foundry.
    - `SohlLogicData` exposes `id`, `name`, `type`, `uuid`, `isOwner`, `kind`,
      `shortcode`, `actorLogic`, `getFlag`, `setFlag`, and `update`; the actor data
      adds `itemLogics` and `hasPlayerOwner`. `SohlDataModel` implements them by
      delegating to its parent document.
    - `SohlLogic` identity getters now read `this.data.*`, and a new `actorLogic`
      getter navigates from any logic to its owning actor's logic.
    - **`uuid` is an opaque identity token** — never resolved to a Foundry document
      inside the logic layer. New `fvttLogicFromUuid` / `fvttLogicFromUuidSync` helpers (in
      `FoundryHelpers`) resolve a uuid back to a `SohlLogic`, keeping the document
      deref inside the shim.

- c4312a1: **Consistent null / undefined convention: null at the edges, undefined in the core**

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
    - Made the `MysteryDataModel` fields whose documented `null` semantics were
      unreachable actually nullable (`initial: null`): `charges.max` (`0` = no
      maximum, `null` = does not use charges), `charges.value` (`null` = infinite
      charges), and `levelBase` (`null` = no defined level). `MysteryLogic` already
      branched on `!== null`; its `charges.value` is normalized `?? undefined` before
      seeding the `ValueModifier`, which rejects `null`.

- baf8b3b: **Register the `attribute` and `lineage` item kinds**

    The `attribute` and `lineage` item kinds shipped with data-model, logic, and
    sheet classes but were never registered, so items of those kinds did not
    function.
    - Register both kinds in the item data-model, logic, and sheet registries so
      they load and behave like every other item kind.
    - Fix `AttributeSheet`, which was a copy-paste of `TraitSheet` — it exported a
      class literally named `TraitSheet` and rendered trait fields. It now renders
      the attribute's own fields (`scoreBase`, `initDiceFormula`, value descriptors,
      and impairing body roles) via a new `attribute-properties.hbs` template, with
      the array fields shown read-only.

- 4264da4: **Let variant modules override per-kind Logic classes**

    Exposes the base actor/item Logic classes at runtime and adds registration so a
    variant module can subclass and swap them:
    - `sohl.actorLogicClasses` / `sohl.itemLogicClasses` — kind → base Logic class,
      for subclassing.
    - `sohl.registerActorLogic(kind, cls)` / `sohl.registerItemLogic(kind, cls)` —
      override the class used to build every document of that kind.

    The resolution path (`SohlDataModel.create`) already reads these maps, so no
    construction sites change — a document prepared after registration uses the
    registered class. Register during a module's `init`/`setup` hook, before the
    first `.logic` for that kind is built.

    Part of #80. Closes #82.

- 21446c8: **Remove the `__func__:` code reviver — untrusted data can no longer become executable (#170)**

    `defaultFromJSON` no longer reconstructs functions from serialized strings.
    The `__func__:` revive branch and the `serializeFn`/`deserializeFn` helpers
    (which compiled `new Function` from a string with no screening) are removed.
    This closes the cross-client remote-code-execution path where a crafted chat
    card `data-scope` — or persisted document data — could carry a `__func__:`
    payload that was revived into a live function and later invoked. Part of the
    "reference code, don't compile it" remediation (epic #154); functions are never
    revived from serialized data.
    - `defaultFromJSON`: the `__func__:` branch is gone. Such a string (which no
      current writer emits) is returned verbatim as an inert string; there is no
      `new Function` path.
    - `buildActionScope` rejects any chat-card scope payload containing a
      `__func__:` marker outright (defense-in-depth on the untrusted path).
    - `SuccessTestResult` accepts a `targetValueFunc` only when it is an actual
      function; any other value falls back to identity, so revived data cannot
      become callable.
    - **Removed exports:** `serializeFn` and `deserializeFn` (no consumers).

- eadc8b2: **Restore the Being sheet header: clickable status pills, health bar, body-location lozenges**

    Rebuild the Being sheet header to match the previous design, in `templates/actor/being/header.hbs`, `scss/layout/_sheet.scss`, and `src/document/actor/foundry/BeingSheet.ts`:
    - **Status pills** now look like the old rounded lozenges (grouped top-right, wrapping) and are **clickable to toggle** the status — a new `toggleStatus` action calls `actor.toggleStatusEffect(statusId)`, creating/deleting the active effect. Active pills are highlighted.
    - **Health bar** restored: a "HEALTH: x%" label over a filled bar, driven by `health.effective` (added `healthPct` to the header context).
    - **Body-location lozenges** restored as a read-only, full-width row beneath the main header, generated dynamically from the actor's Lineage body structure (`bodyStructure.parts`).

    Status `data-status-id`/tooltips and localization keys are unchanged.

- 4e189a2: **Retire the `combattechnique` item type**

    Combat techniques are now a `combattechnique` **skill subtype** (introduced in earlier work), so the standalone `combattechnique` item type is removed: its DataModel, Sheet, and Logic classes, its registration, its item-type enum entry and metadata, and its localization keys are all gone.

    **Combat machinery re-sourced from skills.** Reach, available/blockable/in-range strike modes, the melee-attack gating, and strike-mode pointer resolution now read technique strike modes off `combattechnique`-subtype skills (`SkillLogic.strikeMode` / `strikeModes`) instead of the retired item type.

    **Combat-tab section removed.** The Being sheet's Combat tab no longer renders a dedicated Techniques section. Technique strike modes will resurface through the aggregated Strike Modes view (tracked separately); until then, techniques are edited on the skill sheet.

- eeb286d: **SafeExpression is now a serializable entity with a shared helper registry**

    `SafeExpression` moved from `src/utils/` to the Foundry-free domain layer at
    `src/entity/expr/`, and its helper library is now a single global registry
    rather than a copy carried by every instance.
    - **`SafeExpression extends SohlEntity`.** It is constructed as
      `new SafeExpression({ source }, { parent })` and serializes through the curated
      `toJSON` path, persisting only its `source` string; the parsed AST is rebuilt
      on reconstruction and never stored. Every construction site now threads the
      owning document/entity logic as the parent.
    - **Global helper registry.** The built-in helpers (`has`, `len`, `matches`,
      `min`, `floor`, `defined`, …) live in the process-wide `expressionHelpers`
      registry and are always available; `SafeExpression` no longer takes a helper
      argument. The registry also accepts helpers installed at runtime, including
      ones compiled from a source body via `textToFunction` — the groundwork for
      world-authored custom helpers.
    - **Module split.** `SafeExpressionError` and the helper registry are separate
      modules from `SafeExpression` to keep the layer import-cycle-free.
    - **World-authored custom helpers.** A new **Expression Helper Library** settings
      menu (GM-only) lets a world import a JSON file mapping helper names to
      `{ args?: string[], body: string }` entries. The bodies are compiled with the
      existing sandboxed `textToFunction` and installed into the registry alongside
      the built-ins; the library persists in a world setting and reloads on world
      start. Invalid entries are skipped and reported rather than blocking the rest.

    No behavior change to the expression language itself; existing predicates
    (action `trigger`/`visible`, Active Effect `test`, context-menu string
    conditions) evaluate exactly as before.

- 4455e04: **Script Actions run a Foundry Macro instead of compiled code (#156)**

    A Script action's `executor` is now the **UUID of a Foundry `Macro`**, run via
    `Macro#execute`, rather than a JavaScript body compiled by `textToFunction`.
    This removes the last place the system compiled code from document data (the
    SEC-1 executor surface) and gives GM "homebrew" a first-class, permission-gated
    home: `Macro#execute` enforces the `MACRO_SCRIPT` permission and ownership, and
    no code is ever compiled from serialized data. See the
    [Security Model](../docs/concepts/security-model.md).
    - New `fvttExecuteMacro` shim resolves a Macro UUID and runs it with the action
      scope (`{ actor, item, speaker, scope }`). Intrinsic actions are unchanged
      (a bound method-name lookup on the target logic).
    - The action `executor` field is now a `StringField` (a reference), not a
      `JavaScriptField` — no executable source is stored on a document.
    - **Removed `SohlAction.executeSync`** and the now-dead `isAsync` action field:
      a Script action runs a macro and is therefore always asynchronous, so a
      synchronous execution path is impossible and was a trap. A GM who needs a
      synchronous computed value uses a `SafeExpression` field instead.

- 70a1b16: **Skill base is a computed value; birthsigns are mysteries**

    The skill base is now a plain number produced by a Foundry-free
    `calcSkillBase(skillBaseFormula, actorLogic)` function, replacing the
    `SkillBase` entity object. `SkillLogic.skillBase` is now a `number`.
    - **Birthsigns are Mystery items of subtype `buff`.** Birthsign bonuses in a
      skill-base formula are matched by the mystery's shortcode, instead of a
      trait's hyphen-split `textValue`. A `subType` field was added to the Mystery
      data model — `buff` marks a birthsign — completing the field the mystery
      sheet already read. The field has a default, so no world migration is needed.
    - **Formula evaluation follows the documented rules.** `@code` (optionally
      `@code:multiplier`) averages the actor's attribute scores by shortcode; the
      two-attribute up/down rounding rule, the single largest matching birthsign
      bonus, flat numeric modifiers, and the clamp to ≥ 0 all apply. This also
      fixes latent parser bugs in the old `SkillBase` (mis-detected birthsign
      terms and double-counted numeric modifiers).
    - `SkillLogic.valid` and the Aura-based _no-fate_ rule now derive from the
      formula's attribute references, so they no longer depend on a `SkillBase`
      instance.
    - The `SkillBase` entity class (`src/entity/skillbase/SkillBase.ts`) and its
      direct unit test are removed; `calcSkillBase` is covered by a new
      value-focused test that adds the previously-missing birthsign-bonus cases.

- baf8b3b: **SkillBase computed entirely in the logic layer**

    `SkillBase` now takes the actor's `AttributeLogic` instances and a `TraitLogic`
    birthsign instead of Foundry items, so skill-base resolution no longer touches
    the Foundry layer.
    - The constructor option changes from `{ items }` to
      `{ attributes?: AttributeLogic[]; birthsign?: TraitLogic }`.
    - Attribute references are matched by `data.shortcode` and scored from
      `score.effective`; the birthsign tokens are read from the trait's
      `data.textValue`. Callers pass `actorLogic.logicTypes[ATTRIBUTE]`.

- f97a3ec: **Expose constructable entity classes via `sohl.entity`**

    Adds a flat, getter-backed `sohl.entity.<ClassName>` registry so macros and
    extension modules have a named entry point to `new` or subclass SoHL's
    constructable entity classes — modifiers (`ValueModifier`, `ValueDelta`,
    `CombatModifier`, `ImpactModifier`, `MasteryLevelModifier`), results
    (`TestResult`, `SuccessTestResult`, `OpposedTestResult`, `ImpactResult`,
    `AttackResult`, `DefendResult`, `CombatResult`), strike modes (`StrikeModeBase`,
    `MeleeStrikeMode`, `MissileStrikeMode`), `SohlAction`, and body modeling
    (`BodyStructure`, `BodyPart`, `BodyLocation`).

    Each entry is a getter over a backing record, so a future `sohl.entity.register()`
    override (planned) is picked up automatically at every access — `new
sohl.entity.ValueModifier(...)` and `class X extends sohl.entity.SuccessTestResult
{}` both work today.

    Also repairs the stale `types/sohl-public-api.d.ts` (its re-exports pointed at the
    deleted `src/common/*` tree and it documented a non-existent `sohl.classes`) and
    adds a macro/module **API Access Map** how-to.

    Part of #80. Closes #81.

- 70a1b16: **Strike-mode availability gated by held limbs and pull**

    A being's available weapon strike modes now depend on how the weapon is
    physically held and, for missiles, on the being's pull — an inline model on
    `BeingLogic.availableStrikeModes` that replaces the former
    `computeAvailableStrikeModes` helper.
    - A weapon's strike mode is available only when the weapon is held in at least
      the mode's `minParts` body parts. Gear reports its holders through the new
      `GearLogic.heldBy` (the `BodyPart`s currently gripping the item). Combat
      technique strike modes are intrinsic and always available.
    - A new Being **`pull`** score (a `ValueModifier`) gates missile modes: a missile
      mode is available only when its `draw` is at most the being's pull.
    - The result reads already-prepared strike-mode data, so it must be evaluated
      after item preparation — see the actor-first data-preparation change.

- baf8b3b: **Typed item-logic registry and actor-logic accessors**

    Add a kind-indexed item-logic registry and typed lookup so callers get the
    concrete logic type for an item kind without casting.
    - **`getItemLogic(shortcode, kind)`** on the actor logic returns the concrete
      logic for that kind — e.g. `getItemLogic("stealth", ITEM_KIND.SKILL)` is typed
      `SkillLogic | undefined`. It matches on **both** `shortcode` and kind, so a
      shortcode shared across kinds cannot return an unexpected item.
    - **`allLogics`** and **`logicTypes`** on the actor logic — the logic-layer
      analogues of `Actor#items` and `Actor#itemTypes`, with each group typed to its
      kind (`logicTypes.skill` is `SkillLogic[]`).
    - **`sohl.actorLogics`** and **`sohl.itemLogics`** expose every world actor's and
      item's logic instance directly, instead of going through `game.actors` /
      `game.items` and reading each `.logic`.
    - A precise `ITEM_LOGIC_DEF` registry with a compile-time completeness guard
      drives the `ItemLogicByKind` type map; registering a new item kind without a
      logic class is now a type error.

### Patch Changes

- 313be82: **Fix: declare the `sohleffectdata` ActiveEffect subtype so effects get their data model**

    `system.json` `documentTypes` declared an `activeeffectdata` ActiveEffect subtype
    that no data model was registered for, while the add-effect action and
    `CONFIG.ActiveEffect` use `sohleffectdata`. Creating a SoHL effect
    (`type: "sohleffectdata"`) was therefore rejected as an invalid type, and effects
    never received `SohlActiveEffectDataModel` — their `system.scope` / `system.changes`
    were absent.

    Declare `sohleffectdata` in `documentTypes` (a one-line rename) so the type is
    valid and effects get their data model.

    Fixes #145

- ac98233: **Fix: complete the ApplicationV2 item-sheet migration (render + persist edits)**

    Item sheets now render, and all sheets persist field edits on change with no
    button press. Previously every item sheet failed to render
    (`Template part "tabs" must render a single HTML element`) and no sheet saved
    field edits.
    - Add `form.submitOnChange` to the base sheet mixin so `DocumentSheetV2` persists
      a field edit as soon as it changes — fixes both actor and item sheets.
    - Migrate `SohlItemSheetBase.TABS` from the legacy v1 shape
      (`navSelector`/`contentSelector`) to the v13 `ApplicationTabsConfiguration`, and
      render the tab navigation from the core `tab-navigation.hbs` part (mirroring the
      being sheet).
    - Fix the item content-section templates: correct `data-tab`/`data-group`/active
      wiring and replace a non-existent `length` Handlebars helper with property
      access.

    Resolves the render and edit-persistence failures tracked in #141. A few item
    kinds remain (their whole-form submit is rejected when a required `subType` is
    unsatisfied; `combattechnique` has no properties template) and stay tracked under
    #141.

- b3bf436: **Add `no-floating-promises` and `await-thenable` ESLint rules**

    Two new type-aware rules catch real async correctness bugs:
    - **`@typescript-eslint/no-floating-promises`** — every Promise must be `await`ed, returned, or explicitly marked `void`. Catches fire-and-forget Promise chains that silently swallow rejections.
    - **`@typescript-eslint/await-thenable`** — flags `await` applied to a non-Promise value, which is always a logic bug.

    **Fixes found by the new rules:**
    - `SohlDataModel` and `BeingSheet` — `super._onRender()` was called without `await` in an `async _onRender` override, meaning drag-drop rebinding and filter rebinding ran before the parent render completed.
    - `SohlLogger` — `await new SourceMapConsumer(rawMap)` awaited a non-thenable constructor; `await` removed.
    - All `this.render()` calls in UI event handlers and `action.execute()` / `doc.update()` calls in sync callbacks are explicitly marked `void` to signal intentional fire-and-forget.

- 8e5ae4d: **Fix: register the Combatant data model under `base` so combat works**

    Combatants could not receive `SohlCombatantDataModel`: it was registered under a
    `sohlcombatantdata` subtype that `system.json` `documentTypes` never declared, so
    every combatant fell back to the typeless `base` model with no `system.logic`.
    Group seeding then crashed on the first combatant added
    (`Cannot read properties of undefined (reading 'groupId')`), making combat
    non-functional end to end.

    Register the single combatant data model under the always-valid `base` type (as
    Scene already does). The data model's static `kind` is unchanged, so the
    `COMBATANT_LOGIC` lookup still resolves `SohlCombatantLogic`. Combatants now carry
    their logic, group seeding runs, and turns/rounds advance.

    Fixes #142.

- 3c84655: **Fix: combattechnique item sheet renders and edits its strike mode**

    The combattechnique sheet referenced a strike-mode properties template that did
    not exist (`combattechniquestrikemode-properties.hbs`), so opening any
    combattechnique item threw `Failed to load template … ENOENT` and the sheet could
    not render.
    - Add the strike-mode properties template. `strikeMode` is a melee/missile
      discriminated `TypedSchemaField` stored flat as `{ type, ...fields }`, so its
      sub-fields are edited at explicit `system.strikeMode.<field>` paths (with a
      hidden `type` input so the discriminated update stays valid on submit), with
      melee/missile-specific fields rendered conditionally.
    - Fix `CombatTechniqueSheet._preparePropertiesContext`, which referenced
      non-existent top-level fields, to expose the resolved strike-mode value/type.

    Fixes #147

- 906f729: Fix logic-level dialogs on Foundry v14 and consolidate the dialog helpers into one primitive.

    On Foundry v14, `DialogV2.input` only invokes a callback supplied under
    `ok.callback`, so the callback the old `inputDialog` passed at the top level was
    silently ignored — every form dialog (Add Injury, attack/defense, success test,
    the DataModel array/key-value editors) resolved to raw, untransformed field data
    instead of the caller's result.

    The four near-duplicate helpers (`inputDialog`, `okDialog`, `yesNoDialog`,
    `awaitDialog`) are replaced by a single logic-level `dialog()` primitive. It owns
    all Foundry/DOM work — template rendering, `FormDataExtended`, and `DialogV2` — at
    the boundary and hands callers a pure `callback(formData, action)` that receives a
    plain object, plus an optional `render(element)` hook for dynamic form behaviour
    (e.g. dependent dropdowns). Logic-layer callers no longer reference
    `FormDataExtended`, `querySelector`, or `DialogV2` at all. (#282)

- 0dfbfb2: **Document the target CSS/SCSS architecture and conventions (styleguide)**

    Adds `docs/concepts/css-architecture.md` — the decision record that grounds the
    CSS/SCSS refactor epic (#95). It ratifies, with rationale and examples drawn from the
    current `scss/` tree, the choices the rest of the epic builds on:
    - **Tool:** stay on SCSS (Dart Sass); modernize _usage_ rather than switching to
      Tailwind or CSS-in-JS.
    - **Folders:** ITCSS-inspired `abstracts/ · base/ · layout/ · components/ · apps/ ·
utilities/`, with a migration map from today's `utils/ · global/ · components/`.
    - **Naming:** BEM (`block__element--modifier`) under the `.sohl` namespace; `data-*`
      hooks and `lang/en.json` keys stay stable.
    - **Tokens:** `--sohl-*` custom properties generated from SCSS maps, kept distinct
      from the Foundry `--color-*` overrides.
    - **Cascade:** a documented `@layer` order.
    - **Scoping:** the #87 rule written down — compound `.sohl.sheet` (never descendant),
      `:where()` for low specificity.
    - **Module loading:** `@use`/`@forward` canonical, `meta.load-css` reserved for
      scoped output.

    Documentation only — no `.scss`/`.css` changes. Linked from `docs/README.md`,
    `docs/concepts/concepts.md`, and the `CLAUDE.md` quick reference.

- 4075201: **Finish the BEM pass: effects component, dead-CSS deletion (part 3 of #94)**

    Completes the naming capstone of the CSS refactor (epic #95).
    - **Effects component** → BEM `effects` block: `effects-list → effects__list`,
      `effects-header → effects__header`, `effect-list → effects__items`,
      `effect → effects__row`, `effect-controls → effects__controls`,
      `effect-control → effects__control`, renamed in lockstep across the effect templates
      and `scss/components/_effects.scss`. The `.effects-list` `SearchFilter`
      `contentSelector` in `BeingSheet.ts` is updated to match. Event hooks
      (`effect-toggle`, `effect-create`, `effect-contextmenu`) and generic columns are kept.
    - **Dead CSS removed:** the entire `scss/components/_bodyloc.scss` (every rule was
      mis-scoped under `.bodylocations .zone-list` ancestors that the body-structure template
      never renders, so none of it matched), plus the unused `.nocarry` / `.overmaxcap` /
      `.overencumberedcap` state rules.

    **Intentionally kept** (documented in the styleguide): generic leaf columns (`.name`,
    `.detail`, `.type`, …) scoped under their block, and the standard state classes
    `.active` / `.disabled` / `.danger` — `.active`/`.disabled` are Foundry/template
    conventions and renaming them would break tab/disabled behavior.

    Note: the effects search filter was already non-functional before this change —
    `_displayFilteredResults` queries `.item`, but effect rows are `.effects__row` (were
    `.effect`). That pre-existing bug is left as-is (separate fix); the rename keeps the
    filter wiring internally consistent.

- c5ffc5f: **Apply BEM naming to the header and facade components (part 1 of the naming pass)**

    First slice of the BEM renaming capstone, scoped to the two component families whose CSS
    classes are **not** referenced from `src/` (no JS selectors) and whose state is
    template-driven — so the rename is a pure SCSS + template change with no behavioral risk:
    - **Header block** (`scss/layout/_sheet.scss` + the 8 `*/header.hbs` templates):
      `header-details → sheet-header__details`, `actor-img → sheet-header__portrait`,
      `status-effects → sheet-header__statuses`, `toggle-status-effect → sheet-header__status`.
    - **Facade** (`scss/components/_facade.scss` + `facade.hbs`):
      `facade-image → facade__image`, `facade-description → facade__description`.

    SCSS and templates are renamed in lockstep (verified: zero remaining references to the old
    names anywhere in `scss/`, `templates/`, or `src/`). `data-*` attributes, `data-action` /
    `data-tab` values, localization keys, the generic `.active` state class, and Foundry-owned
    classes (`flexrow`, …) are left unchanged. The `.sohl` / `.sohl.sheet` wrappers are kept,
    so specificity is unchanged.

    The styleguide (`docs/concepts/css-architecture.md` §3) is updated to nail down the
    convention: BEM block names are namespaced by the `.sohl` wrapper (no redundant `sohl-`
    prefix), and Foundry/JS-owned classes and `data-*`/`lang` keys are explicitly off-limits.

    Remaining BEM clusters (the list classes, which are entangled with the `SearchFilter`
    `contentSelector`s in `BeingSheet.ts`, and the state-modifier normalization) follow in
    later per-component slices so each stays reviewable and visually verifiable.

- 326b802: **Apply BEM to the shared list scaffolding (part 2 of the naming pass)**

    Unify the ad-hoc `item-*` / `items-*` scaffolding classes — used ~250× across every
    list-bearing sheet — into a single `list` BEM block, renamed in lockstep across the
    templates and `scss/components/_items.scss`:

    | Old                                    | New                                       |
    | -------------------------------------- | ----------------------------------------- |
    | `items`                                | `list-section`                            |
    | `items-list`                           | `list`                                    |
    | `item-list`                            | `list__items`                             |
    | `items-header`                         | `list__header`                            |
    | `item-name`                            | `list__name`                              |
    | `item-detail`                          | `list__detail`                            |
    | `item-controls` / `item-controls-wide` | `list__controls` / `list__controls--wide` |
    | `item-control`                         | `list__control`                           |
    | `item-image`                           | `list__image`                             |

    **Deliberately kept** (JS-coupled — renaming them would silently break behavior):
    `.item` (the row class queried by `_displayFilteredResults` for every search filter),
    `.item-contextmenu` and `.default-action` (event hooks), and the eight `SearchFilter`
    `contentSelector` classes. Generic single-word leaf columns (`.name`, `.detail`,
    `.type`, …) are left scoped under their block, and Foundry-owned classes (`flexrow`, …)
    are untouched. `data-*` / `data-action` values and `lang/` keys are unchanged.

    Template class lists were rewritten only inside `class="…"` attributes, so handlebars
    expressions and `data-*` are unaffected; verified zero orphaned old tokens remain in
    `scss/` or `templates/`. The rename is consistent (wrapper + children moved together), so
    ancestor-scoped styling is preserved.

    Remaining for a follow-up: the effect/body-location component-specific classes (the
    effect list's `contentSelector` needs a paired `src/` edit, and much of the
    body-location SCSS is dead and better deleted than renamed) and the state-modifier
    normalization (`active`/`disabled` are JS/Foundry-toggled and need per-site care).

- e59b66b: **Reorganize SCSS into the target folder architecture**

    Move every partial into the agreed `abstracts/ base/ layout/ components/ utilities/`
    layout and split the mixed-concern "dumping ground" files, so each partial holds a single
    concern. Pure regrouping — the compiled CSS rule set is **identical** to before (verified:
    the set of selectors and the set of declarations both diff clean against the previous
    build); only rule ordering and `@layer` wrapping change.
    - `abstracts/` — `_tokens`, `_typography`, `_mixins`, `_icons` (the icon-font generator
      now writes to `scss/abstracts/_icons.scss`).
    - `base/` — `_foundry-vars`, `_editor`, `_hotbar`, plus `_elements` (form-element resets)
      and `_window` (window chrome) split out of the old `_top`/`_forms`.
    - `layout/` — `_sheet` (frame), `_tabs` (tab nav + `.tab-body`), `_grid`.
    - `components/` — `_facade`, `_items`, `_profile`, `_bodyloc`, `_effects`, `_chat`,
      `_tooltip`, `_rollable`, plus `_search` (from `_top`) and `_field` (split from
      `_resource`).
    - `utilities/` — `_flex` (incl. the `flex-group-*` helpers moved out of `_grid`).
    - Removed the empty/commented-out `_nav` partial and the now-empty `utils/`, `global/`
      directories.

    `scss/sohl.scss` loads the folders in the documented `@layer` order
    (`base → layout → components → utilities`). Grid helpers load in `layout` rather than
    `utilities` so the existing component-level overrides (e.g. chat's `.mingap` tightening a
    grid gap) keep winning; the BEM pass (#94) will convert those to modifiers and promote
    grid to the utilities layer.

- 522f3ea: **Extract the reusable list-widget component (DRY items/effects/body-location)**

    The item, effect, and body-location lists each re-implemented the same skeleton —
    scrollable body, header row, reset inner list, control cluster, and the
    ellipsis-truncation triple repeated on nearly every column. Extract that skeleton into
    shared mixins so the three lists become thin consumers:
    - `abstracts/_mixins.scss` gains `truncate` (the `text-overflow`/`white-space`/`overflow`
      ellipsis triple used ~15× across the lists).
    - New `components/_list.scss` provides the list mixins: `scroll-body`, `reset`,
      `section-title`, `header-row`, and `controls` (emits no CSS itself).
    - `components/_items.scss`, `_effects.scss`, and `_bodyloc.scss` now `@include` those
      mixins and keep only their own columns and accent colors.

    Class names are unchanged, so **templates are untouched** and the compiled CSS is
    equivalent: the only diff against the previous build is a cosmetic `margin: 7px 0px` →
    `margin: 7px 0` normalization (identical computed value) on the body-location list.

    Scope note: the header duplication this epic targeted (`.sheet-header-being/-object`) was
    already removed in the dead-code pass, and the form field was split into its own partial
    in the folder reorg; the remaining BEM-driven shared-class adoption in templates lands in
    the naming pass.

- e9d9437: **Fix: convert remaining DataModel array `choices` to value-keyed objects**

    Foundry builds `<option>` values from `Object.entries(choices)`, so a DataModel
    `StringField({ choices })` given an enum `values` array renders option values as
    indices (`0`, `1`, …) — breaking any editable select of that field on submit.
    This completes the sweep started in #149, converting the remaining choice fields
    across the item / actor / combatant / strike-mode data models to the value-keyed
    `choices` map now emitted by `defineType`:
    - Item: skill (`subType`, `combatCategory`), mystery, mysticalability, trauma
      (`subType`, `aspect`), affliction (`subType`), concoctiongear (`subType`),
      projectilegear (`subType`), attribute (`bodyRole`), lineage (`bodyRole`,
      bleeding, amputation, move medium).
    - Actor: cohort (member role), vehicle (occupant role); Combatant: displayed
      medium; StrikeModeBase: impact aspect.

    Strike-mode `type` discriminators (a `TypedSchemaField`'s hidden discriminator)
    are intentionally left as single-value arrays.

    Fixes #148

- 70a1b16: **Document the entity-serialization and chat-card scope contracts**

    Capture the serialization and action-context patterns as developer reference so
    they don't have to be re-derived.
    - **Entity serialization contract** (new section in `docs/reference/runtime-contracts.md`).
      How a `SohlEntity` serializes: ownership by a transient `parent`, the
      `defaultToJSON` / `defaultFromJSON` pair (no reflective serializer), curated
      `Data`-shaped `toJSON` in persisted representation (uuids/shortcodes, not
      resolved objects) with the rule that `toJSON()` output must be valid
      constructor `data`, `registerKind` for revival, explicit `clone(parent)`, and
      `SohlLogic` serializing as a `{ uuid, name, kind }` reference.
    - **Chat-card scope model** (extends the existing _Chat-card dispatch contract_).
      The three kinds of button data (display fields, routing metadata, scope), and
      how an action's `scope` crosses the client boundary as a single `data-scope`
      blob written by the card logic and revived by `buildActionScope` so flows read
      live `context.scope` objects rather than per-payload JSON strings.
    - **`SohlActionContext` as a runtime value object** — why it is not a
      `SohlEntity`, and why `scope` stays a `ContextScope` interface.
    - **Extension how-to** (`docs/how-to/extension-points.md`). _Adding a chat-card
      button_ now instructs authors to carry payloads in `data-scope` rather than a
      bespoke `data-*-json` attribute, cross-linking both reference sections.

    Documentation only; no runtime change.

- d1729e6: **refactor(result): move aim/spread ownership to ImpactModifier (#207)**

    `aimBodyPartCode` and `spread` were duplicated — stored as direct fields on both `AttackResult` and `ImpactResult`, producing the same two values twice in each serialized tree. They now live exclusively on `ImpactModifier` (the weapon capability descriptor), which is the natural owner.

    **Changes:**
    - `ImpactModifier` — gains `aimBodyPartCode` and `spread` fields; both are serialized in `toJSON()`.
    - `AttackResult.aimBodyPartCode` / `.spread` — converted from stored fields to read-through getters (`this.impact.aimBodyPartCode` / `.spread`); removed from `toJSON()`.
    - `ImpactResult.aimBodyPartCode` / `.spread` — same conversion (`this.impactModifier.*`); removed from `toJSON()`.
    - `CombatResult.rollImpact()` — drops the now-redundant explicit `aimBodyPartCode`/`spread` pass-through; they flow automatically via the shared `ImpactModifier`.
    - `buildAttackResult()` — passes `aimBodyPartCode`/`spread` into `impact.clone()` so they are embedded in the modifier from the start.

- 962eb81: **refactor(result): rehydrate AttackResult.mode to a live StrikeMode (#204)**

    `AttackResult.mode` previously held a `StrikeModeBase.PointerData` struct in memory (the wire form), making it unusable at runtime. It now holds the live `StrikeModeBase | undefined`, following the same pointer-on-wire / live-object-in-memory rule already applied to `DefendResult.mode` and `AttackResult.combatant`.

    **Changes:**
    - `AttackResult.mode` — runtime type changed from `PointerData` to `StrikeModeBase | undefined`; rehydrated via `StrikeModeBase.fromPointerData()` in the constructor. `undefined` when the weapon is absent from the current client (e.g. the defending client).
    - `AttackResult._modePointer` — private field retains the original `PointerData` for lossless `toJSON()` serialization.
    - `AttackResult.toJSON()` — `mode` is now serialized from `_modePointer` (same shape as before; no wire format change).
    - `SohlCombatantLogic` — two `StrikeModeBase.fromPointerData(atkResult.mode)` calls replaced with direct `atkResult.mode` access; the `priorAttackResult.mode` comparison guarded against `undefined`.

- 343f755: **Seed a default strike mode for new combat-technique skills**

    Creating a `combattechnique`-subtype skill now seeds a default melee strike mode
    (named after the skill) when none is supplied, so the item is immediately valid
    and usable — a combat technique needs a strike mode for its Attack / Block /
    Counterstrike to mean anything. Handled in `SkillDataModel._preCreate`; every
    other skill subtype keeps a null strike mode.

- f76f1f1: **Fix #64:** Dodge is now offered only when the actor has a usable Dodge skill.

    Previously the Dodge defense button appeared for every defender regardless of
    whether they had a Dodge skill.

    **Two gates fixed:**
    - **Automated chat card** (`chat-card-gating.ts`): Added `hasUsableDodgeSkill(actorLogic)` helper that checks `logicTypes[ITEM_KIND.SKILL]` for a skill with shortcode `"dge"`. `gateAutomatedDefenseButtons` now removes the Dodge button when the helper returns false — mirroring the existing Block/Counterstrike gates.
    - **Context menu** (`constants.ts` + `ExpressionHelperRegistry.ts`): `TEST_TYPE.DODGE.condition` changed from `"true"` to `"hasUsableSkill(actor,'dge')"`. Added `hasUsableSkill(actor, shortcode)` to `STANDARD_HELPERS` — a pure, duck-typed helper that walks `actor.logic.logicTypes["skill"]` to find the skill, with no Foundry import required.

- 66ea919: **Fix #70:** Move hardcoded English `FATE_DESC_TABLE` and `STANDARD_SUCCESS_VALUE_TABLE` entries to i18n.

    Both tables previously used module-level constants with static English strings. They are now getter functions (`getFateDescTable()` and `getStandardSuccessValueTable()`) that resolve labels and descriptions via `sohl.i18n.localize()` at call time so the active locale is available.

    **New i18n keys added:**
    - `SOHL.Skill.FateDesc.loseFateNoEffect.*`, `SOHL.Skill.FateDesc.noLossNoEffect.*`, `SOHL.Skill.FateDesc.success.*`, `SOHL.Skill.FateDesc.critSuccess.*`
    - `SOHL.MasteryLevel.SvTable.noValue.*`, `littleValue.*`, `baseValue.*`, `bonus1.*`–`bonus5.*`

- 32c4318: **Fix #104:** Actor sheet search filters now work for effects, gear, and
  body-location rows.

    `SohlActor._displayFilteredResults` was querying `.item` elements and
    reading `el.dataset.itemName`, but effect rows are `.effects__row` and
    carry `data-effect-name`, while body-location rows carry no name attribute
    at all — so those filters were silent no-ops.

    **Fix:** switch `_displayFilteredResults` to query `[data-search-name]`
    and read `el.dataset.searchName`, then stamp `data-search-name` on every
    filterable row across all eight search lists:
    - `templates/actor/being/profile.hbs` — traits
    - `templates/actor/being/skills.hbs` — skills
    - `templates/actor/being/mysteries.hbs` — mysteries and mystical abilities
    - `templates/actor/being/trauma.hbs` — injuries and afflictions
    - `templates/actor/being/combat.hbs` — body-location rows (`loc.shortcode`)
    - `templates/actor/parts/gear.hbs` — gear items (`item.name`)
    - `templates/actor/parts/effects.hbs` — own and transferred effects

    The existing `data-item-name` and `data-effect-name` attributes are
    preserved for other consumers.

- aab39fa: **Constrain the actor sheet header portrait**

    Fixes [#57](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/57):
    the header portrait sizing rule now targets `img.actor-img` — the class the actor
    header templates actually render — instead of the stale `img.profile` selector.
    The portrait is held to 100px again on all five actor sheets, so the header is
    compact and the tab content area gets its space back.

- a73e58c: **Key embedded items when exporting the actors pack**

    Fixes [#59](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/59):
    the actor pack exporter now writes a hierarchical `_key`
    (`!actors.items!<actorId>.<itemId>`, and `!actors.items.effects!…` for any
    effects an item carries) on each embedded item. Foundry's LevelDB pack compiler
    keys every embedded document by `_key`, so without it the compile aborted with
    `LEVEL_INVALID_KEY` ("Key cannot be null or undefined") as soon as the actors
    pack contained an actor.

- 8c52915: **Fix #104:** Actor sheet search filter now works for effects and body-location rows.

    The filter previously called `querySelectorAll(".item")` and read `el.dataset.itemName`. Effect rows use `.effects__row` (no `.item`) and body-location rows are `.item` but carry no `data-item-name` — so both were silently broken (effects never matched; body-locations were all hidden on any query).

    **Approach:** A new `applySearchFilter(query, rgx, content)` pure helper queries `[data-search-name]` and reads `el.dataset.searchName`. `SohlActor._displayFilteredResults` now delegates to it. All filterable `<li>` rows in the eight being/cohort tab templates receive `data-search-name="{{name}}"`, making the filter class-agnostic and fixing effects, body-locations, and gear in one pass.

- 17accf7: **Repair actor sheet tab navigation**

    Fixes [#53](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/53):
    the Being actor sheet crashed on render, and tab content rendered hidden on all
    actor sheets (Being, Cohort, Structure, Vehicle, Assembly). The Being `tabs` part
    now uses Foundry's core navigation template, and every actor tab section resolves
    its `active` state and tab group so the correct tab body is shown.

- cbeb583: **Complete `ValueModifier.addVM` so it preserves the full modifier derivation**

    `addVM` is meant to fold one modifier's justification into another — copying the
    source's labeled deltas so the merged value keeps each source's tooltip and can
    layer its own deltas on top. It was previously a stub that only copied the base
    value and **silently dropped the source's deltas**.

    It now replays every labeled delta from the source (name, shortcode, operator,
    and value preserved, honoring same-shortcode replacement and `OVERRIDE`
    semantics), while still adopting the source's base only when `includeBase` is set
    (the base is not additive — a modifier has exactly one, so it is replaced, not
    summed).

    This corrects `MysticalAbilityLogic`'s mastery-level derivation, which used the
    stub to borrow an associated skill's mastery level and therefore lost that
    skill's own modifiers (e.g. injury impairment). It is also the mechanism the
    upcoming combat-technique-as-skill work (#322/#323) uses to drive a technique's
    strike-mode attack/defense from its skill.

- c4fad5b: **Fix #186:** Attacker-side injury button now emitted when a counterstrike
  lands.

    `buildCombatCardData` hard-coded `hasAttackInjury: false` with empty
    `attackInjuryHandlerUuid`/`attackInjuryScope` on both the main attack card
    and the counterstrike (CX) card, so the attacker could never receive an
    injury button even when the defender's counterstrike landed a blow.

    The fix mirrors the existing defender-side `injuryButton(...)` logic:
    - **Main attack card:** `atkInjury = injuryButton(cxImpact, atkResult.token.uuid)` — the original attacker takes an injury when the CX blow lands.
    - **CX card:** `atkInjury = injuryButton(cxImpact, attackResult.token.uuid)` — same CX impact, targeting the original attacker's token (now the "defender" on the CX card).

    `atkInjury` is `null` when no CX exists or the CX missed, so `hasAttackInjury` stays false in the normal (non-counterstrike) case.

- 3d310d5: **Fix #178:** `BeingSheet._onRollStrikeModeTest` now uses the correct
  modifier for the chosen test kind.

    Previously the method always called `sm.attack` regardless of whether the
    player clicked a block or counterstrike cell. It now delegates to a new
    pure helper, `selectStrikeModeModifier(sm, testKind)`, which maps:
    - `"attack"` → `sm.attack`
    - `"block"` → `(sm as MeleeStrikeMode).defense.block`
    - `"counterstrike"` → `(sm as MeleeStrikeMode).defense.counterstrike`

    An unknown `testKind` returns `undefined` and the roll is silently
    skipped. The helper is unit-tested in `being-sheet-view.test.ts`.

- e20d9a9: **Security:** Fix XSS in `CalendarSettingsMenu._onDeleteCalendar` via imported calendar name (#163).

    `cal.label` (verbatim from a GM-imported JSON file) was passed to `game.i18n.format` without HTML escaping. A calendar named `<img src=x onerror=…>` would execute when the GM opened the delete confirmation dialog. Also fixed the sibling import-success notification that used `calendarConfig.name` unescaped.

    Both `cal.label` and `calendarConfig.name` are now wrapped with `foundry.utils.escapeHTML` before interpolation. Also adds `foundry.utils.escapeHTML` and `foundry.utils.deepClone` stubs to the test setup.

- 2458999: **Authorize chat-card clicks by the handler document's ownership**

    Fixes [#167](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/167):
    the chat-card click dispatcher resolved the handler document by UUID and ran its
    `onChatCardButton` with no ownership check, so intrinsic combat/opposed flows
    (`opposedTestResume`, the automated defense resumes, `startAutomatedAttack`, …)
    could be driven for a document the acting client does not own — the render-time
    `gateAutomatedDefenseButtons` is UX only and is bypassed by a synthesized click
    or a direct handler call.

    A chat card addresses each button to the actor that should _handle_ it, and
    running the action mutates that actor's own state, so authorization is document
    ownership. The dispatch now honors a click only if the resolved handler is owned
    by the current client (a GM owns all):
    - New `resolveAuthorizedChatCardHandler(dataset, resolveDoc)` resolves the handler
      and returns it only when `doc.isOwner`, gating both the button and edit-action
      click paths in `sohl.ts` before any dialog, `buildActionScope` revival, or
      intrinsic logic runs. Foundry lookup is injected, so it is Foundry-free and
      unit-tested (mirroring `gateAutomatedDefenseButtons`).
    - Each `onChatCardButton` handler (`SohlCombatant` / `SohlTokenDocument` /
      `SohlItem`) also re-checks `this.isOwner` on entry, so a direct call is refused
      too (defense-in-depth), matching the existing `onChatCardEditAction` guard.

    The correctly-addressed owner's flows are unchanged. The two-sided model
    (render-gate + click-authorize on the handler's ownership) is documented in the
    Chat-card dispatch contract (`docs/reference/runtime-contracts.md`) and the
    cross-client authorization guardrail (`docs/concepts/security-model.md`).

- 67eada0: **fix(result): eliminate doubled attack/defend payload in CombatResult.toJSON() (#203)**

    `CombatResult.toJSON()` was emitting each nested result twice: once as `sourceTestResult`/`targetTestResult` (inherited from `OpposedTestResult`) and again as `attackResult`/`defendResult` (redundant stored fields). Every combat card's `data-scope` carried four result objects where two were sufficient, roughly doubling the cross-client payload.

    **Changes:**
    - `attackResult` and `defendResult` are now **read-only getters** that alias `sourceTestResult`/`targetTestResult`; the stored fields are gone.
    - The `CombatResult` constructor normalises construction-time aliases (`attackResult`→`sourceTestResult`, `defendResult`→`targetTestResult`) before calling `super()`, so callers may pass either name — including the revival path, which only sees the serialised `sourceTestResult`/`targetTestResult` keys.
    - The `toJSON()` override is removed; `OpposedTestResult.toJSON()` already serialises the pair correctly.
    - `buildCombatResult` in `SohlCombatantLogic` no longer passes redundant keys.

    _Verify: `CombatResult.toJSON()` now contains one attack result and one defend result (not four), and a round-trip via `defaultFromJSON` restores `attackResult === sourceTestResult`._

- 563a669: **Enable type-aware `@typescript-eslint/consistent-return` lint rule (#235)**

    Enables the type-aware `@typescript-eslint/consistent-return` ESLint rule (with the base `consistent-return` rule turned off to avoid false positives on `void` returns). The type-aware version correctly distinguishes functions returning `Promise<T | undefined>` — where bare `return;` is inconsistent with `return value;` — from `Promise<void>` functions where bare returns are fine.

    **Changed files:**
    - `eslint.config.js` — added `parserOptions.project: true` + `tsconfigRootDir`, disabled base `consistent-return`, enabled `@typescript-eslint/consistent-return`
    - All bare `return;` statements in non-void async functions changed to `return undefined;` across: `SohlLogic`, `SohlActor`, `SohlItem`, `SohlCombatant`, `BeingLogic`, `SohlCombatantLogic`, `SohlTokenDocumentLogic`, `MasteryLevelModifier`, `StrikeModeBase`
    - `_preUpdate`/`_preCreate` overrides that fell off the end without a return now have an explicit `return undefined;`

- 30b9f1b: Fix the Add Injury flow never recording a trauma.

    `createTraumaFromInjury` called `actor.createEmbeddedDocuments(...)`, but both
    call sites pass the `BeingLogic`, not a Foundry actor, so it threw
    `TypeError: actor.createEmbeddedDocuments is not a function` and no trauma was
    created. It now routes the write through a new
    `FoundryHelpers.fvttCreateEmbeddedItems(actorLogic, itemsData)` boundary, which
    resolves the actor from the logic — keeping `injury-actions.ts` free of direct
    Foundry calls. With this, the Add Injury flow records the trauma end to end. (#286)

- 4a9e3f6: **Security:** Fix stored XSS in `DomainManagerApp.promptForEntry` (#160).

    Registry fields (`label`, `description`, `img`, `iconFAClass`, `shortcode`, `sort`) were interpolated unescaped into the `DialogV2.prompt` content string. The domain registry is plantable via the `sohl.domains` world setting and module registration, and the dialog runs in GM (full-privilege) context.

    All registry field values are now passed through `foundry.utils.escapeHTML` before interpolation. The sibling `domain-manager.hbs` list template already used auto-escaped double-stash and is unaffected.

- c0fe843: **Security:** Fix catastrophic ReDoS in `FILE_PATH_REGEX` (#165).

    The inner character class `[^<>:"|?*\n\r]` allowed `/` and `\`, which overlapped with the adjacent `(?:[\\/]...)` group. For an N-segment path ending with a forbidden character, the engine explored O(2^N) backtracking paths — a 30-segment input caused a ~60-second hang.

    The fix excludes `/` and `\` from both inner char classes (`[^<>:"|?*\n\r\\/]+`), making each path separator consumed by exactly one arm and reducing matching to O(N).

- 5d8d62d: **Fix #177:** `BeingLogic.getUsableStrikeModes()` now returns the actor's
  genuinely usable strike modes so automated attack and counterstrike can
  start.

    The method body was a `return []` stub, causing `commonAttack` to abort with
    "has no usable strike mode" on every automated attack and counterstrike
    resume.

    The fix composes the two existing collectors:
    - **`availableStrikeModes`** — modes whose weapon is held in ≥ `minParts`
      limbs (missile modes additionally gated by `draw ≤ pull`). Already correct;
      now used as the starting set.
    - **Range/reach filter** — melee modes require `distanceToTarget ≤ reach.effective`; missile modes require `distanceToTarget ≤ baseRange.effective`.
    - **Type gating** — `meleeAllowed`, `directAllowed`, and `volleyAllowed` options prune the result as callers require.
    - **Disabled gate** — modes with `attack.disabled` are always excluded.

    Unblocks the automated-attack path (#193 RED cases: "automated attack start"
    and "Counterstrike resume").

- 494dcb6: **Security:** Fix Handlebars SSTI and XSS in dialog HTML builders (#159, #164).

    **`SohlItem._moveQtyDialog` (#159):** Item names, source/target container names, and quantity were interpolated directly into Handlebars template source before compilation, allowing SSTI (proto-chain code execution) via crafted names and enabling stored XSS. Names are now placed in the Handlebars data context (`{{itemName}}`, auto-escaped) and compiled from a static template string. The `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags are removed.

    **Defense-in-depth hardening (#164):**
    - `SohlDataModel._addChoiceArrayItem`: choice labels and values from `data-choices` are now HTML-escaped with `Handlebars.escapeExpression` rather than concatenated into a template source string; the `Handlebars.compile` + `allowProto*` step is eliminated.
    - `selectArray` Handlebars helper: `option.value` is now escaped with `Handlebars.escapeExpression` to match the existing escaping on `option.label`.
    - `FoundryHelpers.toHTMLWithContent`: removed `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags; plain-object contexts do not need proto-chain access.

- b3194cc: Fix the injury chat card failing to render.

    `templates/chat/injury-card.hbs` closed its `{{#if needsShockRoll}}` block with
    `{{/unless}}` instead of `{{/if}}`, so rendering threw `if doesn't match unless`
    and no injury card was posted (aborting the Add Injury flow before the trauma was
    recorded). (#283)

- 5d4cac1: Fix the broken Add Injury flow.

    `BeingLogic.addInjuryViaDialog` / `onCreateInjury` resolved the target body via
    `getActorBodyStructure(this)`, but `this` is the `BeingLogic` — which exposes
    `logicTypes`, not the Foundry actor's `itemTypes` — so the lookup always returned
    `undefined` and the flow aborted before any dialog (whose "no body" warning then
    hit the logger recursion). And `BeingSheet._onAddInjury` called
    `this.document.addInjuryViaDialog()`, a method the actor does not define (it lives
    on `BeingLogic`). `getActorBodyStructure` now reads the lineage body through the
    logic's `logicTypes` (matching how the rest of `BeingLogic` reaches it), and the
    sheet action routes through `.logic`. (#268)

- b6407c2: **Fix #112:** Bump `input-label` typography token from 14 px to 16 px.

    All other body and label tokens were already at 16 px; the `input-label`
    entry in `scss/abstracts/_typography.scss` was the only one still at 14 px,
    causing form field labels to render noticeably smaller than the rest of the
    UI text.

- dd55166: **Fix actor import crash from unwired intrinsic actions**

    Fixes [#62](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/62):
    importing an actor (e.g. `Basic_Folk`) threw _"The target of this action does not
    have a function named 'perform'"_ during data preparation. Several Logic classes
    declared intrinsic actions whose `executor` named a method that did not exist or
    was misnamed, and `SohlAction`'s constructor rejects an unresolved intrinsic
    executor — aborting the whole actor's data preparation.

    Every declared intrinsic executor now resolves to a real method. Not-yet-built
    actions (`mysticalability` perform, `mystery` useMystery, `weapongear`
    attack/block/counterstrike, `trauma` treatment/healing tests, `affliction`
    fatigue/morale/fear tests) degrade gracefully with a "not yet implemented"
    warning instead of throwing, and the `affliction` transmit/contract actions now
    point at their existing `transmit`/`contractTest` methods. Adds the missing
    action-title localization keys.

- 44be7f6: Fix infinite recursion (stack overflow) in `SohlLogger.uiWarn` / `uiInfo` / `uiError`.

    The notify branch of `log()` re-entered the same `uiWarn`/`uiInfo`/`uiError`
    method — which calls back into `log()` with the same `notifyLevel` — recursing
    without bound and crashing the client with `RangeError: Maximum call stack size
exceeded` on **any** UI-notify log call. The notification now goes straight to
    Foundry's notification manager (`ui.notifications`), and the two previously
    unguarded `i18n.format` calls in `log()` are wrapped so a formatting failure
    cannot throw out of the logger. (#267)

- 3343760: **Security:** Fix ReDoS in `matches()` expression helper (#166).

    `MAX_PATTERN_LENGTH = 200` bounded pattern length but not backtracking complexity. A sub-200-char pattern with nested quantifiers (e.g. `(a+)+`) against attacker-influenced input could hang the JS engine for seconds or minutes.

    Adds `hasCatastrophicPattern()` static analysis before `new RegExp(...)` is called. Patterns containing backreferences (`\1`–`\9`) or a quantified group whose body itself contains a quantifier (`(a+)+`, `(.*)* `, `([a-z]+\d)+`) are rejected with a `SafeExpressionError`. Legitimate single-level quantifiers (`a+`, `[a-z]+`, `(?:foo|bar)`) are unaffected.

- 48eb22a: **Fix the release workflow so GitHub Releases include the system archive**

    Fixes [#120](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/120):
    the release workflow uploaded its assets from `build/release/`, but the packaging
    step writes `system.zip` and `system.json` to `build/dist/`. The upload now points
    at `build/dist/`, so published Releases carry the installable system files that
    Foundry's manifest/download URLs reference.

- 134d817: Fix seven dialog templates failing to render on Foundry v14.

    Foundry v14 removed the `{{#select}}` Handlebars block helper, so the injury,
    damage, missile-damage, opposed-response, create-item, strike-mode, and
    query-weapon dialogs threw `Missing helper: "select"` and never opened. Each
    select is converted to the supported v14 pattern: `{{selectOptions}}` (with
    `valueAttr`/`labelAttr` for object lists), or an inline `{{#each}}` with
    `{{#if (eq …)}}selected{{/if}}` where the option value or label can't be
    expressed through `selectOptions` (string lists and formatted labels like `dN`).
    This also repairs the Add Injury flow end to end (its dialog can now render). (#280)

- baf8b3b: **Fix the shared data-model schema spread**

    `defineSohlDataSchema()` — the schema for the fields every SoHL data model is
    meant to carry (`shortcode`, `docUrl`, `actionDefs`) — was defined but never
    spread into any concrete schema, so those fields were absent from every item
    and actor data model. Spread it into the item, actor, and combatant base
    schemas so the fields exist and persist. `shortcode` is made lenient
    (`initial: ""`), a safe default since it was previously unvalidated everywhere.

- 0712d1b: **Repair sheet layout broken by a dead CSS scope**

    Fixes [#87](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/87):
    the Being sheet (and every other SoHL document sheet) rendered with an oversized
    header and cramped tab content. The sheet-layout rules in `_top.scss` lived inside
    a top-level `.sheet { … }` block, but because the stylesheet loads each component
    inside `.sohl { }` they compiled to the descendant selector `.sohl .sheet`. Foundry's
    ApplicationV2 places `sohl`, `sheet`, and the sheet-type class on the **same** frame
    element, so that descendant selector never matched and the whole block — including
    the portrait size cap and the tab-body height — was silently dead.

    The block now lives in its own `components/_sheet.scss` partial, loaded under the
    compound `.sohl.sheet` selector so it matches the frame as intended. This also
    explains why the earlier `img.profile` → `img.actor-img` rename (#57) had no visible
    effect: the rule it edited never applied.

- 640e1d5: **Restore type safety on `sohl.*` and SoHL document types (fix stale `sohl-globals.d.ts`)**

    `types/sohl-globals.d.ts` had regressed to a broken state: it imported from a
    non-existent `@src/common/*` layout and referenced removed `X.DataModel`
    namespace members, while `tsconfig`'s `skipLibCheck: true` hid the breakage. The
    effect was that `var sohl: SohlSystem`, the Foundry `DocumentClassConfig`, and
    `DataModelConfig` all silently resolved to `any` — turning off type checking on
    every `sohl.*` global access and on SoHL document / data-model types.
    - **Corrected the declaration file**: repointed all imports to the current
      `@src/document/*/{foundry,logic}`, `@src/core/logic`, and `@src/entity`
      layout; use the standalone `XDataModel` classes (the `X.DataModel` namespaces
      are gone); dropped dead imports; made `SohlActor`/`SohlItem`/`SohlActiveEffect`
      non-generic to match their classes; fixed the `Mixin` utility-type constraint.
    - **Broke an fvtt-types instantiation cycle**: the actor/item `DataModelConfig`
      entries pin their DataModel generics to `any`, because the concrete classes
      carry self-referential `TLogic` defaults (DataModel → Logic → Data → system →
      DataModelConfig) that otherwise send the compiler into infinite recursion.
      Per-subtype `system` stays loosely typed (as it already was while the file was
      broken); everything else is now correctly typed.
    - **Fixed the ~50 latent type errors** the correction de-masked: added a typed
      `SohlSystem.CONFIG` getter; cast heterogeneous `SohlDocument`-union member
      access in the base sheet; annotated implicit-`any` callback params; and fixed
      two genuine bugs surfaced by real typing — a possibly-undefined
      `charges.value` read in `SkillLogic`, and `BodyPart.heldItem` now normalizes
      to `undefined` (its declared type) instead of `null` when no item is held.

    Also adds a build/CI guard (`npm run lint:dts`, wired into `build:noci` and the
    build workflow) that type-checks the project's own declaration files with
    `skipLibCheck` off and fails on any error in a file we own — so this regression
    cannot silently recur. Third-party library errors (which `skipLibCheck` exists
    to suppress) are ignored.

    Type-only change; no runtime behavior change beyond the two correctness fixes
    noted above.

- 0093c45: **Bug fix:** `SohlSpeaker._toChatWithContent` now correctly awaits `toHTMLWithContent`.

    The inline-content chat path was assigning a `Promise` to `messageData.content` instead of the resolved HTML string, causing chat messages to render as `[object Promise]` or empty. Added `await` to match the sibling `_toChatWithTemplate` path.

- ac32893: **Fix #78:** `successValueTest` now passes the correct `svTestContext` to `successTest`.

    Previously, `successValueTest` built `svTestContext` with the right `svTable` and index-offset `targetValueFunc` but then called `this.successTest(context)` with the original, unmodified context. As a result, `successValueTest` behaved identically to a plain `successTest` and the success-value grading was never applied.

    The fix passes `svTestContext` (spreading any caller-supplied scope fields underneath, then overriding with `svTable` and the index-offset func) to `this.successTest(...)`.

- 38e8732: **Fix #75:** `SuccessTestResult.testDialog` now records the target's movement
  from the dialog form.

    The `targetMovement` handling block was commented out with a `FIXME(#75)`.
    The block referenced a nonexistent `this.targetMovement` field and the wrong
    guard name (`isMovement`). The fix:
    - Reads `formData.targetMovement` (not `data.targetMovement`)
    - Validates with `isSuccessTestResultMovement`
    - Assigns `this._movement` (the existing `movement` backing field)
    - Throws `Invalid target movement "…"` for unrecognized values, mirroring the
      existing `rollMode` validation pattern directly above it

    Also adds `isSuccessTestResultMovement` to the import list.

- b778130: **Fix Foundry V14 item lifecycle: rename `prepareEmbeddedData` → `prepareEmbeddedDocuments`**

    `SohlActor` overrode `prepareEmbeddedData()`, the V13 Foundry Actor method name. Foundry V14 renamed this to `prepareEmbeddedDocuments()`, so the SoHL three-phase item lifecycle (initialize → evaluate → finalize) was never called. All computed logic-layer properties on embedded items (`score.effective`, `masteryLevel.effective`, `reach.effective`, etc.) were permanently `undefined` at runtime in V14.

    The fix renames the override to `prepareEmbeddedDocuments()` and updates the `super` call accordingly.

- a32bf63: **Security:** Fix stored XSS in `ValueModifier.chatHtml` via unescaped delta names (#162).

    Delta `name` and `value` fields were interpolated unescaped into the `chatHtml` string that is rendered via triple-mustache (`{{{ }}}`) in `opposed-result-card.hbs` and `standard-test-card.hbs`. A crafted delta `name` embedded in an opposed-request card's `data-scope` would be revived on the target's client and re-broadcast to all connected clients as live HTML.

    Both `m.name` and `getValue(m)` are now HTML-escaped via the new pure `escapeHTML` utility added to `src/utils/helpers.ts`. Delta names/shortcodes are not validated upstream, so escaping at the source is required.

- 7310900: **Correct valueDesc element localization keys in en.json**

    Fixes [#55](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/55):
    the `Trait.valueDesc` element subfields now localize under
    `valueDesc.element.label.*` / `valueDesc.element.maxValue.*`, matching Foundry's
    array-of-schema convention. This removes the key collision that aborted
    localization on world load and places the keys where the field auto-localizer
    looks them up.

- 0b7383b: **Fix: form-select fields with array `choices` submitted invalid values**

    A DataModel `StringField({ choices })` used the enum `values` array, but Foundry
    builds `<option>` values from `Object.entries(choices)`, so array choices render
    option values as indices (`0`, `1`, `2`, …). Rendered as an editable select,
    `submitOnChange` then submitted the index, validation rejected the whole form
    update (`X is not a valid choice`), and no edit persisted — this broke the trait,
    affliction, projectilegear, and concoctiongear item sheets.

    `defineType` now emits a value-keyed `choices` label map, and the affected fields
    use it: trait `subType`/`intensity`, affliction `transmission`, projectilegear
    `impactBase.aspect`, and concoctiongear `potency`.

    Remaining array-`choices` fields that do not yet render as editable selects are
    tracked in #148; combattechnique's sheet is separately blocked on a missing
    strike-mode template (#147).

    Refs #141

- 6a90c0f: **Make `helpers.ts` strictly Foundry-free and break the helpers ↔ FoundryHelpers cycle**

    `src/utils/helpers.ts` no longer imports the Foundry shim, so the util layer is a
    true Foundry-free foundation. Previously `helpers.ts` and `FoundryHelpers.ts`
    imported each other; the two runtime touch-points that caused it are gone.
    - `cloneInstance` now merges overrides with a pure, internal `deepMerge`
      (recursive plain-object merge; arrays and scalars replace wholesale) instead of
      Foundry's `mergeObject`.
    - `defaultFromJSON` revives a `ClientDocument` reference through an injected
      resolver registered via the new `setUuidResolver`. The `FoundryHelpers` shim
      (and its test mock) registers `fvttResolveUuid` at load, so Foundry UUID
      resolution is wired in for every runtime path without the util importing the
      shim.
    - Free-standing pure types moved to a new `src/utils/types.ts`: the dialog
      types/interfaces (out of `FoundryHelpers.ts`, still re-exported there for
      existing importers) and `SohlSettingValue` (out of `helpers.ts`). Branded types
      paired with runtime guards (`FilePath`, `HTMLString`, `DocumentId`,
      `DocumentUuid`) stay with their guards in `helpers.ts`.

    No public API or behavior change; enforced by the existing purity test, which now
    loads `helpers.ts` with no Foundry globals and no shim dependency.

- baf8b3b: **Icon attributions**

    Expand the icon-attribution list in the README with credits for additional
    icons sourced from The Noun Project and Game-Icons, and sort the list
    alphabetically.

- 70a1b16: **`isA` guards for item/actor kinds and logic base types**

    The `isA(x, key)` guard now accepts item/actor kind values and the logic base
    types, so a `x.kind === ITEM_KIND.X` check can be written `isA(x, ITEM_KIND.X)`
    with full type narrowing.
    - **Kind checks** — `isA(logic, ITEM_KIND.SKILL)` / `isA(logic, ACTOR_KIND.BEING)`
      match on the logic's serializable `.kind` discriminant and narrow to the
      concrete logic type via a new `ActorLogicByKind` map (mirroring the existing
      `ItemLogicByKind`). No Symbol brand is used for kinds — they aren't
      cycle-forced, and a Symbol would only add un-spoofability, which is
      meaningless for a kind.
    - **Base-type brands** — `SohlItemLogic`, `SohlActorLogic`, and
      `SohlCombatantLogic` gain Symbol brands (inherited getters on their base
      classes), so `isA(x, "SohlItemLogic")` matches any item logic across the whole
      subtype hierarchy — which a leaf `.kind` string can't express.
    - Converted the logic-side kind checks (lineage-parent guards, the
      skill/attribute opposed-test filter, and the weapongear/combattechnique and
      being combat checks) to `isA`. Foundry-document `.type` checks are unchanged.

    No behavior change: because each registered kind's logic extends a shared base
    (never another registered kind), `isA(x, KIND)` is exactly `x.kind === KIND`.

- 70a1b16: **Rename the logic `type` getter to `kind`**

    `SohlLogic.type` — the convenience getter returning a logic's actor/item kind
    (e.g. `"skill"`, `"being"`) — is renamed to `SohlLogic.kind`, so the logic layer
    uses `kind` consistently with `SohlLogicData.kind` and the
    `ITEM_KIND` / `ACTOR_KIND` values it returns.
    - Callers now read `logic.kind` instead of `logic.type` (updated across the
      combatant, body, mastery-level, and strike-mode logic).
    - The Foundry document's own `type` property and `logic.data.type` are
      unaffected — only the logic-layer accessor is renamed. No behavior change.

- 70a1b16: **Curated `toJSON` serialization across the entity layer; retire `instanceToJSON`**

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

- abb4072: **Fix: partial array-by-index updates no longer corrupt a being's body structure**

    Hand-built updates that targeted a single element of the `bodyStructure.parts`
    array by index (e.g. `update({ "system.bodyStructure.parts.1.heldItemId": id })`)
    corrupted the **entire** parts array: Foundry rebuilds an array field from a
    sparse `{ index: {…} }` change, truncating it and default-filling every element
    that wasn't named. The first time `holdItem` ran, a being's 6 body parts
    collapsed to 2 — wiping every part's `shortcode`, `canHoldItem`, `roles`, and
    `locations` (hit locations, armor coverage, manipulator/locomotor roles). As a
    knock-on, `releaseItem` then matched nothing (its filter needs the now-wiped
    `canHoldItem`) and could never release.

    Affected executors: `GearLogic.holdItem`, `GearLogic.releaseItem`,
    `BodyPart.addLocationUpdate`, `BodyPart.removeLocationUpdate`.

    Added `BodyStructure.setPartFieldsUpdate`, which sources the full canonical parts
    array and writes it back whole with only the target element(s) modified — the
    same complete-array pattern the existing `addPartUpdate`/`removePartUpdate`
    builders already use. All four sites route through it. `ObjectField`-keyed
    updates (`system.strikeModes.<id>.…`) and form submissions were never affected.

    Fixes #247

- 3a3d980: **Remove dead SCSS verified against templates**

    Delete ~408 lines of SCSS whose selectors match no `.hbs` template and no `src/` class
    reference. Mechanical cleanup ahead of the CSS reorganization (epic #95), with each
    deletion grep-verified against `templates/` and `src/`:
    - `scss/components/_forms.scss` — the `.sheet-header-being` and `.sheet-header-object`
      blocks (superseded by the live `.sheet-header` / `.header-details` / `img.actor-img`
      markup), plus the now-unused `@use "../utils/colors"`.
    - `scss/components/_sheet.scss` — the orphaned `.summary`, `.subtype`, and top-level
      `.sheet-navigation` blocks (templates use Foundry tab navigation, not `.sheet-navigation`).
    - `scss/components/_top.scss` — `img.token-image`.
    - `scss/components/_items.scss` — the `.subtype` list column and the `.items-block`
      adjacency rule.

    No renaming, no folder moves, no changes to any live selector (e.g. `.item-subtype`,
    `.status-effects`). Pure deletion; `npm run build:css` and `npm run build` both pass.

- 70a1b16: **Runtime type brands via `isA`, replacing cycle-forming `instanceof`**

    Adds a small Symbol-brand mechanism in `constants.ts` — a `BRAND` map (brand key
    → unique `Symbol()`), a `BrandType` registry (key → the type it narrows to), and
    a generic `isA(x, key)` type guard — as a targeted replacement for `instanceof`
    in the one place a value import would form a module cycle.
    - **Breaks an import cycle.** `SohlEntity.clone` no longer uses
      `instanceof SohlLogic`, which forced `SohlEntity` to import `SohlLogic` as a
      value and closed the cycle `SohlEntity → SohlLogic → SohlActionContext →
SohlEntity` (throwing `Class extends value undefined` when the entity modules
      loaded). It now imports `SohlLogic` type-only and detects it with
      `isA(x, "SohlLogic")`.
    - **Inherited, un-spoofable brands.** A class attaches its brand through an
      inherited getter (`get [BRAND.SohlLogic]()`), so every subtype at any depth is
      recognized. Because the brand is a `Symbol`, it is invisible to
      `Object.keys` / `JSON.stringify` and never leaks into serialized data.
    - **One mechanism, not two.** The earlier one-off `isSohlTokenDocumentLogic`
      string getter is folded into the same pattern
      (`BRAND.SohlTokenDocumentLogic` + `isA`).

    Plain `instanceof` remains the default wherever it does not cause a cycle; the
    brand is added only where the import graph forces it, and the `BrandType`
    registry is meant to grow lazily rather than branding every type.

- d456126: **Add a Security Model & Guardrails developer document**

    New `docs/concepts/security-model.md` captures the system's threat model and the
    standing security guardrails for human and AI developers: reference code rather
    than compiling it from data (the `__kind` registry, intrinsic method names,
    Foundry macros), why regex "sandboxes" and client-only signatures are not boundaries,
    safe serialization, XSS/HTML rules, cross-client authorization vs. client-side
    gating, ReDoS, and a reviewer red-flag checklist. Linked from the docs index and
    `CLAUDE.md`, which gains a matching non-negotiable rule.

- f0120cb: **Serialization canonicalizes empty entity fields to `null`**

    Extends the null-at-the-edges convention to the entity serialization layer.

    `defaultToJSON` now deep-replaces `undefined` with `null` in the output of any custom
    `toJSON` (a new internal `nullifyUndefined` pass). Serialized entity data — the blobs
    `JSON.stringify`'d into chat-card `data-scope`, flags, and clone round-trips — now spells
    "empty" as `null` consistently instead of relying on `JSON.stringify` silently dropping
    `undefined` keys. This matches "null at the edges" (`null` is JSON-safe) while the logic
    layer keeps `undefined`; the `== null` idiom bridges them on revival. Reads stay
    backwards-compatible: an absent key still revives as `undefined` and is treated as empty.
    A bare top-level `undefined` is unchanged.

    **Small changes**
    - Removed the dead `AnyObject` global alias (an unused duplicate of `UnknownObject`).
    - Tightened `SohlEntity.clone`'s `options` parameter to `Partial<SohlEntity.Options>`
      (its `data` parameter intentionally stays `PlainObject` — an open subclass-override bag).
    - Added tests: `nullifyUndefined` coercion in `defaultToJSON`, and a leaf-entity
      `defaultFromJSON(x.toJSON(), { parent })` reconstruction.

- bb6c368: **Move pure view-model logic out of sheet classes into Foundry-free modules**

    Fixes [#117](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/117).

    Pure data-shaping that had been written inline inside Foundry sheet classes — where
    it was excluded from test coverage and sat outside the Foundry-free boundary guards
    (the ESLint logic-zone rule and the purity test) — moves into co-located `*-view`
    helper modules under each document's `logic/` directory, each with unit tests. The
    sheets keep only their Foundry-facing orchestration. No user-facing behavior change.

    _BeingSheet_ → new `being-sheet-view.ts`: `groupBySubType` (replacing five inline
    copies across skills, traits, afflictions, mysteries, and abilities),
    `buildContainerTree` (the gear hierarchy and virtual "On Body" list),
    `buildStatusPills`, `buildBodyPartLozenges`, `clampHealthPct`, and
    `splitWeaponsByRange`. The in-sheet `fvttEnrichHTML` proxy is replaced with a direct
    `TextEditor` call (the proxy exists for the logic layer, not for sheets).

    _SohlItemSheetBase_ → new `item-sheet-view.ts`: `localizeSubType` (subtype-label
    localization with raw fallback), `keyTransferredEffects` (enabled transferred
    effects keyed by id), and `findSimilarItem` (the name/type/subtype match behind
    overwrite-on-drop). The sheet keeps the Foundry-facing drop dialog and mutation.

    _SohlActiveEffectSheet_ → new `effect-sheet-view.ts`: `buildChangeTypesMap` (the
    localized change-`mode` label map), `resolveEffectMetadataType` (scope → effect-key
    namespace), and `resolveEffectKeyChoices` (its `ITEM_METADATA` key-choices lookup).

    _Settings apps_ → new `src/apps/logic/domain-manager-view.ts` (`buildDomainGroups` —
    group by family, sort, and compute delete/override flags) and
    `src/apps/logic/calendar-settings-view.ts` (`buildCalendarViewModel` — the calendar
    dropdown rows and imported-calendar list, taking a `localize` callback). The new
    `src/apps/logic/**` directory is added to the Foundry-free zones (the ESLint
    boundary rule and the purity smoke test).

- 70a1b16: **Reorganize the source tree**

    Internal source reorganization to separate Foundry-bound infrastructure from the
    Foundry-free logic and domain layers. No behavior change.
    - **`src/core` split by coupling.** Foundry-bound infrastructure moves to
      `src/core/foundry/` (`sohl-config.ts`, `SohlCalendar.ts`, `SohlDataModel.ts`,
      `URLField.ts`); the Foundry-free logic runtime moves to `src/core/logic/`
      (`SohlLogic.ts`, `SohlSystem.ts`, `SohlSpeaker.ts`, `SohlHookBridge.ts`).
    - **`src/domain` → `src/entity`.** The whole domain tree (action, body, modifier,
      movement, result, strikemode) moves under `src/entity/`, joined by new
      `src/entity/roll/`, `src/entity/event/`, and `src/entity/domain/` homes for the
      roll primitive, event queue, and domain registry.
    - **Kebab-case filenames.** Several modules are renamed to match the convention
      (`armor-aggregation.ts`, `injury-resolution.ts`, `weighted-random.ts`,
      `move-helpers.ts`, `event-trigger.ts`, `builtin-domains.ts`, …); `@src/…`
      imports are updated throughout, and the `eslint.config.js` Foundry-free-zone
      list is repointed at the new paths.
    - **Calendar Foundry/logic split.** `SohlCalendar`'s pure timestamp/formatting
      helpers are extracted into `src/core/logic/sohl-calendar-logic.ts`; the Foundry
      `CalendarData` subclass stays in `src/core/foundry/`.
    - **Dead code removed.** `src/utils/actionInput.ts` (the `DialogBypassContext`
      interface) is deleted — it had no remaining references.

- 3b69d57: **Refactor: split the Foundry-coupled item/actor foundations into per-concern files**

    `SohlItem.ts` and `SohlActor.ts` each bundled three concerns — the Document, the
    DataModel, and the SheetBase. Each is now its own file:
    - `SohlItem.ts` → `SohlItem` (Document) + new `SohlItemDataModel.ts` + `SohlItemSheetBase.ts`
    - `SohlActor.ts` → `SohlActor` (Document) + new `SohlActorDataModel.ts` + `SohlActorSheetBase.ts`

    Every importer now pulls each class from its own module (no barrel re-exports).
    The pre-existing re-export of the Foundry-free logic contracts
    (`SohlItemBaseLogic` / `SohlActorBaseLogic` and their types) is unchanged.
    Pure reorganization — no behavior change.

    Closes #77

- 70a1b16: **`StrikeModeBase` is now a `SohlEntity`**

    `StrikeModeBase` — and its `MeleeStrikeMode` / `MissileStrikeMode` subclasses —
    now extends `SohlEntity`, bringing the strike-mode family in line with the other
    domain entities (results, modifiers, body parts). Its constructor forwards the
    owning logic as the entity `parent`, and its `Data` interface extends
    `SohlEntity.Data`.

    No behavior change: strike modes are still rebuilt from schema data on every
    preparation cycle and are not serialized through the kind registry (the
    inherited `toJSON` is unused).

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
