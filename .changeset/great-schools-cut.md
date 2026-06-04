---
"sohl": minor
---

Automated combat resolution

Implements the **Automated** combat mode described in
`docs/reference/combat-modes.md`: a single attack → defend → resolve → injury
chain walked through chat cards with minimal player input. Builds on the
assisted pipeline and the `CombatResult` resolution engine.

- **Attack initiation** — rolling an attack while a combat is active with a
  single target posts an attack card (range/reach gated, with a keybinding to
  launch an automated attack) instead of a bare success card.
- **Defender response** — the attack card's Block / Counterstrike / Dodge /
  Ignore buttons each roll the defense, assemble the `CombatResult`, and post
  the combined outcome (margin, Tactical Advantages, weapon-break note).
- **Injury** — the combat-result card forwards the full aim payload so the
  wound resolves with no dialog, reusing the existing injury pipeline.
- **Token & combatant resolution** — `BeingLogic.tokens` returns an actor's
  tokens on the world's active scene (the embedded token for a synthetic actor,
  or every linked token for a world actor), and `BeingLogic.combatant` returns
  the actor's combatant in the active encounter (the first `game.combat`
  combatant bound to one of those tokens). These underpin the range/reach
  gating above. Backed by the pure `selectActorTokens` / `selectActorCombatant`
  helpers and non-throwing `getActiveScene()` / `getActiveCombat()` Foundry
  helpers.
- **Available strike modes** — `BeingLogic.availableStrikeModes` lists the
  strike modes a being can currently use: every combat technique's mode plus
  each weapon mode held in at least its required number of limbs. Backed by the
  pure `selectAvailableStrikeModes` helper; feeds the defenses a target may
  offer in an automated exchange.

<!--
Living entry: expand each bullet with concrete specifics as Phases 5–6 land —
e.g. the pure helpers added to combat-actions.ts (canReachTarget,
buildAttackCardData, buildCombatResultInputs), the new combat-result-card.hbs,
the autoCombatAttack keybinding id, and any TEST_TYPE wiring. Keep it accurate
to what actually ships before release consumes it.
-->
