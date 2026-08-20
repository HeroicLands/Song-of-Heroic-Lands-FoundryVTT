---
aliases: []
name:
  full: Macros and Actions
  aliases: []
id: Hk17waT8fDxpYs6u
slug: macros-and-actions
type: doc
package: sohl
category: dev-docs
folder: null
---

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

### A refused action must say so

`trigger` is a **hard** gate: {@link sohl.entity.action.SohlAction.execute}
honors it however the action is invoked, so an action whose trigger is false
does nothing. A surface that _offers_ the action must therefore ask before
offering it — {@link sohl.entity.action.SohlAction.isAvailable} is that
question, evaluated against the action's own owning documents — and, when the
answer is no, present the control as **disabled with the reason** rather than
live-but-inert. Silently doing nothing on click reads as a bug.

The reason is {@link sohl.entity.action.SohlAction.unavailableReason}: the
action's declared `disabledReason` (an i18n **key**, localized only where it is
rendered or notified), falling back to a generic one. Gate an action on a
condition a user can act on, and give it a `disabledReason` that names that
condition — the gear carried gate does this via
`GearLogic.CARRIED_DISABLED_REASON`, so every gear action refused for an
uncarried item explains itself the same way.

Both Actions tabs render from this contract: the run control on a refused row is
disabled with the reason as its tooltip, and clicking one anyway reports the
refusal instead of no-op'ing.

## How SoHL uses this internally: intrinsic actions

The same mechanism powers SoHL's own built-in behaviors. **Every** action — a GM's
Script Action or a system-provided one — is a {@link sohl.entity.action.SohlAction} surfaced on a
document's context menu. The only difference is where the `executor` comes from:

- A **Script Action**'s executor is a **Foundry Macro UUID**, run via
  `Macro#execute` (above).
- An **intrinsic action**'s executor is the **name of a method on the Logic class**,
  defined in code. SoHL's Logic classes declare their intrinsic actions in a static
  {@link sohl.core.logic.SohlLogic.defineIntrinsicActions} — e.g. a Skill's `successTest`, a
  Trauma's healing test — and the system binds that named method as the executor.

Because `defineIntrinsicActions` composes up the class hierarchy (each override
spreads `super.defineIntrinsicActions()`), the **base Logic classes contribute
actions shared by _every_ document of that layer**, not just per-kind ones. The
`SohlLogic` base pair is edit / delete; on top of it {@link sohl.document.item.logic.SohlItemBaseLogic}
adds **Output Description to Chat** — a `SELF`-scoped intrinsic action
(`outputDescription`) that every item kind therefore carries. It posts the item's
own description to the chat log through the pure, unit-testable
`buildItemDescCardData` (name, type-label subtitle, notes, an optional text
reference, and a charge count where the kind uses charges; the description HTML is
enriched and the card sanitized by `buildActionCard`). It is purely informational —
no follow-up buttons, taking no action on any character — the "assist, never act"
consent model at its simplest.

So "intrinsic actions" are simply the system doing, in code, what a GM does with a
Script Action: attaching an executable, context-menu-activated behavior to a
document. Developers adding a new built-in action define it this way on the relevant
Logic class — see [Extension Points](../how-to/extension-points.md) and {@link sohl.entity.action.SohlAction} /
{@link sohl.core.logic.SohlLogic} in the API reference. To affect _all_ documents of a type rather
than attach one action, use [Lifecycle Hooks](../how-to/lifecycle-hooks.md).

### Overriding an intrinsic action

A GM can **replace** an intrinsic action with their own house-ruled behavior by
adding a Script Action whose `shortcode` matches the intrinsic one. The script then
_wholly overrides_ (hides) the intrinsic: the context menu, the default action, and
{@link sohl.core.logic.SohlLogic.executeAction} all resolve **only** the script —
the system never runs both. Because an action is keyed by `shortcode`, the two
sources are merged with the script winning, and the shadowed intrinsic is dropped
from {@link sohl.core.logic.SohlLogic.actions} entirely.

The override is _total_ — the system does not chain the intrinsic before or after
the script. If the script means only to **build on** the existing capability, it is
responsible for invoking the intrinsic itself. The intrinsic's capability is a plain
method on the Logic (the action's `executor`, e.g. `toggleCarried`), untouched by
the override, so the macro calls it directly.

Every executor — an intrinsic method or a Script Action's macro — receives the
**same single argument**: the {@link sohl.entity.action.SohlActionContext}, exposed
to the macro as `ctx`. Inside a macro `this` is the Foundry Macro (not the Logic),
so the context carries `ctx.thisLogic` — the Logic the action runs on, the exact
target an intrinsic method is bound to (so inside an intrinsic, `this` and
`ctx.thisLogic` are the same object). An overriding macro reaches the intrinsic it
hides through that handle:

```js
// A Script Action macro overriding the intrinsic `toggleCarried`, then
// building on it. `ctx` is the SohlActionContext; `ctx.thisLogic` is the Logic.
await ctx.thisLogic.toggleCarried(ctx); // run the built-in behavior
// …then apply the house rule on top.
```

(Calling `ctx.thisLogic.executeAction("toggleCarried")` instead would resolve back
to this same script and re-enter it — call the executor method, not the action.)

The same action can also be **offered across the chat log** — a card button that
runs it, pre-filled, on whoever is entitled to click. That is the same executor,
just triggered differently, and it is how every cross-client interaction (combat,
treatment, opposed tests) is wired. See
[Action Cards & the Consent Model](./action-cards.md).

### Worked example: Contagion Test

`BeingLogic`'s `contagionTest` (a `SELF`-scoped intrinsic action) is a good
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
