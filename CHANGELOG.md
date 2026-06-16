# sohl

## 0.8.0

### Minor Changes

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
      inside the logic layer. New `logicFromUuid` / `logicFromUuidSync` helpers (in
      `FoundryHelpers`) resolve a uuid back to a `SohlLogic`, keeping the document
      deref inside the shim.

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

- eadc8b2: **Restore the Being sheet header: clickable status pills, health bar, body-location lozenges**

    Rebuild the Being sheet header to match the previous design, in `templates/actor/being/header.hbs`, `scss/layout/_sheet.scss`, and `src/document/actor/foundry/BeingSheet.ts`:
    - **Status pills** now look like the old rounded lozenges (grouped top-right, wrapping) and are **clickable to toggle** the status — a new `toggleStatus` action calls `actor.toggleStatusEffect(statusId)`, creating/deleting the active effect. Active pills are highlighted.
    - **Health bar** restored: a "HEALTH: x%" label over a filled bar, driven by `health.effective` (added `healthPct` to the header context).
    - **Body-location lozenges** restored as a read-only, full-width row beneath the main header, generated dynamically from the actor's Lineage body structure (`bodyStructure.parts`).

    Status `data-status-id`/tooltips and localization keys are unchanged.

- baf8b3b: **SkillBase computed entirely in the logic layer**

    `SkillBase` now takes the actor's `AttributeLogic` instances and a `TraitLogic`
    birthsign instead of Foundry items, so skill-base resolution no longer touches
    the Foundry layer.
    - The constructor option changes from `{ items }` to
      `{ attributes?: AttributeLogic[]; birthsign?: TraitLogic }`.
    - Attribute references are matched by `data.shortcode` and scored from
      `score.effective`; the birthsign tokens are read from the trait's
      `data.textValue`. Callers pass `actorLogic.logicTypes[ATTRIBUTE]`.

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

- 17accf7: **Repair actor sheet tab navigation**

    Fixes [#53](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/53):
    the Being actor sheet crashed on render, and tab content rendered hidden on all
    actor sheets (Being, Cohort, Structure, Vehicle, Assembly). The Being `tabs` part
    now uses Foundry's core navigation template, and every actor tab section resolves
    its `active` state and tab group so the correct tab body is shown.

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

- 48eb22a: **Fix the release workflow so GitHub Releases include the system archive**

    Fixes [#120](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/120):
    the release workflow uploaded its assets from `build/release/`, but the packaging
    step writes `system.zip` and `system.json` to `build/dist/`. The upload now points
    at `build/dist/`, so published Releases carry the installable system files that
    Foundry's manifest/download URLs reference.

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

- 7310900: **Correct valueDesc element localization keys in en.json**

    Fixes [#55](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/55):
    the `Trait.valueDesc` element subfields now localize under
    `valueDesc.element.label.*` / `valueDesc.element.maxValue.*`, matching Foundry's
    array-of-schema convention. This removes the key collision that aborted
    localization on world load and places the keys where the field auto-localizer
    looks them up.

- baf8b3b: **Icon attributions**

    Expand the icon-attribution list in the README with credits for additional
    icons sourced from The Noun Project and Game-Icons, and sort the list
    alphabetically.

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
    - **Assisted impact roll.** The Combat tab's Impact cell is now clickable (`rollStrikeModeImpact`): it rolls the strike mode's impact dice and posts a `damage-card.hbs`. When a single token is targeted, the card's Calculate Injury button forwards `{ impact, aspect }` to the target, opening the assisted Add Injury dialog. `damage-card.hbs` was flattened onto a real render context (the previous template referenced impact fields that never existed). Pure helpers `resolveStrikeModeImpact` / `buildDamageCardData` added to `combat-actions.ts`; a read-only `aspectType` getter was added to `ImpactModifier`.
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
      `URLField`, and `StrikeModeTestKind`.
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
