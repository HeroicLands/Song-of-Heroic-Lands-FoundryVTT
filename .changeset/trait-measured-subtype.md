---
"sohl": minor
---

**Replace the trait `isNumeric` flag with a `Measured` subtype**

A trait's numeric-vs-descriptive nature is no longer a freely-toggleable
`isNumeric` checkbox (a single misclick could strand a configured trait's
`score` / `max` / `valueDesc`). It is now a **deliberate, stable classification**
carried by `subType`: a third value, **`measured`**, alongside `physique` and
`personality`.

- `measured` traits own the numeric `score` (value + optional `max` cap) and the
  `valueDesc` bands; `physique` / `personality` own `textValue`. The trait sheet
  and the Being-sheet trait rows key on `subType`, and the value now reads from a
  single source (`score.value`) — fixing a display bug where numeric traits
  showed `0` (a phantom `masteryLevelBase`).
- **Boundary:** a measured trait is a static quantity — a score with an optional
  cap and labeled bands, **no mastery level and not tested/rolled**. A measured
  value that wants a ~3–18 range, a `score × 5` mastery level, and to be rolled
  against is a **custom Attribute**, not a trait.

_Migration (automatic, lossless):_ trait items with `isNumeric === true` become
`subType: "measured"`; `isNumeric` is dropped. `score` / `valueDesc` were already
stored, so nothing else moves.

Closes #532
