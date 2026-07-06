---
"sohl": minor
---

**SafeExpression is now a serializable entity with a shared helper registry**

`SafeExpression` moved from `src/utils/` to the Foundry-free domain layer at
`src/entity/expr/`, and its helper library is now a single global registry
rather than a copy carried by every instance.

- **`SafeExpression extends SohlEntity`.** It is constructed as
  `new SafeExpression({ source }, { parent })` and serializes through the curated
  `toJSON` path, persisting only its `source` string; the parsed AST is rebuilt
  on reconstruction and never stored. Every construction site now threads the
  owning document/entity logic as the parent.
- **Global helper registry.** The built-in helpers (`has`, `len`, `matches`,
  `min`, `floor`, `defined`, …) live in the process-wide `expressionHelpers`
  registry and are always available; `SafeExpression` no longer takes a helper
  argument. The registry also accepts helpers installed at runtime, including
  ones compiled from a source body via `textToFunction` — the groundwork for
  world-authored custom helpers.
- **Module split.** `SafeExpressionError` and the helper registry are separate
  modules from `SafeExpression` to keep the layer import-cycle-free.

No behavior change to the expression language itself; existing predicates
(action `trigger`/`visible`, Active Effect `test`, context-menu string
conditions) evaluate exactly as before.
