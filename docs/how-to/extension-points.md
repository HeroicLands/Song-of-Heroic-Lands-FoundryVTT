# Extension Points (Developer Guide)

> **Audience:** Developers maintaining or extending SoHL.
> **Goal:** Identify the safest places to add features with minimal risk.

See also: [Architecture Overview](../concepts/architecture.md), [House Rules Cookbook](./house-rules-cookbook.md), [Security Model](../concepts/security-model.md).

## Choosing extension scope

- Use a **Module hook** for additive behavior without modifying SoHL source — best for house rules that affect many items or actors.
- Use **actions** (context-menu entries on a document) for single-item behavior overrides (e.g., one specific spell).

Lifecycle hooks are emitted with item-type granularity (`sohl.<itemType>.<stage>`). Filter by `item.system.shortcode` inside the handler for narrower targeting.

### Recommended module guard pattern

When a hook performs persistent side effects, guard it with a world-setting toggle **and** a GM-only check, so the rule is opt-in per world and runs under a single authority. See the worked recipe in [House Rules Cookbook — guard pattern](./house-rules-cookbook.md#recipe-3-the-recommended-guard-pattern).

## Golden rule

**Extend by adding new classes and registering them**, rather than editing core logic in-place — see the [architectural rules](../concepts/architecture.md#architectural-rules) and [extension mechanisms](../concepts/architecture.md#extension-mechanisms).

When in doubt:

1. Find the nearest existing example.
2. Replicate the pattern.
3. Change the minimum.

## 1) System initialization & registration

Primary files: `src/sohl.ts`, `src/core/logic/SohlSystem.ts`

Common extension needs: register new settings, sheets, hooks, or document classes.

**Guidelines:** Keep registration logic explicit and centralized. Avoid side-effect imports.

Registration runs in `Hooks.once("init")` (settings, system config, calendars, hooks, combat/time defaults, sheet registration), then `Hooks.once("ready")` (Handlebars helpers, then `SohlSystem.ready = true`). Read `src/sohl.ts` for the authoritative order, and add new registration alongside the existing calls there and in {@link sohl.core.logic.SohlSystem}.

## 2) Actor and Item type extension

### Actors

Core actor classes: `src/document/actor/` with base `SohlActor` in `foundry/`.

The per-type split into Document, DataModel, Logic, and Sheet classes — and how they relate — is covered by the [three-layer architecture](../concepts/architecture.md#three-layer-architecture) and [three-class pattern](../concepts/architecture.md#three-class-pattern); read those rather than re-deriving them here.

**How to extend:** Add logic class in `src/document/actor/logic/`, data model + sheet in `src/document/actor/foundry/`, register in {@link sohl.core.logic.SohlSystem}.

### Items

Core item classes: `src/document/item/` with base `SohlItem` in `foundry/`.

Same layering as actors.

**Worked example (new Item kind):**

1. Add the kind constant + metadata in `src/utils/constants.ts` (`ITEM_KIND`, `*_METADATA`).
2. Create the logic class in `src/document/item/logic/` and the data model + sheet in `src/document/item/foundry/`.
3. Register the data model / logic / sheet in {@link sohl.core.logic.SohlSystem}.
4. Add templates and localization keys.
5. Verify `fromData(...)`, drag/drop, sheet rendering, and context-menu behavior resolve; validate startup.

This is the canonical "add a type" procedure — the [Runtime Contracts](../reference/runtime-contracts.md) safe-extension checklist points here.

**Avoid:** Adding `if type === X` branches in base classes; prefer polymorphism.

### Overriding a Logic class from a module (runtime)

The steps above add a kind in-system. A **variant module** instead overrides an
existing kind's Logic class at runtime — no source edits. The base classes are
exposed on the `sohl` global as `sohl.actorLogicClasses` / `sohl.itemLogicClasses`
(kind → base class), and {@link sohl.core.logic.SohlSystem.registerActorLogic} /
{@link sohl.core.logic.SohlSystem.registerItemLogic} swap the class used to build every document
of that kind. The resolution path (`SohlDataModel.create`) already reads that
registry, so no construction sites change.

Register during the module's `init`/`setup` hook, before the first `.logic` for
that kind is built:

```js
Hooks.once("setup", () => {
    class MyBeing extends sohl.actorLogicClasses.being {
        // override rules here
    }
    sohl.registerActorLogic("being", MyBeing);
});
```

Every being actor prepared afterward uses `MyBeing`. `registerItemLogic(kind,
cls)` is the item-side equivalent, keyed by `ITEM_KIND`.

## 3) Combat / tests / resolution pipeline

Core components:

- `src/entity/result/*` — test and combat result classes
- `src/entity/modifier/*` — value tracking and modification
- `src/document/combatant/` — combatant tracking
- `src/entity/action/SohlActionContext.ts` — request context

**Safe extension:**

- Add new `*Result` types for new outcomes
- Add new `*Modifier` types for new influences
- Keep results serializable for chat/UI

**High-risk:**

- Changing shared modifier interpretation rules
- Changing success thresholds or resolution order

See [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md) and [Modifier Model](../reference/modifier-model.md).

## 4) Active effects

Core: [SohlActiveEffect](../../src/document/effect/foundry/SohlActiveEffect.ts).

SoHL extends Foundry's ActiveEffect with an expanded targeting model (`targetType` / `targetName`) so one effect can target self, the owning actor, or sibling items by type. See [Active Effects](../concepts/architecture.md#active-effects) for the model and [Effects Integration](../reference/effects-integration.md) for the full reference.

## 5) UI: templates and chat cards

- Chat cards: `templates/chat/*`
- Dialogs: `templates/dialog/*`
- Actor/item sheets: `templates/actor/*`, `templates/item/*`

**Safe extension:** Add new templates rather than overloading existing ones. Keep template context objects stable and well-documented.

### Adding a chat-card button

Chat-card buttons (inside `.card-buttons`) and `a.edit-action` links are routed by
the `renderChatMessageHTML` hook in `sohl.ts`, which resolves the handler document
from the clicked element's dataset and invokes its `onChatCardButton(btn)` (or
`onChatCardEditAction`). The dataset attribute precedence is a contract — see
[Chat-card dispatch contract](../reference/runtime-contracts.md#chat-card-dispatch-contract).

When adding a new button: **emit one of the recognized dataset attributes** (do not
introduce a new attribute name), and **add an `action` case** to the resolved
document's handler — e.g. `SohlItem.onChatCardButton` (see [SohlItem](../../src/document/item/foundry/SohlItem.ts)), which switches on
`btn.dataset.action`.

To pass **data** to the action — a result, a request object — do not invent a new
`data-*-json` attribute; put the whole payload in one `data-scope`. The card-creation
logic sets a scope field (`scopeData: defaultToJSON(scope)`) and the template renders
`data-scope="{{toJSON scopeData}}"` (the `{{toJSON}}` helper stringifies it); the
handler revives it with {@link sohl.utils.buildActionScope}, so the `action` case reads **live
objects** off `context.scope` (e.g. `context.scope.attackResult`), never a JSON string.
See [Chat-card dispatch contract — Passing scope](../reference/runtime-contracts.md#passing-scope-to-a-button)
and the [Entity serialization contract](../reference/runtime-contracts.md#entity-serialization-contract).

### Cross-actor effects (the acknowledge-button pattern)

Enforce **[actor state sovereignty](../concepts/architecture.md#actor-state-sovereignty)**: an actor mutates only itself. To make one actor affect another, **never reach into the target** — instead:

1. **Resolve the source side on the source.** Roll the attack / spell / effect test against the source's own modifiers and mutate only the source.
2. **Emit a target-addressed button.** Post a chat card whose button carries the _target_ actor's uuid in `data-handler-actor-uuid` (or `data-handler-uuid`) and an `action`. The label must make the consequence unmistakable ("Acknowledge you fall asleep").
3. **Apply on the target's client.** In the target's `onChatCardButton` `action` case, run any required test first (e.g. a resistance roll), then mutate **this** actor.

Render-time gating makes the button appear only to the responding actor's owner (the GM owns all). `gateAutomatedDefenseButtons` (`src/document/chat/chat-card-gating.ts`) is the reference: it removes a button whose `data-handler-actor-uuid` actor the current user does not own (`actor.isOwner`). Reuse this gating for any new target-addressed button.

**Working examples already in the tree:** automated-combat defense buttons (resolve on the _defender's_ client) and the `createInjury` / "Calculate Injury" button (the _target_ wounds itself). Model new mechanics — spells, conditions, knockback, afflictions — on these; do not add a code path where the source writes the target's state.

## 6) Localization

- `lang/en.json`

**Rules:**

- Never rename keys (breaks translations and downstream consumers).
- Add new keys; deprecate old keys slowly if needed.

## 7) System registries

`src/core/logic/SohlSystem.ts` — the central registry for CONFIG mappings.

**Rules:**

- Keep mappings explicit.
- Avoid runtime reflection-based wiring.
- Validate registrations early during init.

## 8) Event triggers (time, combat, scene-region)

The event queue (`sohl.events`) dispatches named **triggers**, and a subscription
runs a document action when one fires — the deferred half of the consent model.
Extension surfaces:

- **Subscribe an action to a trigger** from a Logic class's `finalize()`
  (`sohl.events.subscribe({ uuid, actionName, triggerName, predicate })`) — the
  built-in `updateWorldTime` / combat-lifecycle triggers, plus the **scene-region**
  and **environment** triggers (`regionTokenEnter`/`Exit`/`Turn*`/`Round*`,
  `sceneDarknessChange` — issue #593). Region triggers are event-driven: no
  `fireAt`, so `nextFireTime` is `undefined` and `system.lastRun` is the temporal
  query.
- **The `trigger` RegionBehavior** ({@link sohl.document.region.foundry}) is
  the GM opt-in surface: dropped on a region, it forwards curated events into the
  queue (GM-gated, once) and can offer a region-authored action. High-frequency
  streams (`tokenMove*`) are excluded by curation.
- **Register a custom trigger** ({@link sohl.entity.event.registerSohlTrigger} +
  {@link sohl.entity.event.fireSohlTrigger}) to add your own lifecycle moment.

All Foundry hook wiring lives in `SohlHookBridge` — do not call `Hooks.on(...)`
elsewhere for dispatch. See the [Event Queue Reference](../reference/event-queue.md).

## 9) Calendar registration

SoHL keeps a registry of calendars that modules can extend; registered calendars
appear in the GM's calendar settings. The registry API
(`SohlSystem.registerCalendar` / `unregisterCalendar` / `getCalendar` /
`applyCalendar` / `calendars`), how to register from a module, and the JSON import
format are documented in the
[Calendar Reference](../reference/calendar.md#calendar-registry-and-gm-workflow).

## What to update when you add something

- **New actor/item type:** Add class, register, add templates, update JSDoc, update docs.
- **New user-facing workflow:** Add or update the user guide under `assets/packs/journals/_source/` (compiled into Foundry journal entries at build).

## Deep dives

- [Macros and Actions](../concepts/macros-and-actions.md)
- [Lifecycle Hooks](./lifecycle-hooks.md)
- {@link sohl.core.logic.SohlLogic}
- [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md)
- [Modifier Model](../reference/modifier-model.md)
- [Effects Integration](../reference/effects-integration.md)
- [Runtime Contracts](../reference/runtime-contracts.md)
