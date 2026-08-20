---
aliases: []
name:
  full: Expressions and Scripts
  aliases: []
id: WBg5LHbc23Vceh6u
slug: expressions
type: doc
package: sohl
category: dev-docs
folder: null
---

# Expressions and Scripts

SoHL lets content authors and GMs drive behavior from **data** — an effect's
targeting predicate, an action's availability check, a house-rule script. That
data is untrusted (see the [Security Model](security-model.md)), so the system
never turns it into arbitrary code. Instead there are three distinct mechanisms,
each matched to a different need. This page explains what they are and when to
reach for each; the grammar and API details live in the linked source symbols.

## The three mechanisms at a glance

| Mechanism                               | Runs                    | Authored by         | Used for                                             |
| --------------------------------------- | ----------------------- | ------------------- | ---------------------------------------------------- |
| {@link sohl.entity.expr.SafeExpression} | **synchronously**, safe | content or GM       | predicates and computed values (from any data field) |
| Foundry **Macro**                       | **asynchronously**      | GM (`MACRO_SCRIPT`) | imperative "do something" behavior (Script actions)  |
| Intrinsic **method**                    | sync or async           | the system (code)   | built-in behavior on a Logic class                   |

The dividing lines are _who authors it_ and _how it runs_ — see the
[extension-point matrix](security-model.md#extension-points-which-tool-for-which-need)
in the security model. The one rule that governs all three: **data carries a
reference to, or a safely-evaluated expression of, logic — never compiled
imperative code.**

## SafeExpression — the safe, synchronous evaluator

{@link sohl.entity.expr.SafeExpression} (`src/entity/expr/SafeExpression.ts`) is the workhorse for
turning a short author-supplied string into a value or boolean, safely and
synchronously. It parses the string with [jsep](https://github.com/EricSmekens/jsep)
into an AST, **statically validates that AST against a strict allowlist**, then
evaluates it by walking the tree by hand — it never calls `eval`/`new Function`.
This is an _allowlist_, not a denylist, which is why it is a real security
boundary (unlike the removed `textToFunction` sandbox — see the
[security model](security-model.md#why-not-a-sandbox--denylist)).

### How it works

Two steps — build once, evaluate as often as you like:

1. **Construct.** `new SafeExpression({ source }, { parent })` parses `source`
   with jsep and statically validates the resulting AST. Anything unsupported
   throws a `SafeExpressionError` **at construction**, so a bad predicate fails
   loudly at setup time, not deep in a lifecycle. Construction is the costly
   step; keep the instance and reuse it. Only the `source` string is persisted —
   the AST is rebuilt on revival.
2. **Evaluate.** `expr.evaluate(context?)` walks the validated AST against
   `context`, a plain object of variable bindings. Every bare identifier in the
   expression is looked up by name in `context`; an unknown identifier throws. It
   returns whatever the expression computes — a boolean for a predicate, a number
   or string for a computed field.

Two guardrails make it a real boundary, not a filter:

- **No arbitrary property access.** Member access is allowed, but the keys
  `constructor`, `__proto__`, and `prototype` are denied — even through a
  computed key — so an expression cannot climb the prototype chain to the
  `Function` constructor.
- **No arbitrary calls.** The only callable values are the registered
  [expression helpers](#the-standard-helpers) (built-ins plus any GM-loaded
  ones). An expression cannot call methods on the objects it is handed — you
  cannot write `actor.die()`.

### The language

**Allowed:** literals (`3`, `"orc"`, `true`), array literals (`[1, 2]`),
identifiers resolved from the context, property access by dot or bracket
(`actor.name`, `tags["ranged"]`), the operators `=== !== < > <= >= + - * / %`,
the short-circuiting `&&` and `||`, the unary `! - +`, the ternary
`cond ? a : b`, and calls to **helpers** (below).

**Rejected — at parse/validation time, before anything runs:** assignment (`=`),
bitwise and loose-equality operators (`& | == !=`), `typeof` / `new` / `delete` /
`instanceof`, statements (`;`, `if`, `for`), template and regex literals, and —
importantly — **method calls**.

### Bound variables — what each call site provides

The identifiers an expression may use depend on where it is used. Each call site
declares an **expression scope** — a named set of bindings, with a description
for each — in `src/entity/expr/expression-scopes.mjs`. That one declaration is
what the runtime validates against, what the formula editor autocompletes from,
and what the table below is generated from, so the three cannot drift apart
(issue #1142).

Writing an identifier a scope does not declare is rejected when the expression is
**compiled**, naming the offending identifier and listing the legal ones — rather
than throwing on every evaluation, where the caller catches it and the feature
silently does nothing.

Reach for a SafeExpression whenever a GM or content author needs a **synchronous
condition or computed value** from a data field. These are the call sites today:

<!-- BEGIN GENERATED: expression-scopes -->

| Call site                             | Where                                                              | Field(s)                         | Bindings                                                                                                                                                                                                                       | Result                                        |
| ------------------------------------- | ------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Action — UI visibility                | `SohlAction` (`compileVisibility`)                                 | `visible`                        | `element`, `itemLogic`, `actorLogic`, `isGM`                                                                                                                                                                                   | boolean                                       |
| Action — executability                | `SohlAction` (`compileTrigger`)                                    | `trigger`                        | `itemLogic`, `actorLogic`                                                                                                                                                                                                      | boolean                                       |
| Active Effect — item targeting        | `SohlActiveEffect` (item-kind scope)                               | `test`                           | `itemLogic`                                                                                                                                                                                                                    | boolean                                       |
| Active Effect — strike-mode targeting | `SohlActiveEffect` (`meleestrikemode` / `missilestrikemode` scope) | `test`                           | `itemLogic`, `sm`                                                                                                                                                                                                              | boolean                                       |
| Context-menu entry                    | `ContextMenuEntry` (`compileCondition`)                            | `condition`                      | `target`, `itemLogic`, `actorLogic`                                                                                                                                                                                            | boolean                                       |
| Skill Base formula                    | `SkillLogic` (`computeSkillBase`)                                  | `skillBaseFormula`               | `attr`                                                                                                                                                                                                                         | number                                        |
| Being — strength modifier             | `BeingLogic` (`evaluate`)                                          | `strMod`                         | `str`                                                                                                                                                                                                                          | number                                        |
| Being — encumbrance                   | `BeingLogic` (`evaluate`)                                          | `encumbrance`                    | `wt`                                                                                                                                                                                                                           | number                                        |
| Body — derived weight                 | `BodyLogic` (`evaluate`)                                           | `weight.calc`                    | `str`                                                                                                                                                                                                                          | number                                        |
| Result-description table row          | `SuccessTestResult` (result-description tables)                    | `label`, `description`, `result` | `successLevel`, `targetValue`, `lastDigit`                                                                                                                                                                                     | string (label/description) or number (result) |
| Event-queue subscription predicate    | `SohlEventQueue` (`fire`)                                          | `predicate`                      | `name`, `subscriberUuid`, `payload`, `worldTime`, `dt`, `combat`, `combatant`, `round`, `turn`, `skipped`, `sceneUuid`, `darkness`, `priorDarkness`, `regionUuid`, `regionId`, `regionName`, `tokenUuid`, `actorUuid` _(open)_ | boolean                                       |
| Affliction — outcome trauma           | `AfflictionLogic` (`contractOutcomeTraumas`)                       | `outcomeTrauma`                  | _none_                                                                                                                                                                                                                         | string or string[] (trauma shortcodes)        |

Scopes marked _(open)_ carry a context that varies at runtime, so an
identifier beyond those listed is permitted there; everywhere else, an
identifier the scope does not declare is rejected when the expression is
compiled.

#### What each binding means

**`action.visible`** — Gates whether an action is offered on a context menu. Composed with the script-permission check and the action's own `trigger`.

- `element` — The DOM element the context menu was opened on (the row or sheet control).
- `itemLogic` — Logic layer of the row's item, or `undefined` when the menu is not on an item row.
- `actorLogic` — Logic layer of the surrounding actor, or `undefined` when there is none.
- `isGM` — Whether the current user is a GM.

**`action.trigger`** — Gates whether an action may run at all. Evaluated programmatically, not from a DOM event.

- `itemLogic` — Logic layer of the owning item, or `undefined` for an actor-owned action.
- `actorLogic` — Logic layer of the owning actor, or `undefined` when there is none.

**`effect.itemTest`** — Selects which of the actor's items of the effect's scope kind the effect applies to. A blank test matches every item of the kind.

- `itemLogic` — Logic layer of the candidate item being tested.

**`effect.strikeModeTest`** — Selects which of an item's strike modes the effect applies to. The same `test` field as item targeting, bound differently because the effect's scope is a strike-mode scope.

- `itemLogic` — Logic layer of the item owning the strike mode.
- `sm` — The candidate strike mode being tested.

**`menu.condition`** — Gates whether a context-menu entry is shown for the element the menu was opened on.

- `target` — The DOM element the menu was triggered on.
- `itemLogic` — Logic layer of the nearest ancestor row's item, or `undefined`.
- `actorLogic` — Logic layer of the nearest ancestor row's actor, or `undefined`.

**`skill.base`** — Computes a skill's Skill Base from the owning actor's attributes, e.g. `sb(attr.str, attr.dex)`.

- `attr` — Attribute scores by shortcode — `attr.str`, `attr['dex']`. An attribute the actor does not have reads as `0`.

**`being.strengthModifier`** — Derives the being's strength modifier from its Strength attribute.

- `str` — The being's effective Strength score.

**`being.encumbrance`** — Derives the being's encumbrance level from the weight it is carrying.

- `wt` — The being's effective carried weight.

**`body.weight`** — Derives a body's weight from its Strength when no explicit base weight is set.

- `str` — The being's effective Strength score.

**`test.resultRow`** — Computes a result-table row's text or Value Diamond count from the settled test result. Evaluated only for the one row a test matches.

- `successLevel` — The test's computed success level.
- `targetValue` — The test's effective target value.
- `lastDigit` — The last digit of the rolled d100.

**`event.predicate`** — Gates whether a due subscription is dispatched when its trigger fires. **Open scope** — the bindings are the trigger context, which varies by trigger (and a world may register custom triggers carrying custom keys), so undeclared identifiers are permitted here. Guard anything trigger-specific with `defined(...)`.

- `name` — The trigger name that fired (e.g. `'turnEnd'`).
- `subscriberUuid` — UUID of the document this subscription belongs to — compare against the trigger to scope it to yourself.
- `payload` — The subscription's own attached data, when it has any.
- `worldTime` — `updateWorldTime`: the new world time, in seconds.
- `dt` — `updateWorldTime`: signed delta from the previous world time.
- `combat` — Combat triggers: the combat document.
- `combatant` — `turnStart` / `turnEnd`: the combatant whose turn it is.
- `round` — Round and turn triggers: the round number.
- `turn` — `turnStart` / `turnEnd`: the turn index.
- `skipped` — Round and turn triggers: whether the change was skipped.
- `sceneUuid` — Region and darkness triggers: UUID of the scene.
- `darkness` — `sceneDarknessChange`: the new darkness level (0–1).
- `priorDarkness` — `sceneDarknessChange`: the previous darkness level, when known.
- `regionUuid` — Region triggers: UUID of the region.
- `regionId` — Region triggers: the region's id.
- `regionName` — Region triggers: the region's display name.
- `tokenUuid` — Region triggers: UUID of the token that acted.
- `actorUuid` — Region triggers: UUID of that token's actor, when it has one.

**`affliction.outcomeTrauma`** — Chooses which trauma(s) an affliction inflicts on contraction. Bound to nothing: the expression may use only literals and helper calls (e.g. a shortcode literal, or a `roll('1d3').total` selection), never a bare identifier.

- _No bindings._ Only literals and helper calls may appear.

<!-- END GENERATED: expression-scopes -->

Only the **root** of a member chain is checked: `itemLogic.masteryLevel.effective`
validates `itemLogic` and leaves the rest to runtime, since the roots are a
knowable list and the object graph behind them is not.

The same `SohlActiveEffect.test` field is bound differently by the effect's
scope: item-kind scopes see the candidate item's logic as `itemLogic`; the
strike-mode scopes (`meleestrikemode` / `missilestrikemode`) additionally bind
the strike mode as `sm`.

### Adding a call site: declaring its scope

This part is for **contributors adding a new place that evaluates an
expression**. Authors writing expressions need only the table above.

Scopes live in `src/entity/expr/expression-scopes.mjs`. It is deliberately plain
ESM — no TypeScript, no `@src` aliases, no Foundry — so the bare-`node`
documentation script and the bundled TS runtime can both import it (the same
arrangement as `@heroiclands/content-build/sohl/default-item-art`). That object
**is** the
registry; there is no separate registration step.

1. **Declare the scope.** Add an entry keyed by a dotted `<subject>.<use>` id.
   `label` / `site` / `field` / `result` / `summary` feed the generated table;
   `bindings` maps each legal identifier to the description shown in the editor's
   autocomplete. Set `open: true` **only** for a context whose keys genuinely
   vary at runtime (today just `event.predicate`, whose bindings depend on the
   trigger and may carry world-registered custom keys) — an open scope permits
   undeclared identifiers, so its declarations are documentation, not a gate.
   An entry with no bindings at all is legitimate: it means only literals and
   helper calls may appear.

2. **Pass it at construction.** `expressionScopes.require(id)` throws on an
   unknown id, so a typo is a startup error rather than an unvalidated
   expression:

   ```ts
   const scope = expressionScopes.require("skill.base");
   const expr = new SafeExpression({ source }, { parent: this, scope });
   ```

3. **Bind through the scope at evaluation.** {@link sohl.entity.expr.ExpressionScope.bind}
   checks that the context you supply matches what the scope promised, then
   returns it unchanged:

   ```ts
   expr.evaluate(scope.bind({ attr: this.buildAttrContext() }));
   ```

   It guards the direction construction cannot: a call site that quietly stops
   binding something, or invents a key nobody declared, warns once per distinct
   shape. It never throws — a binding bug must not take a sheet down with it.

4. **Regenerate the table.** `npm run docs:expr-scopes` rewrites the generated
   region above; `npm run lint` fails when the committed copy is stale.

**If the expression is authored in a data field**, declare the scope on the field
rather than at the call site alone, so the schema itself carries the contract:

```ts
skillBaseFormula: new SafeExpressionField({ scope: "skill.base" });
```

The sheet's `expressionField` partial forwards that id to the editor as
`data-expr-scope`, which is what makes autocomplete and the live
"is this valid?" check agree with the code that will evaluate the value. Nothing
about the binding contract is typed into a template — a hand-written list there
is exactly what drifted before (#1142).

### The standard helpers

Because method calls are banned, **helpers** are how behavior is exposed to an
expression. The built-in `STANDARD_HELPERS` library — seeded into the global
{@link sohl.entity.expr.expressionHelpers} registry — is always present; worlds may layer more on
top via the
[Expression Library](#extending-the-helpers-the-expression-library). All
built-ins are pure and null-tolerant. Arguments and results are the _evaluated_
values from the expression.

**Collections**

| Helper                   | Returns   | Description                                                       |
| ------------------------ | --------- | ----------------------------------------------------------------- |
| `has(value, collection)` | `boolean` | `value` is an element of the array, or an own key of the object.  |
| `len(collection)`        | `number`  | Element/key count of an array, string, or object; `0` if nullish. |
| `empty(collection)`      | `boolean` | `true` when the collection has no elements/keys, or is nullish.   |

**Strings**

| Helper                                | Returns    | Description                                                        |
| ------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `lower(value)`                        | `string`   | The value's string form, lowercased.                               |
| `upper(value)`                        | `string`   | The value's string form, uppercased.                               |
| `capitalize(value)`                   | `string`   | The string with only its first character uppercased.               |
| `str(value)`                          | `string`   | The value's string form (`String(value)`).                         |
| `concat(...values)`                   | `string`   | The string forms of all arguments joined together.                 |
| `startsWith(value, prefix)`           | `boolean`  | Whether the string starts with `prefix`.                           |
| `endsWith(value, suffix)`             | `boolean`  | Whether the string ends with `suffix`.                             |
| `contains(value, sub)`                | `boolean`  | Whether the string contains `sub`.                                 |
| `indexOf(value, search, from?)`       | `number`   | First index of `search`, or `-1`.                                  |
| `charAt(value, index)`                | `string`   | The character at `index`, or `""` if out of range.                 |
| `slice(value, start, end?)`           | `string`   | Substring by index; negative indices count from the end.           |
| `substr(value, start, length?)`       | `string`   | Substring by start index and length.                               |
| `trim(value)`                         | `string`   | The string without leading/trailing whitespace.                    |
| `replace(value, search, replacement)` | `string`   | Every literal occurrence of `search` replaced (never a regex).     |
| `split(value, separator, limit?)`     | `string[]` | The string split on `separator` (empty string → characters).       |
| `join(values, separator)`             | `string`   | An array's elements joined with `separator`; `""` for a non-array. |
| `padStart(value, length, pad?)`       | `string`   | The string padded at the start to `length` (`pad` default `" "`).  |
| `padEnd(value, length, pad?)`         | `string`   | The string padded at the end to `length` (`pad` default `" "`).    |
| `repeat(value, count)`                | `string`   | The string repeated `count` times.                                 |
| `matches(value, pattern, flags?)`     | `boolean`  | Regex test; `pattern`/`flags` are strings. See note.               |

`matches()` throws a `SafeExpressionError` if the pattern is longer than 200
characters, looks ReDoS-prone (nested quantifiers or backreferences), or is not a
valid regular expression. `padStart`, `padEnd`, and `repeat` throw a
`SafeExpressionError` when asked to build a string longer than 100,000 characters
(a memory-exhaustion guard).

**Numbers**

| Helper           | Returns  | Description                    |
| ---------------- | -------- | ------------------------------ |
| `min(...values)` | `number` | Smallest of the given numbers. |
| `max(...values)` | `number` | Largest of the given numbers.  |
| `round(value)`   | `number` | Nearest integer.               |
| `floor(value)`   | `number` | Rounded down to an integer.    |
| `ceil(value)`    | `number` | Rounded up to an integer.      |
| `abs(value)`     | `number` | Absolute value.                |

**Type checks**

| Helper            | Returns   | Description                     |
| ----------------- | --------- | ------------------------------- |
| `isNumber(value)` | `boolean` | A real number (not `NaN`).      |
| `isString(value)` | `boolean` | A string.                       |
| `isArray(value)`  | `boolean` | An array.                       |
| `defined(value)`  | `boolean` | Neither `undefined` nor `null`. |

**Domain**

| Helper                                  | Returns   | Description                                                                         |
| --------------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| `hasUsableSkill(actorLogic, shortcode)` | `boolean` | Whether the actor (given its logic) has a skill with that shortcode (e.g. `"dge"`). |

**Dicts and folding** _(the grammar has no object literals, so a dict is built and
combined through helpers)_

| Helper                      | Returns             | Description                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings(...pairs)`        | `object`            | A dict from alternating key/value arguments — `settings("pel", 15, "subtype:combat", 5)` → `{ pel: 15, "subtype:combat": 5 }`. Throws on an odd argument count.                                                                                                                                                                                                                                    |
| `sum(...values)`            | `number`            | The sum of the given numbers (`0` with none). Also usable as a `merge` fold policy.                                                                                                                                                                                                                                                                                                                |
| `merge(...lists, combiner)` | `object` or `array` | Fold dicts (or arrays) **per key**, applying the named pure combiner to the **present values only** for each key. `combiner` is the **last** argument — a **string** naming a registered pure combiner (`"max"`, `"min"`, `"sum"`). One leading list is the common case (`merge(list, "max")`); several leading lists are concatenated first (`merge(listA, listB, "max")`). Arrays fold by index. |

`merge`'s combiner is _selected_ from the registry by name (never injected code)
and is restricted to the pure combiners `max` / `min` / `sum`.

**Randomness and dice** _(stochastic — unlike every other helper, successive
calls differ)_

| Helper          | Returns  | Description                                                                                                                                                                                                   |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rand()`        | `number` | A random number in `[0, 1)` (like `Math.random`). Combine with `floor`/`min`/`max` to derive integers or ranges.                                                                                              |
| `roll(formula)` | `object` | Rolls a `SimpleRoll` dice formula (e.g. `'2d6+3'`, `'1d100'`) and returns a plain object with `formula`, `result`, `total`, `median`, and the roll's raw fields (`numDice`, `dieFaces`, `modifier`, `rolls`). |

`roll` builds its `SimpleRoll` under the evaluating expression's owning Logic and
returns only that plain result object, so the live roll never escapes the
sandbox. Read `.total` for the rolled outcome; `.median` is the roll's
**average (expected value)** — a fixed, non-random reference that may be
fractional (`roll('1d6').median` is `3.5`), so round it yourself if you need an
integer.

**Time** _(read the live clock — mainly for [event-queue](../reference/event-queue.md)
subscription predicates)_

| Helper            | Returns            | Description                                                                                                                                                                      |
| ----------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `curWorldTime()`  | `number`           | The current world time in seconds (`game.time.worldTime`). Lets a predicate gate on world time from any trigger — e.g. `curWorldTime() > 2342663`.                               |
| `curCombatTime()` | `object` or `null` | The active combat's `{ round, turn }` as plain data, or `null` outside combat. Gate on combat time with member access — `defined(curCombatTime()) && curCombatTime().round > 3`. |

Prefer a subscription's concrete `fireAt` for the common "fire at time T" case (it
stays introspectable — the queue can order it and answer "when is the next?"); use
`curWorldTime()` / `curCombatTime()` in a predicate only when it genuinely needs
cross-axis or non-monotonic conditions.

### Worked examples

**A predicate — target only high-mastery skills.** An active effect with an
item-kind scope binds the candidate item's logic as `itemLogic`; the `test`
matches only skills whose effective mastery level is at least 60:

```text
itemLogic.masteryLevel.effective >= 60
```

**A strike-mode predicate — reach and traits.** A strike-mode-scoped effect
additionally binds the strike mode as `sm`. Match only modes that can reach at
least 5 feet and are not thrown:

```text
sm.reach >= 5 && !has('thrown', sm.traits)
```

**A computed value — encumbrance from carried weight.** A being's movement
profile `encumbrance` field is a SafeExpression bound with `wt` (the carried
weight, as a `ValueModifier` — read its `.effective`). It returns a number that
seeds the encumbrance modifier:

```text
floor(wt.effective / 10)
```

**A context-menu condition — gate on a skill.** A context-menu entry's
`condition` binds `actorLogic`; show a Dodge action only when the actor has the
Dodge skill:

```text
hasUsableSkill(actorLogic, 'dge')
```

**A computed value — a random dice outcome.** `roll` evaluates a dice formula
and exposes its `total` (and `median`) for use in an expression. This yields the
total of a `2d6+1` roll:

```text
roll('2d6+1').total
```

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
{@link sohl.entity.action.SohlAction}). This is how SoHL ships its built-in behaviors; it is code,
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
