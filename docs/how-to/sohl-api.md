# The SoHL API

Scripts — Foundry [macros and Script Actions](../concepts/macros-and-actions.md) — and
[modules](../contributing/module-development.md) all reach into Song of Heroic Lands through
**two distinct surfaces**. Keeping them straight is the key to writing anything
against SoHL:

- **The document surface** — for working with _one specific_ actor or item.
- **The `sohl` surface** — for _system-wide_ services and helpers.

## The document surface — `document.logic`

Every SoHL document exposes its domain object as **`document.logic`** — the
Foundry-free layer that holds the document's **computed state** and its
**actions**. You reach it through the document itself:

```js
const actor = game.actors.getName("Grymm");
const being = actor.logic; // the actor's logic object
const sword = actor.items.getName("Broadsword").logic; // an item's logic
```

For typed, documented fields, read **`document.logic.data`** — it returns the
document's `*Data` interface (e.g. an actor's `logic.data` is its `…Data` shape),
so editors autocomplete and the API reference links straight to it. See
[Architecture Overview](../concepts/architecture.md) for the layer model
(`document.system` is the DataModel; `document.logic` is the Logic).

Use this surface whenever the task is "read or act on _this particular_ thing."

## The `sohl` surface — the global singleton

System-wide helpers and services that aren't tied to any one document live on the
global **`sohl`** object:

```js
sohl.utils.romanize(4); // "IV" — a system helper
sohl.constants.ITEM_KIND.SKILL; // system constants
sohl.i18n.localize("SOHL.Something"); // localization
sohl.log.info("hello from a macro"); // the system logger
```

It also offers direct entry points into the logic layer without walking Foundry
collections — `sohl.actorLogics`, `sohl.itemLogics`,
`sohl.currentCombatCombatantLogics`, `sohl.calendar`, `sohl.events`.

`globalThis.sohl` points at the **`SohlSystem` singleton**, created during the
Foundry **`init`** hook — so it is available before `ready` (don't reach for it
any earlier than `init`). For the complete, always-current member list, see
**`SohlSystem`** in the [API Reference](https://api.heroiclands.org/latest) rather
than any table here — the generated page is the source of truth.

### A note on `CONFIG`

SoHL registers its document, modifier, and result classes into Foundry's global
`CONFIG` at init (the same set is mirrored at `sohl.CONFIG`). That's
registration/wiring used by the system and by modules adding new types — not a
day-to-day scripting surface. For extending registrations, see
[Extension Points](./extension-points.md).

## Changing state

Treat both surfaces as **read-first**. To _change_ state, prefer a document's own
actions and the system's mutation paths over writing fields directly: an actor
mutates only itself, and cross-actor effects route through the system's
target-addressed acknowledgement flow rather than one document reaching into
another.

## See also

- [Macros and Actions](../concepts/macros-and-actions.md) — scripting against these surfaces.
- [Writing Modules](../contributing/module-development.md) — extending the system in a package.
- [Architecture Overview](../concepts/architecture.md) — the three-layer model.
- [API Reference](https://api.heroiclands.org/latest) — every exported symbol.
