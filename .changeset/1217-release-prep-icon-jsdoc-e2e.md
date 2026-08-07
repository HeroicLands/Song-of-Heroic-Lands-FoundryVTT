---
"sohl": patch
---

**Release verification fixes: a blank Pall icon, two JSDoc defects, and an order-dependent e2e spec**

Fixes found while running the full format / build / docs / e2e pipeline ahead of the
release.

- **The Trauma "Pall Recovery Test" action rendered a blank icon.** It declared the
  webfont class `ginf-pall`, but no `pall.svg` exists under
  `assets/icons/game-icons/`, so the font build never emitted a codepoint or a
  `.ginf-pall` rule and the class resolved to an empty glyph. It now uses
  `fa-solid fa-heart-circle-check` — the icon its paired hidden `pallRecovery`
  action already carries, matching the convention that every Test/hidden action pair
  shares one icon. It was the only one of the 14 `ginf-*` classes referenced from
  `src/` without a codepoint.
- **Two JSDoc defects.** `BeingSheet._prepareTraumaContext` carried no JSDoc at all,
  unlike every sibling `_prepare*Context` builder; `BeingLogic.applyMoraleResult`
  documented a `@param level` that had been renamed to `category`, publishing an
  undocumented parameter plus a phantom one. `npm run lint:eslint` is now clean.
- **`combat-start-target` is no longer order-dependent.** The spec needs the
  automated-attack turn gate to pass before it can assert on target resolution, but
  that gate reads core's `game.combat`, and neither branch of that getter resolved
  reliably: `ui.combat.viewed` is left stale by the intervening `cleanupWorld()`, and
  the `combats.find(c => c.isActive)` fallback is `scene.isView && active` for a
  scene-bound combat — so it also required the spec's own scene to hold the canvas
  view, which headless it loses as soon as another spec creates a scene. The spec now
  pins `ui.combat.viewed` and creates its combat via a new opt-in
  `cy.createCombatWith(tokens, { sceneless: true })`, which reduces `isActive` to
  plain `active`. Both branches then resolve to the spec's own combat whatever ran
  before. Combatants keep their own `sceneId`, so token resolution is unaffected.
- **`container:<stage> recreate` sweeps a stale Foundry lock.** A container removed
  without a clean shutdown leaves `Config/options.json.lock` behind, and Foundry then
  refuses to boot ("directory is already locked by another process") — turning every
  subsequent `recreate`, and so every `npm run test:e2e`, into a 180-second activation
  timeout. `recreate` now clears the lock after the container is removed, where it can
  only be stale.

Closes #1217
Closes #1218
Closes #1219
