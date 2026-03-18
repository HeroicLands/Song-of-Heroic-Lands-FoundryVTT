# Extension Points (Developer Guide)

> **Audience:** Developers maintaining or extending SoHL.  
> **Goal:** Identify the safest places to add features with minimal risk.

See also: [Rules Variants and Extension Mechanisms](../concepts/rules-variants.md) and [House Rules Cookbook](./house-rules-cookbook.md).

**You are here**

- This page is implementation-focused how-to guidance.
- Canonical variant model and mechanism choice live in [Rules Variants and Extension Mechanisms](../concepts/rules-variants.md).
- Canonical runtime and data-model invariants live in [Runtime Contracts](../reference/runtime-contracts.md).

## Choosing extension scope

- Use a **Variant** for broad, coherent rules families (large-scale differences).
- Use a **Module** for additive house rules without modifying SoHL source.
- Use **Action items** for single-item behavior overrides (for example, one specific spell).

Note: current lifecycle hooks in core are emitted with item-type granularity (`sohl.<itemType>.<stage>`). If you need shortcode-specific behavior, filter inside the handler using `item.system.shortcode`.

### Recommended module guard pattern

When a module hook performs persistent side effects, use both a world-setting toggle and a GM-only guard.

```js
Hooks.once("init", () => {
    game.settings.register("my-house-rules", "enableMysticalTweaks", {
        name: "Enable mystical house rules",
        hint: "Apply custom mystical ability behavior.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
});

Hooks.on("sohl.mysticalability.postFinalize", async (item, ctx) => {
    if (item.system.shortcode !== "curse") return;
    const enabled = game.settings.get("my-house-rules", "enableMysticalTweaks");
    if (!enabled) return;
    if (!game.user?.isGM) return;

    // guarded, single-authority side effects
});
```

## Golden rule

**Extend by adding new classes and registering them** (via existing registries / wiring), rather than editing core logic in-place.

Constructor dispatch rule:

- `globalThis.sohl` points to the selected runtime variant (`SohlSystem` instance).
- Common code should construct variant-resolved classes via `sohl.CONFIG` mappings (for example `sohl.CONFIG.ImpactModifier`) instead of hard-coding variant class names.

When in doubt:

1. find the nearest existing example,
2. replicate the pattern,
3. change the minimum.

## 1) System initialization & registration

Primary entry:

- `src/sohl.ts`
- `src/core/SohlSystem.ts`

Common extension needs:

- Register new settings
- Register new sheets
- Register hooks
- Register new document classes

**Guidelines**

- Keep registration logic explicit and centralized.
- Avoid “magic imports” that register things by side-effect unless already established.

Current startup sequence (from `src/sohl.ts`):

- `Hooks.once("init")`
    - registers system settings (`registerSystemSettings()`),
    - selects/configures variant (`setupVariant()`),
    - rehydrates imported calendars (`rehydrateCalendars()`),
    - applies the active calendar (`applyActiveCalendar()`),
    - registers system hooks (`registerSystemHooks()`),
    - sets combat/time defaults,
    - registers Region and RegionBehavior sheets.
- `Hooks.once("ready")`
    - registers Handlebars helpers (`registerHandlebarsHelpers()`),
    - sets `SohlSystem.ready = true`.

## 2) Actor and Item type extension

### Actors

Core actor classes are under `src/document/actor/` with base `SohlActor.ts` in `src/document/actor/foundry/`.

Layering reminder:

- actor document (`SohlActor` subclass) = Foundry integration surface,
- actor DataModel (`system`) = persisted schema/state,
- actor Logic (`system.logic`) = rules behavior + derived properties,
- actor Sheet = UI/editor behavior.

**How to extend**

- Add a new actor subclass under `src/document/actor/logic/` (logic) and `src/document/actor/foundry/` (data model + sheet)
- Ensure any required sheet templates are added under `templates/...`
- Register data model/logic/sheet mappings in `src/core/SohlSystem.ts` (and variant system mappings where applicable)

### Items

Core item classes are under `src/document/item/` with base `SohlItem.ts` in `src/document/item/foundry/`.

Layering reminder:

- item document (`SohlItem` subclass) = Foundry integration surface,
- item DataModel (`system`) = persisted schema/state,
- item Logic (`system.logic`) = rules behavior + derived properties,
- item Sheet = UI/editor behavior.

Data model invariant:

- DataModel schemas are shared and must stay variant-agnostic.
- Variants can override Logic and Sheets, but should not add variant-specific persisted schema fields to shared models.
- Variant-specific persisted data belongs under `flags.sohl.<variant>...` and logic must handle missing flags safely.

**How to extend**

- Add a new item subclass under `src/document/item/logic/` (logic) and `src/document/item/foundry/` (data model + sheet)
- Add templates if it has a sheet representation
- Register data model/logic/sheet mappings in `src/core/SohlSystem.ts` (and variant mappings when specialized)

**Avoid**

- Adding “if type === X” branches in the base class; prefer polymorphism.

Worked example pattern (minimal checklist for a new Item kind):

1. Add new kind constant in `src/utils/constants.ts` (`ITEM_KIND`).
2. Create item logic class under `src/document/item/logic/` and data model + sheet under `src/document/item/foundry/`.
3. Register data model/logic/sheet in `src/core/SohlSystem.ts` mappings.
4. If variant-specific behavior is needed, add a `Lgnd*` logic override class in `src/document/item/logic/` and update `src/core/LegendarySystem.ts` mappings.
5. Add/adjust templates and localization keys.
6. Validate actor/item sheet rendering and context-menu behavior.

## 3) Combat / tests / resolution pipeline

Core components:

- `src/result/*`
- `src/modifier/*`
- `src/document/combatant/`
- `src/core/SohlLogic.ts` (likely orchestrator)
- `src/core/SohlActionContext.ts` (request context)

**Safe extension pattern**

- Add new `*Result` types for new outcomes
- Add new `*Modifier` types for new influences
- Keep results serializable for chat/UI

**High-risk**

- Changing shared modifier interpretation rules
- Changing success thresholds or resolution order
- Renaming result fields used by templates

**Best practice**

- Introduce new behavior behind a clearly-named function.
- Add an integration path from the orchestrator rather than rewriting it.

## 4) Active effects

Core:

- `src/document/effect/` (`SohlActiveEffect`)

**Safe extension**

- Add new effect categories/types in a backward-compatible way
- Keep data modeling stable

**High-risk**

- Changing effect application order
- Changing how effects are persisted

Current effects integration points:

- Effects are standard `SohlActiveEffect` documents (`src/document/effect/SohlActiveEffect.ts`).
- `SohlDataModel` sheet context exposes:
    - `data.effects` (owned effects)
    - `data.trxEffects` (active transferred effects)
- Actor/item helper methods create embedded ActiveEffects (`createActiveEffect(...)` in `SohlActor` and `SohlItem`).
- SoHL extends Foundry targeting via effect fields:
    - `targetType`: `this`, `actor`, or an item document type
    - `targetName`: regex used for item-type targeting (matched against item shortcodes)

So with `targetType=<itemType>`, one embedded effect can affect multiple sibling items of that type on the same actor.

There is no single centralized "effects-to-modifiers" bridge in one file; interaction with modifiers/results occurs through document logic and data preparation across actor/item/result pipelines.

## 5) UI: templates and chat cards

Chat cards:

- `templates/chat/*`

Dialogs:

- `templates/dialog/*`

Sheets:

- `templates/legendary/*` (and others as present)

**Safe extension**

- Add new templates rather than overloading existing ones
- Keep template context objects stable and well-documented (JSDoc on the builder functions)

**Best practice**

- If a template needs data, define a typed “view model” builder function in TS and pass it to rendering.

## 6) Localization

- `lang/en.json`

**Rules**

- Never rename keys casually (that breaks downstream translations and user muscle memory).
- Add new keys; deprecate old keys slowly if necessary.
- Use helper `src/utils/SohlLocalize.ts` for consistent lookup.

## 7) Variants (Legendary / Misty Isle)

Legendary variant overrides are `Lgnd*` classes co-located in `src/document/*/logic/`. MistyIsle is planned as a separate Foundry module.

**How to extend variants**

- Prefer implementing differences as `Lgnd*` override classes in `src/document/*/logic/`.
- Keep shared behavior in `src/core/` and `src/document/` base classes.
- Avoid pulling variant logic into base classes unless it truly applies to all variants.

**Portability contract**

- Data created in one variant should remain loadable in another.
- Keep persisted DataModel shape stable across variants.
- Store variant-only persisted fields in `flags.sohl.<variant>...`.

## 8) System registries

`src/core/SohlSystem.ts`

This is a critical extension surface.

**Rules**

- Keep mappings explicit.
- Avoid runtime “guessing” / reflection-based wiring.
- Validate registrations early during init.

**Recommended**

- Add a small self-test function (dev-only) that asserts required mappings exist.

## 9) Calendar registration

SoHL provides a calendar registry that modules can use to add custom calendars.
Registered calendars appear in the GM's calendar settings dropdown alongside the
built-in default.

**Registering a calendar from a module:**

Register your calendar in your module's `init` hook. This must happen during
`init` so the calendar is available when the system applies the active calendar
selection.

```js
Hooks.once("init", () => {
    game.system.api.SohlSystem.registerCalendar("my-calendar", {
        label: "My Campaign Calendar",
        config: {
            name: "My Campaign Calendar",
            description: "A 13-month lunar calendar.",
            years: {
                yearZero: 0,
                firstWeekday: 0,
            },
            months: {
                values: [
                    { name: "Moonrise", abbreviation: "Mnr", ordinal: 1, days: 28 },
                    // ... remaining months
                ],
            },
            days: {
                values: [
                    { name: "Firstday", abbreviation: "1st", ordinal: 1 },
                    // ... remaining weekdays
                ],
                daysPerYear: 364,
                hoursPerDay: 24,
                minutesPerHour: 60,
                secondsPerMinute: 60,
            },
            seasons: {
                values: [
                    { name: "Spring", monthStart: 1, monthEnd: 4 },
                    // ... remaining seasons
                ],
            },
            era: {
                hasYearZero: false,
                name: "Age",
                abbrev: "A",
                beforeName: "Before Age",
                beforeAbbrev: "BA",
                description: "",
            },
        },
        builtin: true,  // true = cannot be deleted by the GM via settings UI
    });
});
```

**Registry API** (on `SohlSystem`):

| Method | Description |
|--------|-------------|
| `registerCalendar(id, registration)` | Register or overwrite a calendar. |
| `unregisterCalendar(id)` | Remove a calendar (throws if `builtin`). |
| `getCalendar(id)` | Get a registration by ID. |
| `calendars` | `SohlMap` of all registered calendars. |
| `applyCalendar(id)` | Apply a calendar to `CONFIG.time`. |

**CalendarRegistration shape:**

```ts
interface CalendarRegistration {
    label: string;           // Display name or i18n key
    config: object;          // Full calendar data (see user guide for JSON format)
    calendarClass?: typeof SohlCalendarData;  // Defaults to SohlCalendarData
    builtin?: boolean;       // If true, cannot be deleted via settings UI
}
```

**Key files:**

- Registry: `src/core/SohlSystem.ts` (static calendar methods)
- Calendar data model: `src/core/SohlCalendar.ts` (`SohlCalendarData`)
- Default config: `src/utils/constants.ts` (`SOHL_DEFAULT_CALENDAR_CONFIG`)
- Settings UI: `src/apps/CalendarSettingsMenu.ts`
- Init wiring: `src/sohl.ts` (`rehydrateCalendars`, `applyActiveCalendar`)

**Custom CalendarData subclass:**

If your calendar needs custom time-to-components logic (e.g., a non-standard
era system), you can subclass `SohlCalendarData` and pass it as `calendarClass`
in the registration. Your subclass must extend `SohlCalendarData` (or
`foundry.data.CalendarData`) and override `timeToComponents()`.

**Persistence model:**

- Calendars registered by code (modules, system) use `builtin: true` and are
  re-registered on every init.
- Calendars imported by the GM via the settings UI are persisted in the
  `sohl.importedCalendars` world setting and rehydrated at init.

## 10) AI integration (optional subsystem)

`src/utils/ai/*`

**Extension pattern**

- Add providers under `src/utils/ai/providers/`
- Keep `AIAdapter` and command definitions stable
- Add commands through a typed schema (see `AIAgentCommandDefinition.ts`)

**Rules**

- Must not block core gameplay.
- Must handle failure gracefully (timeouts, missing keys, provider errors).

## What to update when you add something

When adding:

- New actor/item type:
    - add class
    - register in class registry
    - add/adjust templates
    - update TypeDoc JSDoc
    - add a short guide note in `docs/how-to/extension-points.md`
- New user-facing workflow:
    - add `docs/user/...` doc
    - update journal generation content list/spec (see `docs/reference/journal-generation-spec.md`)

## Deep dives

- [Lifecycle Model](../concepts/lifecycle-model.md)
- [Combat Resolution Pipeline](../reference/combat-resolution-pipeline.md)
- [Modifier Model](../reference/modifier-model.md)
- [Effects Integration](../reference/effects-integration.md)
- [Runtime Contracts](../reference/runtime-contracts.md)
- [Scene, Token, and Combatant Systems](../reference/scene-token-combatant.md)
