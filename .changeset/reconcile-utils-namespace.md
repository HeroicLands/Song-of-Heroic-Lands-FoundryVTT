---
"sohl": minor
---

**`sohl.utils` is now the full utils namespace, matching the docs (#408)**

`sohl.utils` was bound to the `helpers` module alone, so documented accessors like
`sohl.utils.ACTOR_KIND`, `sohl.utils.buildActionScope`, and
`sohl.utils.collection.SohlMap` were `undefined` at runtime even though the
namespace-tree docs render them under `sohl.utils`. It is now bound to the
**`utils` namespace** — the superset barrel that re-exports the helpers and the
constants at its top level and nests `collection` — so runtime and docs agree.

`sohl.utils.romanize()` is unchanged (helpers are re-exported at the top level),
and the curated `sohl.constants` alias is kept as-is
(`sohl.constants.ACTOR_KIND`). The binding follows the same cycle-free pattern as
`sohl.document` / `sohl.core` / `sohl.apps`: a type-only `declare` on `SohlSystem`
plus a runtime assignment in `sohl.ts`. This completes the namespace-tree epic
(#401).
