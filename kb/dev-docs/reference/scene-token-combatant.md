---
aliases: []
name:
    full: "Scene, Token, and Combatant Systems"
    aliases: []
id: HA1i1joNOvi4nWAU
slug: scene-token-combatant
type: doc
package: sohl
category: dev-docs
folder: null
---

# Scene, Token, and Combatant Systems

> **Audience:** Developers working with tactical targeting, initiative, and combatant state.

See also: [SoHL Architecture (Overview)](../concepts/architecture.md), [Combat Resolution Pipeline](./combat-resolution-pipeline.md).

## Token utilities

Primary file: `src/document/token/foundry/SohlTokenDocument.ts`

`SohlTokenDocument` provides static helpers used throughout action/combat flows:

- `getTargetedTokens(single?)`
- `getSelectedTokens(single?)`
- `rangeToTarget(source, target, gridUnits?)`

Current distance behavior:

- Requires active scene/grid.
- Non-grid-unit distance currently expects feet/ft scene units.
- If scene flag `sohl.isTotm` is set, range resolves to `0` (theater-of-the-mind path).

## Scene state

Primary files:

- `src/document/scene/foundry/SohlScene.ts`
- `src/document/scene/logic/SohlSceneLogic.ts`

A Foundry `Scene` is **not** a typed document — `BaseScene` declares no
`hasTypeData` — so a scene has no `system` and no system DataModel can be
attached to it, whatever `CONFIG.Scene.dataModels` says. Scene-scoped SoHL state
therefore lives in **flags**, under the `sohl` scope.

- `SohlScene.logic` wraps a transient adapter (`createSceneData`) that reads
  those flags live, mirroring `SohlTokenDocument.logic` — the token document is
  likewise untyped.
- The only scene state today is Theatre of the Mind: `scene.logic.isTotm` reads
  the `sohl.isTotm` flag, and `scene.setTotm(value)` writes it. The Scene
  config's **Sohl** tab writes the same flag through its form
  (`name="flags.sohl.isTotm"`).

## Combatant model

Primary file:

- `src/document/combatant/foundry/SohlCombatant.ts`

### Initiative contract

`SohlCombatant._getInitiativeFormula()` returns the actor's `init` skill mastery value (stringified), not a random dice formula.

### Relationship state

Combat relationships are **derived, not stored**. The combatant persists exactly one allegiance fact — its `groupId`, the `CombatantGroup` it belongs to — and everything else is computed on demand from it:

- `isEnemyOf(other)` — true when the two combatants' group ids differ.
- `allies` — the other combatants sharing this one's group.
- `threatenedBy` — the enemies currently menacing this combatant: not defeated, carrying none of `THREAT_NEGATING_STATUSES`, not hidden, and within melee `reach`.

See [Combat Model → Combatant groups](../concepts/combat-model.md#combatant-groups) for what the grouping is for, how membership is seeded, and which of these relations are consumed today.

### Movement state

`SohlCombatant` carries two movement-related system fields, both encounter-scoped (created with the combatant, destroyed when removed):

- `moveFactor: number` — situational multiplier the GM sets to express run/sprint/encumbrance/terrain. Defaults to 1.
- `displayedMedium: MovementMedium` — which movement medium the tracker row reports. Seeded at `_preCreate` time (user-set › the actor's `system.currentMoveMedium` › schema default).

`combatant.computedMove()` returns the actor's tactical move (feet per combat round) for its active movement medium — read from its `feetPerRound`, **scaled by `moveFactor`** — or `null` for a non-mover (movement medium `NONE`). `combatant.displayedMove` is the convenience getter the combat tracker reads. Note that `displayedMedium` is not yet honored by `computedMove`, which always uses the actor's active medium (`currentMoveMedium`) — see [Combat Model → Current gaps and caveats](../concepts/combat-model.md#current-gaps-and-caveats).

Movement is a **universal actor capability** — every actor kind carries, on the base {@link sohl.document.actor.logic.SohlActorBaseLogic} (see also `src/document/actor/logic/movement.ts`), per-medium `movementProfiles` (each with `feetPerRound`, `leaguesPerWatch`, and encumbrance/strength expressions) plus a `currentMoveMedium`. During preparation the actor resolves its active profile — selected by `currentMoveMedium` — into `feetPerRound` / `leaguesPerWatch` `ValueModifier`s that Active Effects can layer on. The default medium is `MOVEMENT_MEDIUM.NONE` (a non-mover, the `NONE_MOVE_PROFILE` constant), never authored per-actor. Nothing else — weather, terrain — is modeled by the system.

## Calendar

The in-world calendar is a separate subsystem — see the dedicated
[Calendar reference](./calendar.md) (`src/core/foundry/SohlCalendar.ts`).

## Extension guidance

- A combatant (with its token and actor) mutates only **itself** — see [Actor state sovereignty](../concepts/architecture.md#actor-state-sovereignty). Cross-actor effects go through a target-addressed chat acknowledge button, never a direct write to another combatant/token/actor.
- Use token helper methods instead of duplicating target/selection/range logic.
- Keep initiative semantics aligned with skill-driven design.
- For overland travel, weather, and terrain effects, leave it to GM narrative — the system does not model these.
- For calendar changes, preserve deterministic data shapes and enum bounds.
