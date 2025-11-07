/**
 * Biomes represent ecological/climatic zones, usually inferred from terrain.
 */
export interface SceneData {
    encounters: Encounter[];
    terrainToBiomeMap: Record<number, number>; // terrain type ID -> biome type ID
    biomeGrid: Uint8Array; // length = sceneWidth * sceneHeight, biome type IDs
    terrain: Uint8Array; // length = sceneWidth * sceneHeight, terrain type IDs
    biomeEncounters: Record<number, BiomeEncounter[]>; // biome type ID -> possible encounters
}

/**
 * A type representing a function that, given a scene and a grid location,
 * returns a probability that the encounter will occur there.
 *
 * @param scene The scene in which the encounter is being considered.
 * @param grid The grid location being considered.
 * @returns A probability (0..1) that the encounter will occur.
 */
type EncounterProbabilityFn = (scene: Scene, grid: PIXI.Point) => number;

export interface BiomeEncounter {
    id: string;
    name: string;
    description: string;
    cohortId: string;
    maxCount?: number; // maximum number of times this encounter can occur
    numSeen?: number; // number of times this encounter has occurred
    cooldownSeconds?: number; // duration before this encounter can occur again
    lastSeenTime?: number; // timestamp of when this encounter last occurred
    probability?: number | EncounterProbabilityFn;
    enabled?: boolean; // whether this encounter is enabled
}
