# Expressions and Scripts

SoHL lets content authors and GMs drive behavior from **data** — an effect's
targeting predicate, an action's availability check, a house-rule script. That
data is untrusted (see the [Security Model](security-model.md)), so the system
never turns it into arbitrary code. Instead there are three distinct mechanisms,
each matched to a different need. This page explains what they are and when to
reach for each; the grammar and API details live in the linked source symbols.

## The three mechanisms at a glance

| Mechanism              | Runs                    | Authored by         | Used for                                             |
| ---------------------- | ----------------------- | ------------------- | ---------------------------------------------------- |
| {@link SafeExpression} | **synchronously**, safe | content or GM       | predicates and computed values (from any data field) |
| Foundry **Macro**      | **asynchronously**      | GM (`MACRO_SCRIPT`) | imperative "do something" behavior (Script actions)  |
| Intrinsic **method**   | sync or async           | the system (code)   | built-in behavior on a Logic class                   |

The dividing lines are _who authors it_ and _how it runs_ — see the
[extension-point matrix](security-model.md#extension-points-which-tool-for-which-need)
in the security model. The one rule that governs all three: **data carries a
reference to, or a safely-evaluated expression of, logic — never compiled
imperative code.**

## SafeExpression — the safe, synchronous evaluator

{@link SafeExpression} (`src/entity/expr/SafeExpression.ts`) is the workhorse for
turning a short author-supplied string into a value or boolean, safely and
synchronously. It parses the string with [jsep](https://github.com/EricSmekens/jsep)
into an AST, **statically validates that AST against a strict allowlist**, then
evaluates it by walking the tree by hand — it never calls `eval`/`new Function`.
This is an _allowlist_, not a denylist, which is why it is a real security
boundary (unlike the removed `textToFunction` sandbox — see the
[security model](security-model.md#why-not-a-sandbox--denylist)).

Properties worth knowing:

- **Build once, evaluate many.** `new SafeExpression({ source }, { parent })`
  parses and validates immediately and throws a `SafeExpressionError` on
  anything unsupported, so a bad predicate fails at construction, not deep in a
  lifecycle. Only its `source` string is persisted.
- **No arbitrary property access.** Member access is allowed, but the keys
  `constructor`, `__proto__`, and `prototype` are denied — even when reached
  through a computed key — so an expression cannot climb the prototype chain to
  the `Function` constructor.
- **No arbitrary calls.** The only callables are the registered
  [expression helpers](#extending-the-helpers-the-expression-library) (built-ins
  plus any GM-loaded ones); an expression cannot call methods on the objects it
  is handed.
- **Bound variables depend on the call site** — e.g. an action's `trigger`/
  `visible` predicates see `item`, `actor`, `element`, and `isGM`; an active
  effect's `test`/`strikeModePredicate` see `item` / `sm`.

Where SafeExpression predicates are used today: action `trigger`/`visible`
({@link SohlAction}), active-effect `test`/`strikeModePredicate`
(`SohlActiveEffect`), and context-menu `condition`/`visible`
(`ContextMenuEntry`). Reach for a SafeExpression whenever a GM or content author
needs a **synchronous computed value or condition** from a data field.

## Macros — asynchronous, imperative GM behavior

When a GM needs to _do_ something (create documents, post chat, run a dialog),
not compute a value, the vehicle is a Foundry **Macro**. A
[Script action](macros-and-actions.md)'s `executor` is the **UUID of a Macro**,
run via `Macro#execute` — which enforces the `MACRO_SCRIPT` permission and
ownership. No code is stored on, or compiled from, the document. Macros are
inherently **asynchronous**, so they cannot return a value to a synchronous
caller — for that, use a SafeExpression. See
[Macros and Actions](macros-and-actions.md) and the security model's
[GM-homebrew section](security-model.md#gm-homebrew-use-foundry-macros-not-a-bespoke-sandbox).

## Intrinsic methods — the system's own behavior

An **intrinsic action**'s `executor` is the _name of a method_ on the scoped
target Logic class, looked up and bound at construction (see
{@link SohlAction}). This is how SoHL ships its built-in behaviors; it is code,
not data, so it carries no compilation risk. New built-in behavior is added this
way — see [Extension Points](../how-to/extension-points.md).

## Extending the helpers: the Expression Library

The functions a SafeExpression may call come from the expression-helper registry
(`src/entity/expr/ExpressionHelperRegistry.ts`) — built-ins plus any a GM loads
via the **Expression Library** settings menu. A GM chooses a JSON file mapping helper
names to `{ args, body }` entries; the bodies are compiled with the legacy
`textToFunction` screen and registered so predicates can call them.

This is the **one sanctioned use of `textToFunction`**, and it is a deliberately
different trust tier: the GM selects a _local file_, exactly as they would
install a module. It is not installed-package or cross-client data, and the
screen is explicitly "a sandbox, not a hard security boundary." Do **not** route
untrusted or cross-client input through this path or add new callers of
`textToFunction` — see the [security model](security-model.md#the-core-principle-reference-code-never-compile-it-from-data).

## See also

- [Macros and Actions](macros-and-actions.md) — macros vs. document-attached actions.
- [Security Model & Guardrails](security-model.md) — why these mechanisms are shaped this way.
- [Effects Integration](../reference/effects-integration.md) — where effect predicates use SafeExpression.
