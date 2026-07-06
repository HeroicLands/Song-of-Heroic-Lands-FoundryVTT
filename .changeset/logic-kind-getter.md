---
"sohl": patch
---

**Rename the logic `type` getter to `kind`**

`SohlLogic.type` — the convenience getter returning a logic's actor/item kind
(e.g. `"skill"`, `"being"`) — is renamed to `SohlLogic.kind`, so the logic layer
uses `kind` consistently with `SohlLogicData.kind` and the
`ITEM_KIND` / `ACTOR_KIND` values it returns.

- Callers now read `logic.kind` instead of `logic.type` (updated across the
  combatant, body, mastery-level, and strike-mode logic).
- The Foundry document's own `type` property and `logic.data.type` are
  unaffected — only the logic-layer accessor is renamed. No behavior change.
