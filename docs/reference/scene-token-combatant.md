# Scene, Token, and Combatant Systems

> **Audience:** Developers working with tactical targeting, initiative, encounter metadata, or weather/time simulation.

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

## Scene encounter/biome data

Primary files:

- `src/document/scene/SceneData.ts`
- `src/document/scene/Encounter.ts`

Current scene-side structures define:

- terrain-to-biome mappings,
- per-cell biome/terrain grids,
- biome encounter definitions,
- encounter probability and cooldown/count metadata.

These files are currently type/interface oriented and function as data contracts for scene systems.

## Calendar and weather

Primary file:

- `src/core/SohlCalendar.ts`

### Calendar

`SohlCalendarData` extends Foundry calendar data with era metadata and formatting helpers:

- world date component conversion,
- absolute timestamp formatting,
- default in-world date formatting,
- relative-time formatting.

## Extension guidance

- Use token helper methods instead of duplicating target/selection/range logic.
- Keep initiative semantics aligned with skill-driven design.
- Treat scene encounter/biome interfaces as shared contracts across tools/scripts.
- For weather or calendar changes, preserve deterministic data shapes and enum bounds.
