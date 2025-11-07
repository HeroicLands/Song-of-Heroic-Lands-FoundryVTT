/**
 * Semantics:
 * - Per hex, chanceGrid[idx] says “% chance this Encounter fires on a check”.
 * - Scene-wide: fill the grid with same %.
 * - Localized: paint different values per hex.
 * - Once triggered, you spawn the Cohort into the scene and update encounter state.
 *
 * So: Encounter = when/where you might run into a Cohort, with probability and state.
 *
 * scene.flags.sohl.encounters: Encounter[];
 */
interface Encounter {
    id: string;
    name: string;
    cohortId: string; // Cohort actor/template
    chanceGrid: Uint8Array; // length = sceneWidth * sceneHeight, 0..100 %
    maxTriggers?: number;
    triggersSoFar?: number;
    cooldownHours?: number;
    lastTriggerTime?: number;
    disabled?: boolean;
}
