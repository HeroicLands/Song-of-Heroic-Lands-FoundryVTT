---
"sohl": patch
---

**Document the two deliberate result-serialization exceptions**

The `SuccessTestResult.toJSON` contract now documents _why_ two fields are
carried in full rather than reduced to a reference, closing out the
reference-on-wire epic (#202) after its sub-tasks landed:

- `masteryLevelModifier` serializes its complete delta breakdown because the
  receiver renders it verbatim for combat transparency (`mlMod.chatHtml` in the
  standard and opposed result cards); a summarized form would lose the
  breakdown.
- `successStarTable` travels as data (not a table reference) because custom,
  per-result description tables are a supported design goal (#206).

JSDoc-only; no behavior change.

Closes #202
