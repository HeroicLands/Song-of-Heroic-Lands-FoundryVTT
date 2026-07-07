---
"sohl": patch
---

**Fix Foundry V14 item lifecycle: rename `prepareEmbeddedData` → `prepareEmbeddedDocuments`**

`SohlActor` overrode `prepareEmbeddedData()`, the V13 Foundry Actor method name. Foundry V14 renamed this to `prepareEmbeddedDocuments()`, so the SoHL three-phase item lifecycle (initialize → evaluate → finalize) was never called. All computed logic-layer properties on embedded items (`score.effective`, `masteryLevel.effective`, `reach.effective`, etc.) were permanently `undefined` at runtime in V14.

The fix renames the override to `prepareEmbeddedDocuments()` and updates the `super` call accordingly.
