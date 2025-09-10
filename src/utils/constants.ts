/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

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
    kind: ACTOR_KIND,
    values: ActorKinds,
    isValue: isActorKind,
    labels: actorKindLabels,
} = defineType("TYPES.Actor", {
    ENTITY: "entity",
    ASSEMBLY: "assembly",
});
export type ActorKind = (typeof ACTOR_KIND)[keyof typeof ACTOR_KIND];

export const {
    kind: ITEM_METADATA,
    values: ItemMetadatas,
    isValue: isItemMetadata,
    labels: itemMetadataLabels,
} = defineType(`SOHL.Item.METADATA`, {
    [ITEM_KIND.AFFILIATION]: {
        IconCssClass: "fa-duotone fa-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
        Sheet: "systems/sohl/templates/item/affiliation-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.AFFLICTION]: {
        IconCssClass: "fas fa-face-nauseated",
        Image: "systems/sohl/assets/icons/sick.svg",
        Sheet: "systems/sohl/templates/item/affliction-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.ARMORGEAR]: {
        IconCssClass: "fas fa-shield-halved",
        Image: "systems/sohl/assets/icons/armor.svg",
        Sheet: "systems/sohl/templates/item/armorgear-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.BODYLOCATION]: {
        IconCssClass: "fas fa-hand",
        Image: "systems/sohl/assets/icons/hand.svg",
        Sheet: "systems/sohl/templates/item/bodylocation-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.BODYPART]: {
        IconCssClass: "fa-duotone fa-skeleton-ribs",
        Image: "systems/sohl/assets/icons/ribcage.svg",
        Sheet: "systems/sohl/templates/item/bodypart-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.BODYZONE]: {
        IconCssClass: "fa-duotone fa-person",
        Image: "systems/sohl/assets/icons/person.svg",
        Sheet: "systems/sohl/templates/item/bodyzone-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: {
        IconCssClass: "fas fa-hand-fist",
        Image: "systems/sohl/assets/icons/punch.svg",
        Sheet: "systems/sohl/templates/item/combattechniquestrikemode-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.CONCOCTIONGEAR]: {
        IconCssClass: "fas fa-flask-round-potion",
        Image: "systems/sohl/assets/icons/potion.svg",
        Sheet: "systems/sohl/templates/item/concoctiongear-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.CONTAINERGEAR]: {
        IconCssClass: "fas fa-sack",
        Image: "systems/sohl/assets/icons/sack.svg",
        Sheet: "systems/sohl/templates/item/containergear-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.DOMAIN]: {
        IconCssClass: "fas fa-sparkle",
        Image: "systems/sohl/assets/icons/sparkle.svg",
        Sheet: "systems/sohl/templates/item/domain-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.INJURY]: {
        IconCssClass: "fas fa-user-injured",
        Image: "systems/sohl/assets/icons/injury.svg",
        Sheet: "systems/sohl/templates/item/injury-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: {
        IconCssClass: "fas fa-sword",
        Image: "systems/sohl/assets/icons/sword.svg",
        Sheet: "systems/sohl/templates/item/meleeweaponstrikemode-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MISCGEAR]: {
        IconCssClass: "fas fa-ball-pile",
        Image: "systems/sohl/assets/icons/miscgear.svg",
        Sheet: "systems/sohl/templates/item/miscgear-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: {
        IconCssClass: "fas fa-bow-arrow",
        Image: "systems/sohl/assets/icons/longbow.svg",
        Sheet: "systems/sohl/templates/item/missileweaponstrikemode-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTERY]: {
        IconCssClass: "fas fa-sparkles",
        Image: "systems/sohl/assets/icons/sparkles.svg",
        Sheet: "systems/sohl/templates/item/mystery-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTICALABILITY]: {
        IconCssClass: "fas fa-hand-sparkles",
        Image: "systems/sohl/assets/icons/hand-sparkles.svg",
        Sheet: "systems/sohl/templates/item/mysticalability-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTICALDEVICE]: {
        IconCssClass: "fas fa-wand-sparkles",
        Image: "systems/sohl/assets/icons/magic-wand.svg",
        Sheet: "systems/sohl/templates/item/mysticaldevice-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PHILOSOPHY]: {
        IconCssClass: "fas fa-arrow",
        Image: "systems/sohl/assets/icons/sparkle.svg",
        Sheet: "systems/sohl/templates/item/philosophy-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PROJECTILEGEAR]: {
        IconCssClass: "fas fa-bow-arrow",
        Image: "systems/sohl/assets/icons/arrow.svg",
        Sheet: "systems/sohl/templates/item/projectilegear-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PROTECTION]: {
        IconCssClass: "fas fa-shield",
        Image: "systems/sohl/assets/icons/shield.svg",
        Sheet: "systems/sohl/templates/item/protection-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.SKILL]: {
        IconCssClass: "fas fa-head-side-gear",
        Image: "systems/sohl/assets/icons/head-gear.svg",
        Sheet: "systems/sohl/templates/item/skill-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.TRAIT]: {
        IconCssClass: "fas fa-user-gear",
        Image: "systems/sohl/assets/icons/user-gear.svg",
        Sheet: "systems/sohl/templates/item/trait-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.WEAPONGEAR]: {
        IconCssClass: "fas fa-sword",
        Image: "systems/sohl/assets/icons/sword.svg",
        Sheet: "systems/sohl/templates/item/weapongear-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
});
export type ItemMetadata = (typeof ITEM_METADATA)[keyof typeof ITEM_METADATA];

export const {
    kind: ACTOR_METADATA,
    values: ActorMetadatas,
    isValue: isActorMetadata,
    labels: actorMetadataLabels,
} = defineType(`SOHL.Actor.METADATA`, {
    [ACTOR_KIND.ENTITY]: {
        IconCssClass: "fas fa-person",
        Image: "icons/svg/item-bag.svg",
        Sheet: "systems/sohl/templates/item/entity-sheet.hbs",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.ASSEMBLY]: {
        IconCssClass: "fas fa-layer-group",
        Image: "systems/sohl/assets/icons/stack.svg",
        Sheet: "systems/sohl/templates/item/assembly-sheet.hbs",
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
    ACTIVEEFFECTDATA: {
        Kind: "activeeffectdata",
        IconCssClass: "fa-duotone fa-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
        Sheet: "systems/sohl/templates/item/weapongear-sheet.hbs",
    },
});
export type EffectMetadata =
    (typeof EFFECT_METADATA)[keyof typeof EFFECT_METADATA];

export const EFFECT_IMAGE: string =
    "systems/sohl/assets/icons/people-group.svg";

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
    STILL: "still",
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
    kind: ENTITY_EFFECT_KEY,
    values: EntityEffectKey,
    isValue: isEntityEffectKey,
    labels: EntityEffectKeyLabels,
} = defineType("SOHL.Entity.EffectKey", {
    ENGOPP: {
        name: "mod:system.engagedOpponents",
        abbrev: "EngOpp",
    },
} as PlainObject);
export type SohlEntityEffectKey =
    (typeof ENTITY_EFFECT_KEY)[keyof typeof ENTITY_EFFECT_KEY];

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

/*
 * ============================================================
 * Constant based functions
 * ============================================================
 */

/**
 * Defines a type with a prefix and its associated values.
 */
export function defineType<const T extends Record<string, unknown>>(
    prefix: string,
    def: T,
) {
    type KindValue = T[keyof T];

    const values = Object.values(def) as KindValue[];
    const isValue = (value: unknown): value is KindValue =>
        values.includes(value as KindValue);
    const labels = Object.fromEntries(
        Object.entries(def).map(([k, v]) => [k, `${prefix}.${v}`]),
    );
    return {
        kind: def,
        values,
        isValue,
        labels,
        Type: null as unknown as KindValue, // utility only for inference
    };
}
