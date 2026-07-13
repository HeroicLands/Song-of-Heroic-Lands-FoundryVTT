---
aliases: []
id: UtUX2yt4UFN9UWNT
type: doc
package: sohl
category: user-guide
name:
    full: "Effect Targeting"
slug: "effect-targeting"
folder: IgwaG8rAUUO9vrtz
---

# Overview

SoHL extends Foundry's Active Effects so a single effect can reach beyond the
document it lives on. An effect embedded on one item can modify the actor, a
whole class of items, or even individual **strike modes** on weapons — and it
can narrow those targets with a written condition.

Every SoHL Active Effect is described by three things:

| Field                         | Question it answers                    | Where you set it |
| ----------------------------- | -------------------------------------- | ---------------- |
| **Target Scope** (`scope`)    | _What kind of thing_ does this affect? | Details tab      |
| **Target Predicate** (`test`) | _Which specific ones_ of that kind?    | Details tab      |
| **Changes**                   | _What_ does it do to them?             | Changes tab      |

The Target Predicate is a **Safe Expression** — a short, sandboxed condition you
type in. This page explains scopes and gives predicate examples; for the full
predicate language and the list of helper functions, see
[Safe Expressions](Safe_Expressions.md).

# Target Scope

The **Target Scope** dropdown chooses the kind of thing the effect targets.

| Scope                                                | Targets                                                                                   | Uses a predicate? |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------- |
| **This** (`this`)                                    | The document the effect is embedded on (the item, or the actor if it lives on the actor). | No                |
| **Actor** (`actor`)                                  | The owning actor.                                                                         | No                |
| **An item kind** (`skill`, `weapongear`, `trait`, …) | Every item of that kind on the actor.                                                     | Yes               |
| **Melee Strike Mode** (`meleestrikemode`)            | Every melee strike mode on every one of the actor's items.                                | Yes               |
| **Missile Strike Mode** (`missilestrikemode`)        | Every missile strike mode on every one of the actor's items.                              | Yes               |

`This` and `Actor` target exactly one thing, so they ignore the predicate. The
other scopes sweep a whole set of candidates and use the predicate to filter
them — an **empty predicate matches every candidate**.

# Target Predicate

When the scope is an item kind or a strike-mode scope, the **Target Predicate**
decides which candidates are actually affected. It is a
[Safe Expression](Safe_Expressions.md) that must evaluate to `true` for a
candidate to be included.

What the expression can see depends on the scope:

| Scope                                   | Bound variables                                                   |
| --------------------------------------- | ----------------------------------------------------------------- |
| An item kind (`skill`, `weapongear`, …) | `itemLogic` — the candidate item's logic                          |
| `meleestrikemode` / `missilestrikemode` | `itemLogic` — the owning item's logic, and `sm` — the strike mode |

`itemLogic` is the item's _logic_ object (not the raw Foundry document), so you
work with the same computed view the rest of the system uses. The most useful
properties:

- `itemLogic.name` — the item's name (e.g. `"Broadsword"`).
- `itemLogic.data.shortcode` — the item's shortcode (e.g. `"bsw"`).
- `itemLogic.data.subType` — the item's subtype, where it has one.

A strike mode (`sm`) exposes:

- `sm.name` — the strike mode's name (e.g. `"Thrust"`, `"Swing"`).
- `sm.type` — `"melee"` or `"missile"`.
- `sm.parent` — the owning item's logic (the same object as `itemLogic`).

> Because predicates run against the logic layer, you almost never need the raw
> document. Keep expressions in terms of `itemLogic` and `sm`.

# Changes

The **Changes** tab lists what the effect does to each target. Each change has a
**key** (the property to touch), a **mode** (add, multiply, override, …), a
**value**, and a priority.

SoHL keys use a `mod:` prefix and push a modifier onto a _computed_ value rather
than overwriting stored data. For strike-mode scopes the change-key dropdown is
prefilled with the available options, for example:

| Melee strike mode                           | Missile strike mode          |
| ------------------------------------------- | ---------------------------- |
| `mod:attack` — attack roll                  | `mod:attack` — attack roll   |
| `mod:impact` — impact                       | `mod:impact` — impact        |
| `mod:reach` — reach                         | `mod:spread` — spread        |
| `mod:defense.block` — block                 | `mod:baseRange` — base range |
| `mod:defense.counterstrike` — counterstrike | `mod:draw` — draw/reload     |

A strike-mode key applies to _each_ strike mode the predicate matched — so an
effect can raise attack rolls without touching the underlying weapon skill (the
`melee` skill still governs shield blocks, for instance).

# Worked examples

### 1. Buff only the item the effect is on

- **Scope:** `This`
- **Predicate:** _(ignored)_

### 2. Apply an actor-wide condition

- **Scope:** `Actor`
- **Predicate:** _(ignored)_

### 3. Affect a subset of skills

Target the Dodge, Initiative, and Awareness skills by shortcode:

- **Scope:** `Skill`
- **Predicate:** `has(itemLogic.data.shortcode, ["dge", "init", "awa"])`

Or by name pattern:

- **Predicate:** `matches(itemLogic.name, "^(Dodge|Initiative|Awareness)$")`

Leave the predicate empty to affect **every** skill.

### 4. +10 to all melee attack rolls

- **Scope:** `Melee Strike Mode`
- **Predicate:** _(empty — every melee strike mode)_
- **Change:** key `mod:attack`, mode _Add_, value `10`

### 5. +10 attack, but only on a named weapon

- **Scope:** `Melee Strike Mode`
- **Predicate:** `itemLogic.name === "Broadsword"`
- **Change:** key `mod:attack`, mode _Add_, value `10`

### 6. Buff only a specific strike mode

Raise impact only for thrusting attacks, on any weapon:

- **Scope:** `Melee Strike Mode`
- **Predicate:** `sm.name === "Thrust"`
- **Change:** key `mod:impact`, mode _Add_, value `2`

Combine conditions freely —
`itemLogic.name === "Broadsword" && sm.name === "Thrust"` targets the thrust of
one specific weapon.

# Troubleshooting

- **Nothing changes.**
    - Confirm the **Target Scope** matches what you meant to hit.
    - For an item-kind or strike-mode scope, remember an **empty predicate matches
      everything** — if you typed a predicate, check it evaluates `true` for your
      target. A predicate that fails to parse matches **nothing** (and logs a
      warning to the console).
    - Check the change **key** — a `mod:` key must resolve to a real modifier on
      the target.
- **Too many things changed.** Your predicate is too broad. Tighten it: compare
  an exact `itemLogic.data.shortcode`, or use `matches(...)` with anchored `^…$`
  patterns instead of loose substrings.
- **The predicate won't save / shows an error.** It uses syntax the language
  doesn't allow (for example an assignment, a method call, or a loose `a == b`
  comparison). See [Safe Expressions](Safe_Expressions.md) for what's allowed.

# See also

- [Safe Expressions](Safe_Expressions.md) — the predicate language and every
  built-in helper.
- [Actions](Actions.md) — actions use the same Safe Expression language for
  their trigger and visibility conditions.
- API reference:
  [`SafeExpression`](https://api.heroiclands.org/latest/classes/API_Reference.SafeExpression.html).
