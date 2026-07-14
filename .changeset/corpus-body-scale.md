---
"sohl": patch
---

**Per-creature injury scaling via a Corpus `bodyScale` factor**

Resolves #468. Impact is absolute, but an injury _level_ is relative to the body
absorbing it — the same blow is trivial to a cow and grievous to a cat. A new
per-creature `bodyScale` factor scales the injury-level table (not the impact),
so the whole injury pipeline (Shock Index, bleeding, amputation, stumble/fumble,
health) becomes size-correct at the source with no changes to those subsystems.

- **`bodyScaleBase`** — new `CorpusData` field (`NumberField`, `initial: 1.0` =
  baseline human, `min: 0.01`); additive, so existing corpora load human-scaled
  with no migration. Exposed as the floored `bodyScale` ValueModifier on
  `CorpusLogic`, which derives a scaled `injuryTable` in `evaluate` (the master
  `BASE_INJURY_THRESHOLDS` `[1, 5, 10, 15, 20]` is never mutated). A delta on
  `bodyScale` (shrink/enlarge) re-scales the table within the same prepare cycle.
- **`injuryLevelFromImpact`** now takes the creature's thresholds (defaulting to
  the human table, so existing callers are unchanged) and counts how many an
  impact reaches — an impact below the smallest scaled threshold leaves no wound.
  A 2-impact blow is `S2` on a `bodyScale` 0.27 cat but is ignored by a
  `bodyScale` 2.9 cow (which needs ≥ 3 for even `M1`). `resolveInjury` sources the
  table from the struck creature's Corpus via `body.injuryTable`.

Covered by unit tests (`injuryLevelFromImpact` scaled/default, `CorpusLogic`
bodyScale + injuryTable + shrink delta + the `BodyStructure.injuryTable` seam)
and a `injury-body-scale` e2e (the `bodyScaleBase` datamodel field drives the
derived table). Docs updated (`body-structure.md` gains a Body-scale section).
