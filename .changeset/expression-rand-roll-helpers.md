---
"sohl": minor
---

**Add `rand()` and `roll(formula)` helpers to the SafeExpression language**

Two new built-in expression helpers bring randomness and dice into data-driven
predicates and computed fields:

- **`rand()`** — a random number in `[0, 1)` (like `Math.random`). Combine with
  `floor` / `min` / `max` to derive integers or ranges.
- **`roll(formula)`** — rolls a `SimpleRoll` dice formula (`'2d6+3'`, `'1d100'`,
  …) and returns a plain object: the roll's `toJSON` augmented with `formula`,
  `result`, `total`, and `median`. Read `.total` (or `.median`) to use the
  outcome further, e.g. `roll('2d6+1').total`.

Both are stochastic (the first non-pure helpers). `roll` builds its `SimpleRoll`
under the evaluating expression's owning Logic (injected as a hidden first
argument for the small set of parent-bound helpers) and returns only the plain
result object, so the live roll — and the parent — never escape the expression
sandbox. No `eval` or data-into-code is introduced; `roll` uses the Foundry-free
`SimpleRoll` primitive.

`SimpleRoll.median` — the roll's average/expected value, newly surfaced through
`roll(...).median` — now returns its **true** (unrounded) value. It was rounding
to an integer, so an odd count of even-faced dice was off by 0.5 (`1d6` reported
`4` instead of `3.5`; `1d20` `11` instead of `10.5`); it now returns the exact
expected value and callers round if they want an integer. This getter had no
production consumers before this change.

The SafeExpression user guide is also expanded into a complete reference — every
built-in helper documented (the string-building helpers were previously missing),
fuller language coverage, and a "developing an expression" section.

Closes #540, #541
