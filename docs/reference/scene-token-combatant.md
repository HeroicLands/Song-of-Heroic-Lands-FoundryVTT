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

## Combatant model

Primary file:

- `src/document/combatant/foundry/SohlCombatant.ts`

### Initiative contract

`SohlCombatant._getInitiativeFormula()` returns the actor's `init` skill mastery value (stringified), not a random dice formula.

### Relationship state

`SohlCombatantData` tracks ally/threatened relationships:

- `allyIds`
- `initAllyIds`
- `threatenedAllyIds`

Helper methods expose and mutate these relations (`addAlly`, `removeAlly`, `addThreatened`, `removeThreatened`, `threatenedBy`).

### Movement state

`SohlCombatant` carries two movement-related system fields, both encounter-scoped (created with the combatant, destroyed when removed):

- `moveFactor: number` — situational multiplier the GM sets to express run/sprint/encumbrance/terrain. Defaults to 1.
- `displayedMedium: MovementMedium` — which medium's computed move is shown in the tracker. Seeded at `_preCreate` time from the actor's `system.currentMoveMedium`.

`combatant.computedMove()` returns the actor's tactical move (feet per combat round) for its active movement medium — read from its `feetPerRound` — or `null` for a non-mover (movement medium `NONE`). `combatant.displayedMove` is the convenience getter the combat tracker reads. (`moveFactor` is stored on the combatant but not yet applied — #252.)

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
