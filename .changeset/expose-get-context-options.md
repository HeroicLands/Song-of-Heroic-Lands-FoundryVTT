---
"sohl": minor
---

Expose `getContextOptions()` as public API; keep the Foundry binding internal

The instance `getContextOptions()` method is now **public** on `SohlActor`,
`SohlItem`, `SohlActiveEffect`, and `SohlLogic`, so external code can enumerate
the actions currently available on a document — e.g. `actor.getContextOptions()`
or `actor.logic.getContextOptions()`. Each returned entry corresponds to an
action whose visibility predicate currently passes; `SCRIPT` actions remain
permission-gated at execution. (This replaces the former internal
`_getContextOptions`; the static factory wrappers stay internal.)

In the same pass, the document classes' Foundry framework hooks and internal
helpers (`_preCreate`, `_onCreate`, `_preUpdate`, `_onCreateDescendantDocuments`,
`_getInitiativeFormula`, the static `_getContextOptions`, …) are marked
`protected`, and the scene-config sheet is marked `@internal`, so the Foundry
persistence/UI binding stays out of the published API. No runtime behavior
changes.
