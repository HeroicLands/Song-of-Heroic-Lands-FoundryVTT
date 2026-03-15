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
- `src/common/SohlSystem.ts`

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
    - registers system hooks (`registerSystemHooks()`),
    - sets combat/time defaults.
- `Hooks.once("ready")`
    - registers Handlebars helpers (`registerHandlebarsHelpers()`),
    - sets `SohlSystem.ready = true`.

## 2) Actor and Item type extension

### Actors

Core actor classes are under `src/common/actor/*` with base `SohlActor.ts`.

Layering reminder:

- actor document (`SohlActor` subclass) = Foundry integration surface,
- actor DataModel (`system`) = persisted schema/state,
- actor Logic (`system.logic`) = rules behavior + derived properties,
- actor Sheet = UI/editor behavior.

**How to extend**

- Add a new actor subclass under `src/common/actor/` (or variant directory)
- Ensure any required sheet templates are added under `templates/...`
- Register data model/logic/sheet mappings in `src/common/SohlSystem.ts` (and variant system mappings where applicable)

### Items

Core item classes are under `src/common/item/*` with base `SohlItem.ts`.

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

- Add a new item subclass under `src/common/item/`
- Add templates if it has a sheet representation
- Register data model/logic/sheet mappings in `src/common/SohlSystem.ts` (and variant mappings when specialized)

**Avoid**

- Adding “if type === X” branches in the base class; prefer polymorphism.

Worked example pattern (minimal checklist for a new Item kind):

1. Add new kind constant in `src/utils/constants.ts` (`ITEM_KIND`).
2. Create item logic/data/sheet class under `src/common/item/`.
3. Register data model/logic/sheet in `src/common/SohlSystem.ts` mappings.
4. If variant-specific behavior is needed, override mapping in `src/legendary/LegendarySystem.ts` and/or `src/mistyisle/*`.
5. Add/adjust templates and localization keys.
6. Validate actor/item sheet rendering and context-menu behavior.

## 3) Combat / tests / resolution pipeline

Core components:

- `src/common/result/*`
- `src/common/modifier/*`
- `src/common/combatant/*`
- `src/common/SohlLogic.ts` (likely orchestrator)
- `src/common/SohlActionContext.ts` (request context)

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

- `src/common/effect/*` (`SohlActiveEffect`, config, data)

**Safe extension**

- Add new effect categories/types in a backward-compatible way
- Keep data modeling stable

**High-risk**

- Changing effect application order
- Changing how effects are persisted

Current effects integration points:

- Effects are standard `SohlActiveEffect` documents (`src/common/effect/SohlActiveEffect.ts`).
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

Variants live in:

- `src/legendary/*`
- `src/mistyisle/*`

**How to extend variants**

- Prefer implementing differences in variant directories with `Lgnd*` / `Isle*` types.
- Keep shared behavior in `src/common`.
- Avoid pulling variant logic into common unless it truly applies to all variants.

**Portability contract**

- Data created in one variant should remain loadable in another.
- Keep persisted DataModel shape stable across variants.
- Store variant-only persisted fields in `flags.sohl.<variant>...`.

## 8) System registries

`src/common/SohlSystem.ts`

This is a critical extension surface.

**Rules**

- Keep mappings explicit.
- Avoid runtime “guessing” / reflection-based wiring.
- Validate registrations early during init.

**Recommended**

- Add a small self-test function (dev-only) that asserts required mappings exist.

## 9) AI integration (optional subsystem)

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
