# Lifecycle Hooks (Module-Level Actor and Item Logic)

> **Audience:** Foundry module developers who want to augment SoHL actor/item behavior broadly, without modifying SoHL source.
>
> **Complexity:** Moderate. Lifecycle hooks require writing a Foundry module (JavaScript/TypeScript) but do not require understanding SoHL internals deeply. This is the recommended approach for house rules that apply broadly across many items or actors. For simpler, no-code customization on specific items, see [Action Items](./actions.md) in the user guide.

See also: [Action Items](./actions.md), [Extension Points](./extension-points.md), [Lifecycle Model](../concepts/lifecycle-model.md), [House Rules Cookbook](./house-rules-cookbook.md).

**You are here**

- This page covers SoHL's **lifecycle hooks**: Foundry VTT hook points emitted during data preparation that modules can listen to.
- For narrow per-item logic, use [Action Items](./actions.md) instead.
- For broad structural changes, see [System Class Overrides](./system-class-overrides.md).

## Overview

SoHL emits Foundry VTT `Hooks` at each phase of its preparation lifecycle. Modules can listen for these hooks to:

- Augment actor/item logic without modifying SoHL source files.
- Apply house rules that affect all items of a given type across all actors.
- React to or suppress phase execution entirely (via cancellable `pre*` hooks).

Because this mechanism uses Foundry module hooks, it requires building and installing a separate Foundry module. It is not appropriate for per-item customization — for that, use [Action Items](./actions.md).

## Lifecycle phase recap

SoHL runs document preparation in three batched phases:

1. **`initialize`** — set initial state; create virtual items.
2. **`evaluate`** — compute derived values (all `initialize` calls complete first).
3. **`finalize`** — resolve cross-item dependencies (all `evaluate` calls complete first).

For each phase, SoHL emits both a `pre*` hook (cancellable) and a `post*` hook (informational) around the logic call. See [Lifecycle Model](../concepts/lifecycle-model.md) for full phase semantics.

## Complete hook reference

### Item hooks

Emitted for every item on every actor during data preparation.

| Hook name | Cancellable | Arguments | When |
|-----------|------------|-----------|------|
| `sohl.{itemType}.preInitialize` | yes | `(item, ctx)` | Before item `initialize()` |
| `sohl.{itemType}.postInitialize` | no | `(item, ctx)` | After item `initialize()` |
| `sohl.{itemType}.preEvaluate` | yes | `(item, ctx)` | Before item `evaluate()` |
| `sohl.{itemType}.postEvaluate` | no | `(item, ctx)` | After item `evaluate()` |
| `sohl.{itemType}.preFinalize` | yes | `(item, ctx)` | Before item `finalize()` |
| `sohl.{itemType}.postFinalize` | no | `(item, ctx)` | After item `finalize()` |

`{itemType}` is the Foundry item type string. Common values:

| Type string | Item |
|-------------|------|
| `skill` | Skill |
| `affiliation` | Affiliation |
| `affliction` | Affliction |
| `armorgear` | Armor Gear |
| `combattechnique` | Combat Technique |
| `concoctiongear` | Concoction Gear |
| `containergear` | Container Gear |
| `injury` | Injury |
| `miscgear` | Misc Gear |
| `mystery` | Mystery |
| `mysticalability` | Mystical Ability |
| `projectilegear` | Projectile Gear |
| `skill` | Skill |
| `trait` | Trait |
| `weapongear` | Weapon Gear |

For the canonical list, see `ITEM_KIND` in `src/utils/constants.ts`.

### Actor hooks

Emitted for the actor itself during data preparation.

| Hook name | Cancellable | Arguments | When |
|-----------|------------|-----------|------|
| `sohl.actor.{actorType}.preInitialize` | yes | `(actor)` | Before actor `initialize()` |
| `sohl.actor.{actorType}.postInitialize` | no | `(actor)` | After actor `initialize()` |
| `sohl.actor.{actorType}.preEvaluate` | yes | `(actor, ctx)` | Before actor `evaluate()` |
| `sohl.actor.{actorType}.postEvaluate` | no | `(actor, ctx)` | After actor `evaluate()` |
| `sohl.actor.{actorType}.preFinalize` | yes | `(actor, ctx)` | Before actor `finalize()` |
| `sohl.actor.{actorType}.postFinalize` | no | `(actor, ctx)` | After actor `finalize()` |

`{actorType}` is the Foundry actor type string:

| Type string | Actor |
|-------------|-------|
| `being` | Being |
| `cohort` | Cohort |
| `structure` | Structure |
| `vehicle` | Vehicle |
| `assembly` | Assembly |

### System registration hook

| Hook name | Cancellable | Arguments | When |
|-----------|------------|-----------|------|
| `sohl.registerVariants` | no | *(none)* | During Foundry `init`, after SoHL registers built-in variants |

Modules listen for `sohl.registerVariants` to call `SohlSystem.registerVariant()`. See [Creating a Variant Module](./variant-module.md).

## Hook arguments

### `item` (SohlItem)

The item currently being processed. Key properties:
- `item.type` — Foundry type string (e.g., `"skill"`)
- `item.system` — the item's DataModel (persisted fields)
- `item.system.logic` — the item's Logic instance (derived behavior)
- `item.system.shortcode` — shortcode string (use this to filter to a specific item)
- `item.actor` — the owning actor, if any

### `actor` (SohlActor)

The actor currently being processed. Key properties:
- `actor.type` — Foundry type string (e.g., `"being"`)
- `actor.system` — the actor's DataModel
- `actor.system.logic` — the actor's Logic instance

### `ctx` (SohlActionContext)

The lifecycle context object. Key properties:

| Property | Type | Description |
|----------|------|-------------|
| `ctx.speaker` | `SohlSpeaker` | Identity of who triggered the preparation |
| `ctx.target` | `SohlTokenDocument \| null` | Target token, if any |
| `ctx.skipDialog` | `boolean` | Whether UI dialogs should be suppressed |
| `ctx.noChat` | `boolean` | Whether chat output should be suppressed |

`ctx` is not provided for actor `preInitialize`/`postInitialize` (actor-level hooks in `prepareBaseData`).

## Cancellable hooks

`pre*` hooks are cancellable. If **any** listener returns a truthy value, the associated logic method is **skipped** for that document. The corresponding `post*` hook is also not emitted.

This allows a module to completely replace lifecycle behavior for a specific type:

```js
Hooks.on("sohl.skill.preEvaluate", (item, ctx) => {
    if (item.system.shortcode !== "tactics") return; // only affect "tactics"

    // Run custom evaluate instead of default
    myCustomTacticsEvaluate(item, ctx);

    return true; // cancel default evaluate()
});
```

Use cancellation carefully — it completely bypasses SoHL's built-in logic for that phase.

## Practical examples

### Augmenting all skills post-evaluate

```js
Hooks.once("init", () => {
    game.settings.register("my-module", "enableTacticsBonus", {
        name: "Enable Tactics Bonus",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
});

Hooks.on("sohl.skill.postEvaluate", (item, ctx) => {
    if (!game.settings.get("my-module", "enableTacticsBonus")) return;
    if (!game.user?.isGM) return; // single-authority side effect guard

    // Apply a bonus to all skills named "Tactics"
    if (item.system.shortcode === "tactics") {
        item.system.logic.masteryLevel.add("tactics-bonus", 5);
    }
});
```

### Reacting to actor finalize

```js
Hooks.on("sohl.actor.being.postFinalize", (actor, ctx) => {
    // Runs after every Being actor completes finalize()
    // actor.system.logic now has fully resolved derived values
    const encumbrance = actor.system.logic.encumbrance;
    if (encumbrance > actor.system.logic.maxEncumbrance) {
        // apply a flag or mark the actor
    }
});
```

## Phase-barrier guarantee

SoHL keeps phase barriers intact even with hooks active:

- All `postInitialize` listeners complete before any `evaluate` loop begins.
- All `postEvaluate` listeners complete before any `finalize` loop begins.

Hook listeners must still honor phase assumptions. Do not perform finalize-only dependency work inside `postInitialize`.

## Module guard pattern

When a hook performs **persistent side effects** (database writes, world settings mutations), use both a world-setting toggle and a GM-only guard to prevent duplicate execution:

```js
Hooks.on("sohl.mysticalability.postFinalize", async (item, ctx) => {
    const enabled = game.settings.get("my-module", "enableFeature");
    if (!enabled) return;
    if (!game.user?.isGM) return; // single-authority guard

    // side effects here
});
```

This prevents every connected client from independently applying the same change.
