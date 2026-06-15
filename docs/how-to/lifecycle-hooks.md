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
  [Lifecycle Model](../concepts/lifecycle-model.md).

## Guarding persistent side effects

When a hook writes persistent state (documents, world settings), gate it behind a
world-setting toggle **and** a GM-only check, so it runs under a single authority
rather than once per connected client. See the worked recipe in
[House Rules Cookbook — guard pattern](./house-rules-cookbook.md#recipe-3-the-recommended-guard-pattern).

## See also

- [Macros and Actions](../concepts/macros-and-actions.md) — per-item behavior instead of type-wide.
- [Extension Points](./extension-points.md) — choosing an extension scope.
- [Lifecycle Model](../concepts/lifecycle-model.md) — the phase model and rationale.
- [Writing Modules](../contributing/module-development.md) — building the module these hooks live in.
