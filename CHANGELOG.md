# sohl

## 0.8.0

### Minor Changes

- f5cc6a1: **Action-card framework + self-sufficient treatment flow**

    Add the connective tissue for the consent model: **action cards** — chat cards
    whose buttons each invoke a _self-sufficient action_, the same action a human
    could run from a sheet or context menu, just pre-filled. The card is never
    special or privileged; it carries the action's parameters and a `skipDialog`
    marker, so a click runs exactly what a player could have done by hand. Nothing is
    consumed or locked — state lives in the posted cards, so a card can be ignored,
    answered later, or overridden.
    - **`buildActionCard(spec)`** — a pure assembler: it renders a caller-authored
      card **body** (its own template or inline content — buttons are not part of it)
      and appends the standard button block, returning the finished HTML.
      **`postActionCard(speaker, spec)`** posts it via `speaker.toChat`. A card's
      `buttons` may be one, many (e.g. an attack card's four defenses), or none (an
      informational result).
    - **Open, capability-gated buttons** — a button whose handler is the `@self`
      sentinel resolves at click to the clicking user's own `game.user.character`;
      the action self-gates. `gateActionCardButtons` shows `@self` buttons to everyone
      and hides owner-targeted buttons from non-owners.
    - **Single chokepoint** — `dispatchChatCardAction` reads `data-skip-dialog` and
      runs the action with `skipDialog`, so the card path and the by-hand path call
      the same self-sufficient executor.
    - **Treatment flow** — three independently runnable actions: **Request Treatment**
      (a wound's context-menu action) posts an open Perform card; **Perform Treatment
      Test** (a Being action — run from the card, or by hand with a dialog that takes
      a pasted injury UUID or a GM-described severity/aspect) rolls the physician's own
      Physician skill and posts a result, with an owner-gated **Accept** button when it
      has a target wound; **Treat Injury** (a wound's context-menu action — run from
      the Accept button, or by hand via a Healing-Rate dialog) records the rate. The
      physician never touches the patient's wound; the patient's own click does.

    Closes #576

- 78e87dc: **Actor-first data preparation with post-phase action executors**

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

- 6ab1a59: **`sohl.addScriptAction` — programmatic Script Action attach**

    Add the last owed API from the generic-scheduler epic (#588, deliverable §7): a
    clean, first-class way to bind a Foundry Macro to a host document as a SCRIPT
    action, so a module or macro can attach an action and then schedule it — without
    hand-rolling the full `system.actionDefs` shape.
    - **`sohl.addScriptAction(doc, spec)`** — sibling of `sohl.schedule` /
      `sohl.unschedule` / `sohl.worldHost`. Takes a minimal spec (`{ name, executor }`
      plus optional `title` / `scope` / `iconFAClass` / `group` / `minActorOwnership`
      / `trigger` / `visible`), fills the same sensible defaults as the sheet's
      "create action" control, and persists by writing the whole `actionDefs` array
      (upsert by identity, never by index).
    - **`name` is the identity.** It becomes both the action's `shortcode` — what
      `sohl.schedule(doc, name, …)` and the `[Perform]` reminder address — and its
      default `title`. Re-attaching the same `name` **replaces** the entry rather than
      duplicating it, so an init hook is safe to run on every reload.
    - **`executor` is a Foundry Macro UUID** — a reference, never inline code.
      Authoring is GM-gated (the same rule `SohlActor` / `SohlItem` enforce at the
      persist boundary) and execution runs through `Macro#execute`; this assembles and
      persists the reference only, compiling nothing.

    With this, the charter's "Check For Bandits" worked example runs end to end:
    `sohl.worldHost()` → `sohl.addScriptAction(world, { name, executor })` →
    `sohl.schedule(world, name, 4*3600, { visibility: "gm" })` yields a recurring,
    GM-hidden `[Perform]` reminder that survives reloads and runs the Macro on click —
    with no core schema change.

    Closes #605.

- c805aa2: **Affliction Course Test + Reaction effect**

    A symptomatic, naturally-healing affliction now fights its **course**: its
    recurring check applies a **Course Test** at each elapsed checkpoint — a headless
    test of `Healing Base × Healing Rate` that changes the affliction's Healing Rate
    (CF −2, MF −1, MS +1, CS +2). The resulting HR drives the host's **Reaction**:
    HR 6+ defeats the affliction (the course stops), HR 5 / 4 inflict 5 / 10 weakness
    fatigue, and HR 3 / 2 / 1 / <1 impose Stunned / Incapacitated / Unconscious / Dead
    shock (worsening the being's shock state to at least that level, never improving
    it). A shared `inflictWeaknessFatigue` helper (also used by blood-loss anemia)
    creates the fatigue traumas. Part of #548. Closes #489

- c805aa2: **Affliction onset effect + optional onset Macro**

    At onset, an affliction now runs its onset effect: it is already marked
    symptomatic (`onsetDate` crystallized) and starts its course/resolution cycle —
    symptoms themselves are role-played, out of VTT scope — and it may name an
    **optional onset Macro**. A new `system.onsetMacroUuid` (a Macro UUID reference,
    never source) runs once on the active GM right after onset is recorded, with a
    `scope` of `{ affliction, actor }`, and may schedule further events. See the
    House Rules Cookbook (Recipe 4) for authoring. Part of #548. Closes #488

- d6219e2: **Affliction: disease/poison phase progression over world time**

    Afflictions now progress through their phases on the event queue, mirroring the
    Trauma healing/blood-loss scheduling. Adds temporal fields to Affliction
    (`contractDate`, an `onset` and `resolution` one-shot triplet, and a recurring
    `healingCheck` triplet via the schema helpers). On creation `_preCreate` seeds
    `contractDate` and the incubation interval; `AfflictionLogic.finalize()` arms the
    correct event by phase:
    - **incubating** → the `onsetCheck` transition;
    - **symptomatic** → the `resolutionCheck` transition plus the recurring
      `healingCheck`;
    - **resolved** → nothing.

    The `onsetCheck` / `healingCheck` / `resolutionCheck` intrinsic actions advance
    the phase (crystallizing `onsetDate` / `resolutionDate` and rolling the next
    intervals) and re-arm — reusable from the timed event or manually. The
    per-phase roll **effects** are tracked as follow-ups (#488 onset, #489
    course/recovery, #490 resolution).

    Refs #483.

- c805aa2: **Affliction resolution outcome (outcome + outcomeTrauma)**

    When an affliction reaches the end of its symptomatic period without being
    defeated (Healing Rate below 6), its authored **outcome** is now applied. Two new
    fields:
    - **`system.outcome`** (`AFFLICTION_OUTCOME.DEATH` | `CURED`, default `cured`) —
      `DEATH` sets the being's shock state to Dead; `CURED` sets Healing Rate to 6.
    - **`system.outcomeTrauma`** (optional) — a `SafeExpression` evaluating to a trauma
      shortcode, or an array of shortcodes, the host contracts as part of the outcome.
      Matches are resolved world-items-first, then compendiums, via a new
      `fvttFindItemByShortcode` shim.

    The two combine (e.g. `CURED` + `outcomeTrauma: "'weakness20'"` cures the
    affliction but adds the `weakness20` trauma). See House Rules Cookbook (Recipe 5)
    for authoring. Part of #548. Closes #490

- 31aa4c2: **Archetype-first Create dialog: default Name/Shortcode from the chosen archetype**

    The **Create Actor / Create Item** dialog is now **archetype-first**. You choose
    _what kind of thing_ (Type → SubType → Archetype) up front, and **Name** and
    **Shortcode** follow as **optional** fields that default to the chosen archetype's
    own name and shortcode. Starting from a template no longer discards its identity —
    pick _Broadsword_ and confirm, and you get a "Broadsword" with shortcode `brdswd`,
    not a generic "New Weapon".
    - **Fields reordered and made optional.** The dialog lays out **Type → SubType →
      Archetype → Name → Shortcode**; Name and Shortcode are no longer required.
    - **Live defaults from the archetype.** Selecting an archetype pre-fills Name and
      Shortcode from its `name` / `system.shortcode`, updating as the archetype
      selection changes; a field you type into is left alone. Blank means "use the
      archetype's".
    - **(none) is unchanged.** The deliberate blank-slate choice still defaults Name to
      the class default and derives the Shortcode from the Name.
    - **Uniqueness preserved.** A second document from the same archetype still
      auto-bumps its shortcode (`broadsword`, `broadsword2`, …).
    - Works for **both** Item and Actor creation (both route through the shared create
      dialog). The identity-resolution rules are lifted into a Foundry-free,
      unit-tested helper (`sohl.entity.archetype.resolveCreateIdentity`).

    Closes #643

- a2df624: **Migrate the automated attack card onto the action-card framework**

    Assemble the automated-combat attack card the same way every action card is
    built — a body template plus a `buttons` array handed to `buildActionCard` —
    instead of hand-writing the four defense buttons in the template. This makes the
    framework's multi-button case (one card, four defenses, all addressed to the
    defender) a first-class use of `buildActionCard`, and it fixes a latent
    addressing bug in the process.
    - `buildAttackCardData` now returns an `ActionCardSpec` (body `data` + a
      `buttons` array); `attack-card.hbs` is body-only. The four defenses (Dodge /
      Counterstrike / Block / Ignore) are emitted as `action-card-button`s carrying
      the evaluated `AttackResult` in each button's `scope` (revived by the resume
      executors as `context.scope.attackResult`), and `skipDialog`.
    - **Bug fix:** the defense buttons are now addressed to the defender's
      **combatant** (`AttackCardTarget.combatantUuid`), not its actor. The resume
      executors live on the combatant logic, the click dispatch routes through the
      combatant's `onChatCardButton`, and the render gate reaches the actor via
      `combatant.actor` — so the previous actor-uuid address left a rendered attack
      card's defenses mis-resolved (gated down to Ignore, which then did nothing).
    - `gateAutomatedDefenseButtons` reads the handler the same way the dispatcher
      does (`data-handler-uuid`), and per-defender capability gating is unchanged.
    - Adds a Node-only test helper (`renderRealTemplate`) that renders SoHL `.hbs`
      with real Handlebars, so the attack card's assembled button HTML — the
      combatant uuid, `skipDialog`, and the `action-card-button` class — is asserted
      without a running Foundry.

    Closes #578

- c805aa2: **Fatigue system — Fatigue Penalty from fatigue traumas**

    Fatigue is modeled as `fatigue`-subtype **traumas** (windedness / weariness /
    weakness recorded as separate instances because each recovers at its own rate),
    not a being field. `BeingLogic.fatiguePenalty` is a derived `ValueModifier` that
    sums the Fatigue Levels across every fatigue trauma, seeded in `finalize()`. The
    penalty applies to tests and Move rate (consumers read `fatiguePenalty.effective`;
    the shock and course tests fold it in). Part of #548. Closes #552

- 667a6a8: **Being Gear tab display**

    The Gear tab now lists gear under **On Body** and under **each container** as its
    own section, with Type / Qty / Weight / Qual / Dur / Notes columns, plus the
    carried/worn toggles and a per-row context menu.
    - **On Body** summarizes the being's overall load: total carried-gear weight
      (accumulated ground-up on `BeingLogic.carriedWeight`) and the resulting
      **encumbrance** for its active movement medium (`lineage.encumbrance`), e.g.
      _Carried: 10 lb · Enc 2_. A being with no lineage (an incorporeal being) shows
      0 encumbrance.
    - **Containers** each show their own used / max capacity (from the container's
      max capacity).

    Completes the Gear-tab epic (#301).

    Closes #302

- 26e1148: **Compute a being's Healing Base**

    `BeingLogic.healingBase` — previously declared but never assigned — is now a
    derived `ValueModifier`, seeded during `evaluate()` to the average of the being's
    **Endurance** and **Will** scores (the fraction rounded **up when END > WIL**,
    **down otherwise**), and left open to trait and treatment deltas on top. A being
    with no Endurance or Will attribute (e.g. an incorporeal being) keeps an empty
    modifier (base `0`).

    Multiplied by a Healing Rate, the Healing Base is the mastery level of nearly
    every recovery test in the system (the Injury Healing Test, the affliction Course
    Test, the Infection Healing Test, and the Extended Shock / Coma course tests), so
    this is a foundation for the trauma / shock / affliction timed effects. The
    rounding rule is a pure, Foundry-free helper (`healingBaseFor`).

    Part of #548. Closes #549

- 5c65d04: **Fix the Being sheet's cross-cutting layout & wiring defects (#513)**

    Four defects that affected every Being content tab, each fixed once at the shared sheet layer:
    - **Context menus now work (#517).** `_contextMenu()` was never called, so right-clicking an item row and clicking its ⋮ control did nothing — there was no way to edit or delete anything created on the sheet. It is now bound in `BeingSheet._onRender`, so both open the item's context menu.
    - **Content tabs scroll (#514).** The content tabs were `overflow-y: hidden`, so anything past the sheet height was unreachable. The Being tabs now scroll (`overflow-y: auto`), and each content part is marked `scrollable` so the scroll position survives the submit-on-change re-render.
    - **Search fields render light (#516).** The search inputs are `type="search"`, which the light-field CSS didn't cover, so they rendered as a dark bar. `input[type="search"]` is now styled like the other inputs.
    - **List rows are compact (#515).** The Being lists use the shared `.list__*` markup but not the `.list-section .list` wrapper the item lists use, so row names rendered as oversized headings. Compact-row styling is now applied to the Being lists' BEM classes.

- c805aa2: **Shock-state infrastructure**

    A being's **shock state** is now modeled as the Stunned / Incapacitated /
    Unconscious / Dead **status effects** — there is no separate persisted field.
    `BeingLogic.shockState` reports the highest active shock status as an ascending
    severity level (`NONE` 0 … `DEAD` 4), and all transitions go through a single
    `setShockState(level)` operation that clears every shock status then applies only
    the target's (none for `NONE`), keeping transitions clean in both directions and
    repairing any stray multi-status situation. `advanceShockState(steps)` moves from
    the current state by N levels (clamped). The ordered model lives in a pure,
    Foundry-free `shock.ts`; a new `fvttToggleActorStatus` shim applies the statuses.

    Foundation for the trauma / shock / affliction timed effects (blood-loss advance,
    injury shock, shock re-tests). Part of #548. Closes #550

- df20718: **Being Trauma tab — Afflictions section**

    The Trauma tab's afflictions list now groups afflictions by subtype and shows
    each with its level, healing rate, source, and notes — with a search box, a
    custom-create control (`data-type=affliction`), and a per-row context menu. This
    completes the Trauma-tab epic (#304) alongside the Traumas section (#308).

    The `Created` / `Course Test` / `Recovery Test` timer columns are deferred to a
    follow-up (#359): they depend on world-time fields and the affliction
    course/recovery mechanics (#65 / #67 / #68).

    Closes #309

- 088cb1e: **Being Trauma tab — Traumas (injuries) section**

    The Trauma tab's injuries list now shows each trauma with its severity band
    (M1 / S2 / S3 / G4 / G5), healing rate (an `NT` prefix when untreated), localized
    impact aspect, resolved body location (Area), bleeding state, and notes — with a
    custom-create control (a blank trauma, `data-type=trauma`) alongside the existing
    Add-Injury roll, and a per-row context menu.

    The `Created` and `Next Healing` timer columns from the design are deferred to a
    follow-up (#356): they depend on new world-time fields and the trauma
    healing-test mechanic (#73).

    Closes #308

- 9655d35: **Document the bleeding, trauma, and affliction rules**

    Three new rules journals under the Rules folder, linked from the Song of Heroic
    Lands Rules index (new "Health, Injury & Recovery" section):
    - **Bleeding** — the Blood Loss Advance Test (every 5 minutes vs. Strength ML),
      Blood Loss Points and the Shock State progression (No Shock → Stunned →
      Incapacitated → Unconscious → Dead), the anemia weakness-fatigue, and the
      Physician's Blood Stoppage Test with its request/accept flow.
    - **Trauma** — the trauma taxonomy (body / mind / psyche / spirit), and Physical
      Trauma's Injury Healing Test (a Healing Roll made per injury), including the
      rule that an active infection suspends all Injury Healing Tests until every
      infection is defeated, and how a critically-failed test causes infection.
    - **Afflictions** — the three phases (incubation → symptomatic → outcome),
      dormancy, the Course Test against Healing Base × Healing Rate, the reaction
      table by Healing Rate, the final outcome (death / cure / `outcomeTraits` /
      `outcomeTraumas`), and **infections** (an affliction with Healing Rate = injury
      HR + 1 and its own reaction table).

    These capture the rules the timed trauma/affliction processes are built on.

    Closes #543

- c805aa2: **Blood Loss Advance Test effect (+ dispatch-bug fix)**

    A bleeding injury's recurring blood-loss event now applies the **Blood Loss
    Advance Test** at each elapsed checkpoint. With no physician accepting the Blood
    Stoppage request, it auto-resolves as though the Blood Stoppage Test were a
    critical failure — the bleeding continues (the interactive physician Accept card
    is #547). Each test rolls against the victim's Strength Mastery Level and accrues
    Blood Loss Points (CF +3, MF +2, MS +1, CS 0); each BLP advances the being's shock
    state one step (toward Dead) and inflicts 5 Fatigue Levels of weakness fatigue
    (anemia).

    Also fixes a latent dispatch bug: the trauma scheduled blood-loss under the kind
    `trauma::bloodLossAdvanceRoll` while the action executor is `bloodLossAdvanceCheck`,
    so the event never dispatched — the kind now matches the shortcode. Part of #548.
    Closes #487

- 2ede925: **Interactive Blood Stoppage flow (#547)**

    Add the physician **Accept**-card flow for bleeders — the cross-client sibling of
    the treatment flow, built on the action-card framework.
    - **Request Blood Stoppage** (`TraumaLogic.requestBloodStoppage`, on a bleeding
      wound) posts an **open** card any Physician-skilled character's controller may
      answer.
    - **Perform Blood Stoppage** (`BeingLogic.performBloodStoppage`) is a
      self-sufficient physician action: it rolls the physician's own Physician skill
      (plus any +10 carried from a prior Marginal Failure) and posts a result with an
      owner-gated **Accept** button.
    - **Accept** (`TraumaLogic.acceptBloodStoppage`, on the wound) relays the outcome
      back to the bleeder: **CS** stops the bleeding immediately, **MS** stops it after
      the next Blood Loss Advance (honored by `bloodLossAdvanceCheck`), **MF** continues
      with a +10 bonus to the next stoppage, **CF** continues.

    The `#487` auto-resolve fallback (no physician answers by end of round → the advance
    proceeds as a Critical Failure) is unchanged. The pure outcome mapping lives in a
    Foundry-free `blood-stoppage` module (`bloodStoppageOutcome`).

    Part of #548. Closes #547.

- f5a7ecf: **Character Creation guided tour** — the flagship onboarding tour, and the first
  content story on the `SohlTour` framework (#614).

    It _coaches and waits_ the user from an empty sidebar to a combat-ready character:
    create a Being from the **Basic Folk** archetype, flesh out the Facade, Profile,
    and Skills, arm and armour the character on the Gear and Combat tabs, add an
    **Arcane Talent**, and pack a container — teaching most of the Being sheet along
    the way. Per the framework, each step is either **free** (advise an example,
    advance on Next) or **gated** (Next stays disabled until the user has done the
    thing): the _Basic Folk_ archetype; the Broadsword / Roundshield / Leather Tunic /
    Backpack / Tinderbox gear archetypes; holding the Broadsword in the right arm and
    the Roundshield in the left; equipping the tunic; and dragging the Tinderbox into
    the Backpack and back out. Gated archetype steps key off the instance's inherited
    `system.shortcode` (per #643), so a gate confirms the _right archetype_ was chosen
    without forcing a particular name.

    The tour is **offered once per user** on a new world via a non-blocking whisper
    chat card with a **Start** button (offer-don't-act consent model), and stays
    launchable on demand from **Settings → Tour Management**.

- d6219e2: **Add a reusable clear control for nullable number fields on sheets**

    Emptying an `<input type="number">` does not reliably reset a nullable field to
    `null` (Foundry reads `valueAsNumber` = `NaN`; coercion depends on attributes and
    `submitOnChange`/re-render). Adds a general, reusable control:
    - a `clearableNumberInput` Handlebars helper that wraps the standard number-input
      builder (`field.toInput` / `createNumberInput`) — passing every option through —
      and renders a "×" clear affordance when the field has a value;
    - a `clearField` action on the item and actor base sheets that writes `null`
      explicitly via `document.update`, using the control's `data-field-path`.

    Usable for any nullable field on any SoHL sheet.

    Closes #479.

- bedc361: **Automated combat start on the combatant; opposed tests on the token**

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

- 35ec141: **Relocate the automated combat defenses to the combatant**

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

- bedc361: **Combatant actions on the combat-tracker context menu**

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

- d9d2506: **Compendium build now sets the archetype flag from `sohl.archetype`**

    `build:compiledb` reads each Item/Actor content note's required
    `sohl.archetype` frontmatter and writes it to `flags.sohl.docArchetype`, so
    shipped compendium documents carry their archetype identity for the
    create-dialog picker (issue #640, archetype contract #604).
    - `sohl.archetype` is a **required, nullable number**: a number marks the
      document as an archetype of that priority (→ `flags.sohl.docArchetype`);
      `null` marks it as not an archetype (the flag is omitted); an **absent**
      value is an authoring error that fails the entry, so "not an archetype" is
      never silently assumed.
    - New pure helpers `resolveArchetype` / `withArchetypeFlag` in
      `utils/packs/helpers.mjs` enforce the contract and are used by both the
      `items` and `actors` compilers.
    - `Basic_Folk.md` drops its now-redundant explicit `flags.sohl.docArchetype`
      so `sohl.archetype` is the single source of truth.

- 2e5fd7c: **Feature: Contract Disease action for beings (#391)**

    Beings gain a `Contract Disease` intrinsic action. It opens a dialog listing
    every **disease** (an affliction whose subtype is `disease`) found in the world
    and in the installed Item compendium packs, plus a **Custom disease** option for
    entering a name and Contagion Index (CI) inline. Only diseases can be contracted.

    Contraction is decided by a single d100 **contagion roll** against a target of
    `CI × Endurance`. The character rolls to resist; _failing_ the roll contracts the
    disease. Because a lower CI yields a lower (easier-to-fail) target, **the lower
    the CI, the more contagious the disease**, and higher Endurance protects. On a
    failed roll the disease is added to the sheet — the chosen source disease is
    copied verbatim, or a fresh `affliction` item is built from the custom name/CI.

    The world/compendium search (`fvttFindDiseases`) and the item creation
    (`fvttCreateEmbeddedItems`) live at the Foundry boundary in `FoundryHelpers`; the
    contagion math and dialog-form parsing are pure, Foundry-free, and unit tested.

- 4f3966a: **Seed new Actors/Items from archetypes in the Create dialog**

    The **Create Actor / Create Item** dialog now offers an **Archetype** picker, so a
    new Being (or Item) is born from a populated template instead of a blank slate —
    no more "import Basic Folk and rename." The dialog still exposes Name, Shortcode,
    Type, and (where applicable) SubType; the new Archetype dropdown defaults to the
    best-matching populated template and always includes **(none)** for the deliberate
    blank-slate authoring case.
    - **Data-driven archetypes.** Flag any Actor/Item — in a compendium pack or the
      world — with `flags.sohl.docArchetype = <priority:number>` and it appears in the
      picker for its `(type, subType)`. No code required. SoHL's stock **Basic Folk**
      ships flagged, so Create Actor → Being defaults to a fully-populated being.
    - **Shortcode is identity.** Candidates are deduped by `system.shortcode` (name is
      presentation and may diverge/localize); the winner per shortcode is chosen by
      _priority desc, source tier asc (**world < system < module**), then a stable
      UUID_. A GM's world copy shadows a shipped archetype by tier alone; a module
      must ship `priority > 0` to override a stock archetype.
    - **Foundry-free discovery/resolution helper** (`sohl.entity.archetype`) — the
      filter/dedup/winner rules are unit-tested independently of the dialog.
    - **On confirm** an archetype is cloned from its `toObject()` (embedded documents
      included), cleaned like an import, and overlaid with the dialog's Name/Shortcode;
      `(type, shortcode)` uniqueness is resolved by `_preCreate` as before.
    - **Instantiation strips the marker; copy-verbatim preserves it.**
      `flags.sohl.docArchetype` is removed when an archetype is _instantiated_ (the
      Create-dialog seed, and **drop-to-embed** onto an actor/item sheet) and kept when
      a document is copied as a library entry (**Import**, **Duplicate**) — the strip
      lives at those entry points, never in the universal `_preCreate`.

    Closes #604

- c8799e5: **CSS/SCSS architecture refactor (epic #95)**

    A ground-up modernization of the stylesheet layer. No visual change is intended —
    except where noted, the compiled CSS is computed-value-equivalent to before; the
    work is structural, and lays the foundation for runtime theming.
    - **Ratified architecture** (`docs/concepts/css-architecture.md`). The decision
      record grounding the epic: stay on Dart Sass, ITCSS-inspired folders, BEM under
      the `.sohl` namespace, `--sohl-*` design tokens, a documented `@layer` order, and
      the compound `.sohl.sheet` scoping rule.
    - **Tokens, layers, and scoping foundation.** A single `abstracts/_tokens.scss`
      source of truth emits the palette, spacing, and font stacks as `--sohl-*` custom
      properties, so the system is themeable at runtime; components consume the custom
      properties rather than SCSS variables. `scss/sohl.scss` declares the cascade-layer
      order (`base, layout, components, apps, utilities`) — since Foundry v14 core is
      fully layered, SoHL's layers beat core without `!important` or deep nesting. The
      compound `.sohl.sheet` frame-scoping pattern is settled and documented.
    - **Folder reorganization** into `abstracts/ base/ layout/ components/ utilities/`,
      splitting the mixed-concern "dumping ground" partials so each holds one concern.
    - **Dead-CSS removal.** Deleted the SCSS whose selectors matched no template and no
      `src/` reference (the mis-scoped `_bodyloc.scss`, the `.sheet-header-being` /
      `.sheet-header-object` blocks, orphaned state rules, and redundant `!important`
      flags) — grep-verified against `templates/` and `src/`.
    - **Reusable list widget.** Extracted the shared list skeleton (scroll body, header
      row, control cluster, ellipsis-truncation) into `components/_list.scss` mixins, so
      the item / effect / body-location lists become thin consumers.
    - **BEM naming pass.** Renamed the header, facade, shared list scaffolding
      (`item-*`/`items-*` → a single `list` block, ~250 sites), and effects components
      to `block__element--modifier` in lockstep across templates and SCSS. JS-coupled
      classes (`.item`, event hooks, `SearchFilter` `contentSelector`s), Foundry-owned
      classes, and `data-*` / `lang` keys are deliberately left unchanged.

    Closes the CSS refactor epic (#95): #87, #92, #93, #94.

- 795f3d2: **Add a calendar-aware `datePicker` Handlebars helper** (#530)

    A new `{{datePicker}}` helper edits numeric **worldTime** fields (seconds since
    the calendar epoch) through the active calendar, so dates no longer have to be
    typed as raw world-time integers. The field stores and returns the same numeric
    value; only the display and editing use calendar format.

    The control shows the current value formatted by the active calendar and opens a
    picker dialog with:
    - a **month dropdown**, and numeric **day**, **year**, **hour**, **minute**, and
      **second** inputs;
    - a **day-skip stepper** (± N days) that rolls months and years over correctly,
      including variable-length months and intercalary days;
    - **Now** (set to the current world time) and **Clear** (set to empty) buttons;
    - a live **preview** of the resulting date, with a red **"Invalid Date Format"**
      when the entered parts don't resolve to a real date.

    Wired into the Trauma and Affliction date fields (`contractDate`,
    `treatmentDate`). The worldTime ↔ calendar-parts conversion is a Foundry-free,
    unit-tested core (`date-picker-logic`).

- bedc361: **Default Combat Group moves from a token flag to the actor**

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

- d6219e2: **Derive `isTreated` from a treatment date**

    Trauma and Affliction no longer store a separate `isTreated` boolean. Each now
    persists a nullable `treatmentDate` (world-time, via the temporal-field helper),
    and `isTreated` is a derived getter on the logic (`treatmentDate != null`). The
    item sheets replace the "Treated" checkbox with an editable treatment-date field
    (using the new `clearableNumberInput` control, so it can be cleared back to
    untreated). Context-menu predicates that gated on treatment now read
    `itemLogic.isTreated`.

    Closes #484.

- 5dccfb1: **Dissolve the Corpus into the Being; make movement a universal actor capability**

    The `corpus` item type is removed. A being's physical body — anatomy (body
    structure), weight, reach, and body-scale — now lives directly on the **Being
    actor** under `system.body`, derived by a Being-owned `BodyLogic` and exposed as
    `being.body` (`being.body.structure` / `.weight` / `.reach` / `.bodyScale` /
    `.injuryTable`). No more embedded one-per-being singleton item, `registerCorpus`
    back-reference, or `being.corpus.*` cross-document reads.

    **Movement** (`currentMoveMedium` + `movementProfiles`, and the derived
    `feetPerRound` / `leaguesPerWatch` / `moveProfile`, plus the `makeDefaultMedium`
    action) becomes a universal capability on the **base actor** — every actor kind
    (Being, Vehicle, Cohort, Structure) inherits it. `MOVEMENT_MEDIUM.NONE` is the
    default; a single shared no-movement profile (`NONE_MOVE_PROFILE`) represents an
    actor that cannot move, so no actor authors a `NONE` profile of its own. Beings
    additionally derive movement's `strengthModifier` / `encumbrance` from `str` and
    carried weight.

    **Incorporeality** is now an empty body structure (`body.structure.parts` is
    empty), replacing the old "no corpus item" model.

    In the compendium source, a being's body is authored **inline** — its `sohl`
    block mirrors the schema (`sohl.body` nesting `structure` / `weight` / … , with
    `currentMoveMedium` / `movementProfiles` flat) — and the build inlines it into
    `system.body` + the base-actor movement fields instead of embedding a corpus
    item.

    _No data migration:_ there are no live worlds; throwaway worlds are regenerated
    from the packs.

    Closes #535

- 78e87dc: **Rename `SohlDomains` to `DomainRegistry`**

    The domain registry class is renamed from `SohlDomains` to `DomainRegistry` and
    moved to `src/entity/domain/DomainRegistry.ts`. Its static surface is unchanged
    under the new name — `DomainRegistry.getAll()`, `.get(shortcode)`,
    `.getByFamily(family)`, `.getChoices(family?)`, `.register(...)`, and
    `.remove(shortcode)`.

    The Domain Manager app and its view model are updated to the new name; behavior
    is otherwise unchanged.

- 1ba7d49: **Make every entity class overridable via a two-mechanism registry**

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

- d6219e2: **Event queue dispatches through document actions with SafeExpression predicates**

    When a subscription fires, the queue now **executes the action named by its
    `kind`** on the owning document's logic, rather than a bespoke `handleSohlEvent`
    handler. The trigger context (with the subscription's `payload` attached as
    `ctx.payload`) becomes the action context's `scope`, and `kind` its `type` — so an
    event reuses the same action a user can invoke manually, and one implementation
    serves both.

    Subscription predicates are now `SafeExpression`s evaluated against the trigger
    context (e.g. `name === 'combatStart'`), replacing raw callback functions.
    `SohlTriggerContext` gains an optional `payload`.

    Refs #480.

- d6219e2: **Event queue: populate on all clients, fire on the active GM only, add a query API**

    `sohl.events` is now a pure projection of document state. `subscribe`,
    `unsubscribe`, and `scheduleAt` run on **every** client (a player's queue is a
    permission-scoped subset of the active GM's); only `fire` remains gated to the
    active GM. This lets sheets query event dates locally on any client.

    Adds a read-only query API — `nextFireTime(uuid, kind)`, `timeUntil(uuid, kind)`
    (signed seconds from now), and `isScheduled(uuid, kind)`.

    Dispatch is now **single-pass**: each due subscription fires once and the queue no
    longer cascades re-armed successors within one `fire`. Recurring catch-up over a
    time jump is the consuming document's responsibility (an elapsed-interval loop in
    its handler that persists the advanced anchor), with `finalize()` re-arming the
    next occurrence — keeping the queue a projection that never evolves schedule state
    inside the GM-only `fire`. The same-tick loop guard is removed (no longer needed);
    the reentrancy depth backstop remains.

    The Event Queue reference doc is rewritten accordingly, including the
    owner-persists-the-anchor contract and a corrected worked example.

    Closes #480.

- 67e94ca: **Expand the trauma, shock, and affliction rules documentation**

    Adds a coherent, interlinked set of Rules journals covering the full
    trauma/shock/affliction system, with tables throughout:
    - **Healing Base** — the average-of-END/WIL recovery factor used in every healing
      test.
    - **Shock** — the shock states, the Shock State Index, the Shock Re-Test, and the
      lasting Extended Shock and Coma.
    - **Injury** — Injury Levels, indefinite and permanent impairment, the treatment
      and treatment-action tables, special injury effects, and the Injury Healing Test.
    - **Infection** — infection healing rate, weakness fatigue, and the Infection
      Healing Test.
    - **Fatigue** — windedness, weariness, and weakness, and the Fatigue Penalty.
    - **Fear**, **Morale** (with the Rally and Reaction tests), **Psychological
      Condition** (with Aural Shock), and **The Pall**.

    The **Trauma** page is rewritten as the umbrella over these forms, **Bleeding**
    and **Afflictions** are updated to cross-link the new pages, and the Rules index
    gains a full "Health, Injury & Recovery" section. Reflects two model changes:
    psyche and physical conditions are now **traumas** (only score-based traits
    remain), and an affliction's outcome uses a single **`outcomeTrauma`** field.

    Closes #545

- 577fdd9: **Feature: the namespace tree is now live on the `sohl` global (#403)**

    Every SoHL class is now addressable at runtime by a source-mirroring path on the
    `sohl` global — `sohl.document.effect.foundry.SohlActiveEffect`,
    `sohl.entity.modifier.ValueModifier`, `sohl.apps.foundry.DomainManagerApp`, and so
    on. The top-level namespaces `sohl.document`, `sohl.core`, and `sohl.apps` are new;
    they are typed on `SohlSystem` (via `typeof import(...)`, so the binding adds no
    import cycle) and bound in `sohl.ts` (the last-loaded entry, imported by nothing).

    `sohl.entity` is now **both** its existing override-aware construction registry
    (`sohl.entity.ValueModifier`, `sohl.entity.register(...)` — unchanged, so existing
    macros keep working) **and** a namespace (`sohl.entity.modifier.ValueModifier`).
    The flat PascalCase getters and lowercase sub-namespaces occupy distinct property
    names, so both coexist. Construct or override through the flat registry (its
    getters honor a `register()` override); the namespace path is for reference and
    always resolves to the original class.

    Additive throughout — existing `@src/…` imports and the current `sohl` surface are
    unchanged. The `sohl.utils` / `sohl.constants` surfaces are left as-is for now
    (they overlap the existing curated members); their namespace form is deferred.

- b3273af: **Add `rand()` and `roll(formula)` helpers to the SafeExpression language**

    Two new built-in expression helpers bring randomness and dice into data-driven
    predicates and computed fields:
    - **`rand()`** — a random number in `[0, 1)` (like `Math.random`). Combine with
      `floor` / `min` / `max` to derive integers or ranges.
    - **`roll(formula)`** — rolls a `SimpleRoll` dice formula (`'2d6+3'`, `'1d100'`,
      …) and returns a plain object: the roll's `toJSON` augmented with `formula`,
      `result`, `total`, and `median`. Read `.total` (or `.median`) to use the
      outcome further, e.g. `roll('2d6+1').total`.

    Both are stochastic (the first non-pure helpers). `roll` builds its `SimpleRoll`
    under the evaluating expression's owning Logic (injected as a hidden first
    argument for the small set of parent-bound helpers) and returns only the plain
    result object, so the live roll — and the parent — never escape the expression
    sandbox. No `eval` or data-into-code is introduced; `roll` uses the Foundry-free
    `SimpleRoll` primitive.

    `SimpleRoll.median` — the roll's average/expected value, newly surfaced through
    `roll(...).median` — now returns its **true** (unrounded) value. It was rounding
    to an integer, so an odd count of even-faced dice was off by 0.5 (`1d6` reported
    `4` instead of `3.5`; `1d20` `11` instead of `10.5`); it now returns the exact
    expected value and callers round if they want an integer. This getter had no
    production consumers before this change.

    The SafeExpression user guide is also expanded into a complete reference — every
    built-in helper documented (the string-building helpers were previously missing),
    fuller language coverage, and a "developing an expression" section.

    Closes #540, #541

- 2ede925: **Fear Test (#558)**

    Implement the **Fear Test** — a test against **Will** — and its states. A
    self-sufficient Being action rolls the being's Will headlessly and maps the result
    to a fear state: **Brave** (CS), **Steady** (MS), **Afraid** (MF), and — splitting
    the critical failure by least-significant digit — **Terrified** (CF5) or the more
    severe **Catatonic** (CF0).
    - **Fear sources are traumas.** Each frightening source is recorded as its own
      `fear`-subtype trauma (its level is the state); the being's effective fear state
      is the **most severe** active one. A success clears the source (Steady, or a
      five-minute **+20 Brave** bonus to Fear and Morale tests); a failure records or
      worsens the source.
    - **Psyche Stress.** Terrified grants **+1** and Catatonic **+2** Psyche Stress,
      accrued only for the newly-reached severity (recorded as a `psycond` trauma via a
      shared `inflictPsycheStress` helper).
    - The being carries the `fear` status while any fearful source is active, and an
      informational **trauma-state card** reports the outcome (state, PSY gain, and
      effect notes — Block/Dodge only, must-flee, Helpless).

    The pure rule mapping lives in a Foundry-free `fear` module (`fearStateFromTest`,
    `fearPsyGain`, `mostSevereFear`, and the effect predicates); the per-turn recovery
    retests and the combat enforcement of the defense/flee restrictions are wired with
    the combat-turn work.

    Part of #548. Closes #558.

- 7ec8f61: **Being sheet: correct actor→actor drag semantics (move, with quantity)**

    Dropping an item onto an actor now behaves by source. Compendium and world items
    still **clone** onto the actor (all kinds). An item that lives on **another
    actor** is now **moved** — created here and removed from the source — instead of
    duplicated:
    - **Non-gear** (skill, trait, …) moves the instance.
    - **Physical gear** moves with quantity: a **"How Many?"** dialog for stacks
      greater than one splits the stack (dest += chosen, source −= chosen, source
      removed when all moved). The dialog is skipped for a single item and for a
      **shift-drag**, which moves the whole stack. Moving requires owning the source.

- 8c2ce3b: **Assisted dodge: skill ML cells are rollable on the Skills tab**

    The skills tab now has a clickable mastery-level value for every skill (displayed in the `ML` column). Clicking the ML rolls a success test via `SkillLogic.successTest`, matching the roll pattern of the combat tab's attack/block/counterstrike cells. Hold Shift to skip the dialog.

    **Changes:**
    - `BeingSheet` — adds a `rollSkillTest` action handler (`_onRollSkillTest`) that reads the skill item from the clicked row's `data-item-id`, then calls `skillLogic.successTest(context)`.
    - `templates/actor/being/skills.hbs` — the ML cell gains `class="rollable"` and `data-action="rollSkillTest"`.

    _The Dodge skill is the primary consumer (it is the only defensive skill offered in the automated-combat flow), but all skills in the tab are now directly rollable._

    Closes #187.

- 5fd54f4: **Being Combat tab: Body Locations tree**

    The Combat tab now shows a read-only **Body Locations** tree — each body **part**
    with its hit **locations** (the current model has parts and locations; the old
    zone grouping is gone). Every location shows its covering armor **Layers**
    (material list), hit **Prob**ability, **Shock**, **Impair**ment, and per-aspect
    protection **B / E / P / F** as the **effective total** — natural `protectionBase`
    plus the aggregate of all currently-worn armor mapped to that location. The part
    header shows the **Held** item, and a search box filters locations by name.

    The view is read-only (no add / remove / rearrange — that lives on the Lineage
    sheet). Layer/total contributions require worn armor whose covered locations are
    stored as location shortcodes; compendium armor still stores them as names
    (#249), so its contribution won't appear until that lands.

- 9e8a373: **Implement chat-card edit-action dispatch**

    Clicking the edit icon on a posted chat card (standard-test, opposed-result) now re-runs the named action on the owning document instead of silently doing nothing.

    **Changes:**
    - `chat-card-dispatch.ts` — adds `dispatchChatCardAction(logic, btn)`: reads `dataset.action`, builds an `SohlActionContext`, looks up the action in `logic.actions` (by name, executor id, or title), falls back to a direct method call, and warns via `sohl.log.warn` when nothing matches. The two dead no-op exports (`onChatCardButton`/`onChatCardEditAction`) are removed.
    - `SohlItem.onChatCardEditAction` — replaces the `TODO(#66)` stub: ownership-gated (`this.isOwner`), then delegates to `dispatchChatCardAction(this.logic, btn)`.
    - `BeingLogic.onChatCardEditAction` — same pattern: ownership-gated (`this.actor?.isOwner`), then delegates to `dispatchChatCardAction(this, btn)`.

    _Ownership check applies per #167's guidance (edit path only; the button path is tracked separately under #167)._

    Closes #66.

- 1a473b6: **Combat Technique skill subtype: model + mastery-level wiring**

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

- 07a5968: **Feature: custom item creation from the Being sheet via a `createDialog` flow**

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

- 2b6564d: **Drag-and-drop items from a compendium or the world onto a Being**

    Dropping an Item onto an actor sheet now creates it. The Being sheet is built on
    `DocumentSheetV2` (not `ActorSheetV2`), so it inherited no item-drop handling and
    dropping a compendium or world item did nothing. `SohlActorSheetBase` now
    overrides `_onDropItem` to create the dropped item as an embedded **clone** on
    the actor (all item kinds). An item already embedded on the same actor is ignored
    (no duplicate), and a second **lineage** is refused (the lineage is a singleton).

- 4cec7b3: **Gate armor aggregation and combat-tab weapons on equip/hold state**

    The combat tab now only shows weapons the character is actively holding (gripped by a body part), and armor protection is only aggregated onto body locations for armor that is currently equipped. Previously both operations ignored equip/hold state entirely, so an unequipped suit of plate armor would still protect the wearer and an unheld weapon would appear in the strike-mode list.

    **Changes:**
    - `BeingLogic.aggregateArmorProtection` — filters to `isEquipped` armor before building the layer list; unequipped armor no longer contributes to `bodyLocation.armorProtection`.
    - `being-sheet-view.ts` — adds the pure `filterHeldWeapons` helper (testable without Foundry).
    - `BeingSheet._prepareBeingContext` — applies `filterHeldWeapons` before `splitWeaponsByRange`; only held weapons reach the melee/missile display lists.

    _This is a consistency fix: `reach` and `availableStrikeModes` already required the weapon to be held; armor aggregation and the combat-tab weapon rows now follow the same rule._

    Closes #180.

- 0755468: **Add `setEquipped` / `setNotEquipped` / `holdItem` / `releaseItem` intrinsic actions to `GearLogic`**

    Previously there was no write path to `system.isEquipped` or to `bodyPart.heldItemId` — the fields existed and were read by derived logic, but nothing in the system ever wrote them. This left equip state and weapon-hold state permanently inert.

    `setEquipped` / `setNotEquipped` mirror the existing `setCarried` / `setNotCarried` pattern and write `system.isEquipped` on the gear item. `holdItem` finds the first free hold-capable body part(s) on the owning actor's lineage and writes `heldItemId`; `releaseItem` clears `heldItemId` on every part gripping this item. The minimum grip count is controlled by the protected `minPartsToHold` getter (default 1), which weapon subclasses can override. All four actions are registered in `defineIntrinsicActions` and have `lang/en.json` titles.

    Closes #179.

- ff4abe3: **Gear state controls: carried / worn toggles and per-limb Held Items**

    Two ways to set a Being's gear state:
    - **Carried** (sack) and **Worn** (armor icon) per-row toggles on the Gear tab flip `isCarried` / `isEquipped` (worn armor feeds body-location protection totals). These controls previously rendered as indicators only; they now dispatch actions.
    - A **Held Items** section on the Combat tab (below the strike modes) with **one dropdown per hold-capable limb**. Each dropdown lists the actor's holdable gear — weapons and misc gear that are **not** stowed inside a container — plus a blank option. Selecting an item makes that limb hold it; blank releases it. A **two-handed** weapon is held by selecting it in **both** limbs' dropdowns. Held weapons feed the strike-mode sections.

- 6fb96f8: **Combat tab: Lineage row**

    The Being Combat tab now shows the actor's **Lineage** (below the strike modes and Held Items, above the body-structure display). Because a being's lineage is a singleton, the row reflects that:
    - When a lineage exists: its name is shown with **Edit** (opens the Lineage sheet) and **Delete** (confirmed removal) anchors, and the **+ Add** control is disabled.
    - When none exists: **+ Add** is active (creates a lineage), and a hint notes that a lineage usually arrives by drag-and-drop and that a being with no lineage has no body.

    Adds generic `editItem` / `deleteItem` sheet actions (open sheet / confirm-delete by `data-item-id`).

- 9052402: **Enforce Lineage as a singleton on an actor**

    A being may have at most one lineage (zero — a bodyless spirit — is allowed; more than one never is). This is the hard data-layer guard, covering every path rather than just the sheet UI:
    - **Embedding a second lineage** (drag-drop, paste, `createEmbeddedDocuments`) is refused — `LineageDataModel._preCreate` vetoes the creation when the actor already has one.
    - **An actor created with multiple lineages** (e.g. duplicating an already-invalid actor, or a bad import) is pruned to the first — `SohlActor._onCreate` removes the extras once the actor and its items exist (the parent's `_preCreate` cannot filter bundled embedded items).

    Deleting the lineage is still allowed.

- 3ea7497: **Being Profile — Affiliations section**

    The Profile tab's Affiliations section now renders as a full sectioned list — **Rank / Society / Office / Title / Notes** columns — with a per-row context-menu kebab and a **+ Add** control that creates a new affiliation via the create dialog. The section is always shown (even with no affiliations) so the first one can be added directly from the sheet, and rich-text notes are reduced to a plain-text snippet so they read cleanly in the table. Row shaping lives in a pure, Foundry-free `buildAffiliationRows` helper.

- 22dadad: **Being Profile tab: Attributes section**

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

- f8d9475: **Being Profile — Traits section**

    The Profile tab now renders a character's traits grouped by subtype. Each group shows a legend with the localized subtype label and a per-section **+ Add** control that creates a new trait pre-seeded with that subtype. Traits render in **Intensity / Value / Notes** columns (intensity shown as its localized label; value as the numeric mastery level for numeric traits or the free-text value otherwise), each with a context-menu kebab. Groups are ordered by the trait-subtype definition order, and every defined subtype is always shown — even with no traits — so its **+ Add** control is always available.

- cb94697: **Skill sheet: strike-mode editor for combat-technique skills**

    The Skill item sheet now shows a strike-mode editor — Strike Mode (name, min
    parts, length, and an optional governing-skill override), Attack (spread,
    modifier), Impact (dice/die/modifier), and, for melee, Defense (block,
    counterstrike) — but **only** when the skill's subtype is `combattechnique`. It
    is hidden for every other skill subtype. Leaving the governing-skill override
    blank drives the technique's Attack/Block/Counterstrike from the skill's own
    mastery level; setting it to another skill's code borrows that skill's mastery
    level instead.

- 68e813a: **Reimplement the Being sheet Skills tab**

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

- ab3ae37: **Being Combat tab: derived Melee / Missile Strike Mode sections**

    The Combat tab's weapon sections are now **Melee Strike Modes** and **Missile
    Strike Modes**, aggregating strike modes from **combat-technique skills** (always
    available — they belong to the being) as well as **held weapons**, grouped by
    their source item. Each row keeps the clickable **Atk / Blk / CX** cells (the
    assisted-combat entry points) and the impact roll; a combat technique's cells are
    driven by its skill's mastery level. Unholding or removing a weapon drops its
    strike modes; technique modes come and go with the skill.

- bd8b2b4: **"Use Zone Die" world setting (HMK compatibility)**

    Add a world-level boolean setting **Use Zone Die**. It toggles how a melee strike
    mode's spread is presented on the Combat tab — the same `spread.effective` value
    shown either as a Spread radius (column **Spr**, value `{n}`) or a Zone Die
    (column **ZD**, value `d{n}`). Spread is SoHL's radius-in-feet replacement for
    HameMaster's Zone Die and is numerically identical (a Spread of 6 is a `d6` Zone
    Die), so the switch is presentation-only and effects stay compatible. Off by
    default.

- 6e13832: **Sanitize chat/dialog HTML with Foundry's allowlist sanitizer**

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

- 35ec141: **Foundry-free combat strike-mode collection and chat addressing**

    The combat helpers and the Being combat-resume flow no longer reach the Foundry
    actor for items or chat-target identity.
    - `collectBlockableStrikeModes`, `collectAttackableStrikeModes`,
      `hasMeleeAttackStrikeMode`, and `resolveSkillMasteryLevel` now take the actor
      **logic** and iterate `logicTypes` / `getItemLogic` rather than `itemTypes`.
    - Combat chat cards address the defender via the logic's own `name` and (opaque)
      `uuid`, and the opponent via an opaque `attackerAddress` (name + uuid) carried
      on the counterstrike context and resolved in the scene layer. Emission still
      goes through `SohlSpeaker#toChat`.

- 35ec141: **Foundry-free combatant logic (`CombatantLogic`)**

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

- 35ec141: **Foundry-free logic-layer data port**

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

- a714f94: **Generic scheduled actions — `system.scheduledActions` + `sohl.schedule`**

    The foundation for data-driven recurring schedules on a SoHL document (epic
    #588): a document can defer an action without bespoke schema fields.
    - **`scheduledActions`** on the base `SohlDataModel` (beside `actionDefs`), so it
      is carried by every document whose data model extends that base — **actors,
      items, and combatants**. Scenes and active effects extend `TypeDataModel`
      directly and cannot host a schedule. Each entry is
      `{ actionName, anchor, interval, payload }`; logical identity is `actionName`
      and the fire time is `anchor + interval`.
    - **`sohl.schedule(doc, actionName, interval, payload?)`** — does both halves:
      persists the whole `system.scheduledActions` array (the durable record, anchored
      at the current world time) **and** arms the event queue (the live entry), so the
      action is offered as a `[Perform]` reminder when due. **`sohl.unschedule`** clears
      the entry and unsubscribes. Both derive the fire time from one
      `(anchor, interval)`, so they can't drift.
    - **`armScheduledActions(uuid, list, queue)`** — the Foundry-free, load-side
      re-arm routine (read `system.scheduledActions` → `scheduleAt` each), used by the
      `ready` hook below.

    Part of #588. Follow-up: the migration of trauma/affliction's bespoke
    `recurringPhaseFields` onto this store.

- 223b6b1: **Impaired-but-usable body part penalizes a test's mastery level (#568)**

    Complete the Injury rules' _Indefinite Impairment_ table: a body part that is
    injured but still usable now imposes its **−5** (minor) / **−10** (serious)
    penalty on the effective mastery level of any test that depends on it. This is the
    numeric counterpart to the already-shipped auto-Critical-Failure for an _unusable_
    (grievous) part.
    - A being exposes `impairedRolePenalties()` — each body-part **role** it can still
      use but is impaired in, mapped to the worst (most negative) −5/−10 penalty among
      the usable parts carrying that role. Unusable parts are excluded — they force an
      auto-Critical-Failure, not a number — so the two views never overlap.
    - A mastery-level test whose governing skill/attribute lists any of those roles in
      its `impairedByRoles` takes the worst matching penalty as a labeled mastery-level
      delta, applied in `MasteryLevelModifier.successTest` right where the auto-CF is
      computed. The decision is a Foundry-free helper (`testImpairmentPenalty`); it is a
      strict no-op for a test with no `impairedByRoles` or an actor with no impaired
      parts, and a resumed `priorTestResult` is not penalized twice.

    Also adds the missing unit coverage for the prone (−20 melee) penalty on a combat
    technique's own strike mode (`SkillLogic`), the sibling of the weapon path shipped
    with #562.

    The strike-mode required-limb (`minParts`) auto-CF variant, and the remaining prone
    clauses (Engagement-Zone / body-part-selection / Outnumbered interactions and the
    quarter-Move cost to rise), remain follow-ups — they need subsystems that do not
    exist yet.

    Part of #548.

    Closes #568

- c805aa2: **Infection lifecycle**

    A poorly-treated wound can now fester into an infection, completing the injury
    recovery model (the deferred infection branch of #486).
    - **Infectable wounds** — the Treatment Test (#553) now marks a wound `infectable`
      when it is treated poorly (a failed roll); a marginal/critical success clears
      the risk.
    - **Contraction** — a Critical-Failure Injury Healing Test on an infectable wound
      contracts an **infection**: a separately-recorded `infection`-subtype trauma
      (Injury Level "X", aspect "Inf") starting one Healing Rate step above the wound
      it came from.
    - **Halts injury healing** — while any infection is active (Healing Rate below 6)
      no Injury Healing Tests are made for the patient.
    - **Infection Healing Test** — the infection recovers through the shared course
      test (`Healing Base × Infection Healing Rate`, fatigue applies): the Healing
      Rate shifts by the result (CF −2 / MF −1 / MS +1 / CS +2, floored at 1 — an
      infection never kills), it saps weakness fatigue by its Healing-Rate band
      (HR 1–2 → 10, HR 3–4 → 5, HR 5+ → none), and at Healing Rate 6 it heals, letting
      normal injury healing resume.

    Closes #557
    Part of #548

- c805aa2: **Injury Healing Test effect**

    An `injury`-subtype trauma now heals over time: its recurring `healingCheck`
    applies the **Injury Healing Test** at each elapsed checkpoint, in sequence. Each
    is a headless test of `Healing Base × Healing Rate` — a marginal success reduces
    the Injury Level by 1, a critical success by 2; a marginal failure does nothing;
    a critical failure does no healing (infection-on-CF is completed by the Infection
    work, #557). No test is made while the injury is untreated, already healed, or
    while any active infection halts the patient's healing. A shared `rollTimedTest`
    helper wraps `successTest({ skipDialog })` for the timed effects. Part of #548.
    Closes #486

- c805aa2: **Permanent impairment from slow-healing wounds**

    An eligible injury that takes a long time to heal now leaves a **permanent
    impairment** on its body part, completing the Injury Impairment model (the
    indefinite, severity-scaled impairment already tracked down as a wound heals is
    #464).
    - New Foundry-free `permanentImpairmentFor(days)` (time-to-heal table: none under
      20 days, then −5 per completed 20-day band, floored at −25).
    - When `TraumaLogic.healingCheck` heals an eligible injury (flagged by the
      Treatment Test, #553) to Injury Level 0, it records the permanent impairment on
      the injured body part via `BeingLogic.applyPermanentImpairment`, which worsens
      the part's persisted `permanentImpairment` (worst-of) with a whole-array write.
    - The body-part impairment rollup already consumes `permanentImpairment` as a
      floor, so the impairment persists after the wound itself has healed.

    Closes #554
    Part of #548

- c805aa2: **Injury Shock Test — a wound drives the being's shock state**

    The injury card's **Shock Roll** button is now wired: when a wound calls for a
    Shock roll, resolving it computes the wound's **Shock State Index** and worsens
    the being's shock state accordingly.
    - The button (`data-action="injuryShock"`) carries the wound's precomputed shock
      contribution (body-location Shock Value + Injury Level, including the
      glancing-blow point) and the glancing-blow roll bonus.
    - `BeingLogic.injuryShock` rolls the **Shock** skill headlessly — the being's
      fatigue penalty applies and the glancing bonus is added, but injury-impairment
      penalties do not — and its result adjusts the Shock State Index (CF +2 / MF +1 /
      MS 0 / CS −1). The index maps to a shock state (`≤6` None … `≥10` Dead), and the
      being is worsened to it (an injury never improves an already-worse state).
    - New pure helpers `shockStateFromIndex` and `shockIndexAdjustment` in the
      Foundry-free shock module.

    Closes #555
    Part of #548

- c805aa2: **Injury Treatment Test — establish an injury's Healing Rate**

    A `trauma` of subtype `injury` now supports the Physician **Treatment Test** that
    establishes its Healing Rate, unblocking the Injury Healing Test (#486, which
    assumes the rate is already set).
    - **Treatment Test action.** The `treatmenttest` intrinsic action rolls the
      owning being's **Physician** skill headlessly at the difficulty of the wound's
      _required treatment_ (looked up from the wound's aspect and severity band), and
      maps the result and severity to the injury's Healing Rate. A `HEAL` result (a
      critical success on a minor wound) heals the wound outright.
    - **Untreated resolves as a Critical Failure.** With no owning being able to roll
      (a headless/GM context, pending the interactive physician card of #547), the
      treatment auto-resolves as though the Physician roll were a Critical Failure.
    - **Special injury effects.** A surgical mishap (`EXT`/`SUR` treatment on a
      failure) or a grievous blunt/edged/piercing wound left at Healing Rate 2–3
      becomes a **bleeder** (arming the blood-loss timer, #487); and the wound is
      flagged for **permanent-impairment eligibility** (new
      `system.permanentImpairmentEligible` field) per its aspect, severity, and
      Healing Rate, for the Impairment system (#554) to apply.
    - The lookup tables live in a new Foundry-free `entity/body/injury-treatment`
      module. The `Frost` and `Projectile` aspects (and the amputation path) named in
      the rules are not yet representable in the impact-aspect model and are deferred.

    Closes #553
    Part of #548

- 93449c0: **Character-sheet release readiness (#491)**

    Gear drag-and-drop and sorting on the Being sheet, editable array fields on item sheets, and removal of dead UI and an orphaned document type — the gaps between "sheets render" and "open every sheet and set every property."
    - **Gear drag-and-drop and sorting (#492, #493, #494).** Gear rows on the Being sheet's Gear tab are draggable again (the drag selector matched no markup). Dropping gear onto a container — its header or its contents — moves the item into that container; dropping it outside any container returns it to On Body; dropping it onto another item reorders the list. Containment is by `system.containerId` reference, since items are never embedded in items.
    - **Array-field editors (#497).** Array-valued item properties can be added, edited, and removed from the sheet again — armor coverage locations (flexible / rigid), mystery skills, and trait and attribute value descriptors and impaired-by roles. The whole array is written back on each change (never an element by index).
    - **Removed the orphaned `combattechnique` item type (#498)** from the manifest; it had no data model, logic, or sheet and produced a broken item from the Create dialog. Combat techniques exist only as a `skill` subtype.
    - **Removed dead item-sheet controls (#499).** Effect and action management controls with no working handlers are no longer rendered; effects and actions still display read-only. Wiring that management is tracked in #501.
    - **Removed dead item-sheet drop code (#495)** that embedded items inside items — the wrong containment model.
    - **Tests (#496, #500).** New end-to-end coverage drives real gear drop-to-container and drop-to-reorder events on the Being sheet; the shared item-sheet suite now also sweeps select and checkbox fields and guards that every rendered `system.*` input maps to a schema field.

- a03ba18: **Enforce `(type, shortcode)` as a unique item and actor key**

    Every SoHL item and actor now carries a non-blank `shortcode`, and
    `(type, shortcode)` is a **unique key** — per owning actor for embedded items, and
    per world for world actors and world items. This gives each document a stable,
    unambiguous handle for lookup and cross-references (weapon `assocSkillCode`,
    cohort members, birthsign terms) instead of relying on ambiguous names.

    **Enforcement (in `_preCreate`).** The key is resolved against its scope,
    honoring what the caller supplied and how the create was initiated:
    - _No shortcode supplied_ (system-generated or ad-hoc creates — a trauma from an
      injury, an API create) — one is **derived from the name and uniquified**, so
      programmatic creation can never fail on the key. This is the same fill +
      uniquify the create dialog offers a human, applied to every path.
    - _Explicit shortcode, Foundry duplicate_ ("copy this document"; Foundry stamps
      `_stats.duplicateSource`) — **auto-uniquified** (`arrow` → `arrow2`) so
      Duplicate keeps working. The prior prototype clone mechanism (`cloneActorUuid` /
      items-present heuristic) is dropped in favor of Foundry's native duplicate.
    - _Explicit shortcode, general create_ (dialog, drag, API) — the caller asked for
      that specific code; a collision is **rejected** (intent is unknown — they may
      be unaware it is taken).

    **Create dialog.** The shared create dialog pre-fills a unique shortcode from the
    name and keeps it in sync as you type (until you edit it), mirroring the existing
    name-uniquify — so the human flow always yields a valid, unique key.

    **Data.** The packaged _Basic Folk_ actor is backfilled with a `basicfolk`
    shortcode (its `system.shortcode` was blank).

    Closes #347

- 4b65b2a: **Lineage: per-movement-medium data accessors + ground-up carried weight**

    Adds medium-aware read accessors to `LineageLogic`, each taking an optional
    `medium` that defaults to `defaultMoveMedium`:
    - `getMoveBase(medium?)` — the persisted per-medium `moveBase` scalar.
    - `getFeetPerRound(medium?)` / `getLeaguesPerWatch(medium?)` — the matching
      movement profile's tactical / travel speed.
    - `getEncumbrance(medium?)` — the profile's `encumbrance` `SafeExpression`
      evaluated against the being's carried weight (`wt`).
    - `getStrMod(medium?)` — the profile's `strMod` `SafeExpression` evaluated
      against the being's strength (`str`).

    The expression accessors read context from the owning being; with no owning
    being (or no strength attribute), `str`/`wt` default to `0`, and a missing
    profile yields `0` — the accessors never throw.

    Introduces a ground-up **carried-weight** mechanism: each carried gear item adds
    its `weight × quantity` to the owning being during its own `evaluate()` phase,
    exposed via a new **`BeingLogic.carriedWeight`** getter (reset each prepare
    cycle). `LineageLogic.getEncumbrance` reads it for `wt`.

    Closes #367

- d03d134: **Lineage: expression-driven movement-profile paradigm**

    The Lineage item replaces its flat `encumbranceRate` / `bodyWeightBase` scalars
    with a data-driven, per-medium model:
    - **`movementProfiles`** — one entry per movement medium, each carrying
      `feetPerRound`, `leaguesPerWatch`, and `SafeExpression`s for `encumbrance`
      (of carried weight `wt`) and `strMod` (of `str`).
    - **`personalFatigue`** — a `SafeExpression` of encumbrance (`enc`).
    - **`bodyWeight`** — either a fixed `base` (pounds) or, when `base` is null, a
      `SafeExpression` `calc` of the being's strength (`str`).

    `LineageLogic` gains a **`baseWeight`** getter that returns `bodyWeight.base`
    when set, otherwise evaluates `bodyWeight.calc` against the owning being's `str`.
    The per-medium `moveBase` scalar (which Active Effects target and the movement
    system reads) is mirrored from each profile's `feetPerRound` during export, so
    compendium lineages no longer ship an empty `moveBase`.

    The pack exporter and the Human Folk compendium source are updated to the new
    format. Supersedes the interim `encMod` carry-capacity field.

    Closes #365

- 2ede925: **Morale, Rally, and Reaction tests (#559)**

    Implement the **Morale Test** (a test of the **Initiative** skill) and its states,
    the **Rally Test**, and the **Reaction Test**.
    - **Morale Test** — a self-sufficient Being action mapping the roll to a morale
      state (Brave / Steady / Withdrawing, and the CF0/CF5 split of Catatonic vs
      Routed). Each morale-failure source is a `morale`-subtype trauma; the effective
      state is the most severe active one. Routed grants **+1** and Catatonic **+2**
      Psyche Stress; a Brave result grants the shared five-minute **+20** to Morale and
      Fear tests.
    - **Reaction Test** — an Initiative test a shaken combatant makes to shake off the
      state: on success a Catatonic victim improves to Routed and any other shaken
      victim snaps back to Steady; on failure it persists.
    - **Rally Test** — a leader's Command/Initiative test. Under the Prime Directive a
      rally is **offered, not imposed**: on a success it posts an **open** action card
      any shaken ally's controller may accept to steady their own character (CS) or make
      a Reaction Test (MS); a failure posts an informational card noting the lockout.

    The pure rule mappings live in a Foundry-free `morale` module
    (`moraleStateFromTest`, `moralePsyGain`, `reactionOutcome`, `rallyOutcome`, and the
    effect predicates), reusing the shared state-ladder recorder with fear.

    Part of #548. Closes #559.

- c49874f: **Consistent null / undefined convention: null at the edges, undefined in the core**

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

- 0ad8a5b: **Offer the affliction onset check at contraction, instead of auto-arming**

    Closes out the "nothing auto-schedules" migration (issue #579): the **last**
    creation-time auto-schedule — an affliction seeding its own `onsetCheck` when
    created — is now an **offer**, matching healing / blood-loss / course.
    - `AfflictionDataModel._preCreate` seeds only the cadence config (`contractDate`,
      `onsetDurationBase` from `onsetDurationFormula`) — no `onsetCheck` schedule.
    - `BeingLogic.contractDisease` (the designed contraction path: contagion test →
      on failure, create the affliction) then **offers** the onset check via the
      shared `offerSchedule`. Accept schedules it, decline clears it; a scripted
      caller pre-answers via `scope.schedule` or suppresses with `skipDialog`. The
      offer's per-effect title is "Set an Affliction Onset Reminder?".
    - **Unchanged:** the onset _phase transition_ (`AfflictionLogic.onsetCheck`) still
      auto-schedules the resolution + recurring healing checks — that is the disease
      progressing as the direct consequence of a human-performed step (consent-gated
      by #587), not a creation-time auto-schedule. The recurring healing check already
      offers its reschedule.

    _Behavior note:_ a disease created by a raw drag (bypassing `contractDisease`,
    like a direct `createEmbeddedDocuments`) no longer auto-onsets — consistent with
    how direct trauma creation bypasses its offer. The GM triggers onset via the
    action.

    With this, **every** recurring timed effect — healing, blood-loss, course, onset
    — is armed only at a human's behest, at creation and on every re-schedule.

    **Tests.** Unit tests cover the offer (accept → `sohl.schedule`; decline →
    `sohl.unschedule`). A new button-driven e2e (`affliction-onset-offer.cy.js`)
    contracts a disease end to end — forcing the contagion d100 to fail
    (`SimpleRoll.forceValues`, #598), pressing through the pick and success-test
    dialogs, then pressing **Schedule** / **Not Now** on the onset offer and asserting
    the onset check is armed / left unarmed.

    **Also fixes the pre-existing affliction e2e breakage (#570).** The #565 subtype
    reorg left the e2e factory and several specs creating afflictions with removed /
    moved subtypes (`privation`, `fatigue`), which fail `choices` validation and
    create a typeless document — so 5 affliction specs were red on `main`. Updated to
    the post-#565 taxonomy: the affliction factory default is `other`; the
    afflictions-section fixtures use valid affliction subtypes; and the header
    Fatigue-indicator spec now creates a **fatigue trauma** (fatigue is a trauma
    subtype now, and the indicator lights from active traumas).

    Closes #602, #570. Refs #579, #595, #598.

- 89bea7f: **Offer blood-loss and recovery-course schedules too, instead of auto-arming**

    Completes the "nothing auto-schedules" migration for timed effects (issue #579):
    the two remaining recurring checks that still armed themselves — a bleeding
    wound's **blood-loss advance** and a lasting condition's **recovery course** — are
    now **offered**, matching the healing-check offer.
    - **Blood-loss** is offered wherever a wound starts bleeding: when an injury bleeds
      on infliction (`createTraumaFromInjury`) and when a treatment leaves it bleeding
      (`TraumaLogic.treatmentTest` — was an auto-`sohl.schedule`).
    - **Recovery course** (`courseCheck`) is offered when its lasting condition is
      created: an **Extended Shock / Coma** from a shock re-test
      (`BeingLogic.createLastingShock`) and an **infection** from a critical-failure
      healing test (`TraumaLogic.contractInfection`).
    - **`TraumaDataModel._preCreate` no longer seeds any recurring schedule** — only
      the cadence config (the offer's default). Each creating action forwards its
      context, so the interactive path prompts (a dialog, per the prefer-dialog rule)
      while a scripted/bulk caller can pre-answer (`scope.schedule`) or suppress it
      (`skipDialog`).
    - **Per-effect offer titles.** Because a bleeder wound now fires two offers
      back-to-back (healing check, then blood-loss advance), each schedule offer's
      title names its effect — "Set a Blood Loss Advance Reminder?" instead of two
      identical "Set a Reminder?" dialogs — so the player can tell them apart. The
      whole title is one localization string (`SOHL.Schedule.title`, with an
      already-localized `{actionName}`) so translations control word order.

    With this, every recurring timed effect — healing, blood-loss, course — is armed
    only at a human's behest, at creation and on every re-schedule.

    **Tests.** A new e2e (`timed-effect-creation-offer.cy.js`) presses the _real_
    offer buttons, modelling the player per the testing-doc rule of thumb: pressing
    Schedule / Not Now on the **blood-loss** offer arms / leaves it unarmed, and a
    **critical-failure healing test** (driven deterministically via the forced-dice
    seam, `SimpleRoll.forceValues(100)`) contracts an infection whose **recovery
    course** offer is then Scheduled by button. Two new reusable Cypress commands
    support it — `cy.submitDialogMatching(text, action)` to answer a specific one of
    several look-alike dialogs by content, and a hardened `cy.submitDialog` that only
    targets a _rendered_ dialog (Foundry retains closed dialog instances, whose stale
    elements otherwise leak across tests).

    Refs #579, #598.

- 76aa4fb: **Offer to schedule a wound's healing check at creation, instead of auto-arming**

    Creating an injury no longer silently arms its healing check — the last spot where
    a timed effect scheduled itself without a human (issue #579, completing the
    offer-to-reschedule work). When a wound is recorded, the system now **offers** to
    track its healing: a dialog (default **Schedule**, showing the rolled cadence —
    "in 5 days") shown to the player who took the wound, on their own client. They hit
    OK to track it, adjust, or decline.
    - **A dialog, not a card — because the responder is _me_.** The chat-card
      `[Perform]` buttons exist for a response deferred to later or to someone else; a
      choice the acting human makes here and now (I just took this wound) is a dialog.
    - **No auto-arm at creation.** `TraumaDataModel._preCreate` seeds only the config
      (contract date, the cadence formula/base); `createTraumaFromInjury` then calls
      the shared offer. Both `createInjury` paths (automated aim, assisted dialog)
      forward their context, so a scripted/bulk caller can pre-answer via
      `scope.schedule` or suppress with `skipDialog` — but the interactive path prompts.
    - **The offer helper is generalized.** `offerReschedule` → **`offerSchedule`**
      (same mechanism serves the first schedule and the re-schedule); its dialog now
      leads with **Schedule** as the default and shows the interval, so accepting is a
      single OK. Lang keys `SOHL.Reschedule.*` → `SOHL.Schedule.*`.

    Scope: this covers the injury **healing check** (the player-facing flow).
    Blood-loss / lasting-condition course / affliction onset still auto-arm at creation
    for now — separate follow-ups.

    Refs #579.

- 2ede925: **Prone combat penalty (#562)**

    Wire the core mechanical effect of the prone condition: a **−20 to all melee
    attacks and defenses**. When a wielder carries the `prone` status, each melee
    strike mode's **attack**, **Block**, and **Counterstrike** modifiers take a −20
    penalty — applied imperatively during preparation (in `WeaponGearLogic.evaluate`
    for weapons, and in `SkillLogic.finalize` for combat techniques that carry their
    own strike mode), the same way body reach is folded in, so the penalty is visible
    in the combat-tab effective mastery level as well as at roll time.

    The pure application lives in a Foundry-free `prone` strike-mode helper
    (`applyProneMeleePenalty` / `PRONE_MELEE_PENALTY`). The remaining prone effects —
    the Engagement-Zone, body-part-selection, and Outnumbered interactions, and the
    quarter-Move cost to rise — belong to those subsystems and are follow-ups.

    Part of #548. Closes #562.

- 2ede925: **Psychological Condition & Aural Shock (#560)**

    Implement Psyche Stress Levels (PSY) and Aural Shock as psyche traumas, with their
    recovery tests.
    - **Psyche Stress Recovery Test** — a `psycond`-subtype condition recovers through
      a recurring Will test (every d6 days; fatigue does not apply). `MS`/`CS` recover
      −1/−2 PSY; a Critical Failure is a **Grievous Stress** that turns an _indefinite_
      condition **permanent** (or raises a permanent one's PSY by 1). An indefinite
      condition goes away when its PSY reaches 0. The recovery is a self-sufficient,
      offered action (issue #579) — it never auto-fires.
    - **Aural Shock** — an `auralshock`-subtype trauma (1–6, stacking) that inflicts 5
      Weakness Fatigue per level and recovers through a daily Will test (`MS`/`CS`
      recover −1/−2 AS; a Critical Failure grants +1 PSY). Recovered when AS reaches 0.
    - **Shared inflictors** — `inflictPsycheStress` / `inflictAuralShock` record each
      instance separately, as the rules require. Fear and Morale route their PSY gains
      through the former.

    The pure rule mappings live in a Foundry-free `psyche` module
    (`psycheRecoveryOutcome`, `auralShockRecoveryOutcome`, `psychePresentation`,
    `weaknessFatigueForLevel`). The ~10-minute behavioral onset and the Aura-test
    lockout / automatic-critical-failure gating are follow-ups (the latter joins the
    test-resolution auto-critical-failure work).

    Part of #548. Closes #560.

- 1554361: **Document what SoHL is for, and the consent-dialog testing pattern**

    Now that the consent model reaches all the way to the timed-effect flows (issue
    #579), write down the two things that make it legible — one for players, one for
    contributors — and make the e2e suite model the pattern it now describes.
    - **User guide — "What to Expect: SoHL Assists, It Doesn't Play for You."** A short
      up-front section on the system's purpose (an _assistant_ for playing HârnMaster,
      not a video game that plays it for you) and the one rule everything follows: _it
      guides, prompts, and reminds — it never acts on your character without your
      say-so._ It explains the two shapes an offer takes (a **dialog** when the choice
      is yours here and now; a **chat-card button** when the response is deferred or
      belongs to someone else), that you can always ignore / do-by-hand / GM-override,
      and the pattern to expect throughout — _offer → remind → perform → offer the
      next_ — with a worked wound example. Patterns, not a per-flow catalog, so the
      guide stays lean.
    - **Testing doc — "Consent dialogs are landmines."** A new subsection on the e2e
      reality that a consent dialog hangs a headless run until something answers it.
      Two sanctioned ways: **press the real button** (`cy.submitDialog("<action>")`
      against a stable `data-action`) to model the user when the offer _is_ the subject
      under test; or **pre-answer / suppress** it (`{ skipDialog: true }`,
      `scope: { schedule: false }`, or inline `data-scope`) for setup. The rule of
      thumb: when you add an offer behind a human trigger, grep `cypress/e2e` for the
      specs that hit that seam and make each one answer it (and note that
      `createEmbeddedDocuments` bypasses the offer entirely).
    - **A button-driven e2e that follows the pattern.** `timed-effect-reschedule.cy.js`
      gains a companion test that presses the actual **Not Now** button on the reschedule
      offer and asserts the schedule clears — proving the button choice, not a scripted
      scope, drives the outcome, exactly as the doc recommends.

    Refs #579.

- b9e4972: **`sohl.utils` is now the full utils namespace, matching the docs (#408)**

    `sohl.utils` was bound to the `helpers` module alone, so documented accessors like
    `sohl.utils.ACTOR_KIND`, `sohl.utils.buildActionScope`, and
    `sohl.utils.collection.SohlMap` were `undefined` at runtime even though the
    namespace-tree docs render them under `sohl.utils`. It is now bound to the
    **`utils` namespace** — the superset barrel that re-exports the helpers and the
    constants at its top level and nests `collection` — so runtime and docs agree.

    `sohl.utils.romanize()` is unchanged (helpers are re-exported at the top level),
    and the curated `sohl.constants` alias is kept as-is
    (`sohl.constants.ACTOR_KIND`). The binding follows the same cycle-free pattern as
    `sohl.document` / `sohl.core` / `sohl.apps`: a type-only `declare` on `SohlSystem`
    plus a runtime assignment in `sohl.ts`. This completes the namespace-tree epic
    (#401).

- 35ec141: **Register the `attribute` and `lineage` item kinds**

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

- a1ce841: **Let variant modules override per-kind Logic classes**

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

- f3cc51a: **Remove the `__func__:` code reviver — untrusted data can no longer become executable (#170)**

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

- f8741ca: **Rename the Lineage item to Corpus (a being's physical body)**

    The item formerly called **Lineage** is now **Corpus**. It models a being's
    **physical body** — anatomy, body weight, reach, and per-medium movement — not
    its taxonomic kind. The tell: a being can validly have **no** corpus. Such a
    being is **incorporeal** (a spirit): no carry capacity, speed, encumbrance,
    strength modifier, or body structure. That is now a supported, first-class
    state — a being with no corpus no longer warns during preparation.
    - Item type `lineage` → `corpus`; `LineageLogic`/`LineageDataModel`/`LineageSheet`
      → `CorpusLogic`/`CorpusDataModel`/`CorpusSheet`; `BeingLogic.lineage` →
      `BeingLogic.corpus`.
    - The redundant `body` prefix is dropped from the corpus's own fields:
      `system.bodyStructure` → `system.structure`, `system.bodyWeight` →
      `system.weight`.
    - Cardinality is unchanged: 0 or 1 corpus per being, never more than one.

    **Migration.** A world migration runs once on `ready` (GM only, version-gated):
    it converts existing `lineage` items to `corpus` and de-prefixes their
    `bodyStructure`/`bodyWeight` fields, across world items and every actor's embedded
    items. The compendium is re-exported as `corpus`.

    **Compatibility note.** This renames a Foundry document sub-type and its
    localization keys (`SOHL.Lineage.*` → `SOHL.Corpus.*`, `TYPES.Item.lineage` →
    `TYPES.Item.corpus`) — a deliberate, migrated exception to the usual
    never-rename-keys rule, required because the sub-type key must match the new type.
    Downstream modules referencing the `lineage` item type, `SOHL.Lineage.*` keys, or
    the `bodyStructure`/`bodyWeight` fields must update to the corpus names.

    Closes #371

- 9dc1de6: **Restore the Being sheet header: clickable status pills, health bar, body-location lozenges**

    Rebuild the Being sheet header to match the previous design, in `templates/actor/being/header.hbs`, `scss/layout/_sheet.scss`, and `src/document/actor/foundry/BeingSheet.ts`:
    - **Status pills** now look like the old rounded lozenges (grouped top-right, wrapping) and are **clickable to toggle** the status — a new `toggleStatus` action calls `actor.toggleStatusEffect(statusId)`, creating/deleting the active effect. Active pills are highlighted.
    - **Health bar** restored: a labelled, filled bar in the header (added `healthPct` to the header context).
    - **Body-location lozenges** restored as a read-only, full-width row beneath the main header, generated dynamically from the actor's Lineage body structure (`bodyStructure.parts`).

    Status `data-status-id`/tooltips and localization keys are unchanged.

- 06c7eac: **Retire the `combattechnique` item type**

    Combat techniques are now a `combattechnique` **skill subtype** (introduced in earlier work), so the standalone `combattechnique` item type is removed: its DataModel, Sheet, and Logic classes, its registration, its item-type enum entry and metadata, and its localization keys are all gone.

    **Combat machinery re-sourced from skills.** Reach, available/blockable/in-range strike modes, the melee-attack gating, and strike-mode pointer resolution now read technique strike modes off `combattechnique`-subtype skills (`SkillLogic.strikeMode` / `strikeModes`) instead of the retired item type.

    **Combat-tab section removed.** The Being sheet's Combat tab no longer renders a dedicated Techniques section. Technique strike modes will resurface through the aggregated Strike Modes view (tracked separately); until then, techniques are edited on the skill sheet.

- 2e22618: **Retire the `trait` item type**

    The `trait` item type is removed: its DataModel, Sheet, and Logic classes, its
    registration and per-actor logic accessors, its item-kind enum entry and metadata,
    its `TRAIT_SUBTYPE` / `TRAIT_INTENSITY` / `TRAIT_EFFECT_KEY` / `TRAIT_CODE` enums,
    and its localization keys are all gone. The Being sheet's Profile tab no longer
    renders a Traits section (and its `search-traits` filter is removed).

    **The trait data was already modeled elsewhere.** Descriptive personality and
    physique traits became Trauma conditions in the earlier trauma work; the remaining
    _measured_ physical stats are already first-class fields on the Being/actor data
    model after the Corpus→Being dissolution — Body Weight (`body.weight`), Move (the
    universal `currentMoveMedium` / `movementProfiles` capability), and Size's effects
    (`body.reachBase`, `body.bodyScaleBase`), with Carrying Capacity subsumed by the
    encumbrance system. The lone descriptive straggler, handedness, is remodeled as
    two `physcond` trauma items, **Right Dominance** and **Left Dominance** — a
    whole-side (not hand-only) preference; the ambidextrous have neither.

    **Legacy documents are flagged, not converted.** Surviving `trait` documents are
    **not** auto-migrated. On every GM world-load the system reports each one as an
    unrecognized retired type (console error plus a persistent UI notification) and
    leaves it untouched — the GM removes it or recreates its data as a
    `trauma`/`attribute` by hand. This avoids lossy guesswork about a removed type.

    Closes #651

- e1bd806: **Revert UI icons from the embedded SoHL icon font back to Font Awesome** (#505)

    Sheet and application UI icons use Font Awesome classes again instead of the embedded `sohl-*` icon font.

    Content glyphs that have no Font Awesome equivalent — creatures and animals, and domain / app-specific marks — keep the embedded `sohl-*` font.

- e059d09: **Docs: comprehensive SafeExpression authoring guide (#364)**

    The "Expressions and Scripts" concept doc now documents how to author a
    `SafeExpression` end to end: how it works (parse → static allowlist validation →
    hand-walked evaluation), the exact grammar (what is allowed and what is rejected
    at parse time), the **bindings each call site provides** (action `visible` /
    `trigger`, active-effect `test` for item and strike-mode scopes, context-menu
    `condition`, and Corpus movement-profile value fields), a full **reference table
    of the built-in helpers with their signatures and return values**, and worked
    examples for both predicates and computed values.

    It also fixes a rendering bug in the `SafeExpression` class documentation: the
    JSDoc `@example` tags were swallowing the prose sections that followed them, so
    everything after the first example rendered as preformatted text on
    api.heroiclands.org. Those examples are now inline fenced code blocks, and the
    class doc links back to the concept guide.

- 8714156: **SafeExpression is now a serializable entity with a shared helper registry**

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

- 68b00fc: **Add a comprehensive set of string helpers to `SafeExpression`**

    `SafeExpression` could compute numbers, booleans, comparisons, string literals, and
    `+` concatenation, but method calls are banned — so string handling beyond `lower`,
    `upper`, `startsWith`, `endsWith`, and `contains` was not expressible. That blocked
    computed **label/description** flavor text for author-supplied result-description
    tables (the `#202` feature line).

    Expand the standard expression-helper library with string operations, exposed as
    allowlisted helpers so the sandbox guarantees hold (no raw method access):
    - **Building/formatting:** `str`, `concat`, `capitalize`, `padStart`, `padEnd`,
      `repeat`
    - **Extracting:** `slice`, `substr`, `charAt`, `split`, `join`
    - **Searching/editing:** `indexOf`, `trim`, `replace` (literal, all occurrences)

    `replace` matches its search text literally (never as a regular expression), and
    `padStart`/`padEnd`/`repeat` refuse to build strings longer than 100,000 characters
    as a memory-exhaustion guard. Existing helpers (`lower`, `upper`, `contains`, `len`,
    `matches`, …) are unchanged.

    Closes #448

- a58cf1b: **Scene-region & environment event triggers — react to where characters are, not just when**

    The event queue now dispatches an **event-driven** family of triggers alongside
    time and combat: Foundry v14 scene-region events, plus scene darkness changes.
    This is the epic #593 bridge — the curated triggers, the GM opt-in surface, and
    the consent-gated offer.
    - **A "SoHL Event Trigger" RegionBehavior** (`trigger`) a GM drops onto a
      region to opt it into SoHL triggering. It forwards a **curated** event set —
      `regionTokenEnter` / `regionTokenExit` / `regionTokenTurn{Start,End}` /
      `regionTokenRound{Start,End}` — into the queue, GM-gated so it dispatches once
      (not once per client). Continuous / view-dependent streams (`tokenMove*`,
      `tokenAnimate*`) are deliberately excluded to keep the queue from flooding.
      Optionally names an **action to offer** the entering token's actor.
    - **`sceneDarknessChange`** — a scene environment trigger fired from
      `SohlHookBridge` on `updateScene` when the darkness level changes.
    - **Consent throughout.** A due region trigger surfaces as an owner-gated
      `[Perform]` reminder — no character is acted on without a click. Both hosts
      work: a region-authored action, and a per-character `sohl.events.subscribe(...)`
      scoped by predicate on `regionId` / `actorUuid`.
    - **Event-driven contract.** These triggers have no `fireAt`, so `nextFireTime`
      is `undefined` by design; the generic run record (`system.lastRun`) answers
      "when did this last happen here?".

    A new consent primitive `sohl.events.offer(uuid, actionName, ctx)` is extracted
    from the queue's existing reminder path and reused by the region bridge.

    Closes #593, #606, #607, #608

- 26dddf8: **Scene-scoped scheduled actions — `sohl.schedule(..., sceneUuid?)`**

    A scheduled action (#588) can be bound to a scene so it fires only where it
    belongs — bandits at a hideout, a hazard on a caravan path — instead of ticking
    world-wide (issue #590).
    - **`sohl.schedule(doc, actionName, interval, payload?, sceneUuid?)`** — the new
      optional `sceneUuid` persists to the `system.scheduledActions` entry (blank =
      world-wide) and is threaded through the arm half. `armScheduledActions` restores
      it on reload.
    - **Gate at offer time.** `SohlEventQueue.fire` skips a due, scene-bound
      subscription while its scene is not the active scene (`fvttActiveSceneUuid`) —
      **without consuming it**, so it stays armed and surfaces when the scene next
      becomes active (a check that came due while away is waiting on return). A
      world-wide schedule (no `sceneUuid`) is unaffected.
    - **Immediate on arrival.** An `updateScene` hook re-scans the queue at the
      current world time when a scene's `active` flag flips true, so a pending check
      for the newly-active scene surfaces the instant the party arrives rather than on
      the next time tick. Re-offer stays idempotent via the existing offered-dedupe.
    - A schedule on an unlinked token's actor is naturally scene-scoped: name its
      token's scene.

    Part of #590.

- 7b005c3: **Persisted schedules can bind to lifecycle triggers, not just world time**

    The generic scheduled-actions store (`system.scheduledActions`) previously
    persisted only **time-based** schedules — every entry fired at `anchor +
interval` via `updateWorldTime`. It now also persists **event-driven** schedules
    bound to a lifecycle trigger (`turnEnd`, `roundEnd`, `combatStart`, …, and the
    scene-region families from #593), so a check whose cadence is a combat moment has
    a durable home and re-arms across a reload — the same way a timed one does.
    - **New optional `triggerName`** on each `scheduledActions` entry. Blank (the
      default) or `"updateWorldTime"` keeps the original time behavior; any other
      value makes the entry event-driven, armed as a live subscription on that trigger
      with `interval` unused. Backwards compatible — an entry written before this
      change has no trigger and stays time-based, with no migration.
    - **`armScheduledActions` / `scheduleAction`** arm a time entry via `scheduleAt`
      (as before) and an event entry via `subscribe`; **`sohl.schedule`** and the
      shared **`offerSchedule`** take an optional `triggerName`, and the offer prompt
      reads "…at the end of each turn?" for an event cadence instead of "…in 5 days?".
    - An event entry may also carry an optional **`predicate`** source (a
      `SafeExpression`) to gate its dispatch; the queue binds **`subscriberUuid`** (the
      subscription's own document) so a predicate can compare the trigger to itself —
      e.g. scoping a `turnEnd` schedule to the subscriber's own combat turn.
    - Both families flow through the one owner-gated `[Perform]` reminder path
      (issue #579); time schedules still dedupe by `fireAt`, event schedules still
      offer once per fire.

    Closes #622

- a714f94: **Scheduled-action load-side + world host — `ready` re-arm, `sohl.worldHost`, GM-hidden reminders**

    The load-and-execute half of the generic scheduler (epic #588): persisted
    schedules survive a reload, world-scoped schedules get a home, and the reminders
    they raise can be kept GM-only.
    - **Re-arm on load.** `SohlHookBridge` wires a **`ready`** hook that arms every
      world actor's `system.scheduledActions` — and each actor's embedded items' —
      back into the event queue. Not GM-gated: the queue is a projection of document
      state, so every client re-arms from the documents it can see. New
      `fvttWorldActors()` shim so the wiring crosses the Foundry boundary and stays
      unit-testable.
    - **`sohl.worldHost()`** — find-or-creates the singleton `_sohlworld` actor
      (reserved shortcode, ownership NONE so only the GM sees it; GM-only creation).
      It is the document that world-scoped schedules hang off of, and being an actor it
      already has the execution surface (`onChatCardButton` + an `actions` collection)
      a `[Perform]` reminder needs.
    - **GM-hidden reminders.** A schedule whose payload carries `visibility: "gm"` is
      offered as a GM whisper (`SohlSpeaker` now honors a per-call `rollMode`), so
      world-host events don't leak to players.

    Part of #588.

- 9424a55: **Script Actions run a Foundry Macro instead of compiled code (#156)**

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

- 8e47530: **Seedable, Foundry-free PRNG (`sohl.random`) — reproducible randomness**

    Adds a self-contained, seedable pseudo-random number generator to the
    Foundry-free logic layer and routes all direct randomness through it, so a seed
    makes a whole stream of rolls and selections reproducible (combat replay,
    "what just happened" debugging, property/fuzz tests) without depending on
    Foundry's `Roll` / `MersenneTwister`.

    **The generators (issue #599).** A small `Rng` interface — `float()`,
    unbiased `uint32(bound)` / `int(min, max)` / `die(sides)`, plus the
    `seed()` / `getState()` / `setState()` control surface — with two 32-bit
    implementations behind it: `Sfc32Rng` (the default) and `Xoshiro128Rng` (an
    interchangeable alternative). Integer extraction uses **rejection sampling** so
    it is bias-free even on d100-scale hit-location tables. Seeds accept a string
    (hashed via `cyrb128`), a number, or the four state words directly; an all-zero
    state is guarded. The output for a given seed is a **frozen contract**, locked by
    golden-value tests.
    - **Reentrant / injectable.** Every generator holds its entire state in instance
      fields — no module-level or `static` mutable state, no shared scratch buffer —
      so any number of `Rng` streams run interleaved with zero cross-talk. Injection
      is the first-class path; a flow that must not perturb another holds its own
      instance.
    - **`sohl.random` singleton.** One shared, entropy-seeded stream, present from
      system construction (its own ready signal), exposed for macros, the app, and
      e2e. It is the default-injected source but is **never** hardcoded into
      consumers — `SimpleRoll` and hit-location take an optional `Rng` and fall back
      to it only when none is passed.
    - **Guardrail.** Production seeds from `crypto.getRandomValues` and never accepts
      a fixed seed through a play path — fixed seeds are strictly a test/e2e
      affordance (predictable dice ruin play, and a shared deterministic stream
      desyncs across clients anyway).

    **Routing the non-dice sources through it (issue #601).** `weightedRandom`, the
    `BodyStructure` hit-location spread, `BodyPart`/`BodyStructure` location
    selection, and the `rand()` expression helper now all draw from an injectable
    `Rng` (defaulting to `sohl.random`) instead of `Math.random`. No behavior change
    in normal play — the continuous draws stay statistically identical — but a seed
    now forces a hit location deterministically end to end.

    `SimpleRoll.forceValues(...)` (the #598 forced-value queue) is unchanged and
    still takes precedence over the `Rng`: forced values give targeted determinism
    for a single roll; a seed gives reproducibility of the whole stream.

    **Tests.** Unit specs cover reproducibility, independence, boundary correctness
    (`die`/`int` endpoints, never 0 / `sides+1`), d100 bias (chi-square),
    state snapshot/replay, the zero-state guard, reentrant interleaving, and frozen
    golden streams; `SimpleRoll` and `BodyStructure` gain seeded-determinism specs.
    A new e2e (`seedable-random.cy.js`) re-seeds `window.sohl.random` and drives a
    real skill success test and the `rand()` helper reproducibly.

    Closes #599, #601. Refs #598.

- c805aa2: **Shock Re-Test, Extended Shock, and Coma**

    Ordinary shock can now be shaken off — or deepen into the lasting conditions of
    Extended Shock and Coma, each with its own recovery.
    - **Shock Re-Test** — `BeingLogic.shockReTest` resolves a re-test for an
      Incapacitated or Unconscious being: a headless **Shock** skill test at −20
      (fatigue penalty applies) that recovers from all shock (CS), improves to
      Stunned (MS), or drops the victim into **Extended Shock** (a `shock`-subtype
      trauma at Healing Rate 4/5) — or a **Coma** (a `coma`-subtype trauma) for an
      Unconscious victim on a critical failure.
    - **Extended Shock / Coma course tests** — the two lasting-shock traumas recover
      through a recurring `courseCheck` (a `Healing Base × Healing Rate` test with
      the fatigue penalty; Extended Shock every 4 hours, Coma every d10 days). The
      Healing Rate shifts by the result (CF −2 / MF −1 / MS +1 / CS +2); at Healing
      Rate 0 the victim dies, and at 6 they recover — a recovering Coma additionally
      inflicts weariness fatigue equal to the days spent in it.
    - New Foundry-free helpers in the shock module (`shockReTestOutcome`,
      `shockCourseHrDelta`, `comaHealingRate`, `SHOCK_RETEST_MODIFIER`) and a new
      `course` recurring-phase field triplet on the Trauma data model.

    The Shock Re-Test is currently invoked on demand; its automatic scheduling
    (end of the next turn / ten minutes later) is deferred to a follow-up.

    Closes #556
    Part of #548

- 7b005c3: **Shock Re-Test is offered on its cadence when a being enters shock**

    `BeingLogic.shockReTest` (#556) could only be run on demand. A being that enters
    ordinary shock is now **offered** (never auto-armed) a Re-Test reminder on the
    state's cadence, per the consent model — the being-level timing half of #556.
    - **Incapacitated** → an event-driven `turnEnd` schedule (#622), gated by a
      predicate (`combatant.actor.uuid === subscriberUuid`) to the victim's **own**
      combat turn: a `[Perform]` Re-Test card is offered at the end of each of the
      being's turns, not on every combatant's.
    - **Unconscious** → a time schedule ten minutes out.

    Entering shock (via an injury Shock Test) routes through the shared
    `offerSchedule`, so nothing schedules or runs without a human; when due, the event
    queue posts an owner-gated `[Perform]` card to the being's controller, and the
    Re-Test runs only on their click. Performing a Re-Test — or recovering, or falling
    into a lasting Extended Shock / Coma (whose recovery is a Course Test) — clears the
    ordinary reminder rather than auto-re-arming. `BeingLogic.finalize` now re-arms a
    being's persisted schedules on load.

    Closes #569

- 67aa257: **Shortcode input in the sheet header**

    Both Actor and Item sheets now show the `shortcode` field directly under the Name
    in the header — an unlabeled input with a `shortcode` placeholder, edited inline
    (submit-on-change). For items this replaces the shortcode field that previously
    lived in the Properties tab, so `(type, shortcode)` — the document key — is
    visible and editable next to the name on every sheet.

    Closes #351

- ef16bb4: **Deterministic dice for tests: a forced-value queue built into SimpleRoll**

    Add a process-wide **forced-value queue** to `SimpleRoll` (the single dice
    chokepoint) so tests can drive an RNG-gated outcome that lives deep in the logic
    layer — a success test's d100, an affliction's critical-failure→infection, the
    combat exchange — without reaching the roll instance.
    - **`SimpleRoll.forceValues(...values)`** seeds die values that `roll()` consumes
      one per die (FIFO) instead of `Math.random`; **`SimpleRoll.clearForced()`**
      empties the queue and **`SimpleRoll.forcedRemaining`** inspects it. When the
      queue is empty, rolls are random as before.
    - **Forces the die _values_, not a total**, so `total`, `result` (`"[3, 5] +2"`),
      `formula`, and the Foundry-`Roll` display all derive correctly. Because almost
      every SoHL roll is a single die, this is effectively "one value per roll."
    - Complements the existing per-instance `setRolls` / `SuccessTestResult` presets;
      a pre-seeded roll never touches the queue. Reachable from `sohl`
      (`sohl.entity.roll.SimpleRoll`) so an e2e can seed it in the game realm.
    - **Hygiene:** a leftover forced value leaks into the next roll, so tests clear it
      in an `afterEach` (documented in the testing guide).

    An e2e (`deterministic-dice.cy.js`) proves it end to end: forcing a real skill
    success test's d100 to 5 succeeds and to 100 fails against ML 50. Follow-ups
    tracked separately: a seedable Foundry-free PRNG (#599), and routing the non-dice
    randomness (`weightedRandom`, the `rand()` helper, `BodyStructure` spread) through
    the same seam.

    Closes #598.

- 78e87dc: **Skill base is a computed value; birthsigns are mysteries**

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

- ae47c3f: **Expose constructable entity classes via `sohl.entity`**

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

- 56fb667: **Overloaded `SohlEntity` constructor: `new X(parent)` shorthand**

    `SohlEntity` and the entity subclasses that construct usefully from an empty data
    bag now accept a `(parent)` shorthand alongside the existing `(data, options)`
    form — mirroring the `clone(parent)` shorthand:

    ```ts
    new ValueModifier(logic); // was: new ValueModifier({}, { parent: logic })
    ```

    The base gains two `protected static` normalizers (`SohlEntity.dataOf` /
    `SohlEntity.optionsOf`) and a `SohlEntity.DataOrParent<D>` type alias. The
    overload is resolved by the `isA(x, "SohlLogic")` **brand** check (not
    duck-typing), so a data bag that merely carries a `parent` key is never mistaken
    for a Logic. The runtime throw and its exact message (`SohlEntity requires a
parent`) are unchanged.

    Adopted by `ValueModifier`, `MasteryLevelModifier`, `CombatModifier`,
    `ImpactModifier`, `SimpleRoll`, `TestResult`, and `SuccessTestResult`. Classes
    that require non-empty data (the body classes, strike modes, and the non-empty
    results) keep their single `(data, options)` constructor. Also fixes a latent
    throw in `AttackResult` where `new ImpactModifier()` was called with no
    arguments — the zero-argument form no longer compiles.

    **Compatibility note.** A downstream module subclass that declares a bare
    two-required-parameter `constructor(data, options)` will no longer satisfy
    `typeof ValueModifier` for `sohl.entity.register` — an overloaded target requires
    the source to satisfy every overload. Subclasses that declare _no_ constructor
    (the common case) inherit the overloads and are unaffected. Runtime behavior is
    unchanged either way.

    Closes #369

- 78e87dc: **Strike-mode availability gated by held limbs and pull**

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

- 6b31fad: **Active Effects: strike-mode scopes replace the `sm:` key mechanism**

    Active Effects can now target strike modes directly with two new `scope`
    values, `meleestrikemode` and `missilestrikemode`. When an effect uses one, the
    `test` predicate is run against every strike mode of that type across the
    actor's items — bound `itemLogic` (the owning item's logic) and `sm` (the strike
    mode) — and each matching strike mode receives the change. This lets an effect
    raise, say, attack rolls (`mod:attack`) without touching the underlying `melee`
    skill, optionally narrowed to specific items or strike modes via the predicate.
    - **Predicates now bind logic, not documents.** Item-kind-scoped predicates bind
      `itemLogic` (was the `item` document); strike-mode-scoped predicates bind
      `itemLogic` + `sm`.
    - **New effect-key sets** `MELEESTRIKEMODE_EFFECT_KEY` (attack, impact, reach,
      block, counterstrike) and `MISSILESTRIKEMODE_EFFECT_KEY` (attack, impact,
      spread, base range, draw); the change-key dropdown is populated for the
      strike-mode scopes.
    - **Removed** the per-change `strikeModePredicate` field and the `sm:` /
      `mod:sm:` key-prefix routing (superseded by scope + `test`), along with the old
      `WeaponGear.EffectKey.SM_*` keys and the `isSmKey` helper.

    No migration is provided (no released worlds depend on the old mechanism).

- c768ef9: **Strike-mode required-limb impairment gates the roll (#628)**

    Complete the Injury rules' _Indefinite Impairment_ consequences for weapon strike
    modes — the per-part counterpart to the role-based skill/attribute gating shipped
    in #568. A strike mode names the limbs it needs by count (`minParts`), not by
    role, so it carries no `impairedByRoles`; instead the gating now resolves the
    _specific_ body part(s) holding the weapon and scores each through the being's
    body-part impairment:
    - A strike-mode attack/defense test whose **required (held) limb is unusable** — a
      grievous injury or a permanent-unusable flag — resolves as an automatic Critical
      Failure, reusing the existing `SuccessTestResult.autoCriticalFail` flag.
    - The same limb, when **impaired but still usable**, imposes its **−5** (minor) /
      **−10** (serious) penalty on the mode's attack/defense mastery level. When a test
      is gated on both a role and a held limb, the worst (most negative) of the two
      applies — never their sum.

    Plumbing only, no new outcome logic:
    - Foundry-free `requiredPartsAutoCriticallyFail` / `requiredPartsImpairmentPenalty`
      — the per-part twins of `testAutoCriticallyFails` / `testImpairmentPenalty`.
    - `BeingLogic.bodyPartImpairments(parts)` — the per-part impairment view (as
      opposed to the role-aggregated `unusableRoles` / `impairedRolePenalties`).
    - `GearLogic.heldLimbImpairments` — the impairment of the limb(s) currently
      holding the item, resolved from `heldBy`.
    - `MasteryLevelModifier.successTest` folds the held-limb result into the same
      auto-CF / penalty seam as #568. A strict no-op for a parent that holds nothing
      (a skill, attribute, or unheld item).

    Natural-weapon (combat-technique) strike modes continue to gate through their
    skill's `impairedByRoles` (#568); a per-part link from a natural weapon to its
    body part does not exist yet and remains a follow-up.

- 7aeb376: **Success tests roll the die, and can run headlessly**

    Fixes two latent defects in the success-test path and completes the `skipDialog`
    bypass, so timed and automated effects can resolve a test with no user present.
    - **`SuccessTestResult.evaluate()` now rolls the d100.** Previously it resolved
      against the constructor's default die — a hardcoded `[99]` — so any success test
      that did not pre-seed a roll (skill tests, disease contraction, and every
      planned timed effect) silently always rolled 99 (a marginal failure). The die is
      now cast during `evaluate()` **unless the caller supplied one** (`data.roll`) —
      fate replaying a prior roll, or the attacker's die reconstructed on the
      defender's client, are resolved untouched. The default die is now unrolled, and
      the "was a die supplied?" decision is recorded from caller intent, not inferred
      from the die's state. The combat pipeline (`AttackResult` / `DefendResult`), which
      already seeds its roll via `buildAttackResult`, is unchanged.
    - **`MasteryLevelModifier.successTest` honors `skipDialog`.** The flag was a no-op
      (the dialog always opened). It now bypasses the dialog and takes the situational
      modifier from `context.scope.situationalModifier`, attributes the result to the
      acting `context.speaker` (so `evaluate()`'s owner check passes — a GM-fired event
      owns every actor), and respects `context.noChat` to suppress the result card
      (useful when a timed handler catches up many elapsed checkpoints at once).

    Together these let a GM-fired timed handler resolve a test with
    `mlMod.successTest(new SohlActionContext({ speaker, skipDialog: true, noChat, scope }))`
    — the foundation the trauma / shock / affliction timed effects build on.

    Part of #548. Closes #551

- 9679cf7: **Node template-render test harness + shared pure Handlebars helpers**

    Make SoHL's card and dialog templates renderable in Node so the card/dialog-building
    actions can be unit-tested by asserting the emitted HTML — no running Foundry.
    - **Extract SoHL's pure Handlebars helpers** (`selectArray`, `endswith`,
      `optionalString`, `setHas`, `contains`, `toJSON`, `toLowerCase`, `arrayToString`,
      `injurySeverity`, `array`) out of system init into a Foundry-free module,
      `registerPureHandlebarsHelpers(H)`, registered through an injected Handlebars
      instance. System init and the test harness register the **same** code, so
      template rendering never drifts. Behavior-preserving; the Foundry-coupled helpers
      (`getProperty`, `textInput`, `clearableNumberInput`, `datePicker`,
      `displayWorldTime`) stay in system init.
    - **Render harness** (`tests/mocks/hbs-helpers.ts`): `renderTemplateReal(path, data)`
      reads a `.hbs` off disk and renders it with the shared pure helpers, Foundry's
      logic helpers (copied verbatim), faithful option-list builders (`selectOptions` /
      `selectArray`), and param-placeholder stubs for the Foundry DOM/form builders
      (`formGroup` + `formField`, `formInput`, `numberInput`, `editor`, `filePicker`,
      `radioBoxes`, `rangePicker`) and impure SoHL helpers. `localize` reads the real
      `lang/en.json`.
    - Fidelity: **cards** and **dialogs** render fully (option lists are real); **sheet**
      form builders render as binding placeholders (name/value/disabled) — the right
      level for a unit test.
    - Tests: card/dialog render assertions for the treatment, shock, attack-result cards
      and the injury / treat-injury dialogs; the attack-card action test renders the real
      card through the harness.

    Closes #582

- d6219e2: **Add temporal field and scheduling helpers**

    Shared building blocks for timed item processes (injury healing / blood-loss,
    affliction phases):
    - **Scheduling** (`@src/entity/event/scheduling`, Foundry-free): `deriveNext(anchor,
interval)` — the single definition of the next occurrence time (from the
      persisted anchor, never the clock); and `elapsedCheckpoints(lastAnchor,
worldTime, interval)` — the ordered catch-up set for a time advance, guarded
      against non-advancing loops on a non-positive interval.
    - **Schema factory** (`temporal-fields`): `phaseFields(name)` stamps a one-shot
      phase's `{ …DurationFormula, …DurationBase, …Date }` nullable field triplet (the
      `…Date` is the crystallized actual, `null` until the phase fires), and
      `durationFields(name)` stamps a recurring process's `{ …DurationFormula,
…DurationBase }` interval pair — the recurrence anchor is not a bespoke field but
      lives in the generic `system.scheduledActions` store (#588). Both use consistent
      nullability, plus `worldTimeDateField` / `durationBaseField` /
      `durationFormulaField` for standalone use.

    Closes #481.

- 2ede925: **The Pall (#561)**

    Implement the Pall — the forces of death that assail **Spirit**.
    - **Resist the Pall** — a self-sufficient Being action rolling a Spirit test with a
      **Pall Depth penalty of 5 × total PAL**, mapping the result to a Pall state
      (Immune / Resist / Disturbed, and the CF0/CF5 split of Catatonic vs Terrified). A
      failure accrues Pall Stress Levels (+1 / +2 / +3) on the being's `pall`-subtype
      Pall Cloud trauma; a success grants temporary immunity.
    - **Pall recovery** — a recurring Will test (every d6 days) on the Pall Cloud:
      `MS`/`CS` recover −1/−2 PSL (the Pall is expelled at 0); `MF` knocks the victim
      **Unconscious**; `CF` forces the victim to **Face the Pall** — the three fates
      (Embrace / Vacate / Accept True Death) are **offered** as a choice card, never
      imposed (the choice is always the victim's). Offered, not auto-armed (#579).
    - **Pall Strength & Cloud math** — a Foundry-free `pall` module: `pallStrengthAt`
      (falloff of 1 per 5 ft plus daylight/twilight reductions), `pallDepthPenalty`,
      `pallResistState`, `pallStressGain`, `pallCloudPenalties` (PSL × 5 to vision
      Perception/Agility, PSL × 10 to Dodge/Move/Stealth), and `pallRecoveryOutcome`.

    The application of the Pall Cloud test penalties and the permanent-psyche-trait
    permanence conversion are follow-ups (the former joins the test-resolution work).

    Part of #548. Closes #561.

- e93c4e2: **Timed effects offer to reschedule instead of auto-re-arming, on the generic store**

    Recurring trauma and affliction effects no longer silently re-arm their next
    occurrence — completing the consent model for timed effects (issue #579, building
    on #587's remind-don't-perform) — and their schedules move off bespoke schema
    fields onto the generic `system.scheduledActions` store (the migration named as a
    follow-up of #588).
    - **Offer, don't auto-re-arm.** After a recurring check is performed
      (`healingCheck` / `bloodLossAdvanceCheck` / `courseCheck` on Trauma, `healingCheck`
      on Affliction), the executor **offers** the next occurrence — via
      `context.scope.schedule` when scripted, otherwise a private yes/no dialog
      defaulting to **No** — through the shared `offerSchedule` helper. Accept
      schedules the next; decline clears it (the loop stops and does not resurrect on
      reload). A terminal outcome (a wound healed to 0, a course death/recovery, a
      defeated affliction) ends the recurrence outright. Affliction phase transitions
      (`onsetCheck` → `resolutionCheck`) still advance automatically — the disease
      progresses as the direct consequence of the human-performed step; only their
      _firing_ is consent-gated.
    - **Migrated onto `system.scheduledActions`.** The recurrence anchor now lives in
      the generic store entry (`anchor + interval`), so the bespoke `lastHealingCheckDate`
      / `lastBloodLossAdvanceDate` / `lastCourseDate` fields are removed
      (`recurringPhaseFields` → a new `durationFields` interval pair). Creation and
      becoming-a-bleeder still auto-arm the _first_ occurrence (via `sohl.schedule`).
    - **Generic re-arm in `finalize()`.** Each effect's `finalize()` now re-arms
      whatever `system.scheduledActions` holds (`armScheduledActions`) rather than
      hard-coding per-effect branches — so a reschedule written on one client
      replicates and re-arms every client's queue, the active GM's included.
    - **Generic run record — `system.lastRun`.** A single keyed map (`actionName` →
      world-time) on the base data model, the past-tense mirror of `scheduledActions`,
      stamped automatically at the action chokepoint (`SohlAction.execute`) for actions
      whose definition sets `recordsLastRun`. So "when was my last healing test?" is
      answerable — `injury.system.lastRun.healingCheck` — for **any** action with no
      bespoke field, and it survives after a declined or resolved effect (where the
      next occurrence, `sohl.events.nextFireTime(uuid, actionName)`, is gone). For an
      event-driven trigger whose next fire is undeterminable, this run record is the
      only meaningful temporal fact.
    - **New SafeExpression helpers `curWorldTime()` / `curCombatTime()`.** Event-queue
      subscription **predicates** can now gate on live world or combat time from any
      trigger (`curWorldTime() > T`; `defined(curCombatTime()) && curCombatTime().round > 3`),
      reading through Foundry-free shims — the flexible escape hatch alongside the
      concrete, introspectable `fireAt`.

    Refs #579, #588.

- 03b666c: **Timed effects remind, they no longer auto-perform**

    When a scheduled effect comes due, the event queue now posts an owner-gated
    **[Perform] reminder card** instead of running the effect on its own — the core
    of the consent model (issue #579). Nothing mutates a character until that
    character's controller clicks [Perform]; the click runs the _same_ action the
    queue used to run automatically, on the effect's document.
    - `SohlEventQueue.dispatchOne` posts `templates/chat/reminder-card.hbs` (a
      `[Perform]` action-card button addressed to the effect's **document** via
      `data-handler-uuid` — an item, actor, or any document — carrying the trigger
      context + payload as its scope) rather than calling `executeAction`.
    - De-duplicated by `(uuid, actionName, fireAt)` so a due occurrence is offered
      once, not on every world-time advance while it sits unperformed.
    - Renamed `SohlSubscription.kind` → `actionName` (a runtime-only field): the
      queue is a _deferred action runner_ — it stores which action to run on which
      document, and `actionName` names that action.
    - The seven timed effects (#486, #487, #488, #489, #490, #556, #557) all flow
      through this — none of them can apply to a character without a click.

    Part of #579. Follow-ups: make the effect _offer to reschedule_ the next
    occurrence (dialog/scope, per the self-sufficient action contract) instead of
    auto-re-arming, and offer the first schedule at creation.

- c56fc61: **Driven-tour primitives and deterministic RNG for `SohlTour` (#624)**

    Extend the guided-tour framework so an opinionated, _railroaded_ tour (the
    Automated Combat tour) can drive the app down a fixed path with reproducible
    dice, without regressing the coach-and-wait tours.
    - **Drive steps.** A step may declare a `drive` array of actions that are
      _performed_ (not waited on) before the step is shown, each awaited in order so
      the next step's targets exist: `import-adventure`, `activate-scene`,
      `start-combat` (with optional `roll-initiative`), `advance-turn`, and
      `set-target` / `clear-target`. The sequencing/await logic is the Foundry-free
      `runDrive`; `SohlTour` supplies the Foundry-coupled executor.
    - **Seeded RNG.** Setting `SohlTourConfig.seedRng` seeds `sohl.random` at tour
      start for reproducible scripted rolls and **guarantees restore on every exit
      path** — completion, abort, Escape, navigation (a `pagehide` safety net), and a
      mid-step error — via a fire-once `RngLease` registered at seed time. Restore
      rewinds the shared stream to its exact pre-tour position, so the user's real
      game is never left returning identical dice.

    Coach-and-wait behaviour is unchanged; a step with no `drive`/`seedRng` behaves
    exactly as before.

- d229b63: **Guided-tour framework (`SohlTour`)**

    Add the reusable in-app guided-tour framework that the SoHL Guided Tours epic
    builds on. A stock Foundry tour can only highlight what's already on screen and
    advance on **Next**; `SohlTour` (a subclass of Foundry's NUE `Tour`) adds the
    machinery every substantive SoHL tour needs, extracted once:
    - **Three step kinds** — a **free** step (advances on Next), a **value-gate** step
      (**Next** stays disabled until a target control holds a value), and an
      **action/state-gate** step (**Next** stays disabled until a predicate over
      document/DOM state passes). The disable-Next _decision_ is the Foundry-free
      {@link sohl.entity.tour} gate model — `TourGate`, `gateValue` predicate helpers,
      and `isNextEnabled` — written test-first and unit-tested without a running
      Foundry.
    - **Scene-setting navigation** — a step can open an Actor/Item sheet and switch to
      a named tab, awaiting each render, so a selector on a not-yet-open tab resolves
      after navigation. Only navigation is automated; the user's meaningful choices are
      never made for them (PRIME DIRECTIVE — a tour coaches and waits).
    - **Re-render survival** — when the watched sheet re-renders, the highlight
      re-anchors to the fresh target element.
    - **Registration + a worked example** — `registerSystemTours` wires tours into
      **Tour Management**; a small self-contained demo tour exercises all three step
      kinds against a Being sheet and doubles as the authoring reference. New
      `SOHL.Tour.*` localization keys and a
      [Writing Guided Tours](../docs/how-to/guided-tours.md) authoring guide are added.

    Closes #613

- c2c0c3d: **Replace the trait `isNumeric` flag with a `Measured` subtype**

    A trait's numeric-vs-descriptive nature is no longer a freely-toggleable
    `isNumeric` checkbox (a single misclick could strand a configured trait's
    `score` / `max` / `valueDesc`). It is now a **deliberate, stable classification**
    carried by `subType`: a third value, **`measured`**, alongside `physique` and
    `personality`.
    - `measured` traits own the numeric `score` (value + optional `max` cap) and the
      `valueDesc` bands; `physique` / `personality` own `textValue`. The trait sheet
      and the Being-sheet trait rows key on `subType`, and the value now reads from a
      single source (`score.value`) — fixing a display bug where numeric traits
      showed `0` (a phantom `masteryLevelBase`).
    - **Boundary:** a measured trait is a static quantity — a score with an optional
      cap and labeled bands, **no mastery level and not tested/rolled**. A measured
      value that wants a ~3–18 range, a `score × 5` mastery level, and to be rolled
      against is a **custom Attribute**, not a trait.

    _Migration (automatic, lossless):_ trait items with `isNumeric === true` become
    `subType: "measured"`; `isNumeric` is dropped. `score` / `valueDesc` were already
    stored, so nothing else moves.

    Closes #532

- d4761fe: **Model descriptive personality & physique traits as Trauma conditions**

    Descriptive traits are conditions a being exhibits, not measured values, so they
    now live under the Trauma document instead of the Trait document — the first step
    toward retiring the Trait item entirely (only the measured physical-stat traits
    remain).
    - **New Trauma subtype** `PHYSICAL_CONDITION` (`physcond`), alongside the existing
      `PSYCHOLOGICAL_CONDITION` (`psycond`), each with its own category enum:
      `TRAUMA_PSYCOND_CATEGORY` (_Quirk_ / _Impulse_ / _Disorder_) and
      `TRAUMA_PHYSCOND_CATEGORY` (_Trait_ / _Impediment_ / _Debility_), with matching
      localization.
    - **Nullable injury-only fields.** A Trauma's `levelBase`, `aspect`,
      `bodyLocationCode`, and `category` are now nullable (`initial: null`) so a
      descriptive condition can omit them; injuries are unaffected. The content
      compiler emits `null` for the omitted fields and now carries `category` through
      to the item.
    - **Content migration.** The personality and physique trait content moves to
      `assets/content/Trauma/psycond` and `assets/content/Trauma/physcond` as
      `trauma` items — the old `intensity` becomes a `category` (personality
      `benign→quirk`; physique `benign→trait`, `impulse→impediment`,
      `disorder→debility`), and the descriptive `isNumeric`/`textValue`/`valueDesc`/
      `score` fields are dropped. The measured physical stats (Body Weight, Carrying
      Capacity, Favored Parts, Move, Size) stay Traits.

    Closes #648

- 7b31b65: **Add SHOCK and COMA trauma subtypes**

    Adds two long-duration condition subtypes to `TRAUMA_SUBTYPE`: **Shock** (a
    prolonged physiological state of shock lasting hours or days, following severe
    trauma or blood loss — distinct from the transient combat-shock states) and
    **Coma** (a prolonged state of unconsciousness). Both are available as Trauma
    subtypes in the item sheet, with localization labels.

    Closes #478.

- d6219e2: **Trauma: time-based healing and blood-loss scheduling**

    Injuries now carry their healing and blood-loss timers as data and schedule them
    through the event queue. Adds temporal fields to Trauma (`contractDate`,
    `healingCheck*` and `bloodLossAdvance*` interval triplets via the schema helper),
    makes `healingRateBase` nullable, and replaces the `healingSeconds` world setting
    with `healingCheckDurationFormula` (default `"432000"` = 5 days) plus a new
    `bloodLossAdvanceDurationFormula` (default `"86400"` = 1 day).

    On creation a Trauma seeds its anchors to the current world time and its interval
    formulas from those settings; `TraumaLogic.finalize()` arms the recurring
    `healingCheck` (and, for a bleeding wound, `trauma::bloodLossAdvanceRoll`) events
    from the persisted anchors. The `healingCheck` / `bloodLossAdvanceCheck` intrinsic
    actions roll the next interval and re-arm — reusable both from the timed event and
    manually. The per-occurrence roll **effects** are tracked as follow-ups (#486,
    #487).

    Refs #482.

- 943cb57: **Type the weapon strike-mode schema and guard strike-mode construction (#512)**

    Weapon strike modes were stored in an untyped `ObjectField`, so a strike mode could be persisted with a partial `defense` object. `MeleeStrikeMode`'s constructor then read `data.defense.block.modifier` without a guard, threw during `WeaponGearLogic.initialize`, and aborted the actor's whole data preparation — which Foundry's `_safePrepareData` swallowed, so the weapon's strike modes silently never built and the Combat tab appeared to have none.
    - **Root fix:** `WeaponGearDataModel.strikeModes` is now a `TypedObjectField` of the discriminated melee / missile `TypedSchemaField` — the same schemas the combat-technique skill already uses — so every strike mode's sub-fields, including `defense.block` and `defense.counterstrike`, are validated and default to complete values. Partial strike-mode data can no longer be stored.
    - **Defense-in-depth:** `MeleeStrikeMode`'s constructor now reads `defense` defensively, so a malformed strike mode degrades instead of crashing the actor's data preparation.

- 35ec141: **Typed item-logic registry and actor-logic accessors**

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

- 2ede925: **Unusable body part auto-Critically-Fails a test (#568)**

    Wire the Injury rules' consequence that a **grievous injury makes a body part
    unusable — tests that rely on it automatically Critically Fail**.
    - A being now exposes `unusableRoles()` — the body-part **roles** it cannot use
      (roles of every part made unusable by a grievous injury or the
      permanent-unusable flag).
    - A mastery-level test whose governing skill/attribute lists any of those roles in
      its `impairedByRoles` is forced to a **Critical Failure**, regardless of the
      roll. The decision is a Foundry-free helper (`testAutoCriticallyFails`); the
      forcing is an additive, default-off `autoCriticalFail` flag on `SuccessTestResult`
      honored in `evaluate` (the die is still cast for display, then the outcome is
      forced), and `isCritical` reports `true` for it even when the test has no
      critical digits. Computed in `MasteryLevelModifier.successTest` — a strict no-op
      for tests with no `impairedByRoles` or an actor with no unusable parts, so normal
      rolls are unaffected.

    This establishes the previously-unwired `impairedByRoles` → effective-mastery link
    for the auto-CF case. The corresponding −5/−10 penalties for _impaired-but-usable_
    parts, and the strike-mode required-limb (minParts) variant, are follow-ups.

    Part of #548. Closes #568.

- c2c0c3d: **Wire Active Effect and Action management on the item and being sheets**

    The effect and action controls on the sheets are now functional, backed by real
    document methods — previously the handlers were unwired and the controls had been
    removed to avoid shipping dead buttons.
    - **Active Effects (both sheets):** create, toggle enabled/disabled, and delete an
      embedded effect from the effect list, plus a per-row context menu (edit /
      toggle / delete). Backed by new `createEffect` on `SohlItem` / `SohlActor` and
      `toggleEnabledState` on `SohlActiveEffect`, wired through the ApplicationV2
      `actions` map on the shared sheet mixin. The effect-row toggle now targets the
      `[data-effect-id]` row (it previously looked for a `.effect` element that does
      not exist).
    - **Actions (item sheet):** the item Actions tab now offers the same custom-action
      authoring the being sheet already had — create (bind a world Macro or a fresh
      one), edit the bound Macro, delete, and run (shift-click to skip the dialog).
      Intrinsic actions remain run-only.
    - The create/edit/delete/run action logic is consolidated into one shared
      `core/foundry/sheet-actions` helper used by both sheets, so they behave
      identically.

    Closes #501

### Patch Changes

- 1733025: **Bind action and context-menu predicates to the logic layer**

    Action `trigger` / `visible` predicates and context-menu `condition` predicates
    now bind the **logic layer** instead of the raw Foundry documents, matching the
    Active Effect predicate convention:

    | Predicate                | Was                         | Now                                 |
    | ------------------------ | --------------------------- | ----------------------------------- |
    | Action `trigger`         | `item`, `actor` (documents) | `itemLogic`, `actorLogic`           |
    | Action `visible`         | `element`, `item`, `isGM`   | `element`, `itemLogic`, `isGM`      |
    | Context-menu `condition` | `target`, `item`, `actor`   | `target`, `itemLogic`, `actorLogic` |

    The logic object is the stable, computed view predicate authors want; the owning
    actor is reachable from an item as `itemLogic.actorLogic`. The `hasUsableSkill`
    helper now takes the actor **logic** directly (`hasUsableSkill(actorLogic, …)`).

    _Breaking for author-supplied predicates:_ any `trigger` / `visible` / `condition`
    string that referenced `item` or `actor` must switch to `itemLogic` / `actorLogic`.
    No data migration is required — predicates are re-evaluated at runtime.

    Closes #380

- 26b6a5c: **Fix: declare the `sohleffectdata` ActiveEffect subtype so effects get their data model**

    `system.json` `documentTypes` declared an `activeeffectdata` ActiveEffect subtype
    that no data model was registered for, while the add-effect action and
    `CONFIG.ActiveEffect` use `sohleffectdata`. Creating a SoHL effect
    (`type: "sohleffectdata"`) was therefore rejected as an invalid type, and effects
    never received `SohlActiveEffectDataModel` — their `system.scope` / `system.changes`
    were absent.

    Declare `sohleffectdata` in `documentTypes` (a one-line rename) so the type is
    valid and effects get their data model.

    Fixes #145

- 5a33601: **Fix: actor-addressed chat-card buttons never dispatched**

    Chat-card buttons and edit-actions whose handler is an **actor** (`data-handler-uuid`
    = an Actor uuid) were silently dropped: `sohl.ts` calls `doc.onChatCardButton` /
    `doc.onChatCardEditAction` on the resolved document, but `SohlActor` defined neither
    (the handling lived on a dead `static BeingLogic.onChatCardButton` and an unreachable
    `BeingLogic.onChatCardEditAction`). This broke the `createInjury` "Calculate Injury"
    button and the injury card's Shock Roll (`injuryShock`).
    - `SohlActor` now defines `onChatCardButton` / `onChatCardEditAction` that owner-gate
      (#167) then delegate to the shared `dispatchChatCardAction` chokepoint — mirroring
      `SohlItem` / `SohlCombatant` / `SohlTokenDocument`.
    - `createInjury` is now a normal action-dispatched method (`BeingLogic.createInjury`,
      reading `context.scope`) that flows through that chokepoint, replacing the private
      `onCreateInjury(btn)` and the dead static special-case.

    Closes #572

- 4e80092: **Restore Affliction Course / Treatment / Healing action gating**

    The Course Test, Treatment Test, and Healing Test intrinsic actions were left
    unconditionally visible (`visible: "true"`) during the port to the Foundry-free
    logic layer, so the context menu offered them regardless of the affliction's
    state. Their gating is restored against the ported logic:

    | Action         | Now visible when                                                                                               |
    | -------------- | -------------------------------------------------------------------------------------------------------------- |
    | Course Test    | affliction is **active** (not dormant) **and** the bearer has a usable Endurance attribute                     |
    | Treatment Test | affliction is **untreated**                                                                                    |
    | Healing Test   | affliction **heals naturally** (healing rate not disabled) **and** the bearer has a usable Endurance attribute |

    The gating is exposed as the `hasCourse` / `canTreat` / `canHeal` getters on
    `AfflictionLogic` and referenced from the actions' `visible` predicates. The old
    port left a FIXME claiming the original gate involved a `pysn` skill and an
    `isBleeding` flag; that was a mis-copied Trauma gate — afflictions have no
    bleeding concept — so no bleeding gate is applied.

    Closes #65

- c8799e5: **API documentation site: namespace-tree rendering, single logic surface, and brand chrome**

    A coordinated overhaul of the generated API reference (api.heroiclands.org) so it
    reads as one coherent, honestly-structured property.
    - **Rendered from the namespace tree.** TypeDoc now documents the API from the
      namespace root (the `sohl` module) rather than a generated flat barrel, so the
      sidebar is the real `sohl.*` tree (Foundry-VTT-style) and a symbol's doc path is
      its actual source and runtime-global location. A plugin roots qualified
      type-reference paths at `sohl` so disambiguated names match the breadcrumb,
      sidebar, and runtime global. The old category-overlay machinery is removed.
    - **A single logic-layer surface.** The five still-published Foundry document
      classes (`SohlActor`, `SohlItem`, `SohlActiveEffect`, `SohlScene`,
      `SohlTokenDocument`) are marked `@internal`, and the logic contracts are re-rooted
      out of the Foundry namespace — author-facing code reaches documents through the
      logic layer, so those classes are uniformly internal.
    - **Strictly generated symbols.** The hand-written guide tree is dropped from the
      API build (that prose now lives in the knowledgebase); the landing page points
      developers to the KB, and rendered JSDoc doc-references resolve to knowledgebase
      URLs instead of broken relative `.md` links.
    - **Shared brand chrome.** A TypeDoc plugin injects the shared Heroic Lands
      masthead, footer, palette, and fonts (matching www and the KB) without forking
      the theme, and fixes the nav dropdown's hover gap plus cross-property links.

    Covers #397, #404, #414, #415, #427, #433, #442.

- 73ce7e3: **Fix: complete the ApplicationV2 item-sheet migration (render + persist edits)**

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
    unsatisfied) and stay tracked under #141.

- b9de9db: **Fix: enforce automated-combat attacker and target invariants**

    `startAutomatedAttack` now refuses to begin an automated attack when an invariant
    is violated, instead of proceeding regardless (#387):
    - The **attacker** cannot attack while out of the fight — dead, vanquished
      (Foundry-DEFEATED), unconscious, asleep, restrained, paralyzed, frozen, or
      incapacitated (`attackerBlockingStatus` / `ATTACK_BLOCKING_STATUSES`).
    - The **target** must resolve to a combatant in the active combat, and cannot be
      **dead or defeated** — a defeated (killed/surrendered) combatant is no longer a
      valid target (`targetInvalidStatus` / `TARGET_INVALID_STATUSES`).

    Each violation aborts with a player-facing notification. The status predicates are
    pure and unit-tested. These attacker/target invariants are orthogonal to the
    turn gate (only the current combatant may _start_ an attack, added separately);
    out-of-turn **defenses** — a counterstrike or a Tactical-Advantage follow-up — run
    through the defense-resume path and are unaffected by either. The
    `combat-resolution-pipeline` and `combat-model` docs are updated to match the
    wired enforcement (the previously-cited `resolveAttackContext` was dormant).

- 7f547d3: **Being Actions tab**

    Reimplements the Actions tab of the Being sheet (#313).
    - **Grouped display.** Actions from `logic.actions` are split into a **Custom
      Actions** section (GM-authored script actions) and an **Intrinsic Actions**
      section (code-defined, read-only). Hidden-group actions (lifecycle hooks) are
      omitted.
    - **Create bound to a Macro.** The create control asks for an action name and a
      Macro: either an existing world Macro, or `<New Macro…>`, which creates a
      script Macro named after the owner and action (`<owner> <action>`,
      disambiguated with a number) and opens its sheet to author the body. Either
      way, a SCRIPT action (referenced by the Macro's UUID) is appended to
      `system.actionDefs`.
    - **Edit / Remove / Run.** Each custom action row can open its bound Macro's
      sheet (Edit), remove the action from `system.actionDefs` without deleting the
      Macro (Remove, confirmed), or run it. Intrinsic actions can be run.

    Macro authoring is deferred entirely to Foundry's Macro UI; this only builds the
    action list and the bind/edit/remove/run controls.

- 5f5415c: **Being sheet header: per-body-part injury status grid**

    Resolves #464. The header's body-part grid now shows each part's derived
    impairment, colored by severity, instead of a bare shortcode list.
    - **Impairment derivation** (`bodyPartImpairment`, `src/entity/body/impairment.ts`
      — pure and Foundry-free): a part takes the **most serious** injury across its
      hit locations — grievous (`G4`/`G5`) → **unusable**, serious (`S2`/`S3`) →
      **−10**, minor (`M1`) with healing rate ≤ 5 → **−5** — and eases back
      `unusable → −10 → −5 → none` as wounds heal. A **permanent impairment** acts as
      a non-positive floor.
    - **Header grid**: each part renders by **name** (with a stable `data-shortcode`)
      and a status class colored per the rules — none = white, −5 = yellow, −10 or
      worse = blue, unusable = black.
    - `BodyPart` now surfaces its `name` (mirroring `BodyLocation`), which the grid
      and other callers can use.
    - **Permanent impairment** is a new per-body-part `permanentImpairment` field on
      the Corpus data model (a manually-set, non-positive integer floor; `0` = none).
      It is additive with a safe default, so existing corpora need no migration. No
      dedicated editor UI yet — it is set via a data update; a sheet control is a
      follow-up.

    The derivation is shared — the being's health assessment reads the same per-part
    impairment.

    Covered by `bodyPartImpairment` unit tests (severity bands, worst-injury,
    permanent floor), updated `buildBodyPartLozenges` tests, and a
    `being-header-bodyparts` e2e (a grievous injury colors its part unusable; a
    slow-healing minor injury colors it minor; an uninjured being is all-none).

- f4be3d8: **Being Combat tab: readable limb labels and a cleaned-up Body Locations list (#509)**
    - Held-item limb labels show the readable part name ("Right Arm"), not the raw
      part code ("RARMPART").
    - The Body Locations list drops the obsolete Probability column and the
      in-list "Held:" marker (held items are shown by the Held Items dropdowns), and
      its part sub-headers and rows pick up the compact list styling. Zones and hit
      probability are no longer modeled, so the prototype's zone hierarchy is not
      reintroduced; the filter bar is kept.
    - The Corpus section renders as a single compact row.

- 7c0a014: **Fix: Being Façade tab binds to real datamodel fields (`portrait` / `appearance`)**

    The Façade tab (the Being sheet's initial/summary tab) bound its bio image to
    `system.bioImage` and its description editor to `system.description` — neither of
    which exists in the actor schema. The image rendered blank and the editor was
    always empty, with edits silently dropped.

    Point the tab at the existing fields the schema already defines: the bio image
    uses `system.portrait` and the physical-appearance description editor uses
    `system.appearance`. Adds an e2e spec (`facade-section.cy.js`) asserting both
    bindings.

    Closes #303, #307

- 5c40320: **Being sheet header: Aural-Shock and Fatigue as affliction-derived indicators**

    Resolves #306 (header scope: status toggles). The header's status roster now
    distinguishes toggleable ActiveEffect statuses from affliction-derived
    indicators:
    - Six pills — Sleep, Prone, Stun, Incapacitated, Unconscious, Dead — remain
      click-toggleable (`toggleStatus` → `Actor#toggleStatusEffect`).
    - **Aural-Shock and Fatigue** are now read-only indicators, lit when the actor
      has an active affliction of that subtype (`level.effective > 0`), matching the
      prototype (which drove them from afflictions, not statuses; Fatigue is not a
      `STATUS_EFFECT`). They render as non-interactive pills
      (`.sheet-header__status--indicator`).

    The health bar and per-body-part status grid — which need derived data that does
    not exist yet — are split out of #306 into their own issues (populate
    `BeingLogic.health`; derive per-part injury status) and are not part of this
    change.

    Covered by `buildStatusPills` unit tests (roster order, toggleable vs indicator,
    affliction-vs-status lighting) and a `being-header-status` e2e (Prone toggles on
    click; the Fatigue indicator lights read-only from an active affliction).

- 83f751a: **Being health: an impairment-based, banded assessment**

    Resolves #470. SoHL has **no hit points**, so a being's health is a banded
    assessment of capability — Excellent / Good / Fair / Poor / Morbid / Dead — read
    off **impaired body parts**, not a points pool. An injury that impairs no part
    has no effect on health.
    - **Per-part impairment** (`bodyPartImpairment`) yields a **tier** — NONE / MINOR
      (−5) / SERIOUS (−10) / GRIEVOUS (≤ −11) — and a **`usable`** flag. Impairment is
      the worst-of {permanent impairment, each injury}, never additive; a grievous
      injury makes the part _unusable_ (no number), while permanent impairment tiers
      it but never unuses it. A `permanentlyUnusable` body-part field (a withered or
      amputated limb) also unuses it. `BodyPart` exposes `isCritical` (holds VITAL or
      CORE).
    - **`BeingLogic.health`** is `{ value, max, band }`: `max` is always 100; `value`
      is the physical-impairment ceiling — bucket impaired parts by (critical?, state,
      count) and take the minimum — floored at 1 for a living being and 0 only when
      `dead`; `band` is the mapped label. The header shows the band label (with the
      `%` as a tooltip).

    Fatigue, fear, and shock will later impose their own ceilings, composing by `min`
    with this physical one.

    Covered by unit tests (`bodyPartImpairment` tiers/usable/permanent,
    `physicalHealthCeiling` table + worked examples, `healthBand`, `deriveHealth`,
    `BeingLogic` health, `BodyPart` isCritical/permanentlyUnusable) and a
    `being-header-health` e2e. The Being user-guide and `body-structure.md` document
    the banded model.

- 6cafc38: **Make the Being sheet's compact list-row styling actually apply (#515)**

    The compact-row rules added for #515 were authored as `.being { … }` inside
    `components/_items.scss`, which is loaded under the `.sohl { }` wrapper, so they
    compiled to the _descendant_ selector `.sohl .being …`. ApplicationV2 places
    `sohl` and the `being` sheet-type class on the **same** sheet-root element, so
    that descendant selector never matched and the rules were dead CSS — Being list
    names still rendered as oversized Cinzel headings (multi-word trauma names
    wrapped to three lines).

    The styling now lives in its own `components/_being.scss`, loaded from `sohl.scss`
    under the **compound** `.sohl.being` selector (the same same-element trap the
    sheet frame avoids via `.sohl.sheet`). Column widths are keyed on `.list__items`
    so the header row and the data rows share them and their columns line up.

- e87ca4f: **Style the Being sheet's non-fieldset list headers (#515)**

    The compact list-header styling added for #515 was scoped to `fieldset
.list__header`, but the Gear ("On Body") and Combat weapon-group lists put their
    `.list__header` inside a `.list` div rather than a `<fieldset>`. Their header's
    `.list__name` heading therefore rendered at full Cinzel size with no header bar.
    The rule is now keyed on `.list__header` directly, so every Being list header
    gets the same compact label bar.

- f26c8bc: **Being Mysteries tab: Mysteries section**

    Reimplements the Mysteries section of the Being sheet's Mysteries tab (#310).
    - **A header per subtype, always shown.** Each mystery category (Birthsign,
      Blessing, Buff, Fate, Grace, Other, Piety) now renders its own section header
      in declared order, whether or not the being has any mysteries of that kind.
    - **Charges as ValueModifiers.** `MysteryLogic.charges.value` and `charges.max`
      are always `ValueModifier`s; a `null` source value leaves the modifier
      disabled, which drives the display rules (first match wins): `max` disabled →
      "×" (no charges); `value` disabled → "∞" (infinite remaining); `max` 0 →
      "_value_/∞" (infinite available); otherwise "_value_/_max_". Level shows "×"
      when `levelBase` is `null`.
    - **Associated skill.** Adds an `assocSkillCode` field to the mystery data model
      and resolves it to an `assocSkill` (a `SkillLogic`) during `evaluate`, shown in
      the section's Skill column.
    - **Subtype labels.** Adds the `SOHL.Mystery.SubType.*` localization keys the
      subtype choices reference (also fixes the item-sheet subtype dropdown).

    Remaining Time (called for on Blessing/Fate) is tracked separately and not yet
    wired.

- f26c8bc: **Being Mysteries tab: Mystical Abilities section**

    Reimplements the Mystical Abilities section of the Being sheet's Mysteries tab
    (#311).
    - **A header per subtype, always shown.** Each ability category (Shamanic Rite,
      Spirit Action, Spirit Power, Benediction, Ritual Devotion, Divine/Arcane
      Incantation, Arcane/Spirit Talent, Alchemy, Divination) renders its own
      section header in declared order, whether or not the being has any abilities of
      that kind, with Skill / Level / ML / Charges / Improve / Notes columns.
    - **Charges as ValueModifiers.** `charges.value`/`charges.max` are always
      `ValueModifier`s with `null` → disabled, driving the same ×/∞ display rules as
      the Mysteries section. The data model's `charges.value`, `charges.max`, and
      `levelBase` are now nullable so "no charges", "infinite", and "no level" are
      representable.
    - **Mastery level uses `MasteryLevelModifier`.** `masteryLevel` is now a
      `MasteryLevelModifier`. When the ability names no skill it uses its own
      internal mastery level (`masteryLevelBase`); when a skill is associated,
      `finalize` copies the skill's mastery level in via `addVM`, so the ability's
      own modifiers still stack on top rather than being replaced.
    - Cleans up a double `level` assignment in `initialize`.

- 9513d56: **Being sheet: working per-tab search filters, and fix the search normalizer that hid every row**

    Resolves #312. The Being sheet's list tabs now have live search-criteria inputs
    that filter their lists as you type.
    - **New inputs.** Adds the missing `search-criteria` boxes on the **Profile**
      (traits) and **Mysteries** (mysteries and mystical abilities) tabs. Each list's
      groups are wrapped in a single filter container so the search spans _all_
      subtype groups, not just the first — matching the existing Skills / Combat
      body-locations / Gear inputs.
    - **Filtering actually works now.** `SohlLocalize.normalizeText` used a
      non-negated character class (`/[%\x20-\x7E]/`) that matched _printable ASCII_
      and blanked every letter to a space, so the regex comparison never matched and
      every list-search filter hid all rows on any query. Negating the class
      (`/[^\x20-\x7E]/`) folds only non-ASCII characters, as the docstring intends;
      this repairs search across all tabs (Skills, Gear, body-locations, effects,
      and the new Profile/Mysteries inputs).
    - **Trauma tab has no search** (injuries and afflictions), by design — the
      previously-scaffolded afflictions search input and its filter registration are
      removed; the affliction create-control is kept.

    Covered by a new `normalizeText` unit suite (the ASCII-folding regression) and a
    `being-search-filters` e2e spec (traits filter live across groups; the Mysteries
    inputs render; the Trauma tab exposes no search).

- f4be3d8: **Restore the Being Profile attribute cards (#507)**

    Attributes rendered as loose unstyled text because the template emits
    `.attribute-score__*` BEM classes while `_profile.scss` still targeted the
    pre-rename `.attribute`/`.value`/`.label`. The card styling is re-keyed on the
    BEM classes — a dense six-column grid of compact bordered cards (name + ⋮
    header, large bold score, descriptor, and a `TL:` footer).

- f4be3d8: **Show icons on Being list rows (#508)**

    Skill rows (and injury/gear/affiliation rows) rendered without their icon: the
    skills row emitted no image element, and the shared `.list__image` had no size so
    it collapsed. `buildSkillGroups` now carries each skill's `img`, the skills
    template renders it, and `.list__image` is sized in the Being styles so every
    list row shows its icon.

- f4be3d8: **Distinguish the Being Trauma add controls (#510)**

    The Injuries header's two add controls both read as a plain "+". They are now
    distinct: a file-plus "Create a trauma item manually" and a d20 "Add an injury by
    rolling location & severity", with clearer tooltips. (The injury Area column
    already resolves from the body location for rolled injuries; a blank Area only
    appears for a manually-created trauma with no location set.)

- 5910ffa: **Add `no-floating-promises` and `await-thenable` ESLint rules**

    Two new type-aware rules catch real async correctness bugs:
    - **`@typescript-eslint/no-floating-promises`** — every Promise must be `await`ed, returned, or explicitly marked `void`. Catches fire-and-forget Promise chains that silently swallow rejections.
    - **`@typescript-eslint/await-thenable`** — flags `await` applied to a non-Promise value, which is always a logic bug.

    **Fixes found by the new rules:**
    - `SohlDataModel` and `BeingSheet` — `super._onRender()` was called without `await` in an `async _onRender` override, meaning drag-drop rebinding and filter rebinding ran before the parent render completed.
    - `SohlLogger` — `await new SourceMapConsumer(rawMap)` awaited a non-thenable constructor; `await` removed.
    - All `this.render()` calls in UI event handlers and `action.execute()` / `doc.update()` calls in sync callbacks are explicitly marked `void` to signal intentional fire-and-forget.

- 14de93f: **Style the `clearableNumberInput` clear affordance**

    Add `scss/components/_clearable-number.scss` (scoped under `.sohl`, mirroring the
    `_date-picker.scss` pattern) and wire it into `scss/sohl.scss` in the
    `sohl.components` layer. The `clearableNumberInput` helper's wrapper
    (`.clearable-number`) now lays out its number input and `×` clear control
    (`.clearable-number__clear`) as a flex row — the input flexes to fill, the clear
    sits adjacent with spacing, a muted default colour, `cursor: pointer`, and a
    `hover`/`focus` danger-colour state. Previously neither class was styled, so the
    `×` rendered as an unstyled inline anchor next to the input (visible on the
    affliction and trauma item sheets). Styling only; the `clearField` behaviour was
    already working.

    Closes #631

- 130ee3a: **Automated combat is turn-gated: only the current combatant may start an attack**

    Resolves #384. Documents SoHL's two combat modes (the user-facing **Combat
    Basics** guide and the developer **Combat Model** doc), and corrects a real
    divergence surfaced while writing them: automated combat is meant to run off the
    initiative order, but nothing enforced that the attacker be the combatant whose
    turn it is.
    - **Enforcement.** `SohlCombatantLogic.startAutomatedAttack` (the intrinsic
      `automatedCombatStart` executor both entry points converge on) now aborts, with
      a UI notice, when the attacker is not the active combat's current combatant.
      The check is a new pure, unit-tested helper, `outOfTurnAttackReason`. Only the
      current combatant may _start_ an attack; out-of-turn **defenses** — a
      counterstrike, or a Tactical-Advantage follow-up — are unaffected because they
      run through the `automated*Resume` (defense-resume) path, not this one.
    - **Dead code removed.** `SohlCombatant.startAutomatedAttack` (a document-level
      wrapper whose docstring wrongly called it "the single entry point") had no
      callers — both the weapon/technique and combat-tracker entry points dispatch
      the intrinsic action to the logic — so it is deleted.
    - **Docs.** The user guide, the Combat Model concept doc, and the Combat
      Resolution Pipeline reference now describe the turn gate (and its
      defense-side exception) instead of the earlier, incorrect "no turn gate" note.

- 996ecae: **Reconcile the Combat Model developer doc with the current combat code**

    The `docs/concepts/combat-model.md` combat concept doc (and two source JSDoc
    comments it flagged) had drifted as follow-up combat fixes landed:
    - Dropped the "turn-start location field-name mismatch" caveat — `updateCombat`
      now records `startLocation` correctly (fixed in #390).
    - Dropped the "`moveFactor` is unapplied" caveat — `computedMove()` now scales the
      being's `feetPerRound` by `moveFactor` (fixed in #393); updated the combatant
      properties table to match.
    - Removed the stale `allyIds` / `threatenedAllyIds` relationship-state row (those
      fields and their mutators do not exist; combat relationships are computed).
    - Corrected the assisted-impact description: `_onRollStrikeModeImpact` dispatches
      the actor's `calcImpact` action, it does not call the strike mode's `calcImpact`.
    - Fixed the `injuryButton` and `SohlCombat` group-seeding JSDoc so they match the
      code (aim is forwarded for aimed blows → automated injury; the desired group
      name comes from `actor.system.defaultCombatGroup`), and removed the now-resolved
      "stale docstrings" caveat.

    Closes #384

- 5cd84f1: **Stabilize the `combat-turn-gate` e2e spec against run order**

    The automated-combat turn-gate spec (#384) no longer depends on the ambient,
    viewport-resolved `game.combat` being `undefined` headless — an assumption that
    held only in isolation. Once a preceding combat spec had rendered the combat
    tracker, `game.combat` resolved this spec's active combat with the attacker as
    the current combatant, so the gate passed and the flow warned about the target
    instead of the turn (a full-suite-only failure).

    The spec now pins the combat's current turn to the **defender** and drives the
    **attacker**, so the current combatant is never the attacker and the gate always
    short-circuits with a turn reason, regardless of how `game.combat` resolves.
    Test-only change; the gate logic is unchanged. Closes #638 and #644.

- 0f59e18: **Fix: register the Combatant data model under `base` so combat works**

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

- d7ba98c: **Fix: `computedMove` now applies the combatant's `moveFactor` (#252)**

    `SohlCombatantLogic.computedMove()` returned the being's corpus `feetPerRound`
    verbatim and never read `system.moveFactor`, so the situational move scalar (run,
    difficult terrain, haste, …) was silently dropped even though the field exists to
    scale tactical move. It now returns `feetPerRound × moveFactor` (`moveFactor`
    defaults to `1`, so unscaled behavior is unchanged). `displayedMove` inherits the
    fix via delegation.

- 7771153: **Fix logic-level dialogs on Foundry v14 and consolidate the dialog helpers**

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

- e87ca4f: **Fix item and effect context menus throwing "Container not found" (#517)**

    Right-clicking an item/effect row or clicking its ⋮ control threw
    `Error: Container not found` and never opened the menu, so there was no way to
    edit or delete rows from a sheet. `SohlContextMenu._setPosition` located its
    container with `target.closest("div.app")` — a pre-v13 selector. Under Foundry
    v14 the ApplicationV2 frame carries the `.application` class, and for a
    DocumentSheetV2 the frame element is a `<form>`, not a `<div>` — so both
    `div.app` and `div.application` matched nothing.

    The lookup now matches on the class alone (`.application`), so the menu finds the
    frame, positions, and opens.

- 1b5ded4: **Per-creature injury scaling via a Corpus `bodyScale` factor**

    Resolves #468. Impact is absolute, but an injury _level_ is relative to the body
    absorbing it — the same blow is trivial to a cow and grievous to a cat. A new
    per-creature `bodyScale` factor scales the injury-level table (not the impact),
    so the whole injury pipeline (Shock Index, bleeding, amputation, stumble/fumble,
    health) becomes size-correct at the source with no changes to those subsystems.
    - **`bodyScaleBase`** — new `CorpusData` field (`NumberField`, `initial: 1.0` =
      baseline human, `min: 0.01`); additive, so existing corpora load human-scaled
      with no migration. Exposed as the floored `bodyScale` ValueModifier on
      `CorpusLogic`, which derives a scaled `injuryTable` in `evaluate` (the master
      `BASE_INJURY_THRESHOLDS` `[1, 5, 10, 15, 20]` is never mutated). A delta on
      `bodyScale` (shrink/enlarge) re-scales the table within the same prepare cycle.
    - **`injuryLevelFromImpact`** now takes the creature's thresholds (defaulting to
      the human table, so existing callers are unchanged) and counts how many an
      impact reaches — an impact below the smallest scaled threshold leaves no wound.
      A 2-impact blow is `S2` on a `bodyScale` 0.27 cat but is ignored by a
      `bodyScale` 2.9 cow (which needs ≥ 3 for even `M1`). `resolveInjury` sources the
      table from the struck creature's Corpus via `body.injuryTable`.

    Covered by unit tests (`injuryLevelFromImpact` scaled/default, `CorpusLogic`
    bodyScale + injuryTable + shrink delta + the `BodyStructure.injuryTable` seam)
    and a `injury-body-scale` e2e (the `bodyScaleBase` datamodel field drives the
    derived table). Docs updated (`body-structure.md` gains a Body-scale section).

- 23ddf43: **Fix: convert remaining DataModel array `choices` to value-keyed objects**

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

- 6403966: Add icons to Item sheet tabs
- bf2bc4e: **Docs: user-visible documentation changes are bug/feature, not chore (#398)**

    `system-development.md` now states that user-visible documentation — JSDoc (which
    publishes to the API site) and other user-facing docs (the `docs/` pages and the
    user guide) — is a `bug` (published docs are wrong, broken, or misleading) or a
    `feature` (new or expanded coverage), with a tracking issue and a changeset like
    any other change. Only non-published housekeeping (internal non-JSDoc comments,
    build and tooling config, repo meta) remains `chore/*`.

- 78e87dc: **Document the entity-serialization and chat-card scope contracts**

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

- d2ce43c: **Document the Node template-render harness in the testing guide**

    Add a _Asserting rendered HTML in unit tests_ section to the testing guide covering
    `renderTemplateReal` — how card/dialog templates render in Node (Foundry's
    `renderTemplate` is a Handlebars wrapper; cards and dialogs share the same shims),
    the two usage patterns (render a template directly, or drive an action and spy the
    shim), and the fidelity tiers (cards + dialogs render fully; sheet form builders
    render as binding placeholders). Note the narrow exception to the logic-layer scope
    so the guide stays internally consistent.

    Closes #585

- dcab4ed: **Document the two deliberate result-serialization exceptions**

    The `SuccessTestResult.toJSON` contract now documents _why_ two fields are
    carried in full rather than reduced to a reference, closing out the
    reference-on-wire epic (#202) after its sub-tasks landed:
    - `masteryLevelModifier` serializes its complete delta breakdown because the
      receiver renders it verbatim for combat transparency (`mlMod.chatHtml` in the
      standard and opposed result cards); a summarized form would lose the
      breakdown.
    - `successStarTable` travels as data (not a table reference) because custom,
      per-result description tables are a supported design goal (#206).

    JSDoc-only; no behavior change.

    Closes #202

- 13cc6dd: **Move aim/spread ownership to `ImpactModifier`**

    `aimBodyPartCode` and `spread` were duplicated — stored as direct fields on both `AttackResult` and `ImpactResult`, producing the same two values twice in each serialized tree. They now live exclusively on `ImpactModifier` (the weapon capability descriptor), which is the natural owner.

    **Changes:**
    - `ImpactModifier` — gains `aimBodyPartCode` and `spread` fields; both are serialized in `toJSON()`.
    - `AttackResult.aimBodyPartCode` / `.spread` — converted from stored fields to read-through getters (`this.impact.aimBodyPartCode` / `.spread`); removed from `toJSON()`.
    - `ImpactResult.aimBodyPartCode` / `.spread` — same conversion (`this.impactModifier.*`); removed from `toJSON()`.
    - `CombatResult.rollImpact()` — drops the now-redundant explicit `aimBodyPartCode`/`spread` pass-through; they flow automatically via the shared `ImpactModifier`.
    - `buildAttackResult()` — passes `aimBodyPartCode`/`spread` into `impact.clone()` so they are embedded in the modifier from the start.

    Closes #207.

- 73b8093: **Rehydrate `AttackResult.mode` to a live `StrikeMode`**

    `AttackResult.mode` previously held a `StrikeModeBase.PointerData` struct in memory (the wire form), making it unusable at runtime. It now holds the live `StrikeModeBase | undefined`, following the same pointer-on-wire / live-object-in-memory rule already applied to `DefendResult.mode` and `AttackResult.combatant`.

    **Changes:**
    - `AttackResult.mode` — runtime type changed from `PointerData` to `StrikeModeBase | undefined`; rehydrated via `StrikeModeBase.fromPointerData()` in the constructor. `undefined` when the weapon is absent from the current client (e.g. the defending client).
    - `AttackResult._modePointer` — private field retains the original `PointerData` for lossless `toJSON()` serialization.
    - `AttackResult.toJSON()` — `mode` is now serialized from `_modePointer` (same shape as before; no wire format change).
    - `SohlCombatantLogic` — two `StrikeModeBase.fromPointerData(atkResult.mode)` calls replaced with direct `atkResult.mode` access; the `priorAttackResult.mode` comparison guarded against `undefined`.

    Closes #204.

- b8654a4: **Seed a default strike mode for new combat-technique skills**

    Creating a `combattechnique`-subtype skill now seeds a default melee strike mode
    (named after the skill) when none is supplied, so the item is immediately valid
    and usable — a combat technique needs a strike mode for its Attack / Block /
    Counterstrike to mean anything. Handled in `SkillDataModel._preCreate`; every
    other skill subtype keeps a null strike mode.

- 57448e3: **Derive result text and success stars on read instead of storing them (#205)**

    A `SuccessTestResult` stored its outcome three ways: the raw `successLevel`
    (the true datum), the full description table, **and** the already-rendered
    `resultText` / `resultDesc` / `successStars` derived from that table. The derived
    copies were redundant — and a stale-copy hazard: change the table and the frozen
    strings no longer agree.

    `resultText`, `resultDesc`, and `successStars` are now **getters** that resolve the
    description table against the result's evaluated `successLevel` / `targetValue` /
    `lastDigit` on each read. `toJSON` no longer emits any of the three — the wire form
    carries only the raw `successLevel` (the one deliberately cached derived value) and
    the table (which already rides the wire as data, #206). `toChat` folds the derived
    strings into the chat-card data, rendered once by the sender. Legacy serialized
    results that still contain the three fields are simply ignored on revival and
    recomputed. This keeps a single source of truth, per the subsystem's
    _store only the minimum; never serialize what an in-memory object recomputes_ rule.

- a31561b: **Dodge is offered only when the actor has a usable Dodge skill**

    Previously the Dodge defense button appeared for every defender regardless of
    whether they had a Dodge skill.

    **Two gates fixed:**
    - **Automated chat card** (`chat-card-gating.ts`): Added `hasUsableDodgeSkill(actorLogic)` helper that checks `logicTypes[ITEM_KIND.SKILL]` for a skill with shortcode `"dge"`. `gateAutomatedDefenseButtons` now removes the Dodge button when the helper returns false — mirroring the existing Block/Counterstrike gates.
    - **Context menu** (`constants.ts` + `ExpressionHelperRegistry.ts`): `TEST_TYPE.DODGE.condition` changed from `"true"` to `"hasUsableSkill(actor,'dge')"`. Added `hasUsableSkill(actor, shortcode)` to `STANDARD_HELPERS` — a pure, duck-typed helper that walks `actor.logic.logicTypes["skill"]` to find the skill, with no Foundry import required.

    Closes #64.

- fe9127b: **Move hardcoded `FATE_DESC_TABLE` / `STANDARD_SUCCESS_VALUE_TABLE` entries to i18n**

    Both tables previously used module-level constants with static English strings. They are now getter functions (`getFateDescTable()` and `getStandardSuccessValueTable()`) that resolve labels and descriptions via `sohl.i18n.localize()` at call time so the active locale is available.

    **New i18n keys added:**
    - `SOHL.Skill.FateDesc.loseFateNoEffect.*`, `SOHL.Skill.FateDesc.noLossNoEffect.*`, `SOHL.Skill.FateDesc.success.*`, `SOHL.Skill.FateDesc.critSuccess.*`
    - `SOHL.MasteryLevel.SvTable.noValue.*`, `littleValue.*`, `baseValue.*`, `bonus1.*`–`bonus5.*`

    Closes #70.

- a827ad6: **Constrain the actor sheet header portrait**

    Fixes [#57](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/57):
    the header portrait sizing rule now targets `img.actor-img` — the class the actor
    header templates actually render — instead of the stale `img.profile` selector.
    The portrait is held to 100px again on all five actor sheets, so the header is
    compact and the tab content area gets its space back.

- db0812a: **Key embedded items when exporting the actors pack**

    Fixes [#59](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/59):
    the actor pack exporter now writes a hierarchical `_key`
    (`!actors.items!<actorId>.<itemId>`, and `!actors.items.effects!…` for any
    effects an item carries) on each embedded item. Foundry's LevelDB pack compiler
    keys every embedded document by `_key`, so without it the compile aborted with
    `LEVEL_INVALID_KEY` ("Key cannot be null or undefined") as soon as the actors
    pack contained an actor.

- 9fd329c: **Actor sheet search filter works for effects and body-location rows**

    The filter previously called `querySelectorAll(".item")` and read `el.dataset.itemName`. Effect rows use `.effects__row` (no `.item`) and body-location rows are `.item` but carry no `data-item-name` — so both were silently broken (effects never matched; body-locations were all hidden on any query).

    **Approach:** A new `applySearchFilter(query, rgx, content)` pure helper queries `[data-search-name]` and reads `el.dataset.searchName`. `SohlActor._displayFilteredResults` now delegates to it. All filterable `<li>` rows in the eight being/cohort tab templates receive `data-search-name="{{name}}"`, making the filter class-agnostic and fixing effects, body-locations, and gear in one pass.

    Closes #104.

- 4f38348: **Repair actor sheet tab navigation**

    Fixes [#53](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/53):
    the Being actor sheet crashed on render, and tab content rendered hidden on all
    actor sheets (Being, Cohort, Structure, Vehicle, Assembly). The Being `tabs` part
    now uses Foundry's core navigation template, and every actor tab section resolves
    its `active` state and tab group so the correct tab body is shown.

- fda25c7: **Complete `ValueModifier.addVM` so it preserves the full modifier derivation**

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

- 900fc20: **Emit the attacker-side injury button when a counterstrike lands**

    `buildCombatCardData` hard-coded `hasAttackInjury: false` with empty
    `attackInjuryHandlerUuid`/`attackInjuryScope` on both the main attack card
    and the counterstrike (CX) card, so the attacker could never receive an
    injury button even when the defender's counterstrike landed a blow.

    The fix mirrors the existing defender-side `injuryButton(...)` logic:
    - **Main attack card:** `atkInjury = injuryButton(cxImpact, atkResult.token.uuid)` — the original attacker takes an injury when the CX blow lands.
    - **CX card:** `atkInjury = injuryButton(cxImpact, attackResult.token.uuid)` — same CX impact, targeting the original attacker's token (now the "defender" on the CX card).

    `atkInjury` is `null` when no CX exists or the CX missed, so `hasAttackInjury` stays false in the normal (non-counterstrike) case.

    Closes #186.

- 15116de: **`BeingSheet._onRollStrikeModeTest` uses the correct modifier for the chosen test kind**

    Previously the method always called `sm.attack` regardless of whether the
    player clicked a block or counterstrike cell. It now delegates to a new
    pure helper, `selectStrikeModeModifier(sm, testKind)`, which maps:
    - `"attack"` → `sm.attack`
    - `"block"` → `(sm as MeleeStrikeMode).defense.block`
    - `"counterstrike"` → `(sm as MeleeStrikeMode).defense.counterstrike`

    An unknown `testKind` returns `undefined` and the roll is silently
    skipped. The helper is unit-tested in `being-sheet-view.test.ts`.

    Closes #178.

- bc219f0: **Security:** Fix XSS in `CalendarSettingsMenu._onDeleteCalendar` via imported calendar name (#163).

    `cal.label` (verbatim from a GM-imported JSON file) was passed to `game.i18n.format` without HTML escaping. A calendar named `<img src=x onerror=…>` would execute when the GM opened the delete confirmation dialog. Also fixed the sibling import-success notification that used `calendarConfig.name` unescaped.

    Both `cal.label` and `calendarConfig.name` are now wrapped with `foundry.utils.escapeHTML` before interpolation. Also adds `foundry.utils.escapeHTML` and `foundry.utils.deepClone` stubs to the test setup.

- 4a79e8d: **Authorize chat-card clicks by the handler document's ownership**

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

- 805d19d: **Eliminate the doubled attack/defend payload in `CombatResult.toJSON()`**

    `CombatResult.toJSON()` was emitting each nested result twice: once as `sourceTestResult`/`targetTestResult` (inherited from `OpposedTestResult`) and again as `attackResult`/`defendResult` (redundant stored fields). Every combat card's `data-scope` carried four result objects where two were sufficient, roughly doubling the cross-client payload.

    **Changes:**
    - `attackResult` and `defendResult` are now **read-only getters** that alias `sourceTestResult`/`targetTestResult`; the stored fields are gone.
    - The `CombatResult` constructor normalises construction-time aliases (`attackResult`→`sourceTestResult`, `defendResult`→`targetTestResult`) before calling `super()`, so callers may pass either name — including the revival path, which only sees the serialised `sourceTestResult`/`targetTestResult` keys.
    - The `toJSON()` override is removed; `OpposedTestResult.toJSON()` already serialises the pair correctly.
    - `buildCombatResult` in `SohlCombatantLogic` no longer passes redundant keys.

    _Verify: `CombatResult.toJSON()` now contains one attack result and one defend result (not four), and a round-trip via `defaultFromJSON` restores `attackResult === sourceTestResult`._

    Closes #203.

- d512cb7: **Enable type-aware `@typescript-eslint/consistent-return` lint rule (#235)**

    Enables the type-aware `@typescript-eslint/consistent-return` ESLint rule (with the base `consistent-return` rule turned off to avoid false positives on `void` returns). The type-aware version correctly distinguishes functions returning `Promise<T | undefined>` — where bare `return;` is inconsistent with `return value;` — from `Promise<void>` functions where bare returns are fine.

    **Changed files:**
    - `eslint.config.js` — added `parserOptions.project: true` + `tsconfigRootDir`, disabled base `consistent-return`, enabled `@typescript-eslint/consistent-return`
    - All bare `return;` statements in non-void async functions changed to `return undefined;` across: `SohlLogic`, `SohlActor`, `SohlItem`, `SohlCombatant`, `BeingLogic`, `SohlCombatantLogic`, `SohlTokenDocumentLogic`, `MasteryLevelModifier`, `StrikeModeBase`
    - `_preUpdate`/`_preCreate` overrides that fell off the end without a return now have an explicit `return undefined;`

- 463d55f: **Fix default context-menu conditions that never matched**

    The default `condition` strings on the improve-flag, transmit-affliction, and
    diagnosis context-menu entries — and the `improveWithSDR` action `visible`
    predicate — still referenced the pre-#459 document paths (`item.system.canImprove`,
    `item.system.data.improveFlag`, `item.system.canTransmit`,
    `item.system.data.isTreated`). `canImprove` / `canTransmit` are getters on the
    **logic** layer, not the DataModel, and `item.system.data` is not a valid
    accessor, so every one of these predicates resolved to `undefined` (falsy) and
    the entries stayed hidden regardless of state.

    Migrated them to the logic-layer bindings (`itemLogic.canImprove`,
    `itemLogic.data.improveFlag`, `itemLogic.canTransmit`,
    `itemLogic.data.isTreated`), matching the affliction/trauma predicates already
    migrated in #459. The Improve, Transmit, and Diagnosis entries now appear when
    their underlying state holds.

    Closes #458

- 35a08f5: **Fix the Add Injury flow never recording a trauma**

    `createTraumaFromInjury` called `actor.createEmbeddedDocuments(...)`, but both
    call sites pass the `BeingLogic`, not a Foundry actor, so it threw
    `TypeError: actor.createEmbeddedDocuments is not a function` and no trauma was
    created. It now routes the write through a new
    `FoundryHelpers.fvttCreateEmbeddedItems(actorLogic, itemsData)` boundary, which
    resolves the actor from the logic — keeping `injury-actions.ts` free of direct
    Foundry calls. With this, the Add Injury flow records the trauma end to end. (#286)

- be5bc15: **Security:** Fix stored XSS in `DomainManagerApp.promptForEntry` (#160).

    Registry fields (`label`, `description`, `img`, `iconFAClass`, `shortcode`, `sort`) were interpolated unescaped into the `DialogV2.prompt` content string. The domain registry is plantable via the `sohl.domains` world setting and module registration, and the dialog runs in GM (full-privilege) context.

    All registry field values are now passed through `foundry.utils.escapeHTML` before interpolation. The sibling `domain-manager.hbs` list template already used auto-escaped double-stash and is unaffected.

- d5514b1: **Fix two e2e specs (#502, #503)**
    - **#502** — the affliction action-gating spec modelled a "treated" affliction with the retired `isTreated` flag, but `isTreated` is derived from `treatmentDate` (#484), so the flag was ignored and `canTreat` stayed true. The spec now sets `treatmentDate`.
    - **#503** — with Cypress `testIsolation` off, a permanent error notification raised by one spec (e.g. Foundry's `Hooks.onError` on a caught data-prep failure) persisted and overlaid the Being-header status pill in a later spec, failing an unrelated click. Each test now starts from a clean notification UI, so a bled notification can no longer cover another spec's controls. (The underlying prep error is tracked separately, e.g. #512.)

- cd72c0e: **Fix: de-flake e2e specs that place canvas tokens (#611)**

    Placing a Token in the headless Cypress browser triggered core's canvas render
    chain (`Token.draw` → `TokenRuler.draw` → `GridLayer.addHighlightLayer`, and the
    per-tick `_refreshState` refresh) against a viewport that never finishes
    initializing. Core then reached for absent canvas infrastructure and threw
    unhandled promise rejections (`reading 'addChild'`, `reading 'OBJECTS'`) that
    landed on whatever spec was running, failing token-placing specs
    (`movement-reach`, `scene-tokens`, the combat specs) nondeterministically. The
    aborted draw also left the combatant's actor-derived state (`computedMove`)
    reading `null`.

    Two harness-only changes (no system code touched):
    - **Suppress placeable-`Token` rendering headless.** After login the harness
      no-ops the placeable `Token`'s `draw` and `applyRenderFlags`. This suite never
      asserts on rendered token pixels — it reads the `TokenDocument` and each
      combatant's Foundry-free `.logic` — so skipping the PIXI render removes the
      render race at its source. A narrower, safer guard than allow-listing the generic
      `addChild` / `OBJECTS` messages globally.
    - **Place linked tokens.** `placeToken` / `placeAdjacentTokens` now create
      `actorLink: true` tokens, so a combatant's `.actor` is the world actor a spec has
      already prepared — not an unprepared synthetic (delta) actor whose logic was only
      populated as a side-effect of the (racy) canvas draw. `computedMove` / `reach`
      reads are now deterministic and canvas-independent.

    Fixes #611

- af07406: **Fix broken in-page anchor links in the Event Queue reference**

    Two cross-references in `docs/reference/event-queue.md` pointed at anchors that
    Hugo/GitHub never generate, so the links 404'd:
    - The scene-region worked-example heading carried a trailing `(#593)`, which
      slugifies to `…-entering-593` — but both references (here and in
      `module-development.md`) linked `…-entering`. Dropped the `(#593)` suffix so
      the heading slug matches its links, consistent with the other cross-linked
      section headings, which omit the issue number.
    - The two `[query]` links to _"7. Query the schedule"_ dropped the double hyphen
      the em-dash produces (`schedule--when`), so they resolved to nothing. Corrected
      the anchors.

    Completes the "links resolve" acceptance of #608.

- 5b0d2f0: **Security:** Fix catastrophic ReDoS in `FILE_PATH_REGEX` (#165).

    The inner character class `[^<>:"|?*\n\r]` allowed `/` and `\`, which overlapped with the adjacent `(?:[\\/]...)` group. For an N-segment path ending with a forbidden character, the engine explored O(2^N) backtracking paths — a 30-segment input caused a ~60-second hang.

    The fix excludes `/` and `\` from both inner char classes (`[^<>:"|?*\n\r\\/]+`), making each path separator consumed by exactly one arm and reducing matching to O(N).

- b5cef7e: **`BeingLogic.getUsableStrikeModes()` returns the actor's usable strike modes**

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

    Closes #177.

- 20afc77: **Security:** Fix Handlebars SSTI and XSS in dialog HTML builders (#159, #164).

    **`SohlItem._moveQtyDialog` (#159):** Item names, source/target container names, and quantity were interpolated directly into Handlebars template source before compilation, allowing SSTI (proto-chain code execution) via crafted names and enabling stored XSS. Names are now placed in the Handlebars data context (`{{itemName}}`, auto-escaped) and compiled from a static template string. The `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags are removed.

    **Defense-in-depth hardening (#164):**
    - `SohlDataModel._addChoiceArrayItem`: choice labels and values from `data-choices` are now HTML-escaped with `Handlebars.escapeExpression` rather than concatenated into a template source string; the `Handlebars.compile` + `allowProto*` step is eliminated.
    - `selectArray` Handlebars helper: `option.value` is now escaped with `Handlebars.escapeExpression` to match the existing escaping on `option.label`.
    - `FoundryHelpers.toHTMLWithContent`: removed `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags; plain-object contexts do not need proto-chain access.

- 499bfe4: **Fix the injury chat card failing to render**

    `templates/chat/injury-card.hbs` closed its `{{#if needsShockRoll}}` block with
    `{{/unless}}` instead of `{{/if}}`, so rendering threw `if doesn't match unless`
    and no injury card was posted (aborting the Add Injury flow before the trauma was
    recorded). (#283)

- cd526ee: **Fix the broken Add Injury flow**

    `BeingLogic.addInjuryViaDialog` / `onCreateInjury` resolved the target body via
    `getActorBodyStructure(this)`, but `this` is the `BeingLogic` — which exposes
    `logicTypes`, not the Foundry actor's `itemTypes` — so the lookup always returned
    `undefined` and the flow aborted before any dialog (whose "no body" warning then
    hit the logger recursion). And `BeingSheet._onAddInjury` called
    `this.document.addInjuryViaDialog()`, a method the actor does not define (it lives
    on `BeingLogic`). `getActorBodyStructure` now reads the lineage body through the
    logic's `logicTypes` (matching how the rest of `BeingLogic` reaches it), and the
    sheet action routes through `.logic`. (#268)

- ba3f491: **Bump the `input-label` typography token from 14 px to 16 px**

    All other body and label tokens were already at 16 px; the `input-label`
    entry in `scss/abstracts/_typography.scss` was the only one still at 14 px,
    causing form field labels to render noticeably smaller than the rest of the
    UI text.

    Closes #112.

- e424c47: **Fix actor import crash from unwired intrinsic actions**

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

- f9ca4ae: **Fix a localization-key collision that silently dropped all SoHL translations**

    `lang/en.json` defined `"SOHL.Trauma.Pall"` as a string leaf **and**
    `"SOHL.Trauma.Pall.Note.*"` as a branch under the same path. Foundry runs
    `foundry.utils.expandObject` on every translation file as it loads it, and that
    throws when a key is a strict dotted-prefix of another (`Cannot create property
'Note' on string 'The Pall'`). Foundry catches the throw and discards the
    **entire** file — so a single colliding pair dropped _all_ `SOHL.*` and `TYPES.*`
    strings and every SoHL label rendered as its raw key.
    - Align the Pall trauma with its sibling traumas (`SOHL.Trauma.Fear`,
      `SOHL.Trauma.Morale`) by moving its name to `SOHL.Trauma.Pall.DefaultSource`, so
      `SOHL.Trauma.Pall` is a pure branch and no key is both a leaf and a branch.
    - Add a `lint:lang` build guard (`utils/check-lang.mjs`, wired into `lint`) that
      fails the build fast — before the type-check and tests — on any dotted-prefix
      key collision in a `lang/*.json` file, so this class of regression can never
      ship again.

    Closes #636

- 14d2399: **Fix infinite recursion in `SohlLogger.uiWarn` / `uiInfo` / `uiError`**

    The notify branch of `log()` re-entered the same `uiWarn`/`uiInfo`/`uiError`
    method — which calls back into `log()` with the same `notifyLevel` — recursing
    without bound and crashing the client with `RangeError: Maximum call stack size
exceeded` on **any** UI-notify log call. The notification now goes straight to
    Foundry's notification manager (`ui.notifications`), and the two previously
    unguarded `i18n.format` calls in `log()` are wrapped so a formatting failure
    cannot throw out of the logger. (#267)

- b02decf: **Security:** Fix ReDoS in `matches()` expression helper (#166).

    `MAX_PATTERN_LENGTH = 200` bounded pattern length but not backtracking complexity. A sub-200-char pattern with nested quantifiers (e.g. `(a+)+`) against attacker-influenced input could hang the JS engine for seconds or minutes.

    Adds `hasCatastrophicPattern()` static analysis before `new RegExp(...)` is called. Patterns containing backreferences (`\1`–`\9`) or a quantified group whose body itself contains a quantifier (`(a+)+`, `(.*)* `, `([a-z]+\d)+`) are rejected with a `SafeExpressionError`. Legitimate single-level quantifiers (`a+`, `[a-z]+`, `(?:foo|bar)`) are unaffected.

- 55dc096: **Fix the release workflow so GitHub Releases include the system archive**

    Fixes [#120](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/120):
    the release workflow uploaded its assets from `build/release/`, but the packaging
    step writes `system.zip` and `system.json` to `build/dist/`. The upload now points
    at `build/dist/`, so published Releases carry the installable system files that
    Foundry's manifest/download URLs reference.

- 1e39fc7: **Fix: Script actions never executed their referenced Macro**

    Two bugs meant a Script action (an `actionDefs` entry running a referenced Foundry
    Macro, #156) could never run, so its macro's return value never came back:
    - **Stored actions lost their `shortcode`.** The `actionDefs` schema
      (`SohlDataModel`) omitted the `shortcode` field, so a persisted action's
      shortcode was stripped on save — `logic.actions.get(shortcode)` could never
      find it. Added the field.
    - **`SohlAction.resolveContext` was one level short.** It walked
      `action -> logic -> data model` and read `documentName` off the data model
      (which has none), yielding an `undefined` owning actor. For a Script action
      that failed the execute-permission gate, so `execute()` returned early with no
      error. It now walks the full `action -> logic -> data model -> document` chain.

    Also, the action context is now passed to the macro as `sohlContext` rather than
    `scope`: `scope` collides with the fixed parameter Foundry's macro runner already
    declares, which built the wrapper function with a duplicate parameter name.

    Fixes #348.

- e79e1ca: **Fix seven dialog templates failing to render on Foundry v14**

    Foundry v14 removed the `{{#select}}` Handlebars block helper, so the injury,
    damage, missile-damage, opposed-response, create-item, strike-mode, and
    query-weapon dialogs threw `Missing helper: "select"` and never opened. Each
    select is converted to the supported v14 pattern: `{{selectOptions}}` (with
    `valueAttr`/`labelAttr` for object lists), or an inline `{{#each}}` with
    `{{#if (eq …)}}selected{{/if}}` where the option value or label can't be
    expressed through `selectOptions` (string lists and formatted labels like `dN`).
    This also repairs the Add Injury flow end to end (its dialog can now render). (#280)

- 35ec141: **Fix the shared data-model schema spread**

    `defineSohlDataSchema()` — the schema for the fields every SoHL data model is
    meant to carry (`shortcode`, `docUrl`, `actionDefs`) — was defined but never
    spread into any concrete schema, so those fields were absent from every item
    and actor data model. Spread it into the item, actor, and combatant base
    schemas so the fields exist and persist. `shortcode` is made lenient
    (`initial: ""`), a safe default since it was previously unvalidated everywhere.

- 43136cb: **Fix always-read-only rich-text editors on document sheets (#453, #452)**

    Every SoHL sheet computed its `editable` render-context flag from
    `this.document.editable` — but a Foundry _document_ has no `editable` property
    (that is a _sheet_ property), so the value was always `!!undefined` → `false`.
    The base `DocumentSheetV2._prepareContext` had already set `editable:
this.isEditable` correctly; the override clobbered it.

    As a result every `{{editor … editable=editable}}` field (the Being sheet's
    Profile _dossier_ and Facade _appearance_ ProseMirror editors) rendered
    read-only for everyone, including a GM who owns the actor — the editor never
    became editable, so those descriptions could not be edited on the sheet. The
    flag now reads `this.isEditable`, so ownership/permission correctly drives
    editability. Verified by the previously-red `profile-section` and
    `facade-section` e2e specs, which now pass.

- 47ac0c5: **Repair sheet layout broken by a dead CSS scope**

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

- 5edb0e7: **Restore type safety on `sohl.*` and SoHL document types (fix stale `sohl-globals.d.ts`)**

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

- 8f3ab56: **Bug fix:** `SohlSpeaker._toChatWithContent` now correctly awaits `toHTMLWithContent`.

    The inline-content chat path was assigning a `Promise` to `messageData.content` instead of the resolved HTML string, causing chat messages to render as `[object Promise]` or empty. Added `await` to match the sibling `_toChatWithTemplate` path.

- a7b9ea5: **`successValueTest` passes the correct `svTestContext` to `successTest`**

    Previously, `successValueTest` built `svTestContext` with the right `svTable` and index-offset `targetValueFunc` but then called `this.successTest(context)` with the original, unmodified context. As a result, `successValueTest` behaved identically to a plain `successTest` and the success-value grading was never applied.

    The fix passes `svTestContext` (spreading any caller-supplied scope fields underneath, then overriding with `svTable` and the index-offset func) to `this.successTest(...)`.

    Closes #78.

- 42b1f0b: **`SuccessTestResult.testDialog` records the target's movement from the dialog form**

    The `targetMovement` handling block was commented out with a `FIXME(#75)`.
    The block referenced a nonexistent `this.targetMovement` field and the wrong
    guard name (`isMovement`). The fix:
    - Reads `formData.targetMovement` (not `data.targetMovement`)
    - Validates with `isSuccessTestResultMovement`
    - Assigns `this._movement` (the existing `movement` backing field)
    - Throws `Invalid target movement "…"` for unrecognized values, mirroring the
      existing `rollMode` validation pattern directly above it

    Also adds `isSuccessTestResultMovement` to the import list.

    Closes #75.

- d6219e2: **Fix future-tense relative time rendering; correct calendar docs**

    The `sohl.relative` formatter wraps future durations with the SoHL-owned
    `SOHL.TIME.Until` localization key, which was missing from `lang/en.json` — so
    "… from now" times rendered the raw key while past ("… ago") times worked. Adds
    the key (`{since} from now`).

    Also corrects `docs/reference/calendar.md`, which described the three formatters
    as static methods on `SohlCalendarData` registered in `SohlSystem.ts`; they are
    standalone functions in `sohl-calendar-logic.ts` registered via `sohl-config.ts`,
    and the `sohl.relative` example is updated to the real output.

    Closes #477.

- 939b0e3: **Fix Foundry V14 item lifecycle: rename `prepareEmbeddedData` → `prepareEmbeddedDocuments`**

    `SohlActor` overrode `prepareEmbeddedData()`, the V13 Foundry Actor method name. Foundry V14 renamed this to `prepareEmbeddedDocuments()`, so the SoHL three-phase item lifecycle (initialize → evaluate → finalize) was never called. All computed logic-layer properties on embedded items (`score.effective`, `masteryLevel.effective`, `reach.effective`, etc.) were permanently `undefined` at runtime in V14.

    The fix renames the override to `prepareEmbeddedDocuments()` and updates the `super` call accordingly.

- b63af82: **Security:** Fix stored XSS in `ValueModifier.chatHtml` via unescaped delta names (#162).

    Delta `name` and `value` fields were interpolated unescaped into the `chatHtml` string that is rendered via triple-mustache (`{{{ }}}`) in `opposed-result-card.hbs` and `standard-test-card.hbs`. A crafted delta `name` embedded in an opposed-request card's `data-scope` would be revived on the target's client and re-broadcast to all connected clients as live HTML.

    Both `m.name` and `getValue(m)` are now HTML-escaped via the new pure `escapeHTML` utility added to `src/utils/helpers.ts`. Delta names/shortcodes are not validated upstream, so escaping at the source is required.

- 1b9f62d: **Correct valueDesc element localization keys in en.json**

    Fixes [#55](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/55):
    the `Trait.valueDesc` element subfields now localize under
    `valueDesc.element.label.*` / `valueDesc.element.maxValue.*`, matching Foundry's
    array-of-schema convention. This removes the key collision that aborted
    localization on world load and places the keys where the field auto-localizer
    looks them up.

- c3ef031: **Fix: form-select fields with array `choices` submitted invalid values**

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
    tracked in #148.

    Refs #141

- 3f01933: **Tooling/docs: generate the `@heroiclands/sohl-types` declarations from source (#407)**

    `@heroiclands/sohl-types` now ships type declarations **generated from the SoHL
    source** (a `tsc` declaration emit rolled up by `rollup-plugin-dts`), so they can't
    drift: a single self-contained `index.d.ts` that types the `sohl` global with the
    full namespace tree (`sohl.document.effect.foundry.SohlActiveEffect`, …) and
    exports the public Logic/Data and domain class types, with `fvtt-types` kept as a
    peer dependency (it supplies Foundry's globals). Build with `npm run build:sohl-types`.

    Retires the hand-maintained `types/sohl-public-api.d.ts`, which had drifted (it
    still referenced the removed `LineageLogic`) and — being copied with `../src/`
    relative imports — never resolved once copied into a consumer module. The docs
    (`api-access-map.md`, `module-development.md`) now describe the npm package as the
    only consumption path.

    The release workflow publishes the package to npm via **Trusted Publishing
    (OIDC)** — no `NPM_TOKEN` — idempotently on each system release (requires a
    Trusted Publisher configured on npm for this repo + `release.yml`).

- e9f0464: **Guard the Being sheet against uninitialized item logic (#511)**

    A freshly-dropped or not-yet-initialized item could crash the Being sheet. An item's logic seeds its `ValueModifier`s in `initialize()`, so they are `undefined` until that runs; several logic getters and sheet render reads dereferenced them without a guard, so a single such item threw. In the render path this was unrecoverable — dropping an affliction made `AfflictionLogic.levelLabel` throw during the Trauma-tab context prep, and the sheet could no longer be opened.

    Hardened the reads so a partially-initialized item degrades to a default instead of crashing: `AfflictionLogic.levelLabel` and `canHeal`, `SkillLogic.canImprove`, and the Being sheet's Attributes / Skills / Health / Corpus render reads (added the missing optional chaining on the nested modifier). This is a whole class of defect — a logic getter that assumes its modifiers are seeded can brick the sheet when read on an item whose lifecycle has not completed.

- dc54121: **Make `helpers.ts` strictly Foundry-free and break the helpers ↔ FoundryHelpers cycle**

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

- 35ec141: **Icon attributions**

    Expand the icon-attribution list in the README with credits for additional
    icons sourced from The Noun Project and Game-Icons, and sort the list
    alphabetically.

- 78e87dc: **`isA` guards for item/actor kinds and logic base types**

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

- 5dccfb1: **Fix the item Description tab persisting to a non-existent field**

    The item-sheet Description tab's ProseMirror editor bound `system.description`,
    which is not a schema field (the item schema defines the long-form description as
    `docHtml` and the short row `notes`). Edits in the Description tab were silently
    dropped. The editor now binds `system.docHtml`, so the item's long description
    persists.

    Closes #536

- f4be3d8: **Constrain the item-sheet header image (#528)**

    An item sheet's header image rendered at its natural size and filled the whole
    `window-content`, collapsing the tab body below it to zero height (its form was
    invisible and could not scroll). The header image is now pinned to a fixed size
    with a divider, like the actor portrait, so the tab body keeps the remaining
    space.

- c8799e5: **Knowledgebase site (kb.heroiclands.org) on the shared Heroic Lands theme (epic #418)**

    Stands up the knowledgebase as a Hugo site built on the shared
    `heroiclands-hugo-theme` — the same brand theme behind www.heroiclands.org — so the
    KB shares its header, footer, palette, fonts, and info-block sidebars and reads as
    one property with www and the API site. This supersedes the earlier Astro/Starlight
    scaffold, reusing the polished theme wholesale.
    - **Content-prep pipeline** (`utils/build-kb-content.mjs`), the analogue of the main
      site's exporter: reads the authoritative `assets/content/` tree plus the repo's
      `docs/`, supplies the `title` Hugo needs, and routes each page into Hugo's content
      tree by frontmatter `type` (reference pages get the right infobox; developer docs
      go under `/dev/`). The rendered output is a gitignored build artifact.
    - **Being reference pages** — beings render with portrait, profile, attribute grid,
      categorized skills, and equipment, derived from the note's embedded `sohl.items[]`
      resolved against a content-wide `<type>:<shortcode>` index.
    - **Link resolution** — inline `{@link}` / `{@linkcode}` / `{@linkplain}` tags
      resolve against the TypeDoc symbol map to api.heroiclands.org links, and relative
      `*.md` / source links rewrite to KB dev routes or GitHub blob URLs, both guarded
      to skip fenced code and inline code spans.
    - **Shared nav** — picks up the theme's Projects-dropdown hover-gap fix and the
      API/KB cross-links.

    Covers #418, #429, #435, #437, #442.

- f4be3d8: **Localize action, context-menu, type, and item-tab labels (#527)**

    Intrinsic action names, item context-menu entries, item type subtitles
    (`TYPE.ITEM.*` / `TYPE.ACTOR.*`), and item-sheet tab labels (`SOHL.Item.tab.*`)
    rendered as raw localization keys because the keys were missing from
    `lang/en.json` (and the Actions tab printed the title without localizing it). The
    missing keys are added and the Actions template now localizes the title, so all
    of these show readable text.

- 78e87dc: **Rename the logic `type` getter to `kind`**

    `SohlLogic.type` — the convenience getter returning a logic's actor/item kind
    (e.g. `"skill"`, `"being"`) — is renamed to `SohlLogic.kind`, so the logic layer
    uses `kind` consistently with `SohlLogicData.kind` and the
    `ITEM_KIND` / `ACTOR_KIND` values it returns.
    - Callers now read `logic.kind` instead of `logic.type` (updated across the
      combatant, body, mastery-level, and strike-mode logic).
    - The Foundry document's own `type` property and `logic.data.type` are
      unaffected — only the logic-layer accessor is renamed. No behavior change.

- 84a2d5d: **Build compendium packs from in-repo Markdown; retire the vault export (#419)**

    `build:compiledb` now generates each pack's per-entry JSON from the authoritative
    `assets/content/` Markdown into a `build/packs-json/<pack>/` intermediate and
    compiles the LevelDB packs from it. The JSON is a disposable build artifact — never
    committed — and the build needs no HeroicLands vault.
    - Content is routed by **frontmatter, not directory**: `type` selects the pack (item
      kinds → items, `type: doc` → journals, `character` / `creature` → actors) and
      `package: sohl` scopes it to the system, so setting-specific content is excluded.
    - Removed the `packs:export` / `packs:rebuild` / `packs:clean` scripts and the vault
      code paths (`utils/packs/export.mjs`, `clean-sources.mjs`). The pack compilers now
      read `assets/content/` (`contentBase`) rather than the vault.
    - Entry IDs come from frontmatter `id`, so compiled IDs are unchanged across the
      move (verified against the prior committed sources: items 0 dropped, actors
      identical).

- 78e87dc: **Curated `toJSON` serialization across the entity layer; retire `instanceToJSON`**

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

- c4dfc5b: **Docs: define each `MYSTICALABILITY_SUBTYPE` value, and fix its display labels**

    The twelve mystical-ability subtypes (`SHAMANICRITE`, `SPIRITACTION`, `BENEDICTION`, …)
    had no definition anywhere: not in TSDoc, not in `lang/en.json`, not in consuming code.
    The constant is part of the published API (every `src/**/*.ts` export is bundled into the
    TypeDoc entry point), so readers saw twelve bare identifiers with no explanation.

    Each value now carries a one-line TSDoc comment naming its realm (Arcane, Divine, Spirit)
    and what distinguishes it from its siblings. TypeDoc renders these as a member table on
    the `MYSTICALABILITY_SUBTYPE` page.

    Two localization defects are fixed at the same time:
    - `SOHL.MysticalAbility.SubType.BIRTHSIGN` was **missing entirely**. Because
      `MysticalAbilityDataModel` builds its `subType` dropdown from these keys, a Birthsign
      ability rendered its raw localization key in the sheet.
    - The other eleven labels were mechanical title-case of the identifier — `"Shamanicrite"`,
      `"Spiritaction"`, `"Divineincantation"`. They are now properly spaced (`"Shamanic Rite"`,
      `"Spirit Action"`, `"Divine Incantation"`), taken from the long-unused
      `SOHL.MysticalAbility.Category.*` strings.

    Localization **keys** are unchanged; only the English display strings and the TSDoc move.

- e82a71c: **Namespace barrels + drift-check lint (#402)**

    Adds a hand-written `index.ts` barrel to every `src/` folder that is a namespace,
    forming the `sohl.*` namespace tree (`sohl.document.effect.foundry.SohlActiveEffect`,
    …). Each barrel re-exports its sibling modules via `export *` and its subfolder
    namespaces via `export * as`, with a description on each `export * as` line that
    becomes that namespace's documentation-page prose.

    A drift-check lint (`npm run lint:ns-barrels`, part of `npm run lint`) fails the
    build if a namespace folder lacks a barrel, a module or subfolder is not
    re-exported, or a namespace has no description — keeping the barrels in sync with
    `src/`.

    This is inert groundwork for the namespace-tree epic: nothing imports the barrels
    yet and the docs still build from the flat barrel, so the shipped bundle is
    byte-identical and the API docs are unchanged. Side-effect-only modules (`sohl.ts`,
    `automated-combat.ts`) are intentionally excluded from the tree.

- 2c4f0b8: **Fix: partial array-by-index updates no longer corrupt a being's body structure**

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

- c1d59ee: **Fix: Being Profile tab biography editor binds to `system.dossier`**

    The Profile tab's biography editor bound to `system.biography`, which is not
    defined in the actor schema, so it always rendered empty and edits to it were
    silently dropped. Point it at the existing `dossier` field ("rich-text dossier /
    background notes"). Adds an e2e spec (`profile-section.cy.js`) asserting the
    binding.

    Same bug class as the Façade tab fields fixed in #307.

    Closes #373

- 4696cf6: **Purge all TODO/FIXME markers; track deferred work in issues only (#440)**

    Deferred work is now tracked exclusively in GitHub issues, not flagged in the code.
    All 26 `TODO`/`FIXME` markers under `src/` are removed; each was already linked to
    an issue (#65, #67, #68, #70, #71, #72, #73, #74, #76), so the work stays tracked,
    and any code-site context was first migrated into the relevant issue.

    This also fixes the **API docs** (api.heroiclands.org): two markers lived inside
    published JSDoc, so the site rendered TODO text as documentation —
    - `CohortLogic`'s entire class description was its `TODO(#76)` block (a second
      `/** */` between the real description and `export class` won). The class now
      publishes its real description; an orphaned duplicate description block stranded
      above the imports was removed, and a latent unresolved
      `{@link COHORT_MEMBER_ROLE}` in that description (previously masked) was fixed to
      the qualified `{@link sohl.utils.COHORT_MEMBER_ROLE}`.
    - `GearLogic.sharedWithCohorts`'s doc no longer trails the TODO paragraph.

    The `lint:todos` guard (`utils/check-todos.mjs`, run in CI and `build:noci`) is
    flipped from "TODO/FIXME must be linked" to "**no** TODO/FIXME markers", enforcing
    the policy going forward. Contributor docs are updated to match. No runtime
    behavior changes.

- 78e87dc: **Runtime type brands via `isA`, replacing cycle-forming `instanceof`**

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

- 46fafce: **Add a Security Model & Guardrails developer document**

    New `docs/concepts/security-model.md` captures the system's threat model and the
    standing security guardrails for human and AI developers: reference code rather
    than compiling it from data (the `__kind` registry, intrinsic method names,
    Foundry macros), why regex "sandboxes" and client-only signatures are not boundaries,
    safe serialization, XSS/HTML rules, cross-client authorization vs. client-side
    gating, ReDoS, and a reviewer red-flag checklist. Linked from the docs index and
    `CLAUDE.md`, which gains a matching non-negotiable rule.

- bda7662: **Serialization canonicalizes empty entity fields to `null`**

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

- f114074: **Move pure view-model logic out of sheet classes into Foundry-free modules**

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

- e87ca4f: **Make sheet content tabs scroll instead of clipping (#514)**

    Long content tabs (the Being sheet's Skills, Combat, Trauma, Gear, and the
    overflowing tabs of other sheets) were clipped with no scrollbar. The base
    `.window-content .tab` rule set `overflow-y: hidden`, and the Being-specific
    override that was meant to fix it (`.being .window-content .tab`) was dead CSS —
    loaded under `.sohl.sheet` it compiled to `.sohl.sheet .being …`, which never
    matches because `sohl`, `sheet`, and `being` share one sheet-root element.

    The base rule now uses `overflow-y: auto`, so every SoHL sheet's tabs gain a
    scrollbar when their content exceeds the sheet height. `window-content` is a
    flex column with a definite height (a Foundry ApplicationV2 default), so the
    `height: 100%` tab is already bounded and needs nothing more. Paired with the
    `scrollable: [""]` part config that preserves scroll position across re-renders.

- 0070d6e: **Repo: scaffold the `@heroiclands/sohl-types` package (#407)**

    Adds `packages/sohl-types/` — a standalone, types-only, publish-public package that
    will ship SoHL's public type declarations to external TypeScript modules. This
    first `0.0.x` is a bootstrap placeholder that establishes the package and its
    Trusted-Publishing setup; the full generated declarations (the Logic/Data
    interfaces and the `sohl.*` namespace tree) follow in #407. No change to the SoHL
    system runtime — the package is published separately and declares no runtime
    values.

- 78e87dc: **Reorganize the source tree**

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

- 2fcd25b: **Refactor: split the Foundry-coupled item/actor foundations into per-concern files**

    `SohlItem.ts` and `SohlActor.ts` each bundled three concerns — the Document, the
    DataModel, and the SheetBase. Each is now its own file:
    - `SohlItem.ts` → `SohlItem` (Document) + new `SohlItemDataModel.ts` + `SohlItemSheetBase.ts`
    - `SohlActor.ts` → `SohlActor` (Document) + new `SohlActorDataModel.ts` + `SohlActorSheetBase.ts`

    Every importer now pulls each class from its own module (no barrel re-exports).
    The pre-existing re-export of the Foundry-free logic contracts
    (`SohlItemBaseLogic` / `SohlActorBaseLogic` and their types) is unchanged.
    Pure reorganization — no behavior change.

    Closes #77

- ef79747: **Fix: migrate weapongear strike-mode `defense` to the nested block/counterstrike schema**

    Every compendium weapongear stored strike-mode defense in the legacy flat
    shape (`defense.blockMod` / `defense.counterstrikeMod`), but `MeleeStrikeMode`
    now reads the nested schema (`defense.block` / `defense.counterstrike`, each
    `{ disabled, modifier, successLevelMod }`). Embedding a compendium weapon on an
    actor therefore threw `TypeError: Cannot read properties of undefined (reading
'modifier')` during `prepareData()`.

    Migrate all 71 affected `_source` items (162 defense blocks) to the nested
    schema, carrying each modifier value across and defaulting `disabled` to `false`
    and `successLevelMod` to `0`. Verified against the licensed test container:
    `gear-equip`, `combat-setup`, and `combat-automated` specs pass (compendium
    weapons now embed without crashing).

    Fixes #246

- 78e87dc: **`StrikeModeBase` is now a `SohlEntity`**

    `StrikeModeBase` — and its `MeleeStrikeMode` / `MissileStrikeMode` subclasses —
    now extends `SohlEntity`, bringing the strike-mode family in line with the other
    domain entities (results, modifiers, body parts). Its constructor forwards the
    owning logic as the entity `parent`, and its `Data` interface extends
    `SohlEntity.Data`.

    No behavior change: strike modes are still rebuilt from schema data on every
    preparation cycle and are not serialized through the kind registry (the
    inherited `toJSON` is unused).

- baa5c6d: **Make success-star / result-description tables serializable as data (#206)**

    A `SuccessTestResult.LimitedDescription` table maps a test outcome to a
    descriptive label — the mechanism for meaningful result text ("You go screaming
    down the halls in terror") rather than a bare "Critical Failure". Its computed
    `label` / `description` / `result` fields were **raw JavaScript functions**, which
    `JSON.stringify` drops silently, so a table could not cross to another client — a
    latent break as soon as anything on the receiver relies on it, and a blocker for
    author-supplied custom tables that must render for every player.

    Those fields are now `string | number | SafeExpression` instead of literal-or-
    function. A `SafeExpression` is **data** (a sandboxed source string), so the whole
    table serializes and revives with no registry and no cross-client module-install
    requirement — following the subsystem's reference-on-wire / live-object-in-memory
    rule. `toJSON` reduces each expression via `serializeLimitedDescriptionTable`; the
    constructor rehydrates it via `reviveLimitedDescriptionTable`, owned by the
    result's parent. The standard success-level table's two computed rows
    (`successLevel ± 1`) become `SafeExpression`s; the literal tables are unchanged.

    Adds the [Result-description Tables](docs/reference/result-description-tables.md)
    developer reference. Computed **string** labels/descriptions need richer
    `SafeExpression` string operations, tracked separately; this change needs only the
    existing numeric expressions. No runtime behavior change to the shipped tests.

- d04fced: Fix the Character Creation guided tour's opening step, which was effectively
  modal — Foundry's tour overlay blocked all input, so the user could not click
  the sidebar to create their character. `SohlTour` now lets pointer events pass
  through the fade/overlay on **every** step (not just gated ones), so a
  coach-and-wait tour never blocks the app it is coaching. The opening step is
  also split into two clearer highlight steps — highlight the **Actors** sidebar
  tab, then (auto-opening the Actors directory) highlight the **Create Actor**
  button — via a new `nav.sidebarTab` scene-setting option. Closes #656.
- 86f605e: Fix the Character Creation tour's create-actor step for a **collapsed sidebar**.
  The step's `nav.sidebarTab` now **expands** the sidebar (not just selects the
  Actors tab) — a programmatic `changeTab` doesn't auto-expand the way a user click
  does, so a collapsed sidebar previously stayed collapsed and the Create Actor
  button was never reachable. The spotlight also waits for the button's on-screen
  rect to **settle** before ringing it, so the sidebar's expand animation no longer
  leaves the ring placed where the button briefly was instead of where it comes to
  rest. Closes #660.
- 8044a2d: Fix the Character Creation tour-offer chat card so its body renders inline
  `**bold**` and `_italic_` markup as HTML instead of showing the literal
  `<strong>`/`<em>` tags. The card template escaped the already-localized content;
  it now uses a raw (triple-stache) render like every other SoHL chat card. Closes
  #654.
- e898bce: Make the Character Creation tour's create-actor step actually guide the user, and
  stop dialogs being shadowed. The step now **selects the Actors tab itself** and
  **spotlights the Create Actor button** (a bright fade ring on the button) while
  the step card stays **centered and stable** — previously the card was anchored to
  the sidebar via Foundry's shared tooltip, which the sidebar's own hover-tooltips
  hijacked, so it vanished the moment the user moved onto the sidebar and never
  returned. A new `SohlTour` `spotlight` step option provides this (ring the target
  without tooltip-anchoring the card), and a new `nav.sidebarTab` scene-setting
  option opens a sidebar directory first so its control is visible to ring.

    Dialogs the user must read or type in are **no longer shadowed** by the tour fade:
    while a tour runs, open dialogs are lifted above the fade. Closes #658.

- a1ceeae: **Fix: turn-start location is now recorded under the field it is read from**

    The `updateCombat` hook wrote the current combatant's turn-start position to
    `system.initialLocation`, but the schema field — and the one
    `spacesMovedThisTurn` reads — is `system.startLocation`. The value was therefore
    never persisted where it was used, so movement-since-turn-start always read the
    default. The hook now writes `system.startLocation` (#386).

    The update payload is built by a new pure, unit-tested helper
    `turnStartCombatantUpdate(center, elevation)`, which guards the field name
    against a future typo.

- 3f58c4c: **Fix `build-type-catalog.mjs` capturing a function's JSDoc instead of the class's (#234)**

    `npm run docs:catalog` described the `skill` type with the `getFateDescTable`
    **function** summary ("Returns the fate-test description table …") instead of the
    `SkillLogic` **class** summary ("A trained capability with a mastery level").

    The class-TSDoc regex used a non-greedy `[\s\S]*?` that started at the _first_
    `/**` in the file and ran through the intervening code to the `*/` before
    `class SkillLogic` — swallowing the earlier function JSDoc. The capture now
    forbids `*/`, so it matches the `/**` immediately preceding the class.
    `docs/reference/type-catalog.md` is regenerated with the correct `skill`
    description (the only type whose Logic file carries an earlier function JSDoc).

- b128b41: **Weapon direct combat is per-strike-mode assisted combat, not weapon-level actions**

    Resolves #69. Assisted combat — rolling attack / block / counterstrike with the
    weapon's modifiers applied, no workflow — is provided by the per-strike-mode
    Atk/Blk/CX cells on the Combat tab (they run `successTest`). The weapon-level
    `attack` / `block` / `counterstrike` intrinsic actions on `WeaponGearLogic` were
    unimplemented stubs (hidden, `visible: false`, warning "not yet implemented"),
    so they are removed rather than implemented — there is no separate weapon-level
    combat action. Also drops their now-unused localization keys and the stale RED
    e2e markers.

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
