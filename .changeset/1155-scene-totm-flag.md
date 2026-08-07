---
"sohl": patch
---

**Theatre of the Mind is readable again: scene state moves to flags (#1155)**

A scene's Theatre of the Mind toggle could never be observed. A Foundry `Scene` is
not a typed document — it declares no `hasTypeData`, so it has no `system` and no
system DataModel can be attached to it however it is registered. `SohlSceneDataModel`
was therefore never instantiated, `scene.logic` resolved to nothing, and the Theatre
of the Mind short-circuit in the range measurement could never fire: distances were
always measured tactically even on a scene the GM had marked TotM.

- **Scene state lives in flags.** `SohlScene.logic` now wraps a transient adapter
  that reads the `sohl.isTotm` scene flag live, mirroring how the (equally untyped)
  Token document gets its logic. `scene.logic.isTotm` reports the toggle, and
  `scene.setTotm(value)` writes it.
- **The Scene config's Sohl tab writes the flag** (`flags.sohl.isTotm`) instead of
  the unreachable `system.isTotm`, so the checkbox now persists and Theatre of the
  Mind takes effect: token-to-token distance resolves to zero on that scene.
- **Removed `SohlSceneDataModel`** and the `CONFIG.Scene.dataModels` registration —
  Foundry ignores both for a Scene. No migration is needed: `system.isTotm` never
  had anywhere to land, so no world holds that value.
