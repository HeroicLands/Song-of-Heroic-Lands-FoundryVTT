---
"sohl": minor
---

**Foundry-free logic-layer data port**

The logic layer now reaches its owning document through the `SohlLogicData`
data interface (a port implemented by the Foundry data model) instead of the
Foundry document directly, so logic classes can be unit tested without Foundry.
- `SohlLogicData` exposes `id`, `name`, `type`, `uuid`, `isOwner`, `kind`,
  `shortcode`, `actorLogic`, `getFlag`, `setFlag`, and `update`; the actor data
  adds `itemLogics` and `hasPlayerOwner`. `SohlDataModel` implements them by
  delegating to its parent document.
- `SohlLogic` identity getters now read `this.data.*`, and a new `actorLogic`
  getter navigates from any logic to its owning actor's logic.
- **`uuid` is an opaque identity token** — never resolved to a Foundry document
  inside the logic layer. New `logicFromUuid` / `logicFromUuidSync` helpers (in
  `FoundryHelpers`) resolve a uuid back to a `SohlLogic`, keeping the document
  deref inside the shim.
