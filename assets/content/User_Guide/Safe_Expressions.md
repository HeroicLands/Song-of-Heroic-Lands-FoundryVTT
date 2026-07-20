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

Several places in SoHL let you type a short **condition** or **formula** that the
system evaluates while the game runs — for example, "which items does this effect
apply to?", "when should this action button appear?", or "how much does this
weigh?". These are written in a small, deliberately limited language called a
**Safe Expression**.

Safe Expressions look like ordinary JavaScript, but they are **sandboxed**: they
can read the game data you're given, do comparisons and arithmetic, and call a
fixed set of **helper functions** — and nothing else. They cannot assign values,
call methods, reach the network or the page, or run arbitrary code. That is what
makes it safe to store one as data and evaluate it against live game objects.

An expression is checked the moment you save it. If it uses something the
language doesn't allow, it fails **immediately and visibly** rather than silently
misbehaving later.

This page is the complete reference: [where you use them](#where-you-use-them),
the [language](#the-language), the [context variables](#context-variables) each
place provides, every [helper function](#helper-functions), a practical guide to
[developing an expression](#developing-an-expression), and
[troubleshooting](#errors--troubleshooting).

# Where you use them

| Where                              | What the expression decides                    | Result | Page                                    |
| ---------------------------------- | ---------------------------------------------- | ------ | --------------------------------------- |
| Active Effect **Target Predicate** | Which candidates an effect applies to          | yes/no | [Effect Targeting](Effect_Targeting.md) |
| Action **Trigger**                 | Whether an action is currently available       | yes/no | [Actions](Actions.md)                   |
| Action **Visibility**              | Whether an action's button/menu entry is shown | yes/no | [Actions](Actions.md)                   |
| **Context-menu condition**         | Whether a right-click menu entry is shown      | yes/no | [Actions](Actions.md)                   |
| **Computed fields** (e.g. weight)  | A number the system feeds into a calculation   | number | this page                               |

Most call sites want a **predicate** — an expression that comes out `true` or
`false`. A few (like a movement profile's weight calculation) want a **number**.
An empty predicate is treated as "always true".

# Writing an expression

An expression is a single line that produces a value — usually a yes/no answer:

```
level >= 3 && !injured
```

The names in the expression (`level`, `injured`) are **context variables** — the
game data you're handed for that particular use. The rest of this page covers the
language itself, the variables available in each place, and the helper functions
you can call.

# The language

## Values you can write

- **Numbers:** `3`, `10`, `-2`, `1.5`. Ordinary decimals and negatives.
- **Text (strings):** `"Broadsword"` or `'melee'` — either quote style works, so
  you can put the other quote inside (`"it's melee"`).
- **Booleans:** `true`, `false`.
- **Nothing:** `null` (a deliberate "no value").
- **Lists (arrays):** `["dge", "init", "awa"]`, `[1, 2, 3]`, `[]` (empty). Lists
  may hold any values, including expressions: `[1 + 1, itemLogic.name]`.

## Reading data

- A bare name is looked up in the context you're given: `actorLogic`, `sm`,
  `itemLogic`. A name that isn't provided is an **error** (not silently empty).
- Reach into a value with a **dot** or **brackets** — both read the same property:
    - `itemLogic.name`
    - `itemLogic.data.shortcode`
    - `tags["ranged"]` (brackets let the key be text or an expression)
- **Chaining** is fine: `sm.parent.name`, `itemLogic.actorLogic.name`.
- **Reading past nothing is safe.** If part of the path is missing or `null`, the
  whole read comes out as "nothing" rather than erroring — so
  `itemLogic.missing.deeper` is simply empty, not a crash. Pair this with
  `defined(...)` when a value is optional.

## Operators

| Kind       | Operators                                                                      |
| ---------- | ------------------------------------------------------------------------------ |
| Compare    | `a === b` (equal), `a !== b` (not equal), `a < b`, `a > b`, `a <= b`, `a >= b` |
| Arithmetic | `+`, `-`, `*`, `/`, `%` (remainder)                                            |
| Logic      | `&&` (and), <code>&#124;&#124;</code> (or), `!` (not)                          |
| Choice     | `condition ? valueIfTrue : valueIfFalse`                                       |

Notes:

- **Precedence is the usual maths/JavaScript order** — `*` and `/` bind tighter
  than `+`/`-`, comparisons tighter than `&&`, and `&&` tighter than `||`. When in
  doubt, add **parentheses**: `(a || b) && c`.
- **`+` also joins text.** `"Str " + score` produces `"Str 12"`. (For anything
  more than a simple join, prefer the [text helpers](#text--building--transforming).)
- **`&&` / `||` short-circuit.** `a && b` only looks at `b` when `a` is true;
  `a || b` only looks at `b` when `a` is false. Use this to guard:
  `defined(itemLogic) && itemLogic.name === "Broadsword"` never touches
  `itemLogic.name` unless `itemLogic` exists.
- **Choose a value with `? :`.** `injured ? 0 : score` yields `0` when `injured`,
  otherwise `score`. Chain them for more branches:
  `hp <= 0 ? "dead" : hp < 5 ? "hurt" : "ok"`.

Always use `a === b` / `a !== b` for equality — the loose `a == b` / `a != b` are
**not** allowed.

## Calling helpers

Because you can't call methods on the values you're handed, **helper functions**
are how you do anything beyond comparison and arithmetic. Call one by name with
parentheses, passing evaluated values:

```
lower(itemLogic.name)                 // instead of itemLogic.name.toLowerCase()
has("dge", codes)                     // instead of codes.includes("dge")
```

Arguments are ordinary expressions, so calls **nest** and combine freely:

```
upper(slice(itemLogic.name, 0, 3))            // first 3 letters, uppercased
has(lower(itemLogic.data.subType), kinds)     // normalize, then test membership
max(1, floor(score / 2))
```

The full list is in [Helper functions](#helper-functions) below.

## What is _not_ allowed

The language rejects anything that could change state or run code. These all fail
**when you save the expression**:

- **Assignment / updates:** `x = 5`, `x += 1`, `x++`.
- **Loose equality:** `a == b`, `a != b` — use `a === b` / `a !== b`.
- **Bitwise operators:** `&`, `|`, `^`, `<<`, `>>`, `~`.
- **`typeof`, `new`, `delete`, `instanceof`.**
- **Method calls:** `itemLogic.getName()` — you cannot call a method on a value
  (only the named helpers are callable).
- **The keys `constructor`, `__proto__`, `prototype`** — reading them is blocked
  (this is what stops an expression from climbing to arbitrary code).
- **Statements, template strings, regex literals, semicolons.**

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

**Stored vs. computed.** Stored fields — the values saved on the sheet — live
under `.data` on a logic object (for example `itemLogic.data.subType`). Computed
values (things the system works out, like an effective mastery level) are
properties of the logic itself (`itemLogic.masteryLevel.effective`). When a read
comes back empty, a wrong `.data` vs. computed choice is the usual cause.

# Helper functions

Helpers are the only functions you can call. They are grouped below by purpose;
each entry gives the call shape and what it returns. Arguments and results are the
_evaluated_ values from your expression. Every built-in is **null-tolerant** (a
missing/`null` argument yields a sensible empty result rather than an error);
the only exceptions are the stochastic `rand`/`roll`, which give a different
answer each time.

> Worlds can add **custom helpers** on top of these built-ins (see
> [Custom helpers](#custom-helpers)). If your GM has loaded a helper library,
> those extra helper names are available too.

## Collections & membership

| Helper                   | Returns | Description                                                                                          |
| ------------------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `has(value, collection)` | boolean | `true` if `value` is an element of the array `collection`, or an own key of the object `collection`. |
| `len(collection)`        | number  | Number of elements (array/string) or keys (object). `0` for nothing/`null`.                          |
| `empty(collection)`      | boolean | `true` when the collection has no elements/keys (or is `null`).                                      |

```
has(itemLogic.data.shortcode, ["dge", "init", "awa"])   // one of these skills?
has("thrown", sm.traits)                                // does the mode have a trait?
len(sm.traits) <= 2                                     // at most two traits
empty(itemLogic.data.notes)                             // notes field blank?
```

## Text — testing

| Helper                            | Returns | Description                                                                                                                          |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `lower(value)`                    | string  | Lowercased text form of `value`.                                                                                                     |
| `upper(value)`                    | string  | Uppercased text form of `value`.                                                                                                     |
| `capitalize(value)`               | string  | Uppercases the first character only, leaving the rest unchanged.                                                                     |
| `startsWith(value, prefix)`       | boolean | Whether the text starts with `prefix`.                                                                                               |
| `endsWith(value, suffix)`         | boolean | Whether the text ends with `suffix`.                                                                                                 |
| `contains(value, sub)`            | boolean | Whether the text contains `sub` anywhere.                                                                                            |
| `matches(value, pattern, flags?)` | boolean | Whether `value` matches the regular-expression `pattern` (given as a string). `flags` is optional (e.g. `"i"` for case-insensitive). |

```
startsWith(itemLogic.data.shortcode, "melee-")
contains(lower(itemLogic.name), "sword")
matches(itemLogic.name, "^(Sword|Axe|Spear)$")
matches(itemLogic.name, "dagger", "i")                  // case-insensitive
```

> **`matches` patterns are limited on purpose.** A pattern longer than 200
> characters, or one prone to "catastrophic backtracking" (nested quantifiers
> like `(a+)+`, or backreferences), is rejected. Prefer anchored, explicit
> patterns like `^(a|b|c)$`. For a simple "contains", reach for `contains`
> instead of a regex.

## Text — building & transforming

These build or reshape text — most useful in **computed string fields** (like
flavor text) rather than predicates.

| Helper                                | Returns | Description                                                                                           |
| ------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `str(value)`                          | string  | The text form of any value (`str(42)` → `"42"`). The companion to the numeric helpers.                |
| `concat(a, b, …)`                     | string  | Joins the text forms of every argument, in order (`concat("n=", 3)` → `"n=3"`). No arguments → `""`.  |
| `slice(value, start, end?)`           | string  | Substring from `start` up to (not including) `end`; negative indices count from the end.              |
| `substr(value, start, length?)`       | string  | Substring of `length` characters starting at `start` (to the end when `length` is omitted).           |
| `split(value, separator, limit?)`     | array   | Splits text into a list on `separator` (an empty separator splits into characters); optional `limit`. |
| `join(values, separator)`             | string  | Joins a list's elements with `separator` (a non-list yields `""`).                                    |
| `trim(value)`                         | string  | Removes leading and trailing whitespace.                                                              |
| `replace(value, search, replacement)` | string  | Replaces **every** occurrence of the literal `search` (never treated as a regex).                     |
| `indexOf(value, search, from?)`       | number  | First index of `search`, or `-1` if absent; optional `from` start index.                              |
| `charAt(value, index)`                | string  | The single character at `index`, or `""` if out of range.                                             |
| `padStart(value, length, pad?)`       | string  | Pads the **start** with `pad` (default a space) until the text reaches `length`.                      |
| `padEnd(value, length, pad?)`         | string  | Pads the **end** with `pad` (default a space) until the text reaches `length`.                        |
| `repeat(value, count)`                | string  | Repeats the text `count` times.                                                                       |

```
concat("You flee ", upper(where), "!")                  // "You flee NORTH!"
capitalize(lower(itemLogic.name))                       // tidy a name's casing
slice(itemLogic.data.shortcode, 0, 3)                   // first 3 characters
join(split("a,b,c", ","), " / ")                        // "a / b / c"
replace(itemLogic.name, " ", "_")                       // spaces to underscores
padStart(str(rank), 3, "0")                             // "007"
```

> **Size guard.** `padStart`, `padEnd`, and `repeat` refuse to build a string
> longer than 100,000 characters (so a runaway `repeat("x", 1e9)` fails cleanly
> instead of exhausting memory).

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
min(score, 18)                                          // cap at 18
abs(sm.reach.effective - 5) <= 1                        // reach within 1 of 5
```

## Randomness & dice

Unlike every other helper, these two give a **different answer each time** — use
them when you want a random value or the outcome of a dice roll.

| Helper          | Returns | Description                                                                                                                                     |
| --------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `rand()`        | number  | A random number from `0` up to (but not including) `1`. Combine with `floor`/`min`/`max` to turn it into a whole number or a range.             |
| `roll(formula)` | object  | Rolls a dice `formula` (e.g. `"2d6+3"`, `"1d100"`) and hands back the result. Read `.total` for the rolled total, or `.median` for the average. |

`roll` returns an **object**, not a bare number — reach into it for the piece you
want:

- `.total` — the rolled total (dice plus modifier)
- `.median` — the average (expected) result of that formula: a fixed reference
  value, not random, and possibly fractional (e.g. `3.5` for `1d6`). Round it
  yourself with `floor`/`round` if you want a whole number.
- `.result` — a readable string of the individual dice, e.g. `"[3, 5] +3"`
- `.formula` — the tidied-up formula, e.g. `"2d6+3"`

```
floor(rand() * 6) + 1                                   // a random 1–6
roll("2d6+1").total                                     // the total of a 2d6+1 roll
roll("1d100").total <= 50                               // did a d100 come up 50 or less?
```

An invalid dice formula (anything that isn't `NdM`, with an optional `+K`/`-K`)
fails when the expression runs, just like a bad `matches` pattern.

## Type checks

| Helper            | Returns | Description                                      |
| ----------------- | ------- | ------------------------------------------------ |
| `isNumber(value)` | boolean | `true` if `value` is a real number (not `NaN`).  |
| `isString(value)` | boolean | `true` if `value` is text.                       |
| `isArray(value)`  | boolean | `true` if `value` is a list.                     |
| `defined(value)`  | boolean | `true` if `value` is neither missing nor `null`. |

```
defined(itemLogic.data.subType) && itemLogic.data.subType === "melee"
isNumber(sm.reach.effective) && sm.reach.effective >= 5
```

## Game helpers

| Helper                                  | Returns | Description                                                                                                    |
| --------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `hasUsableSkill(actorLogic, shortcode)` | boolean | `true` if the actor has a skill with the given shortcode (e.g. `"dge"` for Dodge). Handy in action conditions. |

```
hasUsableSkill(actorLogic, "dge")                       // actor knows Dodge?
hasUsableSkill(itemLogic.actorLogic, "dge")             // from an item context
```

# Developing an expression

A repeatable way to write one that works the first time.

**1. Start from the plain-language question.** Write what you want in words —
"only melee weapons the actor can dodge with" — then translate it clause by
clause.

**2. Know your context variables.** Check the [table above](#context-variables)
for the call site you're editing, and remember every value there is a **logic**
object. If you name something that isn't listed (e.g. `sm` outside a strike-mode
scope), the expression errors.

**3. Get the path right: `.data` vs. computed.** Stored sheet fields are under
`.data` (`itemLogic.data.subType`, `itemLogic.data.shortcode`); computed values
are direct properties (`itemLogic.masteryLevel.effective`,
`sm.reach.effective`). A read that's mysteriously empty is almost always the
wrong one of these two.

**4. Build it up incrementally.** Start with the simplest true/false clause and
save it — because validation runs on save, each addition is checked immediately.
Then combine clauses with `&&` / `||`:

```
itemLogic.data.subType === "melee"                                  // step 1
itemLogic.data.subType === "melee" && hasUsableSkill(actorLogic, "dge")   // step 2
```

**5. Guard values that might be absent.** When a variable can be missing (context
menus especially), lead with `defined(...)` and rely on `&&` short-circuiting:

```
defined(itemLogic) && itemLogic.name === "Broadsword"
```

**6. Normalize before you compare.** Lowercase or trim text so small differences
don't defeat a comparison, and use `has(...)` for "one of several":

```
has(lower(itemLogic.data.subType), ["melee", "thrown"])
```

**7. Keep predicates boolean.** A predicate should come out `true`/`false`. If a
clause yields a value, compare it (`len(sm.traits) > 0`, not bare `sm.traits`).

**Handy recipes**

```
// One of several skills, by shortcode
has(itemLogic.data.shortcode, ["dge", "init", "awa"])

// A named strike mode on a named weapon
sm.parent.name === "Short Bow" && sm.name === "Quick Shot"

// GM-only, and only when the actor has the skill
isGM && hasUsableSkill(itemLogic.actorLogic, "dge")

// A computed weight — carried weight, rounded down to a whole number
floor(wt.effective / 10)

// Flavor text built from data
concat(capitalize(itemLogic.name), " strikes for ", str(roll("1d6").total), "!")
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
  language — an assignment, `a == b` / `a != b`, a method call, `typeof`, a
  blocked property key, and so on. Rework it using the allowed operators and
  helpers above.
- **`matches()` complains about the pattern.** The pattern is too long or uses a
  backtracking-prone construct. Simplify to an anchored, explicit pattern — or use
  `contains` / `startsWith` / `endsWith` for a plain substring test.
- **`roll()` errors.** The formula isn't a valid `NdM` (with an optional `+K` /
  `-K` modifier) — check for stray text or a bad die size.
- **A size-guard error from `repeat` / `padStart` / `padEnd`.** You asked for a
  string over 100,000 characters. Reduce the count/length.
- **The condition is never true.** Check the **context variables** — a name that
  isn't provided for that use is an error, and a wrong property path just reads as
  "nothing". Confirm whether the field is stored (`.data`) or computed, and
  normalize text before comparing.
- **Where do I see the failure?** Parse/validation errors surface where you edit
  the expression; runtime issues are logged to the browser console (F12).

# See also

- [Effect Targeting](Effect_Targeting.md) — Active Effect scopes and predicates.
- [Actions](Actions.md) — action triggers and visibility.
- API reference:
  [`SafeExpression`](https://api.heroiclands.org/latest/classes/API_Reference.SafeExpression.html)
  — the authoritative definition of the grammar and evaluator.
