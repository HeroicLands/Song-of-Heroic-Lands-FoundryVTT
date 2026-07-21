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
> page explains what they are and how the mechanism works.

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
sitting on the macro bar, it runs from a specific actor's or item's **context
menu**, with the document as its context. They're **GM-only** to author (there's
no end-user authoring UI today).

A Script Action does not store code. Its `executor` is the **UUID of a Foundry
`Macro`** — the GM authors an ordinary script Macro (getting Foundry's editor,
`MACRO_SCRIPT` permission gate, and ownership for free), and the action runs it
via `Macro#execute`. No JavaScript is ever compiled from document data; this is
the reference-not-compile rule from the
[Security Model](security-model.md#the-core-principle-reference-code-never-compile-it-from-data).
Because macros are asynchronous, a Script Action always runs asynchronously — a
GM who needs a _synchronous computed value_ uses a {@link sohl.entity.expr.SafeExpression} field
(the safe, synchronous expression evaluator) instead.

The configurable fields (`scope`, `trigger`/`visible`, `executor`), the
{@link sohl.entity.expr.SafeExpression} predicates, and a worked example are documented on
**{@link sohl.entity.action.SohlAction}** (and {@link sohl.entity.action.SohlAction.Data}).

## How SoHL uses this internally: intrinsic actions

The same mechanism powers SoHL's own built-in behaviors. **Every** action — a GM's
Script Action or a system-provided one — is a {@link sohl.entity.action.SohlAction} surfaced on a
document's context menu. The only difference is where the `executor` comes from:

- A **Script Action**'s executor is a **Foundry Macro UUID**, run via
  `Macro#execute` (above).
- An **intrinsic action**'s executor is the **name of a method on the Logic class**,
  defined in code. SoHL's Logic classes declare their intrinsic actions in a static
  {@link sohl.core.logic.SohlLogic.defineIntrinsicActions} — e.g. a Mystery's `useMystery`, a
  Trauma's healing test — and the system binds that named method as the executor.

So "intrinsic actions" are simply the system doing, in code, what a GM does with a
Script Action: attaching an executable, context-menu-activated behavior to a
document. Developers adding a new built-in action define it this way on the relevant
Logic class — see [Extension Points](../how-to/extension-points.md) and {@link sohl.entity.action.SohlAction} /
{@link sohl.core.logic.SohlLogic} in the API reference. To affect _all_ documents of a type rather
than attach one action, use [Lifecycle Hooks](../how-to/lifecycle-hooks.md).

The same action can also be **offered across the chat log** — a card button that
runs it, pre-filled, on whoever is entitled to click. That is the same executor,
just triggered differently, and it is how every cross-client interaction (combat,
treatment, opposed tests) is wired. See
[Action Cards & the Consent Model](./action-cards.md).

### Worked example: Contract Disease

`BeingLogic`'s `contractDisease` (a `SELF`-scoped intrinsic action) is a good
template for an action that touches the Foundry boundary, because it keeps the
executor Foundry-free and pushes every Foundry call to a `FoundryHelpers` shim:

1. It reads the being's Endurance **attribute** with `getItemLogic("end", ITEM_KIND.ATTRIBUTE)`.
2. It delegates the world/compendium search **and** the dialog to
   `promptContractDisease()` — which calls the boundary shims `fvttFindDiseases()`
   (raw `game.items` / `game.packs` access) and `dialog()`, returning a plain,
   Foundry-free choice object. Only `disease`-subtype afflictions are offered.
3. It rolls the contagion test as an ordinary `MasteryLevelModifier.successTest`
   whose base is `contagionTarget(CI, Endurance)` = `CI × Endurance`. Because a
   lower CI yields a lower (easier-to-fail) target, a lower CI is more contagious.
4. On a **failed** roll it creates the affliction with `fvttCreateEmbeddedItems()`,
   copying the chosen source disease or building a fresh one from the custom
   name/CI (`buildContractedAfflictionData`).

The pure pieces (`contagionTarget`, `readContractAfflictionForm`,
`buildContractedAfflictionData`) live in `affliction-contract.ts` and are unit
tested directly; the executor and shims are the only Foundry-aware parts. This is
the standard shape: **logic orchestrates, `FoundryHelpers` shims do the I/O.**

## See also

- [The SoHL API](./sohl-api.md) — the document and `sohl` surfaces these scripts use.
- [Lifecycle Hooks](../how-to/lifecycle-hooks.md) — type-wide behavior instead of a
  per-document action.
- [Extension Points](../how-to/extension-points.md) — defining intrinsic actions and new types.
- [Writing Modules](../contributing/module-development.md) — when a script outgrows a macro or
  action.
