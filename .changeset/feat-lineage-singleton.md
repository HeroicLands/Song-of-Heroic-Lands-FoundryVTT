---
"sohl": minor
---

**Enforce Lineage as a singleton on an actor**

A being may have at most one lineage (zero — a bodyless spirit — is allowed; more than one never is). This is the hard data-layer guard, covering every path rather than just the sheet UI:

- **Embedding a second lineage** (drag-drop, paste, `createEmbeddedDocuments`) is refused — `LineageDataModel._preCreate` vetoes the creation when the actor already has one.
- **An actor created with multiple lineages** (e.g. duplicating an already-invalid actor, or a bad import) is pruned to the first — `SohlActor._onCreate` removes the extras once the actor and its items exist (the parent's `_preCreate` cannot filter bundled embedded items).

Deleting the lineage is still allowed.
