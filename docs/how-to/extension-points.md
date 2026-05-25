# Extension Points (Developer Guide)

> **Audience:** Developers maintaining or extending SoHL.
> **Goal:** Identify the safest places to add features with minimal risk.

See also: [Architecture Overview](../concepts/architecture.md), [House Rules Cookbook](./house-rules-cookbook.md).

## Choosing extension scope

- Use a **Module hook** for additive behavior without modifying SoHL source — best for house rules that affect many items or actors.
- Use **Action items** for single-item behavior overrides (e.g., one specific spell).

Lifecycle hooks are emitted with item-type granularity (`sohl.<itemType>.<stage>`). Filter by `item.system.shortcode` inside the handler for narrower targeting.

### Recommended module guard pattern

When a hook performs persistent side effects, use both a world-setting toggle and a GM-only guard:

```js
Hooks.once("init", () => {
    game.settings.register("my-house-rules", "enableMysticalTweaks", {
        name: "Enable mystical house rules",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
});

Hooks.on("sohl.mysticalability.postFinalize", async (item, ctx) => {
    if (item.system.shortcode !== "curse") return;
    if (!game.settings.get("my-house-rules", "enableMysticalTweaks")) return;
    if (!game.user?.isGM) return;

    // guarded, single-authority side effects
});
```

## Golden rule

**Extend by adding new classes and registering them**, rather than editing core logic in-place.

When in doubt:
1. Find the nearest existing example.
2. Replicate the pattern.
3. Change the minimum.

## 1) System initialization & registration

Primary files: `src/sohl.ts`, `src/core/SohlSystem.ts`

Common extension needs: register new settings, sheets, hooks, or document classes.

**Guidelines:** Keep registration logic explicit and centralized. Avoid side-effect imports.

Current startup sequence (from `src/sohl.ts`):

- `Hooks.once("init")`
    - registers system settings,
    - configures system,
    - rehydrates imported calendars,
    - applies the active calendar,
    - registers system hooks,
    - sets combat/time defaults,
    - registers Region and RegionBehavior sheets.
- `Hooks.once("ready")`
    - registers Handlebars helpers,
    - sets `SohlSystem.ready = true`.

## 2) Actor and Item type extension

### Actors

Core actor classes: `src/document/actor/` with base `SohlActor` in `foundry/`.

Layering:
- Document (`SohlActor`) = Foundry integration
- DataModel (`system`) = persisted schema
- Logic (`system.logic`) = rules behavior + derived properties
- Sheet = UI/editor behavior

**How to extend:** Add logic class in `src/document/actor/logic/`, data model + sheet in `src/document/actor/foundry/`, register in `SohlSystem.ts`.

### Items

Core item classes: `src/document/item/` with base `SohlItem` in `foundry/`.

Same layering as actors.

**Worked example (new Item kind):**

1. Add kind constant in `src/utils/constants.ts` (`ITEM_KIND`).
2. Create logic class in `src/document/item/logic/` and data model + sheet in `src/document/item/foundry/`.
3. Register data model/logic/sheet in `src/core/SohlSystem.ts`.
4. Add templates and localization keys.
5. Validate sheet rendering and context-menu behavior.

**Avoid:** Adding `if type === X` branches in base classes; prefer polymorphism.

## 3) Combat / tests / resolution pipeline

Core components:
- `src/domain/result/*` — test and combat result classes
- `src/domain/modifier/*` — value tracking and modification
- `src/document/combatant/` — combatant tracking
- `src/core/SohlActionContext.ts` — request context

**Safe extension:**
- Add new `*Result` types for new outcomes
- Add new `*Modifier` types for new influences
- Keep results serializable for chat/UI

**High-risk:**
- Changing shared modifier interpretation rules
- Changing success thresholds or resolution order

See [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md) and [Modifier Model](../reference/modifier-model.md).

## 4) Active effects

Core: `src/document/effect/SohlActiveEffect.ts`

SoHL extends Foundry's targeting via:
- `targetType`: `this`, `actor`, or an item document type
- `targetName`: regex matched against item shortcodes

With `targetType=<itemType>`, one effect can affect multiple sibling items of that type on the same actor.

See [Effects Integration](../reference/effects-integration.md).

## 5) UI: templates and chat cards

- Chat cards: `templates/chat/*`
- Dialogs: `templates/dialog/*`
- Actor/item sheets: `templates/actor/*`, `templates/item/*`

**Safe extension:** Add new templates rather than overloading existing ones. Keep template context objects stable and well-documented.

## 6) Localization

- `lang/en.json`

**Rules:**
- Never rename keys (breaks translations and downstream consumers).
- Add new keys; deprecate old keys slowly if needed.

## 7) System registries

`src/core/SohlSystem.ts` — the central registry for CONFIG mappings.

**Rules:**
- Keep mappings explicit.
- Avoid runtime reflection-based wiring.
- Validate registrations early during init.

## 8) Calendar registration

SoHL provides a calendar registry that modules can use to add custom calendars. Registered calendars appear in the GM's calendar settings dropdown.

Register in your module's `init` hook:

```js
Hooks.once("init", () => {
    game.system.api.SohlSystem.registerCalendar("my-calendar", {
        label: "My Campaign Calendar",
        config: { /* calendar data */ },
        builtin: true,
    });
});
```

**Registry API** (on `SohlSystem`):

| Method | Description |
|--------|-------------|
| `registerCalendar(id, registration)` | Register or overwrite a calendar |
| `unregisterCalendar(id)` | Remove a calendar (throws if `builtin`) |
| `getCalendar(id)` | Get a registration by ID |
| `calendars` | `SohlMap` of all registered calendars |
| `applyCalendar(id)` | Apply a calendar to `CONFIG.time` |

## What to update when you add something

- **New actor/item type:** Add class, register, add templates, update JSDoc, update docs.
- **New user-facing workflow:** Add `docs/user/...` doc, update journal generation spec.

## Deep dives

- [Action Items — Developer Reference](./actions.md)
- [Lifecycle Hooks](./lifecycle-hooks.md)
- [Lifecycle Model](../concepts/lifecycle-model.md)
- [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md)
- [Modifier Model](../reference/modifier-model.md)
- [Effects Integration](../reference/effects-integration.md)
- [Runtime Contracts](../reference/runtime-contracts.md)
