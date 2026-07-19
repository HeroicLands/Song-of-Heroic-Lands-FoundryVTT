# SoHL Architecture

> **Audience:** Developers, contributors, and anyone needing a mental model of the system.

See also: [Documentation Hub](../README.md), [Extension Points](../how-to/extension-points.md), {@link sohl.core.logic.SohlLogic}.

> **New to the codebase? Start here.** Read this page top to bottom for the mental model, then branch out through the [Where to learn more](#where-to-learn-more) index at the end.

## What SoHL is

Song of Heroic Lands (SoHL) is a Foundry VTT game system implementing HârnMaster-compatible gameplay with deep automation: actors, items, active effects, combat resolution, chat cards, UI sheets, localization, and compendium content. All code targets Foundry VTT v14+.

## Directory structure

```
src/
├── core/        System foundations, split into logic/ (Foundry-free: system
│                registration, the Logic base, event queue, hook bridge) and
│                foundry/ (the DataModel base, calendar) plus the FoundryHelpers shim.
├── entity/      Pure, Foundry-free game-mechanics objects: modifier/, result/,
│                body/, movement/, action/, roll/, event/, expr/ (SafeExpression),
│                strikemode/, domain/ (the DomainRegistry game concept), skill base.
├── document/    Foundry document classes, grouped by kind:
│   ├── actor/       actors — foundry/ holds DataModel + Sheet, logic/ holds Logic + Data
│   ├── item/        items  — same foundry/ + logic/ split
│   └── effect/ · combat/ · combatant/ · token/ · scene/   the other document kinds
├── apps/        Standalone Foundry application windows (foundry/ + logic/ split).
├── utils/       Shared utilities: constants/enums, helpers, collections, logging.
└── sohl.ts      Entry point: Foundry hooks and system registration.

templates/       Handlebars (.hbs) templates: actor, item, chat, dialog, effect.
tests/           Vitest suite (mirrors src/).
docs/            Developer & API documentation.
assets/          Compendium data, icons, templates.
lang/            Localization (en.json).
```

This map stays at the **directory level** on purpose. Directories are stable; the specific files inside them get added, renamed, and moved between `foundry/` and `logic/`. For the actual classes in any folder, consult the API reference, whose navigation mirrors this layout (see next section) and is regenerated from source on every build.

## How the API reference is organized

The generated [API reference](https://api.heroiclands.org/latest) mirrors this directory layout. Its sidebar groups every public symbol the same way the source is grouped — **Core**, **Documents** (`Actor`, `Item`, `Combat`, `Combatant`, `Chat`, `Effect`, `Scene`, `Token`), **Domain** (`Action`, `Body`, `Modifier`, `Movement`, `Result`, `StrikeMode`, `SkillBase`), **Utility** (`AI`, `Collection`, `Constants`, `Helpers`), and **Applications** — so a folder here maps directly to a navigation group there. Start from the group that matches the area you're working in.

## Three-layer architecture

### Foundry layer

Document classes (`SohlActor`, `SohlItem`, `SohlActiveEffect`) handle Foundry VTT integration: persistence, data preparation lifecycle, sheet rendering, and document operations. These live in `src/document/*/foundry/`, `src/core/foundry/`, `src/apps/foundry/`, and the one boundary shim `src/core/FoundryHelpers.ts` — the **only** module that touches Foundry globals on behalf of the logic layer.

### Logic layer

Logic classes handle game rules, calculations, and actions — separated from Foundry persistence and UI. They live in `src/document/*/logic/`.

**Foundry isolation.** The logic layer is forbidden from interacting with anything Foundry-level directly. It reaches Foundry through exactly two channels:

1. **The `FoundryHelpers` shim** (`src/core/FoundryHelpers.ts`) — every Foundry global or API call (`game.*`, `canvas.*`, `Hooks.*`, `Roll`, dialogs, …) goes through its `fvtt`-prefixed wrappers. See [FoundryHelpers shim](#foundryhelpers-shim).
2. **The Data interfaces on `logic.data`** — a document's persisted shape is a `*Data` interface (`SohlItemData` / `SohlActorData` and per-type extensions) that the **logic layer owns** and the Foundry `DataModel` implements. Logic reads a document's persisted fields through `logic.data` (the typed shape), never by reaching into `document.system` or Foundry internals. These contracts live in `src/document/item/logic/SohlItemBaseLogic.ts` and `src/document/actor/logic/SohlActorBaseLogic.ts` (the Foundry-side base modules re-export them for compatibility).

Logic/domain code may also _reference_ Foundry-coupled classes (`SohlItem`, `SohlActor`, `SohlTokenDocument`) with **`import type` only** — type imports are erased at compile time and create no runtime dependency.

Persisted `*Data` fields are **references** (a UUID, id, or shortcode); the logic layer resolves them to **live objects**. This "reference on the wire, live object in memory" rule spans the whole system and is the canonical serialization contract — see [Runtime Contracts → the grounding rule](../reference/runtime-contracts.md#the-grounding-rule-reference-on-the-wire-live-object-in-memory).

This isolation is precisely what makes the logic layer **unit-testable with no Foundry running**: both channels are replaced with test doubles (see [Testing](../how-to/testing.md)). It is enforced two ways:

- An ESLint rule (`@typescript-eslint/no-restricted-imports` in `eslint.config.js`) forbids value imports of Foundry-coupled modules from the Foundry-free zones.
- A purity smoke test (`npm run test:purity`, part of `build:noci`) imports every logic/domain module with **no** Foundry globals present; any module-level `foundry.*`/`game.*` access fails the build.

### Domain layer

Pure game-mechanics objects in `src/entity/` — modifiers, test results, body structure, move-base helpers, skill base computation. These have no Foundry dependency at all and are fully unit-testable.

> **The Foundry-free zone** is larger than one directory. It spans `src/entity/`, every `src/**/logic/` folder (`src/core/logic/`, `src/document/*/logic/`, `src/apps/logic/`), and **all of `src/utils/`** — the shared utilities (helpers, collections, constants, logging) are pure and carry no Foundry dependency. Only `src/core/FoundryHelpers.ts` and the `src/**/foundry/` folders are Foundry-coupled. The ESLint rule and purity test above police this whole zone, not just `entity/`.

### Presentation layer

Sheet classes and Handlebars templates (`.hbs`) handle UI. Sheets extend `SohlActorSheetBase` or `SohlItemSheetBase`. Chat cards use templates in `templates/chat/`.

#### Sheet view-model modules

A sheet (or settings app) is Foundry code: it owns the DOM, fires hooks, mutates documents, and enriches HTML. But its `_prepare*Context` methods often also contain **pure data-shaping** — grouping, sorting, hierarchy building, label/scope resolution. That logic belongs in the Foundry-free layer, not inline in the sheet, so it can be unit-tested and is covered by the boundary guards.

The convention: a sheet/app class `FooSheet`/`FooApp` with pure view-model logic gets a `foo-sheet-view.ts` (apps: `foo-view.ts`) module of free functions in the **sibling `logic/` directory** (e.g. `actor/logic/being-sheet-view.ts`, `apps/logic/domain-manager-view.ts`). These take accessor callbacks or minimal structural inputs — never Foundry document types — so they stay value-Foundry-free; the sheet keeps only orchestration and delegates the shaping. The canonical example is `being-sheet-view.ts`.

Create such a module **only when there is real logic to hold** — trivial field-injection (`system.foo → context.foo`) stays inline. Don't add empty placeholder modules.

## Three-class pattern

Every actor and item type is split into three classes across two directories:

1. **Logic class** (e.g., `SkillLogic` in `item/logic/SkillLogic.ts`) — business logic, calculations, actions. Participates in the phase-batched lifecycle: `initialize()` → `evaluate()` → `finalize()`. Also contains the Data interface.

2. **DataModel class** (e.g., `SkillDataModel` in `item/foundry/SkillDataModel.ts`) — extends Foundry `TypeDataModel`, defines the persisted schema via `defineSchema()`.

3. **Sheet class** (e.g., `SkillSheet` in `item/foundry/SkillSheet.ts`) — UI presentation, extends the appropriate sheet base class.

The `logic/` directory contains code that can run and be tested without Foundry VTT. The `foundry/` directory contains code that depends on the Foundry runtime.

### Accessing a document's data and logic

At runtime, `document.system` is the **DataModel** instance and `document.logic` (≡ `document.system.logic`) is the **Logic**. The DataModel implements the type's `*Data` interface, so the persisted fields are the same object whichever way you reach them.

For typed, documented access, prefer **`document.logic.data`**. `SohlLogic.data` returns the `*Data` interface — e.g. `skillItem.logic.data` is typed `SkillData` — so editors autocomplete the fields and the API reference links straight to the shape. `document.system` holds the identical object but is typed as the Foundry-internal DataModel class (excluded from the API docs).

- `actor.logic.data.foo` — fully typed via the public `*Data` interface (**recommended**).
- `actor.system.foo` — the same value, but typed as the internal DataModel.

So to discover what's available on a document, read its `*Data` interface (the shape of `system` / `logic.data`) and its Logic class (computed properties, intrinsic actions). The DataModel and Sheet classes are Foundry binding and are intentionally absent from the API docs.

### A being's physical baseline lives on a `body` sub-object; movement is universal

A being's physical baseline — **anatomy, body weight, reach, body scale, and personal
fatigue** — lives on the **Being actor itself**, under `system.body`, and is derived by
a Being-owned {@link sohl.document.actor.logic.BodyLogic} exposed as **`being.body`**.
There is no separate physical-body item: a being with an **empty body structure**
(`being.body.structure.parts.length === 0`) is **incorporeal** — a spirit, with no body
structure, weight, or reach. That is a supported state, not an error; check
`being.body.isIncorporeal`. Reach body-owned state through `being.body`:

- On **{@link sohl.document.actor.logic.BeingLogic}** directly: `health`, `healingBase`, `shockState`, `pull`, and `carriedWeight` (the ground-up total of carried gear).
- On **`being.body`** (a {@link sohl.document.actor.logic.BodyLogic}): `structure`, `weight`, `reach`, `bodyScale`, `injuryTable`, and `isIncorporeal`.

**Movement is not a being-only concept.** It is a **universal actor capability** on the
base {@link sohl.document.actor.logic.SohlActorBaseLogic} (see also
`src/document/actor/logic/movement.ts`), so every actor — Being, Vehicle, Cohort,
Structure — inherits `currentMoveMedium` + `movementProfiles` and the derived
`feetPerRound` / `leaguesPerWatch` / `moveProfile` (the resolved profile for the actor's
`currentMoveMedium`), plus the `makeDefaultMedium` intrinsic action. The default medium
is `MOVEMENT_MEDIUM.NONE` — a non-mover, represented by the `NONE_MOVE_PROFILE` constant
in `movement.ts`, which is never authored per-actor. `BeingLogic` additionally derives
movement's `strengthModifier` and `encumbrance` from its `str` attribute and
`carriedWeight`.

```ts
const being = actor.logic; // BeingLogic
being.carriedWeight.effective; // carried gear weight — on the being
being.feetPerRound.effective; // tactical move — universal actor state
being.body.structure; // anatomy — on the being's body sub-object
being.body.isIncorporeal; // true when the body structure is empty
```

At the data layer, the anatomy/weight/reach/scale **schema is the `body` `SchemaField` on
`BeingDataModel`** (see [Body Structure → Where the data lives](../reference/body-structure.md#where-the-data-lives)), while the movement schema is on the base actor DataModel.

## Document types

SoHL defines several **actor** and **item** types, each following the three-class pattern above. The exact set drifts as types are added or renamed, so this page does not enumerate them — consult the authoritative sources instead:

- `ACTOR_KIND` and `ITEM_KIND` in `src/utils/constants.ts` — the canonical set of type codes.
- [Type Catalog](../reference/type-catalog.md) — what each type is and how they interact.
- The API reference — every type's classes, under **Documents → Actor** and **Documents → Item**.

In short: **actors** model the entities in the world — individual beings and creatures, groups, structures, vehicles, and item-container assemblies. **Items** model the capabilities and possessions an actor carries — skills, traits, gear, afflictions and injuries, combat techniques, and mystical abilities.

## Phase-batched lifecycle

Foundry VTT processes each embedded item fully before moving to the next, so sibling items cannot depend on each other. SoHL overrides `prepareEmbeddedData()` to run three **phase-batched** passes across all items with barriers between them:

1. **initialize** — set up base state from persisted data. Cannot read sibling items.
2. **evaluate** — compute derived values using sibling items' initialized state.
3. **finalize** — resolve cross-item dependencies requiring evaluated state.

See {@link sohl.core.logic.SohlLogic} for the full rationale and rules, and [Lifecycle Hooks](../how-to/lifecycle-hooks.md) for augmenting a phase from a module.

## Domain objects

Game-mechanics value objects in `src/entity/` are rebuilt from persisted data each preparation cycle. They may be mutated during the lifecycle (e.g., active effects adding modifiers), but mutations are not persisted.

| Directory             | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `domain/modifier/`    | Auditable tracked values built from a base plus ordered deltas.     |
| `domain/result/`      | Test and combat resolution outcomes.                                |
| `domain/body/`        | Anatomical structure with weighted hit-location selection.          |
| `domain/movement/`    | Per-medium base-move lookup.                                        |
| `domain/action/`      | Executable action definitions (context-menu entries, chat buttons). |
| `domain/` (top level) | Skill-base formula computation.                                     |

For the classes in each area, see **Domain** in the API reference, and [Modifier Model](../reference/modifier-model.md), [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md), and [Body Structure](../reference/body-structure.md).

## Active Effects

`SohlActiveEffect` extends Foundry's ActiveEffect with an extended targeting model:

- `targetType`: `this` (self), `actor` (owning actor), or `<itemType>` (other items on actor)
- `targetName`: regex pattern matched against item shortcodes

See [Effects Integration](../reference/effects-integration.md).

## Extension mechanisms

SoHL provides two levels of extension for customizing behavior without modifying core source:

1. **Modules via lifecycle hooks** — Foundry modules listen for hooks emitted at each lifecycle phase to augment behavior broadly across items or actors. See [Lifecycle Hooks](../how-to/lifecycle-hooks.md).

2. **Actions** — document-attached executable logic surfaced on context menus, for per-item behavior. See [Macros and Actions](./macros-and-actions.md).

## FoundryHelpers shim

`src/core/FoundryHelpers.ts` wraps all Foundry VTT globals (`game`, `canvas`, `Hooks`, `Roll`, etc.) behind a stable API. During testing, vitest swaps it for a mock. Logic classes must import from FoundryHelpers, never from Foundry directly.

Shim exports use the `fvtt` prefix (e.g., `fvttGetSetting`, `fvttCallHook`). Functions that don't wrap globals (e.g., `inputDialog`, `getContextItem`) use plain names.

For UI notifications, use `sohl.log.uiWarn` / `sohl.log.uiError` (SohlLogger), not the shim.

## Build system

`npm run build` runs the full pipeline (type-check → test → bundle with Vite) into **`build/stage/`**, which mirrors the installed Foundry system directory — Foundry could load it as-is. For the script catalog, the pipeline stages, the `build/` layout, and how `system.json` is assembled, see [Build, Deployment, and Release](../how-to/build-and-deployment.md).

## Actor state sovereignty

**An actor — together with its token and combatant — is the sole authority over its own state.** An actor's logic or client may mutate only **itself**; it must never write directly to another actor (or another actor's token or combatant).

Any effect one actor would impose on another is mediated by a **chat-message handshake**:

1. The **source** resolves its own side — rolls the attack, the spell-success test, etc. — mutating only itself.
2. On success it posts a chat card with a button **addressed to the target's owner**, whose label states unambiguously what is being acknowledged or applied.
3. The **target's owning client** clicks it, runs any required test first (e.g. a resistance roll), and applies the change **to itself**.

Example: a wizard casts Sleep on a victim. The wizard rolls to land the spell; on success the card shows the _victim's_ owner a button ("Acknowledge you fall asleep", possibly gated behind a resistance test). The victim's client marks the victim asleep — the wizard never touches the victim's state.

**Why:** Foundry permissions — a client can only reliably update documents it owns — and player accountability: each player (the GM owns all actors) stays in control of, and every cross-actor consequence stays visible in chat for, their own character.

This already underlies automated combat: defense buttons dispatch to the _defender's_ client, and the "Calculate Injury" button resolves on the _target's_ client. To implement a new cross-actor mechanic, follow [Extension Points → Cross-actor effects](../how-to/extension-points.md#cross-actor-effects-the-acknowledge-button-pattern).

## Architectural rules

1. **Logic layer stays Foundry-free.** All Foundry API calls go through `FoundryHelpers.ts`.
2. **Extension over rewrites.** Use hooks and actions, not source modifications.
3. **Backwards compatibility.** Never rename data fields without a migration strategy.
4. **No global search-and-replace.** Cross-cutting changes must be scoped and validated.
5. **Stable localization keys.** Never rename keys in `lang/en.json` — add new ones.
6. **Small, focused changes.** One feature or fix per PR.
7. **Complete implementations.** No placeholder stubs.
8. **Actor state sovereignty.** An actor mutates only itself; cross-actor effects go through a target-addressed chat acknowledge button (see above).

## Where to learn more

| Topic                 | Document                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| Lifecycle phases      | {@link sohl.core.logic.SohlLogic}                                        |
| Extending SoHL        | [Extension Points](../how-to/extension-points.md)                        |
| Lifecycle hooks       | [Lifecycle Hooks](../how-to/lifecycle-hooks.md)                          |
| Actions               | [Macros and Actions](./macros-and-actions.md)                            |
| Expressions/scripts   | [Expressions and Scripts](./expressions.md)                              |
| Security & guardrails | [Security Model](./security-model.md)                                    |
| Combat resolution     | [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md) |
| Modifier system       | [Modifier Model](../reference/modifier-model.md)                         |
| Body anatomy          | [Body Structure](../reference/body-structure.md)                         |
| Active effects        | [Effects Integration](../reference/effects-integration.md)               |
| CSS/styling           | [CSS Architecture](./css-architecture.md)                                |
| Testing               | [Testing Guide](../how-to/testing.md)                                    |
| Type catalog          | [Type Catalog](../reference/type-catalog.md)                             |
| Runtime contracts     | [Runtime Contracts](../reference/runtime-contracts.md)                   |
