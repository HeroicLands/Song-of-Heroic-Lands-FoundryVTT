/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlLogic } from "@common/SohlLogic";
import type { MasteryLevelLogic } from "@common/item/MasteryLevel";
import type { SohlItem } from "@common/item/SohlItem";
import type { AfflictionLogic } from "@common/item/Affliction";
import type { InjuryLogic } from "@common/item/Injury";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import { Itr } from "@utils/Itr";

export const KIND_KEY: string = "__kind" as const;
export const SCHEMA_VERSION_KEY: string = "__schemaVer" as const;

export const {
    kind: VARIANT,
    values: Variants,
    isValue: isVariant,
    labels: VariantLabels,
} = defineType("SOHL.SohlSystem.Variant", {
    LEGENDARY: "legendary",
    MYSTYISLE: "mystyisle",
});
export type Variant = (typeof VARIANT)[keyof typeof VARIANT];

export const SYMBOL: StrictObject<string> = {
    TIMES: String.fromCharCode(0x00d7),
    GREATERTHANOREQUAL: String.fromCodePoint(0x2265),
    LESSTHANOREQUAL: String.fromCodePoint(0x2264),
    INFINITY: String.fromCodePoint(0x221e),
    STARF: String.fromCharCode(0x2605),
    STAR: String.fromCharCode(0x2606),
};

export const {
    kind: LOGLEVEL,
    values: LogLevels,
    isValue: isLogLevel,
} = defineType("SOHL.Logger.LogLevel", {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
});
export type LogLevel = (typeof LOGLEVEL)[keyof typeof LOGLEVEL];

export const {
    kind: ITEM_KIND,
    values: ItemKinds,
    isValue: isItemKind,
    labels: itemKindLabels,
} = defineType("TYPES.Item", {
    ACTION: "action",
    AFFILIATION: "affiliation",
    AFFLICTION: "affliction",
    ARMORGEAR: "armorgear",
    BODYLOCATION: "bodylocation",
    BODYPART: "bodypart",
    BODYZONE: "bodyzone",
    COMBATTECHNIQUESTRIKEMODE: "combattechniquestrikemode",
    CONCOCTIONGEAR: "concoctiongear",
    CONTAINERGEAR: "containergear",
    DOMAIN: "domain",
    INJURY: "injury",
    MELEEWEAPONSTRIKEMODE: "meleeweaponstrikemode",
    MISCGEAR: "miscgear",
    MISSILEWEAPONSTRIKEMODE: "missileweaponstrikemode",
    MOVEMENTPROFILE: "movementprofile",
    MYSTERY: "mystery",
    MYSTICALABILITY: "mysticalability",
    MYSTICALDEVICE: "mysticaldevice",
    PHILOSOPHY: "philosophy",
    PROJECTILEGEAR: "projectilegear",
    PROTECTION: "protection",
    SKILL: "skill",
    TRAIT: "trait",
    WEAPONGEAR: "weapongear",
});
export type ItemKind = (typeof ITEM_KIND)[keyof typeof ITEM_KIND];

export const {
    kind: COMBATANT_KIND,
    values: CombatantKinds,
    isValue: isCombatantKind,
    labels: combatantKindLabels,
} = defineType("TYPES.Combatant", {
    COMBATANTDATA: "sohlcombatantdata",
});
export type CombatantKind =
    (typeof COMBATANT_KIND)[keyof typeof COMBATANT_KIND];

export const {
    kind: EFFECT_KIND,
    values: EffectKinds,
    isValue: isEffectKind,
    labels: effectKindLabels,
} = defineType("TYPES.Effect", {
    EFFECTDATA: "sohleffectdata",
});
export type EffectKind = (typeof EFFECT_KIND)[keyof typeof EFFECT_KIND];

export const {
    kind: ACTOR_KIND,
    values: ActorKinds,
    isValue: isActorKind,
    labels: actorKindLabels,
} = defineType("TYPES.Actor", {
    BEING: "being",
    ASSEMBLY: "assembly",
    COHORT: "cohort",
    STRUCTURE: "structure",
    VEHICLE: "vehicle",
});
export type ActorKind = (typeof ACTOR_KIND)[keyof typeof ACTOR_KIND];

export const {
    kind: ITEM_METADATA,
    values: ItemMetadatas,
    isValue: isItemMetadata,
    labels: itemMetadataLabels,
} = defineType(`SOHL.Item.METADATA`, {
    [ITEM_KIND.ACTION]: {
        IconCssClass: "fas fa-gears",
        Image: "systems/sohl/assets/icons/gears.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.AFFILIATION]: {
        IconCssClass: "fa-duotone fa-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.AFFLICTION]: {
        IconCssClass: "fas fa-face-nauseated",
        Image: "systems/sohl/assets/icons/sick.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.ARMORGEAR]: {
        IconCssClass: "fas fa-shield-halved",
        Image: "systems/sohl/assets/icons/armor.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.BODYLOCATION]: {
        IconCssClass: "fas fa-hand",
        Image: "systems/sohl/assets/icons/hand.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.BODYPART]: {
        IconCssClass: "fa-duotone fa-skeleton-ribs",
        Image: "systems/sohl/assets/icons/ribcage.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.BODYZONE]: {
        IconCssClass: "fa-duotone fa-person",
        Image: "systems/sohl/assets/icons/person.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: {
        IconCssClass: "fas fa-hand-fist",
        Image: "systems/sohl/assets/icons/punch.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.CONCOCTIONGEAR]: {
        IconCssClass: "fas fa-flask-round-potion",
        Image: "systems/sohl/assets/icons/potion.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.CONTAINERGEAR]: {
        IconCssClass: "fas fa-sack",
        Image: "systems/sohl/assets/icons/sack.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.DOMAIN]: {
        IconCssClass: "fas fa-sparkle",
        Image: "systems/sohl/assets/icons/sparkle.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.INJURY]: {
        IconCssClass: "fas fa-user-injured",
        Image: "systems/sohl/assets/icons/injury.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: {
        IconCssClass: "fas fa-sword",
        Image: "systems/sohl/assets/icons/sword.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MISCGEAR]: {
        IconCssClass: "fas fa-ball-pile",
        Image: "systems/sohl/assets/icons/miscgear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: {
        IconCssClass: "fas fa-bow-arrow",
        Image: "systems/sohl/assets/icons/longbow.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MOVEMENTPROFILE]: {
        IconCssClass: "fas fa-walking",
        Image: "systems/sohl/assets/icons/walk.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTERY]: {
        IconCssClass: "fas fa-sparkles",
        Image: "systems/sohl/assets/icons/sparkles.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTICALABILITY]: {
        IconCssClass: "fas fa-hand-sparkles",
        Image: "systems/sohl/assets/icons/hand-sparkles.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTICALDEVICE]: {
        IconCssClass: "fas fa-wand-sparkles",
        Image: "systems/sohl/assets/icons/magic-wand.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PHILOSOPHY]: {
        IconCssClass: "fas fa-arrow",
        Image: "systems/sohl/assets/icons/sparkle.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PROJECTILEGEAR]: {
        IconCssClass: "fas fa-bow-arrow",
        Image: "systems/sohl/assets/icons/arrow.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PROTECTION]: {
        IconCssClass: "fas fa-shield",
        Image: "systems/sohl/assets/icons/shield.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.SKILL]: {
        IconCssClass: "fas fa-head-side-gear",
        Image: "systems/sohl/assets/icons/head-gear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.TRAIT]: {
        IconCssClass: "fas fa-user-gear",
        Image: "systems/sohl/assets/icons/user-gear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.WEAPONGEAR]: {
        IconCssClass: "fas fa-sword",
        Image: "systems/sohl/assets/icons/sword.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
});
export type ItemMetadata = (typeof ITEM_METADATA)[keyof typeof ITEM_METADATA];

// Compile-time check: ensure every ItemKind has an ITEM_METADATA entry.
// If there is an ItemKind without metadata, this line will fail to type-check.
const _ensureItemMetadataCoversAllKinds: Record<ItemKind, unknown> =
    ITEM_METADATA;

export const {
    kind: ACTOR_METADATA,
    values: ActorMetadatas,
    isValue: isActorMetadata,
    labels: actorMetadataLabels,
} = defineType(`SOHL.Actor.METADATA`, {
    [ACTOR_KIND.BEING]: {
        IconCssClass: "fas fa-person",
        Image: "icons/svg/item-bag.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.ASSEMBLY]: {
        IconCssClass: "fas fa-layer-group",
        Image: "systems/sohl/assets/icons/stack.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.COHORT]: {
        IconCssClass: "fas fa-layer-group",
        Image: "systems/sohl/assets/icons/stack.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.STRUCTURE]: {
        IconCssClass: "fas fa-home",
        Image: "systems/sohl/assets/icons/home.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.VEHICLE]: {
        IconCssClass: "fas fa-wagon-covered",
        Image: "systems/sohl/assets/icons/wagon.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
});
export type ActorMetadata =
    (typeof ACTOR_METADATA)[keyof typeof ACTOR_METADATA];

export const {
    kind: EFFECT_METADATA,
    values: EffectMetadatas,
    isValue: isEffectMetadata,
    labels: effectMetadataLabels,
} = defineType(`SOHL.Effect.METADATA`, {
    [EFFECT_KIND.EFFECTDATA]: {
        IconCssClass: "fa-duotone fa-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
        Sheet: "systems/sohl/templates/effect/effect-sheet.hbs",
    },
});
export type EffectMetadata =
    (typeof EFFECT_METADATA)[keyof typeof EFFECT_METADATA];

export const EFFECT_IMAGE: string =
    "systems/sohl/assets/icons/people-group.svg";

export const {
    kind: REACTION,
    values: Reactions,
    isValue: isReaction,
    labels: reactionLabels,
} = defineType("SOHL.SohlActor.REACTION", {
    HOSTILE: "hostile",
    FRIENDLY: "friendly",
    NEUTRAL: "neutral",
});

export const {
    kind: TERRAIN,
    values: Terrains,
    isValue: isTerrain,
    labels: terrainLabels,
} = defineType("SOHL.Terrain", {
    FLAT_PAVED_ROAD: 1,
    FLAT_UNPAVED_ROAD: 2,
    FLAT_RURAL_TRACK: 3,
    FLAT_WILDERNESS_TRAIL: 4,
    FLAT_CROPLAND_GRASSLAND: 5,
    FLAT_MIXED_WOODLAND: 6,
    FLAT_HEATH_MOOR: 7,
    FLAT_NEEDLELEAF_FOREST: 8,
    FLAT_MIXED_FOREST: 9,
    WETLANDS: 10,
    MARSH_SWAMP: 11,
    BOG_FEN: 12,
    TUNDRA: 13,
    PERMAFROST_SCRUB: 14,
    DESERT_DUNES: 15,
    DESERT_SCRUB: 16,
    DESERT_ROCK: 17,
    DESERT_SALT_FLAT: 18,
    SAVANNA: 19,
    STEPPE: 20,
    FOREST_TROPICAL_RAINFOREST: 21,
    FOREST_TROPICAL_SEASONAL: 22,
    FOREST_MANGROVE: 23,
    COAST_SANDY_BEACH: 24,
    COAST_ROCKY_SHORE: 25,
    ICE_FLAT: 26,
    ICE_BROKEN: 27,
    ICE_CREVASSE_FIELD: 28,
    ICE_SNOW_ROCK_FIELD: 29,
    HILLY_PAVED_ROAD: 30,
    HILLY_UNPAVED_ROAD: 31,
    HILLY_RURAL_TRACK: 32,
    HILLY_WILDERNESS_TRAIL: 33,
    HILLY_CROPLAND_GRASSLAND: 34,
    HILLY_MIXED_WOODLAND: 35,
    HILLY_HEATH_MOOR: 36,
    HILLY_NEEDLELEAF_FOREST: 37,
    HILLY_MIXED_FOREST: 38,
    HILLY_SAVANNA: 39,
    HILLY_DESERT_SCRUB: 40,
    HILLY_TUNDRA: 41,
    MOUNTAIN_PAVED_ROAD: 42,
    MOUNTAIN_UNPAVED_ROAD: 43,
    MOUNTAIN_RURAL_TRACK: 44,
    MOUNTAIN_WILDERNESS_TRAIL: 45,
    MOUNTAIN_COLD_WOODLAND: 46,
    MOUNTAIN_ALPINE_VEGETATION: 47,
    MOUNTAIN_NEEDLELEAF_FOREST: 48,
    MOUNTAIN_MIXED_FOREST: 49,
    MOUNTAIN_ICE_SNOW_ROCK_FIELD: 50,
    MOUNTAIN_DESERT_SCRUB: 51,
    MOUNTAIN_TROPICAL_FOREST: 52,
    MOUNTAIN_TUNDRA: 53,
    WATER: 54,
});
export type Terrain = (typeof TERRAIN)[keyof typeof TERRAIN];

export const {
    kind: MOVEMENT_MODE,
    values: MovementModes,
    isValue: isMovementMode,
    labels: movementModeLabels,
} = defineType("SOHL.MovementMode", {
    LAND: "land",
    SWIMMING: "swimming",
    FLYING: "flying",
});
export type MovementMode = (typeof MOVEMENT_MODE)[keyof typeof MOVEMENT_MODE];

export const {
    kind: BIOME,
    values: Biomes,
    isValue: isBiome,
    labels: biomeLabels,
} = defineType("SOHL.Biome", {
    ARCTIC_ICEFIELD: 1,
    ARCTIC_TUNDRA: 2,
    SUBARCTIC_TAIGA: 3,
    MOUNTAIN_ALPINE: 4,
    PERMAFROST_SCRUB: 5,
    TEMPERATE_GRASSLAND: 6,
    TEMPERATE_FOREST: 7,
    TEMPERATE_MIXED_WOODLAND: 8,
    TEMPERATE_HEATH_MOOR: 9,
    TEMPERATE_WETLANDS: 10,
    TEMPERATE_MARSH: 11,
    TEMPERATE_HILLS: 12,
    TEMPERATE_MOUNTAINS: 13,
    DESERT_DUNES: 14,
    DESERT_ROCK: 15,
    DESERT_SALT_FLAT: 16,
    DESERT_SCRUB: 17,
    STEPPE: 18,
    SAVANNA: 19,
    TROPICAL_RAINFOREST: 20,
    TROPICAL_SEASONAL_FOREST: 21,
    TROPICAL_SAVANNA: 22,
    TROPICAL_MANGROVE: 23,
    COASTAL_BEACH: 24,
    COASTAL_ROCKY_SHORE: 25,
    COASTAL_WETLAND: 26,
    CORAL_ISLAND: 27,
    OPEN_SEA: 28,
});
export type Biome = (typeof BIOME)[keyof typeof BIOME];
export const DEFAULT_BIOME_SPEED_FACTORS = [
    0.5, // ARCTIC_ICEFIELD
    0.7, // ARCTIC_TUNDRA
    0.8, // SUBARCTIC_TAIGA
    0.6, // MOUNTAIN_ALPINE
    0.75, // PERMAFROST_SCRUB
    1.0, // TEMPERATE_GRASSLAND
    0.9, // TEMPERATE_FOREST
    0.9, // TEMPERATE_MIXED_WOODLAND
    0.85, // TEMPERATE_HEATH_MOOR
    0.7, // TEMPERATE_WETLANDS
    0.6, // TEMPERATE_MARSH
    0.9, // TEMPERATE_HILLS
    0.8, // TEMPERATE_MOUNTAINS
    0.7, // DESERT_DUNES
    0.8, // DESERT_ROCK
    0.9, // DESERT_SALT_FLAT
    0.85, // DESERT_SCRUB
    1.0, // STEPPE
    0.95, // SAVANNA
    0.7, // TROPICAL_RAINFOREST
    0.8, // TROPICAL_SEASONAL_FOREST
    0.9, // TROPICAL_SAVANNA
    0.6, // TROPICAL_MANGROVE
    0.8, // COASTAL_BEACH
    0.7, // COASTAL_ROCKY_SHORE
    0.6, // COASTAL_WETLAND
    0.8, // CORAL_ISLAND
    1.0, // OPEN_SEA
];

export const {
    kind: SEASON,
    values: Seasons,
    isValue: isSeason,
    labels: seasonLabels,
} = defineType("SOHL.Season", {
    SPRING: "spring",
    SUMMER: "summer",
    AUTUMN: "autumn",
    WINTER: "winter",
});
export type Season = (typeof SEASON)[keyof typeof SEASON];

export interface WeatherState {
    sky: number; // WEATHER_SKY
    temp: number; // WEATHER_TEMP
    windDir: number; // WEATHER_WIND_DIR
    windForce: number; // WEATHER_WIND_FORCE
    precip: number; // WEATHER_PRECIP
}

export interface WeatherContext {
    latDeg: number;
    season: Season;
}

export interface BiomeWeatherProfile {
    tempOffset?: number; // shifts WEATHER_TEMP up/down
    precipOffset?: number; // shifts WEATHER_PRECIP up/down
    cloudinessOffset?: number; // shifts WEATHER_SKY up/down
    storminessOffset?: number; // shifts typical windForce up/down

    /**
     * Peak-to-mean diurnal temperature amplitude in TEMP bands.
     * Example: 2–3 for a sandy desert, 0.5–1 for a humid jungle.
     */
    diurnalTempAmplitude?: number;

    /**
     * Extra cooling applied at night (in TEMP bands).
     * Use this to exaggerate cold nights in e.g. deserts.
     */
    diurnalNightBias?: number;
}

export const DEFAULT_BIOME_WEATHER_PROFILE: Record<
    number,
    BiomeWeatherProfile
> = {
    // arctic / polar
    [BIOME.ARCTIC_ICEFIELD]: {
        tempOffset: -2,
        cloudinessOffset: 0,
        precipOffset: -1,
        // Cold, high albedo, often long nights → small but real diurnal swing,
        // with some pre-dawn cooling when there is an actual night.
        diurnalTempAmplitude: 0.8,
        diurnalNightBias: 0.5,
    },
    [BIOME.ARCTIC_TUNDRA]: {
        tempOffset: -2,
        cloudinessOffset: 0,
        // Less ice cover than icefields, a bit more exposed ground → slightly
        // larger diurnal swing than pure ice.
        diurnalTempAmplitude: 1.5,
        diurnalNightBias: 0.7,
    },

    // subarctic / taiga
    [BIOME.SUBARCTIC_TAIGA]: {
        tempOffset: -1,
        cloudinessOffset: +1,
        precipOffset: +1,
        // Forest canopy damps extremes; still noticeable night-time cooling.
        diurnalTempAmplitude: 1.0,
        diurnalNightBias: 0.5,
    },

    // mountains & alpine
    [BIOME.MOUNTAIN_ALPINE]: {
        tempOffset: -1,
        storminessOffset: +1,
        // High, thin air → decent swings; rocks and sparse vegetation lose heat at night.
        diurnalTempAmplitude: 1.5,
        diurnalNightBias: 0.8,
    },

    // deserts (hot & dry)
    [BIOME.DESERT_DUNES]: {
        tempOffset: +1,
        precipOffset: -3,
        cloudinessOffset: -2,
        // Classic sandy desert: huge day/night spread, brutal pre-dawn cold.
        diurnalTempAmplitude: 3.0,
        diurnalNightBias: 1.5,
    },
    [BIOME.DESERT_ROCK]: {
        tempOffset: +1,
        precipOffset: -2,
        cloudinessOffset: -1,
        // Rock and broken terrain: big swings, slightly less than dunes.
        diurnalTempAmplitude: 2.5,
        diurnalNightBias: 1.0,
    },
    [BIOME.DESERT_SALT_FLAT]: {
        tempOffset: +1,
        precipOffset: -2,
        cloudinessOffset: -1,
        // Very exposed, very dry; strong radiative cooling at night.
        diurnalTempAmplitude: 3.0,
        diurnalNightBias: 1.5,
    },
    [BIOME.DESERT_SCRUB]: {
        tempOffset: +1,
        precipOffset: -1,
        // Semi-arid; still big swings, but moderated by vegetation.
        diurnalTempAmplitude: 2.0,
        diurnalNightBias: 1.0,
    },

    // grasslands / steppe / savanna
    [BIOME.STEPPE]: {
        tempOffset: 0,
        precipOffset: -1,
        // Open, often dry grassland → good swings, cool pre-dawn.
        diurnalTempAmplitude: 2.0,
        diurnalNightBias: 0.7,
    },
    [BIOME.SAVANNA]: {
        tempOffset: +1,
        precipOffset: 0,
        // Warm, somewhat humid, open terrain; strong but not desert-level swings.
        diurnalTempAmplitude: 2.5,
        diurnalNightBias: 0.8,
    },

    // wet / tropical
    [BIOME.TROPICAL_RAINFOREST]: {
        tempOffset: 0,
        precipOffset: +2,
        cloudinessOffset: +2,
        storminessOffset: +1,
        // Hot, humid, very cloudy: small diurnal swings, nights still warm.
        diurnalTempAmplitude: 1.0,
        diurnalNightBias: 0.2,
    },
    [BIOME.TROPICAL_SEASONAL_FOREST]: {
        tempOffset: 0,
        precipOffset: +1,
        cloudinessOffset: +1,
        // Transitional between rainforest and savanna; moderate swings.
        diurnalTempAmplitude: 1.5,
        diurnalNightBias: 0.4,
    },

    // coastal
    [BIOME.COASTAL_BEACH]: {
        storminessOffset: +1,
        // Water moderates temps → modest swing, mild pre-dawn cooling.
        diurnalTempAmplitude: 1.0,
        diurnalNightBias: 0.3,
    },
    [BIOME.COASTAL_ROCKY_SHORE]: {
        storminessOffset: +1,
        cloudinessOffset: +1,
        // Similar to beach, maybe slightly more exposed, but ocean still damps swings.
        diurnalTempAmplitude: 1.0,
        diurnalNightBias: 0.3,
    },
    [BIOME.COASTAL_WETLAND]: {
        precipOffset: +1,
        cloudinessOffset: +1,
        // Humid, often cloudy → diurnal swings modest, closer to swamp.
        diurnalTempAmplitude: 1.0,
        diurnalNightBias: 0.3,
    },

    // open sea / islands
    [BIOME.CORAL_ISLAND]: {
        precipOffset: +1,
        storminessOffset: +1,
        // Small landmass in warm sea: a bit more swing than open ocean, still muted.
        diurnalTempAmplitude: 1.2,
        diurnalNightBias: 0.4,
    },
    [BIOME.OPEN_SEA]: {
        precipOffset: +1,
        storminessOffset: +2,
        // Huge thermal inertia: tiny diurnal temp changes, slight pre-dawn bias.
        diurnalTempAmplitude: 0.5,
        diurnalNightBias: 0.2,
    },
};

export const {
    kind: WEATHER,
    values: Weathers,
    isValue: isWeather,
    labels: weatherLabels,
} = defineType("SOHL.Weather", {
    CLEAR: "clear",
    PARTLY_CLOUDY: "partly_cloudy",
    OVERCAST: "overcast",

    LIGHT_RAIN: "light_rain",
    MODERATE_RAIN: "moderate_rain",
    HEAVY_RAIN: "heavy_rain",
    THUNDERSTORM: "thunderstorm",

    LIGHT_SNOW: "light_snow",
    MODERATE_SNOW: "moderate_snow",
    HEAVY_SNOW: "heavy_snow",
    BLIZZARD: "blizzard",

    FOG_LIGHT: "fog_light",
    FOG_DENSE: "fog_dense",
    MIST: "mist",

    WIND_BREEZE: "wind_breeze",
    WIND_STRONG: "wind_strong",
    WIND_GALE: "wind_gale",
    WIND_STORM: "wind_storm",

    HAIL: "hail",
    SLEET: "sleet",
    DUST_STORM: "dust_storm",
    SAND_STORM: "sand_storm",

    EXTREME_HEAT: "extreme_heat",
    EXTREME_COLD: "extreme_cold",
});
export type Weather = (typeof WEATHER)[keyof typeof WEATHER];

export const {
    kind: WEATHER_SKY,
    values: WeatherSkies,
    isValue: isWeatherSky,
    labels: weatherSkyLabels,
} = defineType("SOHL.WeatherSky", {
    CLEAR: 0,
    MOSTLY_CLEAR: 1,
    PARTLY_CLOUDY: 2,
    MOSTLY_CLOUDY: 3,
    OVERCAST: 4,
    FOGGY: 5,
    HAZY: 6,
    OBSCURED: 7,
});

export const {
    kind: WEATHER_TEMP,
    values: WeatherTemps,
    isValue: isWeatherTemp,
    labels: weatherTempLabels,
} = defineType("SOHL.WeatherTemp", {
    FRIGID: 0, // <= -15 degrees
    FREEZING: 1, // <= 0 degrees
    COLD: 2, // <= 10 degrees
    COOL: 3, // <= 20 degrees
    WARM: 4, // <= 30 degrees
    HOT: 5, // <= 45 degrees
    FURNACE: 6, // > 45 degrees
});

export const {
    kind: WEATHER_WIND_DIR,
    values: WeatherWindDirs,
    isValue: isWeatherWindDir,
    labels: weatherWindDirLabels,
} = defineType("SOHL.WeatherWindDir", {
    NORTH: 0,
    NORTHEAST: 1,
    EAST: 2,
    SOUTHEAST: 3,
    SOUTH: 4,
    SOUTHWEST: 5,
    WEST: 6,
    NORTHWEST: 7,
});

// for this, use Beaufort scale
export const {
    kind: WEATHER_WIND_FORCE,
    values: WeatherWindForces,
    isValue: isWeatherWindForce,
    labels: weatherWindForceLabels,
} = defineType("SOHL.WeatherWindForce", {
    CALM: 0,
    LIGHT_AIR: 1,
    LIGHT_BREEZE: 2,
    GENTLE_BREEZE: 3,
    MODERATE_BREEZE: 4,
    FRESH_BREEZE: 5,
    STRONG_BREEZE: 6,
    NEAR_GALE: 7,
    GALE: 8,
    SEVERE_GALE: 9,
    STORM: 10,
    VIOLENT_STORM: 11,
    HURRICANE: 12,
});

export const {
    kind: WEATHER_PRECIP,
    values: WeatherPrecips,
    isValue: isWeatherPrecip,
    labels: weatherPrecipLabels,
} = defineType("SOHL.WeatherPrecip", {
    NONE: 0, // 0mm per hour; dry
    MIST: 1, // <= 0.25mm per hour
    LIGHT: 2, // <= 2.5mm per hour
    MODERATE: 3, // <= 7.5mm per hour
    HEAVY: 4, // <= 15mm per hour
    TORRENTIAL: 5, // <= 30mm per hour
    EXTREME: 6, // > 30mm per hour
});

export const {
    kind: WEATHER_REGIME,
    values: WeatherRegimes,
    isValue: isWeatherRegime,
    labels: weatherRegimeLabels,
} = defineType("SOHL.WeatherRegime", {
    FAIR: 0,
    UNSETTLED: 1,
    STORMY: 2,
    HEATWAVE: 3,
    COLD_SNAP: 4,
});
export type WeatherRegime =
    (typeof WEATHER_REGIME)[keyof typeof WEATHER_REGIME];

export const {
    kind: COHORT_MEMBER_ROLE,
    values: CohortMemberRoles,
    isValue: isCohortMemberRole,
    labels: cohortMemberRoleLabels,
} = defineType("SOHL.Cohort.MEMBER_ROLE", {
    DIRECTOR: "director",
    MEMBER: "member",
    SUBORDINATE: "subordinate",
});
export type CohortMemberRole =
    (typeof COHORT_MEMBER_ROLE)[keyof typeof COHORT_MEMBER_ROLE];

export const {
    kind: COMBATANT_METADATA,
    values: CombatantMetadatas,
    isValue: isCombatantMetadata,
    labels: combatantMetadataLabels,
} = defineType(`SOHL.Combatant.METADATA`, {
    [COMBATANT_KIND.COMBATANTDATA]: {
        IconCssClass: "fa-duotone fa-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
    },
});
export type CombatantMetadata =
    (typeof COMBATANT_METADATA)[keyof typeof COMBATANT_METADATA];

export const {
    kind: GEAR_KIND,
    values: GearKinds,
    isValue: isGearKind,
    labels: gearKindLabels,
} = defineType(`SOHL.Gear.GEAR_KIND`, {
    ARMOR: "armorgear",
    WEAPON: "weapongear",
    PROJECTILE: "projectilegear",
    CONCOCTION: "concoctiongear",
    CONTAINER: "containergear",
    MISC: "miscgear",
});
export type GearKind = (typeof GEAR_KIND)[keyof typeof GEAR_KIND];

export const {
    kind: VALUE_DELTA_INFO,
    values: ValueDeltaInfos,
    isValue: isValueDeltaInfo,
} = defineType("SOHL.ValueDelta.INFO", {
    DISABLED: "Dsbl",
    NOMSLDEF: "NoMslDef",
    NOMODIFIERNODIE: "NMND",
    NOBLOCK: "NoBlk",
    NOCOUNTERSTRIKE: "NoCX",
    NOCHARGES: "NoChrg",
    NOUSECHARGES: "NoUseChrg",
    NOHEALRATE: "NoHeal",
    NOTNUMNOSCORE: "NoScore",
    NOTNUMNOML: "NoML",
    ARMORPROT: "ArmProt",
    DURABILITY: "Dur",
    FATEBNS: "FateBns",
    ITEMWT: "ItmWt",
    MAGIC: "Magic",
    MAGICMOD: "MagicMod",
    MAXVALUE: "MaxVal",
    MINVALUE: "MinVal",
    MLATTRBOOST: "MlAtrBst",
    MLDSBL: "MLDsbl",
    NOFATE: "NoFateAvail",
    NOTATTRNOML: "NotAttrNoML",
    OFFHAND: "OffHnd",
    OUTNUMBERED: "Outn",
    PLAYER: "SitMod",
    SSMOD: "SSMod",
});
export type ValueDeltaInfo =
    (typeof VALUE_DELTA_INFO)[keyof typeof VALUE_DELTA_INFO];
export const VALUE_DELTA_ID: StrictObject<{ name: string; abbrev: string }> =
    ValueDeltaInfos.reduce(
        (acc, val: string) => {
            const name = `SOHL.ValueDelta.INFO.${val}`;
            acc[val] = { name, abbrev: val };
            return acc;
        },
        {} as StrictObject<{ name: string; abbrev: string }>,
    );

export const {
    kind: VALUE_DELTA_OPERATOR,
    values: ValueDeltaOperators,
    isValue: isValueDeltaOperator,
} = defineType("SOHL.ValueDelta.OPERATOR", {
    CUSTOM: 0,
    MULTIPLY: 1,
    ADD: 2,
    DOWNGRADE: 3,
    UPGRADE: 4,
    OVERRIDE: 5,
});
export type ValueDeltaOperator =
    (typeof VALUE_DELTA_OPERATOR)[keyof typeof VALUE_DELTA_OPERATOR];
export type ValueDeltaValue = string | number;
export function isValueDeltaValue(value: unknown): value is ValueDeltaValue {
    return (
        typeof value === "number" ||
        (typeof value === "string" && ["true", "false"].includes(value))
    );
}

export const {
    kind: TACTICAL_ADVANTAGES,
    values: tacticalAdvantages,
    isValue: isTacticalAdvantage,
} = defineType("SOHL.AttackResult.TacticalAdvantage", {
    IMPACT: "impact",
    PRECISION: "precision",
    ACTION: "action",
    SETUP: "setup",
});
export type TacticalAdvantage =
    (typeof TACTICAL_ADVANTAGES)[keyof typeof TACTICAL_ADVANTAGES];

export type SuccessLevel = number;
export const CRITICAL_FAILURE: SuccessLevel = -1;
export const MARGINAL_FAILURE: SuccessLevel = 0;
export const MARGINAL_SUCCESS: SuccessLevel = 1;
export const CRITICAL_SUCCESS: SuccessLevel = 2;

export const {
    kind: SUCCESS_TEST_RESULT_MISHAP,
    values: SuccessTestResultMishaps,
    isValue: isSuccessTestResultMishap,
} = defineType("SOHL.SuccessTestResult.Mishap", {
    MISFIRE: "misfire",
});
export type SuccessTestResultMishap =
    (typeof SUCCESS_TEST_RESULT_MISHAP)[keyof typeof SUCCESS_TEST_RESULT_MISHAP];

export const {
    kind: ATTACK_MISHAP,
    values: AttackMishaps,
    isValue: isAttackMishap,
} = defineType("SOHL.AttackResult.Mishap", {
    STUMBLE_TEST: "stumbletest",
    STUMBLE: "stumble",
    FUMBLE_TEST: "fumbletest",
    FUMBLE: "fumble",
    WEAPON_BREAK: "weaponBreak",
    MISSILE_MISFIRE: "missileMisfire",
});
export type AttackMishap = (typeof ATTACK_MISHAP)[keyof typeof ATTACK_MISHAP];

export const {
    kind: DEFEND_MISHAP,
    values: DefendResultMishaps,
    isValue: isDefendResultMishap,
} = defineType("SOHL.DefendResult.DefendMishap", {
    STUMBLE_TEST: "stumbletest",
    STUMBLE: "stumble",
    FUMBLE_TEST: "fumbletest",
    FUMBLE: "fumble",
    WEAPON_BREAK: "weaponBreak",
});
export type DefendResultMishap =
    (typeof DEFEND_MISHAP)[keyof typeof DEFEND_MISHAP];

export const {
    kind: SUCCESS_TEST_RESULT_MOVEMENT,
    values: SuccessTestResultMovements,
    isValue: isSuccessTestResultMovement,
} = defineType("SOHL.SuccessTestResult.Movement", {
    STATIONARY: "stationary",
    MOVING: "moving",
});
export type SuccessTestResultMovement =
    (typeof SUCCESS_TEST_RESULT_MOVEMENT)[keyof typeof SUCCESS_TEST_RESULT_MOVEMENT];

export const {
    kind: SOHL_SPEAKER_ROLL_MODE,
    values: SohlSpeakerRollModes,
    isValue: isSohlSpeakerRollMode,
} = defineType("SOHL.SohlSpeaker.ROLL_MODE", {
    SYSTEM: "roll",
    PUBLIC: "publicroll",
    SELF: "selfroll",
    BLIND: "blindroll",
    PRIVATE: "gmroll",
});
export type SohlSpeakerRollMode =
    (typeof SOHL_SPEAKER_ROLL_MODE)[keyof typeof SOHL_SPEAKER_ROLL_MODE];

export const {
    kind: SOHL_SPEAKER_STYLE,
    values: SohlSpeakerStyles,
    isValue: isSohlSpeakerStyle,
} = defineType("SOHL.SohlSpeaker.STYLE", {
    OTHER: 0,
    OUT_OF_CHARACTER: 1,
    IN_CHARACTER: 2,
    EMOTE: 3,
});
export type SohlSpeakerStyle =
    (typeof SOHL_SPEAKER_STYLE)[keyof typeof SOHL_SPEAKER_STYLE];

export const {
    kind: SOHL_SPEAKER_SOUND,
    values: SohlSpeakerSounds,
    isValue: isSohlSpeakerSound,
} = defineType("SOHL.SohlSpeaker.SOUND", {
    DICE: "sounds/dice.wav",
    LOCK: "sounds/lock.wav",
    NOTIFICATION: "sounds/notify.wav",
    COMBAT: "sounds/drums.wav",
});
export type SohlSpeakerSound =
    (typeof SOHL_SPEAKER_SOUND)[keyof typeof SOHL_SPEAKER_SOUND];

export const {
    kind: OPPOSED_TEST_RESULT_TIEBREAK,
    values: OpposedTestResultTieBreaks,
    isValue: isOpposedTestResultTieBreak,
} = defineType("SOHL.OpposedTestResult.TieBreak", {
    SOURCE: 1,
    NONE: 0,
    TARGET: -1,
});
export type OpposedTestResultTieBreak =
    (typeof OPPOSED_TEST_RESULT_TIEBREAK)[keyof typeof OPPOSED_TEST_RESULT_TIEBREAK];

export const {
    kind: IMPACT_ASPECT,
    values: ImpactAspects,
    isValue: isImpactAspect,
} = defineType("SOHL.ImpactModifier.Aspect", {
    BLUNT: "blunt",
    EDGED: "edged",
    PIERCING: "piercing",
    FIRE: "fire",
});
export type ImpactAspect = (typeof IMPACT_ASPECT)[keyof typeof IMPACT_ASPECT];

export const IMPACT_ASPECT_CHAR: Record<ImpactAspect, string> = {
    [IMPACT_ASPECT.BLUNT]: "b",
    [IMPACT_ASPECT.EDGED]: "e",
    [IMPACT_ASPECT.PIERCING]: "p",
    [IMPACT_ASPECT.FIRE]: "f",
};

/**
 * Constants for context menu groups.
 */
export const {
    kind: SOHL_CONTEXT_MENU_SORT_GROUP,
    values: SohlContextMenuSortGroups,
    isValue: isSohlContextMenuSortGroup,
} = defineType("SOHL.ContextMenu.SORT_GROUP", {
    DEFAULT: "default",
    ESSENTIAL: "essential",
    GENERAL: "general",
    HIDDEN: "hidden",
});
export type SohlContextMenuSortGroup =
    (typeof SOHL_CONTEXT_MENU_SORT_GROUP)[keyof typeof SOHL_CONTEXT_MENU_SORT_GROUP];
export function toSohlContextMenuSortGroup(
    group: string,
): SohlContextMenuSortGroup {
    if (isSohlContextMenuSortGroup(group)) return group;
    return SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
}

export const {
    kind: BEING_EFFECT_KEY,
    values: BeingEffectKey,
    isValue: isBeingEffectKey,
    labels: BeingEffectKeyLabels,
} = defineType("SOHL.Being.EffectKey", {
    ENGOPP: {
        name: "mod:system.engagedOpponents",
        abbrev: "EngOpp",
    },
} as PlainObject);
export type SohlBeingEffectKey =
    (typeof BEING_EFFECT_KEY)[keyof typeof BEING_EFFECT_KEY];

export const {
    kind: STRIKE_MODE_EFFECT_KEY,
    values: StrikeModeEffectKey,
    isValue: isStrikeModeEffectKey,
    labels: StrikeModeEffectKeyLabels,
} = defineType("SOHL.StrikeMode.EffectKey", {
    IMPACT: {
        name: "system.logic.impact",
        abbrev: "Imp",
    },
    ATTACK: {
        name: "system.logic.attack",
        abbrev: "Atk",
    },
    BLOCK: {
        name: "system.logic.defense.block",
        abbrev: "Blk",
    },
    COUNTERSTRIKE: {
        name: "system.logic.defense.counterstrike",
        abbrev: "CXMod",
    },
    NOATTACK: {
        name: "system.logic.traits.noAttack",
        abbrev: "NoAtk",
    },
    NOBLOCK: {
        name: "system.logic.traits.noBlock",
        abbrev: "NoBlk",
    },
} as StrictObject<SohlLogic.EffectKeyData>);
export type StrikeModeEffectKey =
    (typeof STRIKE_MODE_EFFECT_KEY)[keyof typeof STRIKE_MODE_EFFECT_KEY];

export const {
    kind: MASTERY_EFFECT_KEYS,
    values: MasteryEffectKeys,
    isValue: isMasteryEffectKey,
    labels: masteryEffectKeyLabels,
} = defineType(`SOHL.Gear.GEAR_KIND`, {
    "system._boosts": "MBoost",
    "mod:system.masteryLevel": "ML",
    "mod:system.masteryLevel.fate": "Fate",
    "system.masteryLevel.successLevelMod": "SL",
});
export type EffectKey =
    (typeof MASTERY_EFFECT_KEYS)[keyof typeof MASTERY_EFFECT_KEYS];

export const {
    kind: MELEE_WEAPON_STRIKEMODE_EFFECT_KEY,
    values: MeleeWeaponStrikeModeEffectKey,
    isValue: isMeleeWeaponStrikeModeEffectKey,
    labels: MeleeWeaponStrikeModeEffectKeyLabels,
} = defineType("SOHL.MeleeWeaponStrikeMode.EffectKey", {
    ...STRIKE_MODE_EFFECT_KEY,
    LENGTH: {
        name: "system.logic.length",
        abbrev: "Len",
    },
    BLOCK: {
        name: "system.logic.defense.block",
        abbrev: "Blk",
    },
    COUNTERSTRIKE: {
        name: "system.logic.defense.counterstrike",
        abbrev: "CX",
    },
} as StrictObject<SohlLogic.EffectKeyData>);
export type MeleeWeaponStrikeModeEffectKey =
    (typeof MELEE_WEAPON_STRIKEMODE_EFFECT_KEY)[keyof typeof MELEE_WEAPON_STRIKEMODE_EFFECT_KEY];

export const {
    kind: SOHL_EVENT_STATE,
    values: SohlEventStates,
    isValue: isSohlEventState,
    labels: SohlEventStateLabels,
} = defineType("SOHL.Event.State", {
    CREATED: "created", // SohlEvent has been created
    INITIATED: "initiated", // SohlEvent has been initiated
    ACTIVATED: "activated", // SohlEvent has been activated
    EXPIRED: "expired", // SohlEvent has expired
});
export type SohlEventState =
    (typeof SOHL_EVENT_STATE)[keyof typeof SOHL_EVENT_STATE];

export const {
    kind: SOHL_EVENT_TERM,
    values: SohlEventTerms,
    isValue: isSohlEventTerm,
    labels: SohlEventTermLabels,
} = defineType("SOHL.Event.Term", {
    DURATION: "duration", // SohlEvent will last for a duration
    INDEFINITE: "indefinite", // SohlEvent will last indefinitely until manually expired
    PERMANENT: "permanent", // SohlEvent will last permanently
});
export type SohlEventTerm =
    (typeof SOHL_EVENT_TERM)[keyof typeof SOHL_EVENT_TERM];

export const {
    kind: SOHL_EVENT_REPEAT,
    values: SohlEventRepeats,
    isValue: isSohlEventRepeat,
    labels: SohlEventRepeatLabels,
} = defineType("SOHL.Event.Repeat", {
    NONE: "none", // SohlEvent will not repeat
    ONCE: "once", // SohlEvent will repeat once
    REPEATED: "repeated", // SohlEvent will repeat multiple times
});
export type SohlEventRepeat =
    (typeof SOHL_EVENT_REPEAT)[keyof typeof SOHL_EVENT_REPEAT];

export const {
    kind: SOHL_ACTION_SCOPE,
    values: SohlActionScopes,
    isValue: isSohlActionScope,
} = defineType("SOHL.SohlAction.Scope", {
    SELF: "self",
    ITEM: "item",
    ACTOR: "actor",
    OTHER: "other",
});
export type SohlActionScope =
    (typeof SOHL_ACTION_SCOPE)[keyof typeof SOHL_ACTION_SCOPE];

export const {
    kind: SOHL_ACTION_ROLE,
    values: SohlActionRoles,
    isValue: isSohlActionRole,
    labels: SohlActionRoleLabels,
} = defineType("SOHL.Action.Role", {
    NONE: 0,
    PLAYER: 1,
    TRUSTED: 2,
    OWNER: 3,
    ASSISTANT: 4,
    GAMEMASTER: 5,
});
export type SohlActionRole =
    (typeof SOHL_ACTION_ROLE)[keyof typeof SOHL_ACTION_ROLE];

/**
 * Constants for the Heal Rate of an Affliction.
 */
export const AfflictionHealRate: StrictObject<number> = {
    NONE: -1,
    DEFEATED: 6,
    DEAD: 0,
} as const;

export const {
    kind: AFFLICTION_SUBTYPE,
    values: AfflictionSubTypes,
    isValue: isAfflictionSubType,
    labels: AfflictionSubTypeLabels,
} = defineType("SOHL.Affliction.SUBTYPE", {
    PRIVATION: "privation",
    FATIGUE: "fatigue",
    DISEASE: "disease",
    INFECTION: "infection",
    POISONTOXIN: "poisontoxin",
    FEAR: "fear",
    MORALE: "morale",
    SHADOW: "shadow",
    PSYCHE: "psyche",
    AURALSHOCK: "auralshock",
});
export type AfflictionSubType = (typeof AfflictionSubTypes)[number];

export const {
    kind: AFFLICTION_TRANSMISSION,
    values: AfflictionTransmissions,
    isValue: isAfflictionTransmission,
    labels: AfflictionTransmissionLabels,
} = defineType("SOHL.Affliction.TRANSMISSION", {
    NONE: "none",
    AIRBORNE: "airborne",
    CONTACT: "contact",
    BODYFLUID: "bodyfluid",
    INJESTED: "injested",
    PROXIMITY: "proximity",
    VECTOR: "vector",
    PERCEPTION: "perception",
    ARCANE: "arcane",
    DIVINE: "divine",
    SPIRIT: "spirit",
});
export type AfflictionTransmission = (typeof AfflictionTransmissions)[number];

export const {
    kind: FATIGUE_CATEGORY,
    values: FatigueCategories,
    isValue: isFatigueCategory,
    labels: FatigueCategoryLabels,
} = defineType("SOHL.Affliction.FATIGUE_CATEGORY", {
    WINDEDNESS: "windedness",
    WEARINESS: "weariness",
    WEAKNESS: "weakness",
});
export type FatigueCategory =
    (typeof FATIGUE_CATEGORY)[keyof typeof FATIGUE_CATEGORY];

export const {
    kind: PRIVATION_CATEGORY,
    values: PrivationCategories,
    isValue: isPrivationCategory,
    labels: PrivationCategoryLabels,
} = defineType("SOHL.Affliction.PRIVATION_CATEGORY", {
    ASPHIXIA: "asphixia",
    COLD: "cold",
    HEAT: "heat",
    STARVATION: "starvation",
    DEHYDRATION: "dehydration",
    SLEEP_DEPRIVATION: "nosleep",
});
export type PrivationCategory =
    (typeof PRIVATION_CATEGORY)[keyof typeof PRIVATION_CATEGORY];

export const {
    kind: FEAR_LEVEL,
    values: FearLevels,
    isValue: isFearLevel,
    labels: FearLevelLabels,
} = defineType("SOHL.Affliction.FEAR_LEVEL", {
    NONE: 0,
    BRAVE: 1,
    STEADY: 2,
    AFRAID: 3,
    TERRIFIED: 4,
    CATATONIC: 5,
});
export type FearLevel = (typeof FEAR_LEVEL)[keyof typeof FEAR_LEVEL];

export const {
    kind: MORALE_LEVEL,
    values: MoraleLevels,
    isValue: isMoraleLevel,
    labels: MoraleLevelLabels,
} = defineType("SOHL.Affliction.MORALE_LEVEL", {
    NONE: 0,
    BRAVE: 1,
    STEADY: 2,
    WITHDRAWING: 3,
    ROUTED: 4,
    CATATONIC: 5,
});
export type MoraleLevel = (typeof MORALE_LEVEL)[keyof typeof MORALE_LEVEL];

export const {
    kind: CONCOCTIONGEAR_SUBTYPE,
    values: ConcoctionGearSubTypes,
    isValue: isConcoctionGearSubType,
} = defineType("SOHL.ConcoctionGear.SubType", {
    MUNDANE: "mundane",
    EXOTIC: "exotic",
    ELIXIR: "elixir",
});
export type ConcoctionGearSubType =
    (typeof CONCOCTIONGEAR_SUBTYPE)[keyof typeof CONCOCTIONGEAR_SUBTYPE];

export const {
    kind: CONCOCTIONGEAR_POTENCY,
    values: ConcoctionGearPotencies,
    isValue: isConcoctionGearPotency,
} = defineType("SOHL.ConcoctionGear.Potency", {
    NOT_APPLICABLE: "na",
    MILD: "mild",
    STRONG: "strong",
    GREAT: "great",
});
export type ConcoctionGearPotency =
    (typeof CONCOCTIONGEAR_POTENCY)[keyof typeof CONCOCTIONGEAR_POTENCY];

export const {
    kind: DOMAIN_EMBODIMENT_CATEGORY,
    values: DomainEmbodimentCategories,
    isValue: isDomainEmbodimentCategory,
} = defineType("SOHL.Domain.EMBODIMENT_CATEGORY", {
    DREAMS: "dreams",
    DEATH: "death",
    VIOLENCE: "violence",
    PEACE: "peace",
    FERTILITY: "fertility",
    ORDER: "order",
    KNOWLEDGE: "knowledge",
    PROSPERITY: "prosperity",
    FIRE: "fire",
    CREATION: "creation",
    VOYAGER: "voyager",
    DECAY: "decay",
});
export type DomainEmbodimentCategory =
    (typeof DOMAIN_EMBODIMENT_CATEGORY)[keyof typeof DOMAIN_EMBODIMENT_CATEGORY];

export const {
    kind: DOMAIN_ELEMENT_CATEGORY,
    values: DomainElementCategories,
    isValue: isDomainElementCategory,
} = defineType("SOHL.Domain.ELEMENT_CATEGORY", {
    FIRE: "fire",
    WATER: "water",
    EARTH: "earth",
    SPIRIT: "spirit",
    WIND: "wind",
    METAL: "metal",
    ARCANA: "arcana",
});
export type DomainElementCategory =
    (typeof DOMAIN_ELEMENT_CATEGORY)[keyof typeof DOMAIN_ELEMENT_CATEGORY];

export const {
    kind: ACTION_SUBTYPE,
    values: ActionSubTypes,
    isValue: isActionSubType,
    labels: ActionSubTypeLabels,
} = defineType("SOHL.Action.SUBTYPE", {
    BASIC: "basic",
    SCRIPT_ACTION: "scriptaction",
    INTRINSIC_ACTION: "intrinsicaction",
});
export type ActionSubType = (typeof ActionSubTypes)[number];

export const {
    kind: MYSTERY_SUBTYPE,
    values: MysterySubTypes,
    isValue: isMysterySubType,
} = defineType("SOHL.Mystery.SubType", {
    GRACE: "grace",
    PIETY: "piety",
    FATE: "fate",
    FATEBONUS: "fateBonus",
    FATEPOINTBONUS: "fatePointBonus",
    BLESSING: "blessing",
    ANCESTORSPIRITPOWER: "ancestorSpiritPower",
    TOTEMSPIRITPOWER: "totemSpiritPower",
});
export type MysterySubType =
    (typeof MYSTERY_SUBTYPE)[keyof typeof MYSTERY_SUBTYPE];

export const {
    kind: MYSTERY_CATEGORY,
    values: MysteryCategories,
    isValue: isMysteryCategory,
} = defineType("SOHL.Mystery.Category", {
    DIVINE: "divinedomain",
    SKILL: "skill",
    CREATURE: "creature",
    NONE: "none",
});
export type MysteryCategory =
    (typeof MYSTERY_CATEGORY)[keyof typeof MYSTERY_CATEGORY];

export const {
    kind: MYSTERY_CATEGORYMAP,
    values: MysteryCategoryMaps,
    isValue: isMysteryCategoryMap,
} = defineType("SOHL.Mystery.CategoryMap", {
    [MYSTERY_SUBTYPE.GRACE]: MYSTERY_CATEGORY.DIVINE,
    [MYSTERY_SUBTYPE.PIETY]: MYSTERY_CATEGORY.DIVINE,
    [MYSTERY_SUBTYPE.FATE]: MYSTERY_CATEGORY.SKILL,
    [MYSTERY_SUBTYPE.FATEBONUS]: MYSTERY_CATEGORY.SKILL,
    [MYSTERY_SUBTYPE.FATEPOINTBONUS]: MYSTERY_CATEGORY.NONE,
    [MYSTERY_SUBTYPE.BLESSING]: MYSTERY_CATEGORY.DIVINE,
    [MYSTERY_SUBTYPE.ANCESTORSPIRITPOWER]: MYSTERY_CATEGORY.SKILL,
    [MYSTERY_SUBTYPE.TOTEMSPIRITPOWER]: MYSTERY_CATEGORY.CREATURE,
});
export type MysteryCategoryMap =
    (typeof MYSTERY_CATEGORYMAP)[keyof typeof MYSTERY_CATEGORYMAP];

export const {
    kind: MYSTICALABILITY_SUBTYPE,
    values: MysticalAbilitySubTypes,
    isValue: isMysticalAbilitySubType,
} = defineType("SOHL.MysticalAbility.SubType", {
    SHAMANICRITE: "shamanicrite",
    SPIRITACTION: "spiritaction",
    SPIRITPOWER: "spiritpower",
    BENEDICTION: "benediction",
    DIVINEDEVOTION: "divinedevotion",
    DIVINEINCANTATION: "divineincantation",
    ARCANEINCANTATION: "arcaneincantation",
    ARCANETALENT: "arcanetalent",
    SPIRITTALENT: "spirittalent",
    ALCHEMY: "alchemy",
    DIVINATION: "divination",
});
export type MysticalAbilitySubType =
    (typeof MYSTICALABILITY_SUBTYPE)[keyof typeof MYSTICALABILITY_SUBTYPE];

export const {
    kind: MYSTICALABILITY_DEGREE,
    values: MysticalAbilityDegrees,
    isValue: isMysticalAbilityDegree,
} = defineType("SOHL.MysticalAbility.Degree", {
    PRIMARY: { name: "primary", value: 0 },
    SECONDARY: { name: "secondary", value: 1 },
    NEUTRAL: { name: "neutral", value: 2 },
    TERTIARY: { name: "tertiary", value: 3 },
    DIAMETRIC: { name: "diametric", value: 4 },
});
export type MysticalAbilityDegree =
    (typeof MYSTICALABILITY_DEGREE)[keyof typeof MYSTICALABILITY_DEGREE];

export const {
    kind: MYSTICALDEVICE_SUBTYPE,
    values: MysticalDeviceSubTypes,
    isValue: isMysticalDeviceSubType,
} = defineType("SOHL.MysticalDevice.SubType", {
    ARTIFACT: "artifact",
    ANCESTOR_TALISMAN: "ancestortalisman",
    TOTEM_TALISMAN: "totemtalisman",
    REMNANT: "remnant",
    RELIC: "relic",
});
export type MysticalDeviceSubType =
    (typeof MYSTICALDEVICE_SUBTYPE)[keyof typeof MYSTICALDEVICE_SUBTYPE];

export const {
    kind: PHILOSOPHY_SUBTYPE,
    values: PhilosophySubTypes,
    isValue: isPhilosophySubType,
} = defineType("SOHL.Philosophy.SUBTYPE", {
    ARCANE: "arcane",
    DIVINE: "divine",
    SPIRIT: "spirit",
    ASTRAL: "astral",
    NATURAL: "natural",
});
export type PhilosophySubType =
    (typeof PHILOSOPHY_SUBTYPE)[keyof typeof PHILOSOPHY_SUBTYPE];

export const {
    kind: PROJECTILEGEAR_SUBTYPE,
    values: ProjectileGearSubTypes,
    isValue: isProjectileGearSubType,
} = defineType("SOHL.ProjectileGear.SubType", {
    NONE: "none",
    ARROW: "arrow",
    BOLT: "bolt",
    BULLET: "bullet",
    DART: "dart",
    OTHER: "other",
});
export type ProjectileGearSubType =
    (typeof PROJECTILEGEAR_SUBTYPE)[keyof typeof PROJECTILEGEAR_SUBTYPE];

export const {
    kind: SKILL_SUBTYPE,
    values: SkillSubTypes,
    isValue: isSkillSubType,
} = defineType("SOHL.Skill.SubType", {
    SOCIAL: "social",
    NATURE: "nature",
    CRAFT: "craft",
    LORE: "lore",
    LANGUAGE: "language",
    SCRIPT: "script",
    RITUAL: "ritual",
    PHYSICAL: "physical",
    COMBAT: "combat",
    ESOTERIC: "esoteric",
});
export type SkillSubType = (typeof SKILL_SUBTYPE)[keyof typeof SKILL_SUBTYPE];

export const {
    kind: SKILL_COMBAT_CATEGORY,
    values: SkillCombatCategories,
    isValue: isSkillCombatCategory,
} = defineType("SOHL.Skill.Combat", {
    NONE: "none",
    ALL: "all",
    MELEE: "melee",
    MISSILE: "missile",
    MELEEMISSILE: "meleemissile",
    MANEUVER: "maneuver",
    MELEEMANEUVER: "meleemaneuver",
});
export type SkillCombatCategory =
    (typeof SKILL_COMBAT_CATEGORY)[keyof typeof SKILL_COMBAT_CATEGORY];

export const {
    kind: TRAIT_SUBTYPE,
    values: TraitSubTypes,
    isValue: isTraitSubType,
} = defineType("SOHL.Trait.SubType", {
    PHYSIQUE: "physique",
    PERSONALITY: "personality",
    TRANSCENDENT: "transcendent",
});
export type TraitSubType = (typeof TRAIT_SUBTYPE)[keyof typeof TRAIT_SUBTYPE];

export const {
    kind: TRAIT_INTENSITY,
    values: TraitIntensities,
    isValue: isTraitIntensity,
} = defineType("SOHL.Trait.Intensity", {
    TRAIT: "trait",
    IMPULSE: "impulse",
    DISORDER: "disorder",
    ATTRIBUTE: "attribute",
});
export type TraitIntensity =
    (typeof TRAIT_INTENSITY)[keyof typeof TRAIT_INTENSITY];

export const {
    kind: TEST_TYPE,
    values: TestTypes,
    isValue: isTestType,
} = defineType("SOHL.SuccessTestResult.TestType", {
    SETIMPROVEFLAG: {
        id: "setImproveFlag",
        name: "Set Improve Flag",
        iconClass: "fas fa-star",
        condition: (header: HTMLElement): boolean => {
            const mlLogic = getContextItem(header)
                ?.system as unknown as MasteryLevelLogic;
            return mlLogic?.canImprove && !mlLogic.data.improveFlag;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    UNSETIMPROVEFLAG: {
        id: "unsetImproveFlag",
        name: "Unset Improve Flag",
        iconClass: "far fa-star",
        condition: (header: HTMLElement): boolean => {
            const mlLogic = getContextItem(header)
                ?.system as unknown as MasteryLevelLogic;
            return mlLogic?.canImprove && !mlLogic.data.improveFlag;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    IMPROVEWITHSDR: {
        id: "improveWithSDR",
        name: "Improve with SDR",
        iconClass: "fas fa-star",
        condition: (header: HTMLElement): boolean => {
            const mlLogic = getContextItem(header)
                ?.system as unknown as MasteryLevelLogic;
            return mlLogic?.canImprove && !mlLogic.data.improveFlag;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    SUCCESSTEST: {
        id: "successTest",
        name: "Success Test",
        iconClass: "fas fa-person",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTSTART: {
        id: "opposedTestStart",
        name: "Opposed Test Start",
        iconClass: "fas fa-arrow-down-left-and-arrow-up-right-to-center",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     getContextItem(header),
            // );
            // const token = cast<SohlActor>(
            //     cast<Item>(item)?.actor,
            // )?.getToken();
            // return token && !item.system.$masteryLevel.disabled;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    SHOCKTEST: {
        id: "shockTest",
        name: "Shock Test",
        iconClass: "far fa-face-eyes-xmarks",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    STUMBLETEST: {
        id: "stumbleTest",
        name: "Stumble Test",
        iconClass: "far fa-person-falling",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FUMBLETEST: {
        id: "fumbleTest",
        name: "Fumble Test",
        iconClass: "far fa-ball-pile",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        id: "moraleTest",
        name: "Morale Test",
        iconClass: "far fa-people-group",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        id: "fearTest",
        name: "Fear Test",
        iconClass: "far fa-face-scream",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TRANSMITAFFLICTION: {
        id: "transmitAffliction",
        name: "Transmit Affliction",
        iconClass: "fas fa-head-side-cough",
        condition: (header: HTMLElement): boolean => {
            const afflLogic = getContextItem(header)
                ?.system as unknown as AfflictionLogic;
            return afflLogic?.canTransmit;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        id: "contractAfflictionTest",
        name: "Contract Affliction Test",
        iconClass: "fas fa-virus",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        id: "courseTest",
        name: "Course Test",
        iconClass: "fas fa-heart-pulse",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        id: "fatigueTest",
        name: "Fatigue Test",
        iconClass: "fas fa-face-downcast-sweat",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        id: "treatmentTest",
        name: "Treatment Test",
        iconClass: "fas fa-staff-snake",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        id: "diagnosisTest",
        name: "Diagnosis Test",
        iconClass: "fas fa-stethoscope",
        condition: (header: HTMLElement): boolean => {
            const injLogic = getContextItem(header)
                ?.system as unknown as InjuryLogic;
            return injLogic?.data.isTreated;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: "healingTest",
        name: "Healing Test",
        iconClass: "fas fa-heart-pulse",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const endurance = item?.actor?.getTraitByAbbrev("end");
            // return endurance && !endurance.system.$masteryLevel.disabled;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    BLEEDINGSTOPPAGETEST: {
        id: "bleedingStoppageTest",
        name: "Bleeding Stoppage Test",
        iconClass: "fas fa-droplet-slash",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     getContextItem(header),
            // );
            // if (!item?.system.isBleeding) return false;
            // const physician = item?.actor?.getSkillByAbbrev("pysn");
            // return physician && !physician.system.$masteryLevel.disabled;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    BLOODLOSSADVANCETEST: {
        id: "bloodlossAdvanceTest",
        name: "Bloodloss Advance Test",
        iconClass: "fas fa-droplet",
        condition: (header: HTMLElement): boolean => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     getContextItem(header),
            // );
            // if (!item || !item.system.isBleeding) return false;
            // const strength = item?.actor?.getTraitByAbbrev("str");
            // return strength && !strength.system.$masteryLevel?.disabled;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTRESUME: {
        id: "opposedTestResume",
        name: "Opposed Test Resume",
        iconClass: "fas fa-people-arrows",
        condition: (header: HTMLElement): boolean => false,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    RESOLVEIMPACT: {
        id: "resolveImpact",
        name: "Resolve Impact",
        iconClass: "fas fa-person-burst",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    BLOCK: {
        id: "blockTest",
        name: "Block Test",
        iconClass: "fas fa-shield",
        condition: (header: HTMLElement): boolean => {
            return true;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    COUNTERSTRIKE: {
        id: "counterstrikeTest",
        name: "Counterstrike Test",
        iconClass: "fas fa-circle-half-stroke",
        condition: (header: HTMLElement): boolean => {
            return true;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DODGE: {
        id: "dodgeTest",
        name: "Dodge Test",
        iconClass: "fas fa-person-walking-arrow-loop-left",
        condition: (header: HTMLElement): boolean => {
            const item = getContextItem(header);
            if (!item?.actor?.items) return false;
            const dodge = Itr.from(item.actor.items.values()).find(
                // @ts-ignore
                (it: SohlItem) =>
                    it.type === ITEM_KIND.SKILL && it.name === "Dodge",
            ) as SohlItem | null;
            return !!(
                dodge &&
                !(dodge.logic as MasteryLevelLogic).masteryLevel.disabled
            );
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    IGNORE: {
        id: "ignore",
        name: "Ignore",
        iconClass: "fas fa-ban",
        condition: (header: HTMLElement): boolean => {
            return true;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMELEE: {
        id: "autoCombatMelee",
        name: "Auto Combat Melee",
        iconClass: "fas fa-swords",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMISSILE: {
        id: "autoCombatMissile",
        name: "Auto Combat Missile",
        iconClass: "fas fa-bow-arrow",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    MISSILEATTACK: {
        id: "missileAttackTest",
        name: "Missile Attack Test",
        iconClass: "fas fa-bow-arrow",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    MELEEATTACK: {
        id: "meleeAttackTest",
        name: "Melee Attack Test",
        iconClass: "fas fa-sword",
        condition: (header: HTMLElement): boolean => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<SohlContextMenu.Entry>);
export type TestType = (typeof TEST_TYPE)[keyof typeof TEST_TYPE]["id"];

export const SOHL_DEFAULT_CALENDAR_CONFIG = {
    name: "Default Calendar",
    description: "The default calendar for Song of Heroic Lands.",
    years: {
        yearZero: 720,
        firstWeekday: 0,
    },
    era: {
        name: "SOHL.CALENDAR.DEFAULT.EraName",
        abbrev: "SOHL.CALENDAR.DEFAULT.EraAbbr",
        beforeName: "SOHL.CALENDAR.DEFAULT.BeforeEraName",
        beforeAbbrev: "SOHL.CALENDAR.DEFAULT.BeforeEraAbbr",
        description: "",
        hasYearZero: false,
    },
    months: {
        values: [
            // Springtide, Spr, Vernal equinox; planting season begins
            {
                name: "SOHL.CALENDAR.DEFAULT.Springtide",
                abbreviation: "SOHL.CALENDAR.DEFAULT.SpringtideAbbr",
                ordinal: 1,
                days: 30,
            },
            // Blossomreach, Blo, Flowers and bees return
            {
                name: "SOHL.CALENDAR.DEFAULT.Blossomreach",
                abbreviation: "SOHL.CALENDAR.DEFAULT.BlossomreachAbbr",
                ordinal: 2,
                days: 30,
            },
            // Greengold, Grn, Young crops rise
            {
                name: "SOHL.CALENDAR.DEFAULT.Greengold",
                abbreviation: "SOHL.CALENDAR.DEFAULT.GreengoldAbbr",
                ordinal: 3,
                days: 30,
            },
            // Highsun, Sun, The sun’s zenith; labor in full swing
            {
                name: "SOHL.CALENDAR.DEFAULT.Highsun",
                abbreviation: "SOHL.CALENDAR.DEFAULT.HighsunAbbr",
                ordinal: 4,
                days: 30,
            },
            // Midsummer, Mid, Festivals, First fruits
            {
                name: "SOHL.CALENDAR.DEFAULT.Midsummer",
                abbreviation: "SOHL.CALENDAR.DEFAULT.MidsummerAbbr",
                ordinal: 5,
                days: 30,
            },
            // Hayfall, Hay, Preparation for harvest
            {
                name: "SOHL.CALENDAR.DEFAULT.Hayfall",
                abbreviation: "SOHL.CALENDAR.DEFAULT.HayfallAbbr",
                ordinal: 6,
                days: 30,
            },
            // Reapmoon, Rep, The main harvest
            {
                name: "SOHL.CALENDAR.DEFAULT.Reapmoon",
                abbreviation: "SOHL.CALENDAR.DEFAULT.ReapmoonAbbr",
                ordinal: 7,
                days: 30,
            },
            // Emberwane, Emb, Smoke in the fields, turning leaves
            {
                name: "SOHL.CALENDAR.DEFAULT.Emberwane",
                abbreviation: "SOHL.CALENDAR.DEFAULT.EmberwaneAbbr",
                ordinal: 8,
                days: 30,
            },
            // Fallmere, Fal, Final gathering before cold
            {
                name: "SOHL.CALENDAR.DEFAULT.Fallmere",
                abbreviation: "SOHL.CALENDAR.DEFAULT.FallmereAbbr",
                ordinal: 9,
                days: 30,
            },
            // Frostwane, Frs, First frosts, fading light, herds brought in
            {
                name: "SOHL.CALENDAR.DEFAULT.Frostwane",
                abbreviation: "SOHL.CALENDAR.DEFAULT.FrostwaneAbbr",
                ordinal: 10,
                days: 30,
            },
            // Snorest, Sno, Deep winter, Quiet, hearth, mending tools
            {
                name: "SOHL.CALENDAR.DEFAULT.Snowrest",
                abbreviation: "SOHL.CALENDAR.DEFAULT.SnowrestAbbr",
                ordinal: 11,
                days: 30,
            },
            // Thawrise, Tha, Snows melt, life stirs, hope returns
            {
                name: "SOHL.CALENDAR.DEFAULT.Thawrise",
                abbreviation: "SOHL.CALENDAR.DEFAULT.ThawriseAbbr",
                ordinal: 12,
                days: 30,
            },
        ],
    },
    days: {
        values: [
            {
                name: "SOHL.CALENDAR.DEFAULT.Oneday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.OnedayAbbr",
                ordinal: 1,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Twoday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.TwodayAbbr",
                ordinal: 2,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Threeday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.ThreedayAbbr",
                ordinal: 3,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Fourday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.FourdayAbbr",
                ordinal: 4,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Fiveday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.FivedayAbbr",
                ordinal: 5,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Sixday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.SixdayAbbr",
                ordinal: 6,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Sevenday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.SevendayAbbr",
                ordinal: 7,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Eightday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.EightdayAbbr",
                ordinal: 8,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Nineday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.NinedayAbbr",
                ordinal: 9,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Tenday",
                abbreviation: "SOHL.CALENDAR.DEFAULT.TendayAbbr",
                ordinal: 10,
            },
        ],
        daysPerYear: 360,
        hoursPerDay: 24,
        minutesPerHour: 60,
        secondsPerMinute: 60,
    },
    seasons: {
        values: [
            {
                name: "SOHL.CALENDAR.DEFAULT.Spring",
                monthStart: 1,
                monthEnd: 3,
            },
            {
                name: "SOHL.CALENDAR.DEFAULT.Summer",
                monthStart: 4,
                monthEnd: 6,
            },
            { name: "SOHL.CALENDAR.DEFAULT.Fall", monthStart: 7, monthEnd: 9 },
            {
                name: "SOHL.CALENDAR.DEFAULT.Winter",
                monthStart: 10,
                monthEnd: 12,
            },
        ],
    },
};

/*
 * ============================================================
 * Constant based functions
 * ============================================================
 */

export interface DefinedType<KMap extends Record<string, unknown>> {
    kind: KMap;
    values: Array<KMap[keyof KMap]>;
    isValue: (v: unknown) => v is KMap[keyof KMap];
    labels: Record<string, string>;
    Type: KMap[keyof KMap];
}

/**
 * Defines a type with a prefix and its associated values.
 */
export function defineType<const T extends Record<string, unknown>>(
    prefix: string,
    def: T,
) {
    type StringKeys = keyof T & string;
    type KindValue = T[StringKeys];

    const values = Object.values(def) as KindValue[];
    const isValue = (value: unknown): value is KindValue =>
        values.includes(value as KindValue);

    const labels = Object.fromEntries(
        Object.entries(def).map(([k, v]) => [k, `${prefix}.${v}`]),
    ) as Record<StringKeys, string>;

    return {
        kind: def,
        values,
        isValue,
        labels,
        Type: null as unknown as KindValue,
    };
}

export function getContextItem(header: HTMLElement): SohlItem<any, any> | null {
    const element = header.closest(".item") as HTMLElement;
    const item =
        element?.dataset?.effectId && fromUuidSync(element.dataset.itemId);
    return item && typeof item === "object" ?
            (item as SohlItem<any, any>)
        :   null;
}

export function getContextLogic(element: HTMLElement): any {
    const found = element.closest(".logic") as any;
    if (!found) return null;
    // @ts-ignore
    return fromUuidSync(found.dataset.uuid);
}
