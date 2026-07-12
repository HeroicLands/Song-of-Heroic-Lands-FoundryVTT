# Runtime Contracts

> **Audience:** Maintainers working on system startup, registration, and core object construction.

See also: [Architecture Overview](../concepts/architecture.md), [Extension Points](../how-to/extension-points.md), [Security Model](../concepts/security-model.md).

This page is the canonical reference for runtime contracts and invariants. If guidance here conflicts with narrative/how-to pages, this page is authoritative.

## System-level contracts (`SohlSystem`)

Primary file: `src/core/logic/SohlSystem.ts`

- `globalThis.sohl` is assigned during init (`src/sohl.ts`) and provides the runtime system instance.
- Core config surface (`CONFIG`) exposes document classes, data models, sheets, and result/modifier constructors.
- Calendar registry (see [Extension Points — Calendar Registration](../how-to/extension-points.md#8-calendar-registration)).

### CONFIG structure

`sohl.CONFIG` defines which classes are active at runtime:

#### Modifier classes

| CONFIG key                    | Default class          | Description                  |
| ----------------------------- | ---------------------- | ---------------------------- |
| `CONFIG.ValueModifier`        | `ValueModifier`        | Base auditable value tracker |
| `CONFIG.CombatModifier`       | `CombatModifier`       | Combat-specific modifier     |
| `CONFIG.ImpactModifier`       | `ImpactModifier`       | Damage/impact modifier       |
| `CONFIG.MasteryLevelModifier` | `MasteryLevelModifier` | Test mastery level modifier  |

#### Result classes

| CONFIG key                 | Default class       | Description                              |
| -------------------------- | ------------------- | ---------------------------------------- |
| `CONFIG.SuccessTestResult` | `SuccessTestResult` | Single test result                       |
| `CONFIG.OpposedTestResult` | `OpposedTestResult` | Opposed test result                      |
| `CONFIG.AttackResult`      | `AttackResult`      | Attack resolution (carries impact + aim) |
| `CONFIG.DefendResult`      | `DefendResult`      | Defense resolution                       |
| `CONFIG.CombatResult`      | `CombatResult`      | Full combat outcome                      |

#### Document sheets

`CONFIG.Actor.documentSheets` and `CONFIG.Item.documentSheets` map actor/item type strings to sheet classes.

### Invariants

- Core constructor mappings (results/modifiers/data models) must be available before sheet and runtime usage.
- Common code should construct classes through `sohl.CONFIG` mappings when available.

## Data model contract (`SohlDataModel`)

Primary file: `src/core/foundry/SohlDataModel.ts`

`SohlDataModel` is the typed data-layer wrapper over Foundry `TypeDataModel`.

Key contracts:

- Each data model class declares static `kind` and localization prefixes.
- Logic object is created lazily through `create(...)` + `logic` accessor.
- `fromData(...)` resolves model class by `kind` across configured document families and normalizes serialized JSON forms.

### Updating array fields: write the whole array, never an element by index

**Never** target a single element of an `ArrayField` by index in an `update()`
payload — e.g. `update({ "system.structure.parts.2.heldItemId": id })`.
Foundry expands the dotted key to `{ parts: { 2: {…} } }` and rebuilds the array
field from that sparse map, **truncating the array and default-filling every
element that wasn't named**. A partial write meant to touch one field of one
element silently destroys every other element (e.g. wiping every body part's
`shortcode`, `canHoldItem`, and `locations`). This corrupted persisted anatomy
in production; see issue #247.

To change a subset of an array's elements, **source the full canonical array
from the DataModel and write it back whole**, with only the target element(s)
modified. The `BodyStructure` update-builders are the template:
{@link BodyStructure.addPartUpdate}, {@link BodyStructure.removePartUpdate}, and
the general {@link BodyStructure.setPartFieldsUpdate} (used by
{@link GearLogic.holdItem}/`releaseItem` and `BodyPart.addLocationUpdate`/
`removeLocationUpdate`).

Two reasons this is easy to miss:

- **A valid value is required to trigger it.** If the written value fails field
  validation (e.g. an invalid `DocumentIdField` id), Foundry drops that field and
  the update becomes a no-op, leaving the array intact — so ad-hoc tests with
  placeholder ids look fine while real ids corrupt.
- **Form submission is unaffected.** Sheets serialize the _complete_ array (every
  element, every field), so `parts` is always replaced wholesale. Only hand-built
  partial updates outside a form hit this. `ObjectField` dicts keyed by id (e.g.
  `system.strikeModes.<id>.<field>`) are also safe — object partial-merge is fine;
  the hazard is arrays specifically.

## Document/DataModel/Logic contract

SoHL separates persistence from behavior:

- **Document** (`SohlItem`, `SohlActor`) — integrates with Foundry document APIs.
- **DataModel** (`document.system`) — defines persisted fields/schema only.
- **Logic** (`document.system.logic`) — contains lifecycle methods, rules behavior, and derived properties.

Concrete example (Skill type):

- `SohlItem` with `type = skill`
- `SkillDataModel` on `system` (persisted fields)
- `SkillLogic` on `system.logic` (lifecycle, calculations)
- `SkillSheet` (UI/editor)

**Guideline:** Stored fields in DataModel, derived behavior in Logic, integration helpers in Document, presentation in Sheet.

## Sheet mixin contract

`SohlDataModel.SheetMixin(...)` provides shared sheet behavior:

- Context build (`config`, `system`, `effects`, transferred effects)
- Drag/drop hooks and routing by dropped document type
- Item/effect context-menu wiring through `SohlContextMenu`

Use this mixin for consistent behavior across actor/item/effect sheets.

## Constants and metadata contract

Primary file: `src/utils/constants.ts`

- Canonical kind IDs (`ACTOR_KIND`, `ITEM_KIND`).
- Metadata maps (`*_METADATA`) for registration and UI lookups.
- Test/modifier enums used throughout result/modifier pipelines.

Changing constants is a high-impact operation: treat as migration-sensitive.

## The grounding rule: reference on the wire, live object in memory

One rule governs how SoHL represents state across the DataModel and Logic/entity
layers, in **both** directions:

> **The serialized (wire) form of anything shared is a _reference_ — a UUID, id,
> shortcode, or `PointerData`. The in-memory form is the _resolved live object_ —
> an entity, an item/actor Logic, a `StrikeMode`, a table — rehydrated by the
> Logic/entity constructor.**

- **DataModel / `Data` interfaces hold pointers.** A persisted field is a
  reference: `combatantUuid` (not the live combatant), `heldItemId` on a body
  part, a cohort member's `shortcode`, a strike mode's `PointerData`, a Foundry
  document reduced to a `ClientDocument` UUID by `defaultToJSON`.
- **Logic classes and entities rehydrate those pointers into real objects** in
  their constructor and hold the live object thereafter: `fvttLogicFromUuidSync`
  turns a UUID into a Logic; `MeleeStrikeMode.fromPointerData` turns `PointerData`
  into a live strike mode; `defaultFromJSON` turns a `__kind` tag into the
  concrete class. The `parent` Logic is supplied on revival (`options.parent`),
  never carried in the payload.

Two failure modes break the rule — watch for both in review:

1. **A pointer kept in memory** — a runtime field typed as `PointerData`/uuid/id
   that is never resolved, so consumers can't use it and the real data gets
   denormalized and stored elsewhere.
2. **A live object or config put on the wire** — serializing a resolved object,
   or embedding static config (a table, a function body) in a payload, instead of
   a reference the receiver resolves locally.

The corollary is **minimality**: store only the reference and the genuinely
transient data (the dice roll, an evaluated-snapshot success level). Never
serialize what an in-memory object recomputes — anything calculable is derived on
read, not stored.

## Entity serialization contract

Primary files: `src/entity/SohlEntity.ts`, `src/utils/helpers.ts`, `src/utils/kindRegistry.ts`

Domain entities — results (`SuccessTestResult`, `AttackResult`, …), modifiers (`ValueModifier`, `ImpactModifier`, …), and dice (`SimpleRoll`) — all extend `SohlEntity` and share one serialization mechanism. There is no reflective serializer; a class serializes exactly what its `toJSON` emits. This section applies the [grounding rule](#the-grounding-rule-reference-on-the-wire-live-object-in-memory) above to those entities.

- **Ownership.** Every `SohlEntity` requires a `parent` Logic (`options.parent`); the constructor throws `SohlEntity requires a parent` otherwise. `parent` is transient — never serialized — and is re-supplied on revival.
- **Two constructor forms.** The constructor is overloaded (matching the `clone(parent)` shorthand below): `new X(parent)` is shorthand for an empty entity owned by `parent`, while `new X(data, options)` supplies persisted state plus options (`options.parent` required). The base normalizes the overloaded first argument with `SohlEntity.dataOf` / `SohlEntity.optionsOf`, which use the `isA(x, "SohlLogic")` **brand** check — not duck-typing — so a data bag that merely carries a `parent` **key** is never mistaken for a Logic. Subclasses that construct usefully from `{}` (`ValueModifier`, `MasteryLevelModifier`, `CombatModifier`, `ImpactModifier`, `SimpleRoll`, `TestResult`, `SuccessTestResult`) expose both overloads; classes that require non-empty `data` (the body classes, strike modes, and the non-empty results) keep the single `(data, options)` form. A subclass adopts the shorthand with a fixed template — declare the two overloads, then normalize inside the `super(...)` arguments:
    ```ts
    constructor(parent: SohlLogic<any>);
    constructor(data: Partial<X.Data>, options: Partial<X.Options>);
    constructor(
        dataOrParent: SohlEntity.DataOrParent<X.Data> = {},
        options: Partial<X.Options> = {},
    ) {
        super(
            SohlEntity.dataOf<X.Data>(dataOrParent),
            SohlEntity.optionsOf<X.Options>(dataOrParent, options),
        );
        const data = SohlEntity.dataOf<X.Data>(dataOrParent);
        // …rehydrate fields from `data` as before…
    }
    ```
    Normalizing _inside_ the `super(...)` argument expressions (rather than in statements before `super`) keeps the class immune to the "`super` must be the first statement" rule.
- **Serialize / revive through `defaultToJSON` / `defaultFromJSON`.** `JSON.stringify(defaultToJSON(entity))` is the wire form; `defaultFromJSON(parsed, { parent })` rebuilds it. `defaultToJSON` honors each object's `toJSON` (and stamps a `__kind` tag through the `SohlEntity` chain); `defaultFromJSON` revives nested `__kind`-tagged children bottom-up, then calls `new Ctor(data, { parent })` via the kind registry.
- **Curated `toJSON`, `Data`-shaped.** Each subclass that adds state overrides `toJSON` (chaining `...super.toJSON()`) and emits keys matching its `Data` interface in **persisted** representation — a uuid/shortcode where the implementation holds a _resolved_ object (`combatantUuid`, not the live combatant), the raw value where a getter normalizes it. The governing rule: **`toJSON()` output must be valid `data` for the constructor**, i.e. `new Ctor(x.toJSON(), { parent })` reconstructs `x`. Emit special-typed fields (`Map`, `Set`, `Date`, nested entities) through `defaultToJSON` or the child's `toJSON` so the tree is fully JSON-safe. Do **not** re-emit a value that a nested modifier already carries (e.g. a situational modifier folded into `masteryLevelModifier`) — it would double-apply on revival.
- **Register for revival.** A class rehydrates to its concrete type only if it calls `registerKind(X.Kind, X)`. Without it, `defaultFromJSON` leaves the serialized form as inert data — dropping deltas, collapsing computed values back to the base.
- **Cloning is explicit.** `entity.clone(parent)` deep-copies and re-parents; there is no implicit "reuse my parent". Use `entity.clone(entity.parent)` for a same-owner copy; cloning without a resolvable parent throws (a `SohlEntity` must have one).
- **A Logic is a reference, not a payload.** `SohlLogic.toJSON` emits a compact `{ uuid, name, kind }` reference. A logic wraps a live Foundry document and is re-resolved by uuid (`fvttLogicFromUuidSync`), never revived from its own JSON — which is why an entity's owning `parent` is supplied on revival rather than serialized.

## Entity class registry

Primary files: `src/entity/entityRegistry.ts` (the registry), `src/entity/registry.ts` (the eager-load barrel).

The curated set of constructable entity-layer classes — modifiers (`ValueModifier`, `ValueDelta`, `CombatModifier`, `ImpactModifier`, `MasteryLevelModifier`), results (`TestResult`, `SuccessTestResult`, `OpposedTestResult`, `ImpactResult`, `AttackResult`, `DefendResult`, `CombatResult`), strike modes (`StrikeModeBase`, `MeleeStrikeMode`, `MissileStrikeMode`), `SohlAction`, and body modeling (`BodyStructure`, `BodyPart`, `BodyLocation`) — is **overridable**. A variant module can subclass any of them and swap in its subclass, and every construction across the system then produces the subclass.

Overridability is **all-or-nothing on construction discipline**: a class is overridable only where _every_ construction site resolves it through the registry rather than a bare `new`. A single stray `new SuccessTestResult(...)` would silently produce the base class even after a module registered an override, so the discipline is enforced by an ESLint rule (below), not left to convention.

### The registry surface

The `entity` surface is a frozen, getter-backed view over a module-private backing record, exposed the same way inside and outside SoHL:

- `entity.<ClassName>` — a getter returning the **currently-registered** class (the override if one was registered, else the canonical SoHL base). Because it is a getter, every access and every construction site routed through it picks up a later override automatically.
- `entity.register(name, cls)` — install an override. `cls` must extend (or be) the canonical base for `name`; the call throws on an unknown name, a class that does not extend the base, or a canonical base that has not yet loaded. Call it from a module's `init`/`setup` hook, **before the first construction** of that class.
- `entity.base(name)` — the canonical SoHL base for `name`, ignoring any override. Useful for a module that wants to `extends entity.base("SuccessTestResult")` rather than whatever is currently registered.

`register`/`base` are non-enumerable, so `Object.keys(entity)` lists only class names.

Classes populate the registry by **self-registration**: each class module calls `registerEntity("MyClass", MyClass)` at the bottom (mirroring `registerKind` for serialization). The backing leaf `entityRegistry.ts` value-imports **none** of the classes — it only `import type`s them for the surface's types — which is what keeps it free of load cycles. The first registration for a name is captured as the canonical base; `register` overrides only the _current_ binding.

### The two construction mechanisms

Which one to use depends on _whether you are inside or outside SoHL_:

1. **Inside SoHL** — `import { entity } from "@src/entity/registry"` (or, for the few base classes below, from the leaf `@src/entity/entityRegistry`), then `new entity.X(...)`. A static import, so it resolves purely through the module graph — no reliance on any runtime global, which is what lets unit tests construct these classes with no `sohl.entity` wired.
2. **Outside SoHL** (macros, variant modules) — the same surface is published on the runtime global as `sohl.entity`. Construct with `new sohl.entity.X(...)`, subclass with `class Y extends sohl.entity.X {}`, and override with `sohl.entity.register(...)`.

Both mechanisms read the identical backing record, so an override registered via `sohl.entity.register` is honored no matter which one constructs the object.

**The barrel vs. the leaf.** `registry.ts` is an _eager-load barrel_: its side-effect imports pull in every class module so all self-register, and it re-exports the surface. Most internal code imports `entity` from the barrel. But a class that is _itself the base of a registered class_ cannot import the barrel — the barrel eagerly imports that class's own subclasses, so a re-entrant load would evaluate `class Sub extends Base` while `Base` is still mid-load → `TypeError: Class extends value undefined`. Those base classes (`ValueModifier`, `MasteryLevelModifier`, `SuccessTestResult`, `OpposedTestResult`, `StrikeModeBase`) import `entity` from the **cycle-free leaf** `entityRegistry.ts` instead, and add a bare side-effect `import` of each class they construct so those targets self-register even when the barrel has not been loaded (e.g. in a bare unit test). Each carries a header block explaining this.

### Enforcement

An ESLint `no-restricted-syntax` rule (scoped to `src/**/*.ts` in `eslint.config.js`) flags a bare `new X(...)` for any registered class name and steers to `new entity.X` / `new sohl.entity.X`. Member-expression callees (`entity.X`, `sohl.entity.X`) are not matched, so the two blessed forms pass. Tests are exempt — they construct the concrete classes directly to exercise them.

## Chat-card dispatch contract

Chat-card buttons (inside `.card-buttons`) and `a.edit-action` links are routed by the `renderChatMessageHTML` hook in `src/sohl.ts`. The handler document is resolved from the clicked element's dataset by `resolveChatCardHandlerUuid(dataset)` (`src/document/chat/chat-card-dispatch.ts`), which normalizes the differing attribute conventions across cards with this precedence:

1. `data-doc-uuid` (standard-test, fate, edit-action cards)
2. `data-handler-uuid` (damage, injury, attack-result cards)
3. `data-handler-actor-uuid` (attack-card defender responder)
4. `data-action-handler-uuid` (opposed-request / opposed-result cards)

The resolved document's `onChatCardButton(btn)` (or `onChatCardEditAction`) is then invoked; handlers switch on `btn.dataset.action`. New card buttons must emit one of the attributes above and add an `action` case rather than introducing a new attribute name. For the procedure, see [Extension Points — Adding a chat-card button](../how-to/extension-points.md#adding-a-chat-card-button).

### Authorization: the handler document's owner acts

**A chat-card action is _handled by the actor it addresses_, and only a client that owns that actor may run it** (a GM owns all). Buttons that drive a flow — roll damage, respond to an attack, resume an opposed test — mutate the handler's own actor state, so under [actor-state sovereignty](../concepts/architecture.md#actor-state-sovereignty) authorization is exactly document ownership. This rule has **two sides**, both keyed on the resolved handler document's `isOwner`:

- **Render-time (visibility).** When a card renders, `gateAutomatedDefenseButtons` (`src/document/chat/chat-card-gating.ts`) resolves each defender-response button's `data-handler-actor-uuid` and **removes the buttons a non-owner can't use** (and, for the owner, gates by capability/incapacitation). This is **UX only** — a per-client cosmetic filter.
- **Click-time (authorization).** The render gate is trivially bypassed by a synthesized click or a direct `doc.onChatCardButton(...)` call, so the **real boundary** is at dispatch: `resolveAuthorizedChatCardHandler(dataset, resolveDoc)` (`chat-card-dispatch.ts`) resolves the handler document and returns it **only if `doc.isOwner`** — otherwise the click is ignored, before any dialog, `buildActionScope` revival, or intrinsic logic runs. Each `onChatCardButton` handler additionally re-checks `this.isOwner` on entry, so a direct call is refused too (defense-in-depth). This closes issue #167.

Foundry's own document-ownership check still guards the final _persisted write_; the authorization gate exists to refuse _entering_ the pre-write flow (dialogs, scope revival, intrinsic actions) for an unauthorized client. Both `resolveAuthorizedChatCardHandler` and the render gate take the Foundry lookup (`fromUuidSync`) as an injected parameter, so the authorization logic is Foundry-free and unit-tested.

A card button carries three kinds of data, and only the first two are flat attributes:

1. **Display fields** — rendered into the card body; never read by dispatch.
2. **Routing metadata** — `data-action` plus one `data-*-handler-uuid` (above), read off the dataset _before_ scope exists.
3. **Scope** — the per-action payload, carried as a single `data-scope` attribute.

### The action context (`SohlActionContext`)

`SohlActionContext` is a **runtime value object**, not a `SohlEntity`: it is built fresh at every dispatch (`new SohlActionContext({ speaker, type, scope })`) and is never revived from its own JSON. Only its `scope` crosses the client boundary; the rest — `speaker`, `target`, `skipDialog`, `noChat` — is runtime state. `scope` stays a per-action `ContextScope` **interface**, not an entity: its entity-valued members already round-trip through `defaultToJSON` / `defaultFromJSON`, so the bag itself needs no `toJSON` and no owning parent. Fork a received context with `context.clone(overrides?)`.

### Passing `scope` to a button

An action's `scope` travels as one serialized `data-scope` blob, not a spray of bespoke attributes:

- The **card-creation logic** sets `data-scope` = `JSON.stringify(defaultToJSON(scope))`. In templates the registered `{{toJSON scopeData}}` helper does the `JSON.stringify`, so the card-data field stays an object (`scopeData: defaultToJSON({ attackResult })`) and the template renders `data-scope="{{toJSON scopeData}}"`.
- The **handler** revives it through `buildActionScope(dataset, parent)` (`src/utils/helpers.ts`) — `defaultFromJSON(JSON.parse(dataset.scope), { parent })` — so the action reads live objects (`context.scope.attackResult`, `context.scope.opposedTestResult`), never a per-payload JSON string.
- **Do not** add per-payload `data-*-json` attributes or read individual pieces off the dataset; put the whole payload in `data-scope` and let `defaultToJSON`/`defaultFromJSON` carry it (see [Entity serialization contract](#entity-serialization-contract)).

## Safe extension checklist

To add a new actor or item type, follow the worked example in [Extension Points — Actor and Item type extension](../how-to/extension-points.md#2-actor-and-item-type-extension): add the kind constant + metadata → data model + logic + sheet → register in `SohlSystem` → verify `fromData(...)`/drag-drop/sheet contexts resolve → validate startup.
