---
aliases:
    - Safe Expressions
    - SafeExpression
id: Kx9mQ2vT7bR4nP1c
type: doc
package: sohl
category: user-guide
name:
    full: "Safe Expressions"
slug: "safe-expressions"
folder: IgwaG8rAUUO9vrtz
---

# Overview

Several places in SoHL let you type a short **condition** that the system
evaluates while the game runs — for example, "which items does this effect
apply to?" or "when should this action button appear?". Those conditions are
written in a small, deliberately limited language called a **Safe Expression**.

Safe Expressions look like ordinary JavaScript comparisons, but they are
**sandboxed**: they can read the game data you're given, do comparisons and
arithmetic, and call a fixed set of **helper functions** — and nothing else.
They cannot assign values, call methods, reach the network or the page, or run
arbitrary code. That's what makes it safe to store one as data and evaluate it
against live game objects.

An expression is checked the moment you save it. If it uses something the
language doesn't allow, it fails **immediately and visibly** rather than silently
misbehaving later.

# Where you use them

| Where                              | What the expression decides                    | Page                                    |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------- |
| Active Effect **Target Predicate** | Which candidates an effect applies to          | [Effect Targeting](Effect_Targeting.md) |
| Action **Trigger**                 | Whether an action is currently available       | [Actions](Actions.md)                   |
| Action **Visibility**              | Whether an action's button/menu entry is shown | [Actions](Actions.md)                   |
| **Context-menu condition**         | Whether a right-click menu entry is shown      | [Actions](Actions.md)                   |

In every case the expression should evaluate to `true` or `false` (a
_predicate_). An empty condition is treated as "always true".

# Writing an expression

An expression is a single line that produces a value — usually a yes/no answer:

```
level >= 3 && !injured
```

The names in the expression (`level`, `injured`) are **context variables** — the
game data you're handed for that particular use. The next sections cover the
language itself, then the variables available in each place.

# The language

## Values you can write

- **Numbers:** `3`, `10`, `-2`, `1.5`
- **Text (strings):** `"Broadsword"` or `'melee'` — either quote style works.
- **Booleans:** `true`, `false`
- **Lists (arrays):** `["dge", "init", "awa"]`, `[1, 2, 3]`

## Reading data

- A bare name is looked up in the context you're given: `actorLogic`, `sm`,
  `itemLogic`.
- Reach into a value with a **dot** or **brackets**:
    - `itemLogic.name`
    - `itemLogic.data.shortcode`
    - `sm.type`

## Operators

| Kind       | Operators                                                                      |
| ---------- | ------------------------------------------------------------------------------ |
| Compare    | `a === b` (equal), `a !== b` (not equal), `a < b`, `a > b`, `a <= b`, `a >= b` |
| Arithmetic | `+`, `-`, `*`, `/`, `%` (remainder)                                            |
| Logic      | `&&` (and), <code>&#124;&#124;</code> (or), `!` (not)                          |
| Choice     | `condition ? valueIfTrue : valueIfFalse`                                       |

Always use `a === b` / `a !== b` for comparisons (the loose `a == b` / `a != b`
are **not** allowed).

## What is _not_ allowed

The language rejects anything that could change state or run code. These all
fail when you save the expression:

- **Assignment:** `x = 5`
- **Loose equality:** `a == b`, `a != b` — use `a === b` / `a !== b`.
- **Bitwise operators:** `&`, `|`, `^`, `<<`, `>>`
- **`typeof`, `new`, `delete`, `instanceof`**
- **Method calls:** `itemLogic.getName()` — you cannot call a method on a value.
- **Statements, templates, regex literals, semicolons.**

Because you can't call methods, **helper functions** (below) are how you do
anything beyond comparison and arithmetic. Instead of `name.toLowerCase()` you
write `lower(name)`; instead of `list.includes(x)` you write `has(x, list)`.

# Context variables

The variables you can name depend on _where_ the expression runs.

| Where                                | Variables                           | Notes                                                                            |
| ------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------- |
| Effect predicate — item scope        | `itemLogic`                         | The candidate item's logic                                                       |
| Effect predicate — strike-mode scope | `itemLogic`, `sm`                   | Owning item's logic + the strike mode                                            |
| Action trigger                       | `itemLogic`, `actorLogic`           | The owning item's logic and the actor's logic                                    |
| Action visibility                    | `itemLogic`, `element`, `isGM`      | Owning item's logic, the DOM element, and whether the current user is a GM       |
| Context-menu condition               | `itemLogic`, `actorLogic`, `target` | The item/actor logic for the clicked row, and the DOM element the menu opened on |

Some of these variables are resolved from the clicked row and may be **absent**
when the menu wasn't opened on an item/actor row — guard with `defined(...)`
(for example `defined(itemLogic) && itemLogic.name === "Broadsword"`).

Everything you're handed is a **logic** object — the computed view SoHL works
with, rather than the raw Foundry document. That means you read the same
properties everywhere:

- `itemLogic.name`, `itemLogic.data.shortcode`, `itemLogic.data.subType`
- `actorLogic.name`, and the actor's items via helpers like `hasUsableSkill`
- from an item, reach the actor with `itemLogic.actorLogic`
- `sm.name`, `sm.type`, `sm.parent` (the owning item's logic)

Stored data lives under `.data` on a logic object (for example
`itemLogic.data.subType`); computed values are properties of the logic itself.

# Helper functions

Helpers are the only functions you can call. Call them by name with
parentheses: `has("dge", codes)`. The built-in library:

## Collections & membership

| Helper                   | Returns | Description                                                                                          |
| ------------------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `has(value, collection)` | boolean | `true` if `value` is an element of the array `collection`, or an own key of the object `collection`. |
| `len(collection)`        | number  | Number of elements (array/string) or keys (object). `0` for nothing/`null`.                          |
| `empty(collection)`      | boolean | `true` when the collection has no elements/keys (or is `null`).                                      |

```
has(itemLogic.data.shortcode, ["dge", "init", "awa"])   // one of these skills?
has("dge", ["dge", "init"])                             // true — value in the list
len(["a", "b", "c"])                                    // 3
```

## Text

| Helper                            | Returns | Description                                                                                                                          |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `lower(value)`                    | string  | Lowercased text form of `value`.                                                                                                     |
| `upper(value)`                    | string  | Uppercased text form of `value`.                                                                                                     |
| `startsWith(value, prefix)`       | boolean | Whether the text starts with `prefix`.                                                                                               |
| `endsWith(value, suffix)`         | boolean | Whether the text ends with `suffix`.                                                                                                 |
| `contains(value, sub)`            | boolean | Whether the text contains `sub`.                                                                                                     |
| `matches(value, pattern, flags?)` | boolean | Whether `value` matches the regular-expression `pattern` (given as a string). `flags` is optional (e.g. `"i"` for case-insensitive). |

```
startsWith(itemLogic.data.shortcode, "melee-")
matches(itemLogic.name, "^(Sword|Axe|Spear)$")
matches(itemLogic.name, "dagger", "i")                  // case-insensitive
```

> **`matches` patterns are limited on purpose.** A pattern longer than 200
> characters, or one prone to "catastrophic backtracking" (nested quantifiers
> like `(a+)+`, or backreferences), is rejected. Prefer anchored, explicit
> patterns like `^(a|b|c)$`.

## Numbers

| Helper         | Returns | Description                    |
| -------------- | ------- | ------------------------------ |
| `min(a, b, …)` | number  | Smallest of the given numbers. |
| `max(a, b, …)` | number  | Largest of the given numbers.  |
| `round(value)` | number  | Nearest integer.               |
| `floor(value)` | number  | Round **down** to an integer.  |
| `ceil(value)`  | number  | Round **up** to an integer.    |
| `abs(value)`   | number  | Absolute value.                |

```
max(1, floor(7 / 2))                                    // 3
abs(sm.reach.effective - 5) <= 1                        // reach within 1 of 5
```

## Type checks

| Helper            | Returns | Description                                      |
| ----------------- | ------- | ------------------------------------------------ |
| `isNumber(value)` | boolean | `true` if `value` is a real number (not `NaN`).  |
| `isString(value)` | boolean | `true` if `value` is text.                       |
| `isArray(value)`  | boolean | `true` if `value` is a list.                     |
| `defined(value)`  | boolean | `true` if `value` is neither missing nor `null`. |

```
defined(itemLogic.data.subType) && itemLogic.data.subType === "melee"
```

## Game helpers

| Helper                                  | Returns | Description                                                                                                    |
| --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `hasUsableSkill(actorLogic, shortcode)` | boolean | `true` if the actor has a skill with the given shortcode (e.g. `"dge"` for Dodge). Handy in action conditions. |

```
hasUsableSkill(actorLogic, "dge")                       // actor knows Dodge?
hasUsableSkill(itemLogic.actorLogic, "dge")             // from an item context
```

> Worlds can add **custom helpers** on top of these built-ins (see
> [Custom helpers](#custom-helpers)). If your GM has loaded a helper library,
> those extra helper names are available too.

# Examples

**Only the Broadsword's thrust** (effect, `meleestrikemode` scope):

```
itemLogic.name === "Broadsword" && sm.name === "Thrust"
```

**A specific missile strike mode on a named weapon** (effect,
`missilestrikemode` scope):

```
sm.parent.name === "Short Bow" && sm.name === "Quick Shot"
```

**A handful of skills by shortcode** (effect, `skill` scope):

```
has(itemLogic.data.shortcode, ["dge", "init", "awa"])
```

**Show an action only to a GM, and only when the actor knows the skill**
(action visibility):

```
isGM && hasUsableSkill(itemLogic.actorLogic, "dge")
```

**Show a right-click menu entry only on a specific weapon's row**
(context-menu condition):

```
defined(itemLogic) && itemLogic.name === "Broadsword"
```

# Custom helpers

Beyond the built-ins, a GM can load a **helper library** — a JSON file that
defines additional named helpers for the world. Once loaded, those helpers can
be called from any Safe Expression exactly like the built-ins. Invalid or
unsafe entries in the library are skipped (they don't block the rest), and the
library can be reloaded when the file changes.

Authoring a helper library is a GM/world-setup task; as a player you simply have
those helper names available if your world provides them.

# Errors & troubleshooting

- **The expression won't save (shows an error).** It used something outside the
  language — an assignment, `a == b`/`a != b`, a method call, `typeof`, and so
  on. Rework
  it using the allowed operators and helpers above.
- **`matches()` complains about the pattern.** The pattern is too long or uses a
  backtracking-prone construct. Simplify to an anchored, explicit pattern.
- **The condition is never true.** Check the **context variables** — a name that
  isn't provided for that use (e.g. `sm` outside a strike-mode scope) is an
  error, and a typo in a property path just reads as "nothing". Remember stored
  fields live under `.data` on a logic object (`itemLogic.data.subType`).
- **Where do I see the failure?** Parse/validation errors surface where you edit
  the expression; runtime issues are logged to the browser console (F12).

# See also

- [Effect Targeting](Effect_Targeting.md) — Active Effect scopes and predicates.
- [Actions](Actions.md) — action triggers and visibility.
- API reference:
  [`SafeExpression`](https://api.heroiclands.org/latest/classes/API_Reference.SafeExpression.html)
  — the authoritative definition of the grammar and evaluator.
