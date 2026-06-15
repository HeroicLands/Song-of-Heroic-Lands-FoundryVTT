# Macros and Actions

There are two ways to run custom behavior in a Song of Heroic Lands world, and
both are built on [The SoHL API](./sohl-api.md). They are **different things**:

- A **macro** lives on the **macro bar**, can be given a **hotkey**, and is **not**
  attached to any document.
- An **action** is **attached to a document** (an actor or item) and appears as an
  entry on that document's **context menu**.

This page walks from the familiar (macros) to the SoHL-specific (actions), then
shows that SoHL uses the very same action mechanism internally.

> For _using_ actions during play, see the in-game **User Guide → Actions**. This
> page is about _authoring_ them.

## Macros

A Foundry macro is a script you place on the macro bar, optionally bind to a
hotkey, and run on demand. It isn't tied to any particular actor or item, so it
carries no document context of its own — you reach whatever you need through the
API (the `sohl` surface for helpers, the document surface for a specific thing;
see [The SoHL API](./sohl-api.md)).

```js
// Macro: report the selected token's actor health.
const token = canvas.tokens.controlled[0];
if (!token) return ui.notifications.warn("Select a token first.");
const being = token.actor.logic;
sohl.log.info(`${token.actor.name}: ${being.health?.effective}% health`);
```

Reach for a macro when the task is "let me run X right now" — GM utilities and
one-offs.

## Script Actions

A **Script Action** is, in effect, **a macro attached to a document**. Rather than
sitting on the macro bar, it's stored on a specific actor or item and surfaced as
an entry on that document's **context menu**; choosing the entry runs the script.
Because it lives on the document, it runs _with that document as its context_.

What you author, and how it differs from a macro:

- **Where it appears:** the context menu of the actor/item it's attached to. The
  action's `group` controls placement; `visible` and `trigger` control whether it
  shows and is currently available.
- **What `this` is:** bound by the action's **`scope`** — `SELF` (the action's own
  logic), `ITEM` (the owning item's logic), or `ACTOR` (the owning actor's logic) —
  so the script operates on the right object without looking it up.
- **The context:** the body receives a `SohlActionContext` as its `context`
  parameter (the speaker, an optional target, and dialog/chat flags).
- **Predicates:** `trigger` (availability) and `visible` (display) are authored as
  small **SafeExpression** strings — a restricted dialect of identifiers, property
  access, comparisons, and whitelisted helpers (`has`, `defined`, `startsWith`, …);
  no method calls, `new`, or `eval`.
- **Authoring & permissions:** Script Actions are stored on the document
  (`actionDefs`) and are **GM-only** to create or edit. There is no end-user
  authoring UI today, so a GM (or module code) sets them up.

The body itself is sandboxed: SoHL compiles it through a screened builder
(`textToFunction`, strict mode) that **rejects** dangerous globals and patterns
before the function is created — `window`, `document`, `globalThis`, `eval`,
`fetch`, `require`, `import`, `setTimeout`, `.constructor`, `.__proto__`, and the
like. A Script Action can compute over the SoHL/Foundry objects it's handed, but
it can't touch the DOM, the network, or timers. If you need those, you need a
[module](../contributing/module-development.md), not a Script Action.

```js
// Script Action with scope = ACTOR — `this` is the actor's logic,
// `context` carries the speaker. (Available properties depend on the
// scoped logic type; see the API reference.)
const health = this.health?.effective ?? 0;
sohl.log.info(`${context.speaker?.alias}: ${health}% health`);
```

A short body that isn't a statement is treated as an expression and returned, so a
one-liner works; use an explicit `return` for multi-statement bodies, and set the
action's `isAsync` flag if the body uses `await`.

## How SoHL uses this internally: intrinsic actions

The same mechanism powers SoHL's own built-in behaviors. **Every** action — a GM's
Script Action or a system-provided one — is a `SohlAction` surfaced on a document's
context menu. The only difference is where the `executor` comes from:

- A **Script Action**'s executor is the GM-authored script body (above).
- An **intrinsic action**'s executor is the **name of a method on the Logic class**,
  defined in code. SoHL's Logic classes declare their intrinsic actions in a static
  `defineIntrinsicActions()` — e.g. a Mystery's `useMystery`, a Trauma's healing
  test — and the system binds that named method as the executor.

So "intrinsic actions" are simply the system doing, in code, what a GM does with a
Script Action: attaching an executable, context-menu-activated behavior to a
document. Developers adding a new built-in action define it this way on the
relevant Logic class — see [Extension Points](./extension-points.md) and the
`SohlAction` / `SohlLogic` entries in the
[API Reference](https://api.heroiclands.org/latest). To affect _all_ documents of a
type rather than attach one action, use [Lifecycle Hooks](./lifecycle-hooks.md).

## See also

- [The SoHL API](./sohl-api.md) — the document and `sohl` surfaces these scripts use.
- [Lifecycle Hooks](./lifecycle-hooks.md) — type-wide behavior instead of a
  per-document action.
- [Extension Points](./extension-points.md) — defining intrinsic actions and new types.
- [Writing Modules](../contributing/module-development.md) — when a script outgrows a macro or
  action.
