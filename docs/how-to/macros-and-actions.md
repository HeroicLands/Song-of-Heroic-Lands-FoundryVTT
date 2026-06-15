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

A Foundry **macro** is a script you place on the macro bar, optionally bind to a
hotkey, and run on demand — see Foundry's
[Macros article](https://foundryvtt.com/article/macros/) for the feature itself. It
isn't tied to any particular actor or item, so it carries no document context of its
own — you reach whatever you need through the API (the `sohl` surface for helpers,
the document surface for a specific thing; see [The SoHL API](./sohl-api.md)).

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

A **Script Action** is, in effect, **a macro attached to a document**: instead of
sitting on the macro bar, it's stored on a specific actor or item and runs from that
document's **context menu**, with the document as its context. They're **GM-only**
to author (there's no end-user authoring UI today).

That's the bridge from macros — the full explanation lives on the class. The two
flavors, the configurable fields (`scope`, `trigger`/`visible`, `executor`,
`isAsync`), the {@link SafeExpression} predicates, the {@link textToFunction}
sandbox, and a worked example are all documented on **{@link SohlAction}** (and
{@link SohlAction.Data}). If a body needs what the sandbox forbids (DOM, network,
timers), use a [module](../contributing/module-development.md) instead.

A short body that isn't a statement is treated as an expression and returned, so a
one-liner works; use an explicit `return` for multi-statement bodies, and set the
action's `isAsync` flag if the body uses `await`.

## How SoHL uses this internally: intrinsic actions

The same mechanism powers SoHL's own built-in behaviors. **Every** action — a GM's
Script Action or a system-provided one — is a {@link SohlAction} surfaced on a
document's context menu. The only difference is where the `executor` comes from:

- A **Script Action**'s executor is the GM-authored script body (above).
- An **intrinsic action**'s executor is the **name of a method on the Logic class**,
  defined in code. SoHL's Logic classes declare their intrinsic actions in a static
  {@link SohlLogic.defineIntrinsicActions} — e.g. a Mystery's `useMystery`, a
  Trauma's healing test — and the system binds that named method as the executor.

So "intrinsic actions" are simply the system doing, in code, what a GM does with a
Script Action: attaching an executable, context-menu-activated behavior to a
document. Developers adding a new built-in action define it this way on the relevant
Logic class — see [Extension Points](./extension-points.md) and {@link SohlAction} /
{@link SohlLogic} in the API reference. To affect _all_ documents of a type rather
than attach one action, use [Lifecycle Hooks](./lifecycle-hooks.md).

## See also

- [The SoHL API](./sohl-api.md) — the document and `sohl` surfaces these scripts use.
- [Lifecycle Hooks](./lifecycle-hooks.md) — type-wide behavior instead of a
  per-document action.
- [Extension Points](./extension-points.md) — defining intrinsic actions and new types.
- [Writing Modules](../contributing/module-development.md) — when a script outgrows a macro or
  action.
