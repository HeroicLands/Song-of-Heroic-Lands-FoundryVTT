# Lifecycle Hooks

> **Audience:** Foundry module developers augmenting SoHL actor/item behavior
> _broadly_ — across many items or actors — without modifying SoHL source.

SoHL fires cancellable Foundry hooks around each phase of its data-preparation
lifecycle. From a module you can listen to **augment** behavior, or return `false`
from a `pre*` hook to **replace** a phase. For behavior on _one specific_ item,
prefer a Script Action instead — see
[Macros and Actions](../concepts/macros-and-actions.md).

This page is the module-author entry point; the details live with the code that
defines them:

- **The hook contract** — the hook names, cancellable semantics, arguments, and
  worked `Hooks.on(...)` examples (listen and cancel) — is documented on
  {@link SohlActor}, which fires the hooks during data preparation.
- **The type strings** in the hook names (`sohl.<itemType>.…` and
  `sohl.actor.<actorType>.…`) are {@link ITEM_KIND} and {@link ACTOR_KIND}.
- **The phase model** — the three phases (`initialize` → `evaluate` → `finalize`)
  and the barrier guarantees — is in
  {@link SohlLogic}.

## Minimal example

Hook names are `sohl.<itemType>.<phase>` (and `sohl.actor.<actorType>.<phase>`),
where `<phase>` is `preInitialize`/`postInitialize`, `preEvaluate`/`postEvaluate`,
or `preFinalize`/`postFinalize`.

```js
// Augment: run after every mystical ability finishes evaluating.
Hooks.on("sohl.mysticalability.postEvaluate", (item, ctx) => {
    // item = the mysticalability item; ctx = SohlActionContext
    // read/adjust derived state here (not persisted)
});

// Replace: cancel the default initialize phase for a specific item.
Hooks.on("sohl.mysticalability.preInitialize", (item, ctx) => {
    if (item.system.shortcode !== "curse") return; // leave others alone
    // ...do the replacement work...
    return false; // returning false from a pre* hook cancels the phase
});
```

For persistent writes, guard them (next section). For a fuller worked example
including a world-setting toggle, see
[House Rules Cookbook — Recipe 2](./house-rules-cookbook.md#recipe-2-apply-a-rule-to-many-spells-module).

## Guarding persistent side effects

When a hook writes persistent state (documents, world settings), gate it behind a
world-setting toggle **and** a GM-only check, so it runs under a single authority
rather than once per connected client. See the worked recipe in
[House Rules Cookbook — guard pattern](./house-rules-cookbook.md#recipe-3-the-recommended-guard-pattern).

## See also

- [Macros and Actions](../concepts/macros-and-actions.md) — per-item behavior instead of type-wide.
- [Extension Points](./extension-points.md) — choosing an extension scope.
- {@link SohlLogic} — the phase model and rationale.
- [Writing Modules](../contributing/module-development.md) — building the module these hooks live in.
