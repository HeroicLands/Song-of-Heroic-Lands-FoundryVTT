# House Rules Cookbook

> **Audience:** GMs and developers who want to change behavior without forking SoHL.

See also: [Documentation Hub](../README.md), [Extension Points](./extension-points.md), [Rules Variants and Extension Mechanisms](../concepts/rules-variants.md)

This page gives quick, practical patterns for choosing and implementing house rules.

## Quick chooser

- Use an **Action item** when you want to change behavior for one specific item (for example, only `curse`).
- Use a **Module hook** when you want to apply logic broadly across many items (for example, all spells).
- Use a **Variant** only when you need a large, coherent rule family.

## Recipe 1: Change one spell only (Action item)

Goal: change only `mysticalability.curse` behavior after initialize.

1. Open the `Curse` mystical ability item.
2. Add an Action item with name:
    - `mysticalability.curse.postInitialize`
3. Set Action fields as needed (`scope`, `isAsync`, permissions, etc.).
4. Put your logic in the Action executor.

Result: only the `Curse` item runs this logic during lifecycle.

## Recipe 2: Apply a rule to many spells (Module)

Goal: run generic logic for `mysticalability` items (optionally narrowed by shortcode filters).

Current core emits hooks as:

- `sohl.<itemType>.postInitialize`
- `sohl.<itemType>.postEvaluate`
- `sohl.<itemType>.postFinalize`

So for a module-level "all mystical abilities" rule, register one handler and filter by shortcode only when needed.

```js
Hooks.on("sohl.mysticalability.postInitialize", (item, ctx) => {
    // Optional narrowing:
    // if (!["curse", "bless", "ward"].includes(item.system.shortcode)) return;
    // your broad house-rule logic here
    // item = current mysticalability item
    // ctx = SohlActionContext
});
```

Result: one module can apply consistent logic across multiple spells without changing SoHL source.

## Recipe 3: Use the recommended guard pattern (setting + GM-only)

Goal: make house rules easy to toggle per world and prevent duplicate side effects.

Pattern: combine a world setting check with a GM-only guard before applying persistent changes.

```js
Hooks.once("init", () => {
    game.settings.register("my-house-rules", "enableMysticalTweaks", {
        name: "Enable mystical house rules",
        hint: "Apply custom mystical ability initialization behavior.",
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

    // guarded house-rule logic here
    // safe place for persistent writes (create/update documents, apply effects, etc.)
});
```

Result: the same module can be installed everywhere, activated per world, and executed by a single authority.

## Recipe 4: Escalate to Variant

Use a Variant only when your changes are systemic (many actors/items/results/modifiers together), such as maintaining a whole alternate rules family.

Typical signals you need a Variant:

- multiple subsystems need coordinated changes,
- many classes need overrides, and
- long-term maintainability matters more than minimal setup.

## Tradeoffs summary

- **Action item**
    - Easiest path; no module packaging.
    - Best for one-off item-level overrides.
- **Module**
    - No SoHL core edits required.
    - Best for campaign-wide or category-wide house rules.
- **Variant**
    - Requires SoHL source changes.
    - Best for full alternate rulesets.

## Related docs

- [Action Items — User Guide](../../assets/packs/journals/data/user-guide/actions.md) — full field-by-field reference on creating and configuring Action items
- [Lifecycle Hooks (Developer Guide)](./lifecycle-hooks.md) — complete hook name reference for module authors
- [System Class Overrides](./system-class-overrides.md) — replacing modifier/result/sheet classes
- [Creating a Variant Module](./variant-module.md) — full variant implementation guide
- [Rules Variants and Extension Mechanisms](../concepts/rules-variants.md)
- [Extension Points (Developer Guide)](./extension-points.md)
