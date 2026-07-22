---
"sohl": patch
---

**Fix: de-flake e2e specs that place canvas tokens (#611)**

Placing a Token in the headless Cypress browser triggered core's canvas render
chain (`Token.draw` → `TokenRuler.draw` → `GridLayer.addHighlightLayer`, and the
per-tick `_refreshState` refresh) against a viewport that never finishes
initializing. Core then reached for absent canvas infrastructure and threw
unhandled promise rejections (`reading 'addChild'`, `reading 'OBJECTS'`) that
landed on whatever spec was running, failing token-placing specs
(`movement-reach`, `scene-tokens`, the combat specs) nondeterministically. The
aborted draw also left the combatant's actor-derived state (`computedMove`)
reading `null`.

Two harness-only changes (no system code touched):

- **Suppress placeable-`Token` rendering headless.** After login the harness
  no-ops the placeable `Token`'s `draw` and `applyRenderFlags`. This suite never
  asserts on rendered token pixels — it reads the `TokenDocument` and each
  combatant's Foundry-free `.logic` — so skipping the PIXI render removes the
  render race at its source. A narrower, safer guard than allow-listing the generic
  `addChild` / `OBJECTS` messages globally.
- **Place linked tokens.** `placeToken` / `placeAdjacentTokens` now create
  `actorLink: true` tokens, so a combatant's `.actor` is the world actor a spec has
  already prepared — not an unprepared synthetic (delta) actor whose logic was only
  populated as a side-effect of the (racy) canvas draw. `computedMove` / `reach`
  reads are now deterministic and canvas-independent.

Fixes #611
