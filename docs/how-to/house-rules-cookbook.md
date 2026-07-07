# House Rules Cookbook

> **Audience:** GMs and developers who want to change behavior without forking SoHL.

See also: [Documentation](../documentation.md), [Extension Points](./extension-points.md)

This page gives quick, practical patterns for choosing and implementing house rules.

## Quick chooser

- Use an **Action item** when you want to change behavior for one specific item (for example, only `curse`).
- Use a **Module hook** when you want to apply logic broadly across many items (for example, all spells).

## Recipe 1: Change one spell only (Script Action)

Goal: change only the `Curse` mystical ability's behavior after initialize.

A **Script Action** does not store code — its `executor` is the **UUID of a
Foundry `Macro`**, run via `Macro#execute` (GM-only, permission-gated). No code
is ever compiled from the item's data; see the
[Security Model](../concepts/security-model.md#the-core-principle-reference-code-never-compile-it-from-data).

1. **Author the behavior as a script Macro.** Create a Foundry Macro (type
   _script_) with your logic. It receives `actor`, `token`, and the action
   context in scope; reach SoHL state through `actor.logic` / `item.logic` and
   the `sohl` surface. (Authoring a script Macro requires the `MACRO_SCRIPT`
   permission — GMs have it by default.)
2. **Add a Script Action to the `Curse` item** whose **shortcode** is the
   lifecycle stage you want to hook — `postInitialize` (likewise `postEvaluate`
   or `postFinalize`). After each phase, the system runs the item's action whose
   shortcode matches that stage. Because the action is attached to this item, it
   runs only for `Curse`.
3. Set the action's `scope` (`SELF` / `ITEM` / `ACTOR`) and, if needed,
   `trigger` / `visible` predicates (each a
   [`SafeExpression`](../concepts/security-model.md) string).
4. **Set the action's `executor` to your Macro's UUID.** That reference is the
   whole link — running the action executes that Macro.

Result: only the `Curse` item runs this Macro during its lifecycle.

> Need a _synchronous computed value_ (not imperative behavior)? Use a
> `SafeExpression` field instead — Macros are asynchronous. See the
> [extension-point matrix](../concepts/security-model.md#extension-points-which-tool-for-which-need).

## Recipe 2: Apply a rule to many spells (Module)

Goal: run generic logic for `mysticalability` items (optionally narrowed by shortcode filters).

Core emits hooks as:

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

## Recipe 3: The recommended guard pattern

Goal: make house rules easy to toggle per world (a world setting) and prevent duplicate side effects (a GM-only guard).

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

## Tradeoffs summary

- **Action item**
    - Easiest path; no module packaging.
    - Best for one-off item-level overrides.
- **Module**
    - No SoHL core edits required.
    - Best for campaign-wide or category-wide house rules.

## Related docs

- [Macros and Actions](../concepts/macros-and-actions.md) — authoring macros and Script Actions
- [Lifecycle Hooks (Developer Guide)](./lifecycle-hooks.md) — complete hook name reference for module authors
- [Extension Points (Developer Guide)](./extension-points.md)
