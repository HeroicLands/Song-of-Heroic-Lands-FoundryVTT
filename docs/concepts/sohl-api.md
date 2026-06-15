# The SoHL API

Scripts — Foundry [macros and Script Actions](./macros-and-actions.md) — and
[modules](../contributing/module-development.md) reach into Song of Heroic Lands
through **two distinct surfaces**. This page explains how they relate and when to
use each; _what_ each surface offers is documented on the class it points at.

- **The document surface** — `document.logic`, a {@link SohlLogic} — for working
  with _one specific_ actor or item.
- **The `sohl` surface** — the {@link SohlSystem} singleton — for _system-wide_
  services and helpers.

## The document surface — `document.logic`

Every SoHL document exposes its Foundry-free domain object as **`document.logic`**
(a {@link SohlLogic}), holding the document's computed state and its actions:

```js
const actor = game.actors.getName("Grymm");
const being = actor.logic; // the actor's logic
const sword = actor.items.getName("Broadsword").logic; // an item's logic
```

For typed fields, read **`document.logic.data`** — the document's `*Data` interface,
so editors autocomplete and the API reference links straight to it. {@link SohlLogic}
documents the layer and its lifecycle;
[Architecture Overview](./architecture.md#three-class-pattern) covers how
`document.system` (the DataModel) and `document.logic` (the Logic) relate.

Use this surface whenever the task is "read or act on _this particular_ thing."

## The `sohl` surface — the global singleton

System-wide helpers and services that aren't tied to any one document live on the
global **`sohl`** object — the {@link SohlSystem} singleton, created during Foundry's
`init` hook (so it's available from `init` onward, not earlier):

```js
sohl.utils.romanize(4); // "IV" — a system helper
sohl.log.info("hello from a macro"); // the system logger
```

What it offers — services, helpers, constants, and direct entry points into the
logic layer — is enumerated and kept current on **{@link SohlSystem}**; treat that
class as the source of truth rather than any list here.

### A note on `CONFIG`

SoHL registers its document, modifier, and result classes into Foundry's global
`CONFIG` at init (mirrored at `sohl.CONFIG`) — registration/wiring used by the system
and by modules adding new types, not a day-to-day scripting surface. For extending
it, see [Extension Points](../how-to/extension-points.md).

## Changing state

Treat both surfaces as **read-first**. To _change_ state, prefer a document's own
actions and the system's mutation paths over writing fields directly: an actor
mutates only itself, and cross-actor effects route through a target-addressed
acknowledgement flow — see
[actor state sovereignty](./architecture.md#actor-state-sovereignty).

## See also

- [Macros and Actions](./macros-and-actions.md) — scripting against these surfaces.
- [Writing Modules](../contributing/module-development.md) — extending the system in a package.
- [Architecture Overview](./architecture.md) — the three-layer model.
- [API Reference](https://api.heroiclands.org/latest) — every exported symbol.
