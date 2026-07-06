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
- **World-authored custom helpers.** A new **Expression Helper Library** settings
  menu (GM-only) lets a world import a JSON file mapping helper names to
  `{ args?: string[], body: string }` entries. The bodies are compiled with the
  existing sandboxed `textToFunction` and installed into the registry alongside
  the built-ins; the library persists in a world setting and reloads on world
  start. Invalid entries are skipped and reported rather than blocking the rest.

No behavior change to the expression language itself; existing predicates
(action `trigger`/`visible`, Active Effect `test`, context-menu string
conditions) evaluate exactly as before.
