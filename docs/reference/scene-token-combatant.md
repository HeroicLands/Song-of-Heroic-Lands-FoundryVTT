# Scene, Token, and Combatant Systems

> **Audience:** Developers working with tactical targeting, initiative, and combatant state.

See also: [SoHL Architecture (Overview)](../concepts/architecture.md), [Combat Resolution Pipeline](./combat-resolution-pipeline.md).

## Token utilities

Primary file: `src/document/token/SohlTokenDocument.ts`

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

- `src/document/combatant/SohlCombatant.ts`

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
- `displayedMedium: MovementMedium` — which medium's computed move is shown in the tracker. Seeded at `_preCreate` time from the actor's lineage `defaultMoveMedium`.

`combatant.computedMove(medium)` returns `effectiveBaseMove(medium) × moveFactor` (or `null` when the actor cannot move in that medium). `combatant.displayedMove` is the convenience getter the combat tracker reads.

Base-move values live on the actor's Lineage item as a `moveBase: { terrestrial, aquatic, aerial, burrowing, astral }` dict. Active Effects target individual entries (e.g. `system.moveBase.terrestrial`) directly. Nothing else — overland speed, weather, terrain, encumbrance — is modeled by the system.

## Calendar

Primary file:

- `src/core/SohlCalendar.ts`

`SohlCalendarData` extends Foundry calendar data with era metadata and formatting helpers:

- world date component conversion,
- absolute timestamp formatting,
- default in-world date formatting,
- relative-time formatting.

## Extension guidance

- Use token helper methods instead of duplicating target/selection/range logic.
- Keep initiative semantics aligned with skill-driven design.
- For overland travel, weather, and terrain effects, leave it to GM narrative — the system does not model these.
- For calendar changes, preserve deterministic data shapes and enum bounds.
