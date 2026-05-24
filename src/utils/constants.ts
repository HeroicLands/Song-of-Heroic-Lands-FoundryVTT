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

import type { SohlContextMenu } from "@src/utils/SohlContextMenu";
export const KIND_KEY: string = "__kind" as const;
export const SCHEMA_VERSION_KEY: string = "__schemaVer" as const;

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
    ATTRIBUTE: "attribute",
    COMBATTECHNIQUE: "combattechnique",
    CONCOCTIONGEAR: "concoctiongear",
    CONTAINERGEAR: "containergear",
    TRAUMA: "trauma",
    LINEAGE: "lineage",
    MISCGEAR: "miscgear",
    MYSTERY: "mystery",
    MYSTICALABILITY: "mysticalability",
    PROJECTILEGEAR: "projectilegear",
    SKILL: "skill",
    TRAIT: "trait",
    WEAPONGEAR: "weapongear",
});
export type ItemKind = (typeof ITEM_KIND)[keyof typeof ITEM_KIND];

export const {
    kind: DOMAIN_FAMILY,
    values: DomainFamilies,
    isValue: isDomainFamily,
    labels: domainFamilyLabels,
} = defineType("SOHL.Domain.FAMILY", {
    ARCANE: "arcane", // schools of magic, elements
    DIVINE: "divine", // deities, divine aspects
    RELIGION: "religion", // faiths, sects, cults — usually parented to a deity
    SPIRIT: "spirit", // totems, ancestor spirits
    ASTRAL: "astral", // birthsigns
    NATURAL: "natural", // geology, mathematics, biology, etc.
});
export type DomainFamily = (typeof DOMAIN_FAMILY)[keyof typeof DOMAIN_FAMILY];

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
    [ITEM_KIND.ATTRIBUTE]: {
        IconCssClass: "fas fa-user-gear",
        Image: "systems/sohl/assets/icons/user-gear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.COMBATTECHNIQUE]: {
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
    [ITEM_KIND.TRAUMA]: {
        IconCssClass: "fas fa-user-injured",
        Image: "systems/sohl/assets/icons/injury.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.LINEAGE]: {
        IconCssClass: "fas fa-person-limbs-wide",
        Image: "systems/sohl/assets/icons/body.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MISCGEAR]: {
        IconCssClass: "fas fa-ball-pile",
        Image: "systems/sohl/assets/icons/miscgear.svg",
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
    [ITEM_KIND.PROJECTILEGEAR]: {
        IconCssClass: "fas fa-bow-arrow",
        Image: "systems/sohl/assets/icons/arrow.svg",
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
    kind: REACTION,
    values: Reactions,
    isValue: isReaction,
    labels: reactionLabels,
} = defineType("SOHL.Actor.REACTION", {
    HOSTILE: "hostile",
    FRIENDLY: "friendly",
    NEUTRAL: "neutral",
});
export type Reaction = (typeof REACTION)[keyof typeof REACTION];

export const {
    kind: GROUP_STANCE,
    values: GroupStances,
    isValue: isGroupStance,
    labels: groupStanceLabels,
} = defineType("SOHL.Actor.GROUP_STANCE", {
    ENEMY: "enemy",
    ALLY: "ally",
    NEUTRAL: "neutral",
});
export type GroupStance = (typeof GROUP_STANCE)[keyof typeof GROUP_STANCE];

export const {
    kind: MOVEMENT_MEDIUM,
    values: MovementMediums,
    isValue: isMovementMedium,
    labels: movementMediumLabels,
} = defineType("SOHL.MovementMedium", {
    TERRESTRIAL: "terrestrial",
    AQUATIC: "aquatic",
    AERIAL: "aerial",
    BURROWING: "burrowing",
    ASTRAL: "astral",
});
export type MovementMedium =
    (typeof MOVEMENT_MEDIUM)[keyof typeof MOVEMENT_MEDIUM];

/**
 * Bleeding susceptibility — a per-location tier (the rulebook's "shaded
 * circle") indicating how prone the location is to producing a Bleeder
 * when injured at S3 or higher.
 *
 * Resolution combines tier × severity × weapon aspect via the bleeding
 * table in `BleedingDefaults.ts`:
 *
 *   NONE   — no shaded circle; never produces a Bleeder regardless.
 *   LOW    — white circle; bleeds at G5 only (any aspect).
 *   MEDIUM — grey circle;  bleeds at G4 (E or P) or G5 (any).
 *   HIGH   — black circle; bleeds at S3 (E only), G4 (E or P), or G5 (any).
 */
export const {
    kind: BLEEDING_SUSCEPTIBILITY,
    values: BleedingSusceptibilities,
    isValue: isBleedingSusceptibility,
    labels: bleedingSusceptibilityLabels,
} = defineType("SOHL.BleedingSusceptibility", {
    NONE: "none",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
});
export type BleedingSusceptibility =
    (typeof BLEEDING_SUSCEPTIBILITY)[keyof typeof BLEEDING_SUSCEPTIBILITY];

/**
 * Amputability — a per-location tier (the rulebook's "shaded triangle")
 * indicating how prone the location is to severance when struck by a G5
 * Edge wound. The triangle's shade modifies the Strength test:
 *
 *   NONE   — no triangle; the location is not amputable.
 *   LOW    — white triangle; +20 modifier (least vulnerable).
 *   MEDIUM — grey triangle;  0 modifier.
 *   HIGH   — black triangle; −20 modifier (most vulnerable).
 *
 * Resolution lives in `AmputationDefaults.ts`.
 */
export const {
    kind: AMPUTABILITY,
    values: Amputabilities,
    isValue: isAmputability,
    labels: amputabilityLabels,
} = defineType("SOHL.Amputability", {
    NONE: "none",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
});
export type Amputability = (typeof AMPUTABILITY)[keyof typeof AMPUTABILITY];

/**
 * Body role — abstract functional roles a body part can fulfill. The four
 * roles cover almost any creature anatomy:
 *
 *   VITAL       — control center: brain, sensory organs, vital nerve
 *                 clusters. Head for vertebrates, cephalothorax for
 *                 arachnids, ganglia clusters for invertebrates.
 *   CORE        — power and balance: torso for humans, abdomen for
 *                 insects, mantle for cephalopods, body for snakes.
 *   MANIPULATOR — fine work and intentional force: arms, paws, tentacles,
 *                 trunks, jaws used as bite-weapons.
 *   LOCOMOTOR   — movement: legs, wings, fins, tentacles in swimming.
 *
 * A part may play multiple roles (e.g., a wolf's front leg is LOCOMOTOR +
 * light MANIPULATOR; a wolf's head is VITAL + MANIPULATOR because of bite
 * attacks). Skills and attributes declare which roles impair them; injury
 * at a part impairs every skill that lists any of the part's roles.
 *
 * Mishap behavior is also role-driven:
 *   VITAL injury (Serious) → fumble + stumble check; (Grievous) → both auto.
 *   CORE injury (Serious) → fumble + stumble check; (Grievous) → both auto.
 *   MANIPULATOR injury (Serious) → fumble check; (Grievous) → auto fumble.
 *   LOCOMOTOR injury (Serious) → stumble check; (Grievous) → auto stumble.
 *
 * The lowercase string values are persisted on every lineage and on every
 * skill/attribute's `impairedByRoles`, so they are the source of truth and
 * must not be renamed without a data migration.
 */
export const {
    kind: BODY_ROLE,
    values: BodyRoles,
    isValue: isBodyRole,
    labels: bodyRoleLabels,
} = defineType("SOHL.BodyRole", {
    VITAL: "vital",
    CORE: "core",
    MANIPULATOR: "manipulator",
    LOCOMOTOR: "locomotor",
});
export type BodyRole = (typeof BODY_ROLE)[keyof typeof BODY_ROLE];

export const {
    kind: COHORT_MEMBER_ROLE,
    values: CohortMemberRoles,
    isValue: isCohortMemberRole,
    labels: cohortMemberRoleLabels,
} = defineType("SOHL.Cohort.MemberRole", {
    DIRECTOR: "director",
    MEMBER: "member",
    SUBORDINATE: "subordinate",
});
export type CohortMemberRole =
    (typeof COHORT_MEMBER_ROLE)[keyof typeof COHORT_MEMBER_ROLE];

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
    BSMOD: "BSMod",
});
export type ValueDeltaInfo =
    (typeof VALUE_DELTA_INFO)[keyof typeof VALUE_DELTA_INFO];
export const VALUE_DELTA_ID: StrictObject<{ name: string; shortcode: string }> =
    ValueDeltaInfos.reduce(
        (acc, val: string) => {
            const name = `SOHL.ValueDelta.INFO.${val}`;
            acc[val] = { name, shortcode: val };
            return acc;
        },
        {} as StrictObject<{ name: string; shortcode: string }>,
    );

export const {
    kind: VALUE_DELTA_OPERATOR,
    values: ValueDeltaOperators,
    isValue: isValueDeltaOperator,
} = defineType("SOHL.ValueDelta.OPERATOR", {
    ADD: "add",
    MULTIPLY: "multiply",
    UPGRADE: "upgrade",
    DOWNGRADE: "downgrade",
    OVERRIDE: "override",
    CUSTOM: "custom",
});

/**
 * Processing order for delta operators: flat bonuses first, then scaling,
 * then clamping (min/max), then hard override, then custom escape hatch.
 */
export const VALUE_DELTA_OPERATOR_ORDER: readonly string[] = [
    "add",
    "multiply",
    "upgrade",
    "downgrade",
    "override",
    "custom",
] as const;
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
} = defineType("SOHL.ContextMenu.SortGroup", {
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
        shortcode: "EngOpp",
    },
} as PlainObject);
export type SohlBeingEffectKey =
    (typeof BEING_EFFECT_KEY)[keyof typeof BEING_EFFECT_KEY];

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
} = defineType("SOHL.Affliction.SubType", {
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
} = defineType("SOHL.Affliction.Transmission", {
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
    kind: ACTION_SUBTYPE,
    values: ActionSubTypes,
    isValue: isActionSubType,
    labels: ActionSubTypeLabels,
} = defineType("SOHL.Action.SubType", {
    INTRINSIC: "intrinsic",
    SCRIPT: "script",
});
export type ActionSubType = (typeof ActionSubTypes)[number];

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
    kind: MYSTERY_SUBTYPE,
    values: MysterySubTypes,
    isValue: isMysterySubType,
} = defineType("SOHL.Mystery.SubType", {
    LEVEL: "level",
    BUFF: "buff",
    OTHER: "other",
});
export type MysterySubType =
    (typeof MYSTERY_SUBTYPE)[keyof typeof MYSTERY_SUBTYPE];

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
    kind: STRIKE_MODE_TYPE,
    values: StrikeModeTypes,
    isValue: isStrikeModeType,
} = defineType("SOHL.StrikeMode.Type", {
    MELEE: "melee",
    MISSILE: "missile",
});
export type StrikeModeType =
    (typeof STRIKE_MODE_TYPE)[keyof typeof STRIKE_MODE_TYPE];

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
    MYSTICAL: "mystical",
    PHYSICAL: "physical",
    COMBAT: "combat",
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
});
export type TraitSubType = (typeof TRAIT_SUBTYPE)[keyof typeof TRAIT_SUBTYPE];

export const {
    kind: TRAUMA_SUBTYPE,
    values: TraumaSubTypes,
    isValue: isTraumaSubType,
} = defineType("SOHL.Trauma.SubType", {
    PHYSICAL: "physical",
    MENTAL: "mental",
    SPIRITUAL: "spiritual",
    SHADOW: "shadow",
});
export type TraumaSubType =
    (typeof TRAUMA_SUBTYPE)[keyof typeof TRAUMA_SUBTYPE];

export const {
    kind: TRAIT_INTENSITY,
    values: TraitIntensities,
    isValue: isTraitIntensity,
} = defineType("SOHL.Trait.Intensity", {
    TRAIT: "trait",
    BENIGN: "benign",
    IMPULSE: "impulse",
    DISORDER: "disorder",
});
export type TraitIntensity =
    (typeof TRAIT_INTENSITY)[keyof typeof TRAIT_INTENSITY];

export const {
    kind: VEHICLE_OCCUPANT_ROLE,
    values: VehicleOccupantRoles,
    isValue: isVehicleOccupantRole,
} = defineType("SOHL.Vehicle.Occupant.Role", {
    CREW: "crew",
    PASSENGER: "passenger",
    DRAFT_CREATURE: "draftCreature",
});
export type VehicleOccupantRole =
    (typeof VEHICLE_OCCUPANT_ROLE)[keyof typeof VEHICLE_OCCUPANT_ROLE];

export const {
    kind: ACTIVE_EFFECT_SCOPE,
    values: ActiveEffectScopes,
    isValue: isActiveEffectScope,
} = defineType("SOHL.ActiveEffect.Scope", {
    THIS: "this",
    ACTOR: "actor",
    TEST: "test",
});
export type ActiveEffectScope =
    (typeof ACTIVE_EFFECT_SCOPE)[keyof typeof ACTIVE_EFFECT_SCOPE];

export const {
    kind: TEST_TYPE,
    values: TestTypes,
    isValue: isTestType,
} = defineType("SOHL.SuccessTestResult.TestType", {
    SETIMPROVEFLAG: {
        id: "setImproveFlag",
        name: "Set Improve Flag",
        iconClass: "fas fa-star",
        condition: "item.system.canImprove && !item.system.data.improveFlag",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    UNSETIMPROVEFLAG: {
        id: "unsetImproveFlag",
        name: "Unset Improve Flag",
        iconClass: "far fa-star",
        condition: "item.system.canImprove && !item.system.data.improveFlag",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    IMPROVEWITHSDR: {
        id: "improveWithSDR",
        name: "Improve with SDR",
        iconClass: "fas fa-star",
        condition: "item.system.canImprove && !item.system.data.improveFlag",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    SUCCESSTEST: {
        id: "successTest",
        name: "Success Test",
        iconClass: "fas fa-person",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTSTART: {
        id: "opposedTestStart",
        name: "Opposed Test Start",
        iconClass: "fas fa-arrow-down-left-and-arrow-up-right-to-center",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    SHOCKTEST: {
        id: "shockTest",
        name: "Shock Test",
        iconClass: "far fa-face-eyes-xmarks",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    STUMBLETEST: {
        id: "stumbleTest",
        name: "Stumble Test",
        iconClass: "far fa-person-falling",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FUMBLETEST: {
        id: "fumbleTest",
        name: "Fumble Test",
        iconClass: "far fa-ball-pile",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        id: "moraleTest",
        name: "Morale Test",
        iconClass: "far fa-people-group",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        id: "fearTest",
        name: "Fear Test",
        iconClass: "far fa-face-scream",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TRANSMITAFFLICTION: {
        id: "transmitAffliction",
        name: "Transmit Affliction",
        iconClass: "fas fa-head-side-cough",
        condition: "item.system.canTransmit",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        id: "contractAfflictionTest",
        name: "Contract Affliction Test",
        iconClass: "fas fa-virus",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        id: "courseTest",
        name: "Course Test",
        iconClass: "fas fa-heart-pulse",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        id: "fatigueTest",
        name: "Fatigue Test",
        iconClass: "fas fa-face-downcast-sweat",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        id: "treatmentTest",
        name: "Treatment Test",
        iconClass: "fas fa-staff-snake",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        id: "diagnosisTest",
        name: "Diagnosis Test",
        iconClass: "fas fa-stethoscope",
        condition: "item.system.data.isTreated",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: "healingTest",
        name: "Healing Test",
        iconClass: "fas fa-heart-pulse",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    BLEEDINGSTOPPAGETEST: {
        id: "bleedingStoppageTest",
        name: "Bleeding Stoppage Test",
        iconClass: "fas fa-droplet-slash",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    BLOODLOSSADVANCETEST: {
        id: "bloodlossAdvanceTest",
        name: "Bloodloss Advance Test",
        iconClass: "fas fa-droplet",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTRESUME: {
        id: "opposedTestResume",
        name: "Opposed Test Resume",
        iconClass: "fas fa-people-arrows",
        condition: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    RESOLVEIMPACT: {
        id: "resolveImpact",
        name: "Resolve Impact",
        iconClass: "fas fa-person-burst",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    BLOCK: {
        id: "blockTest",
        name: "Block Test",
        iconClass: "fas fa-shield",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    COUNTERSTRIKE: {
        id: "counterstrikeTest",
        name: "Counterstrike Test",
        iconClass: "fas fa-circle-half-stroke",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DODGE: {
        id: "dodgeTest",
        name: "Dodge Test",
        iconClass: "fas fa-person-walking-arrow-loop-left",
        // FIXME: original walked actor.items.find for a usable "Dodge" skill;
        // reduce to "true" until SafeExpression supports collection iteration.
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    IGNORE: {
        id: "ignore",
        name: "Ignore",
        iconClass: "fas fa-ban",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMELEE: {
        id: "autoCombatMelee",
        name: "Auto Combat Melee",
        iconClass: "fas fa-swords",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMISSILE: {
        id: "autoCombatMissile",
        name: "Auto Combat Missile",
        iconClass: "fas fa-bow-arrow",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    MISSILEATTACK: {
        id: "missileAttackTest",
        name: "Missile Attack Test",
        iconClass: "fas fa-bow-arrow",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    MELEEATTACK: {
        id: "meleeAttackTest",
        name: "Melee Attack Test",
        iconClass: "fas fa-sword",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<SohlContextMenu.Entry>);
export type TestType = (typeof TEST_TYPE)[keyof typeof TEST_TYPE]["id"];

export const SOHL_DEFAULT_CALENDAR_CONFIG = {
    name: "Turning Wheel",
    description: "The Turning Wheel calendar for Song of Heroic Lands.",
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
                name: "SOHL.Calendar.Default.Month.0.label",
                abbreviation: "SOHL.Calendar.Default.Month.0.abbr",
                ordinal: 1,
                days: 30,
            },
            // Blossomreach, Blo, Flowers and bees return
            {
                name: "SOHL.Calendar.Default.Month.1.label",
                abbreviation: "SOHL.Calendar.Default.Month.1.abbr",
                ordinal: 2,
                days: 30,
            },
            // Greengold, Grn, Young crops rise
            {
                name: "SOHL.Calendar.Default.Month.2.label",
                abbreviation: "SOHL.Calendar.Default.Month.2.abbr",
                ordinal: 3,
                days: 30,
            },
            // Highsun, Sun, The sun’s zenith; labor in full swing
            {
                name: "SOHL.Calendar.Default.Month.3.label",
                abbreviation: "SOHL.Calendar.Default.Month.3.abbr",
                ordinal: 4,
                days: 30,
            },
            // Midsummer, Mid, Festivals, First fruits
            {
                name: "SOHL.Calendar.Default.Month.4.label",
                abbreviation: "SOHL.Calendar.Default.Month.4.abbr",
                ordinal: 5,
                days: 30,
            },
            // Hayfall, Hay, Preparation for harvest
            {
                name: "SOHL.Calendar.Default.Month.5.label",
                abbreviation: "SOHL.Calendar.Default.Month.5.abbr",
                ordinal: 6,
                days: 30,
            },
            // Reapmoon, Rep, The main harvest
            {
                name: "SOHL.Calendar.Default.Month.6.label",
                abbreviation: "SOHL.Calendar.Default.Month.6.abbr",
                ordinal: 7,
                days: 30,
            },
            // Emberwane, Emb, Smoke in the fields, turning leaves
            {
                name: "SOHL.Calendar.Default.Month.7.label",
                abbreviation: "SOHL.Calendar.Default.Month.7.abbr",
                ordinal: 8,
                days: 30,
            },
            // Fallmere, Fal, Final gathering before cold
            {
                name: "SOHL.Calendar.Default.Month.8.label",
                abbreviation: "SOHL.Calendar.Default.Month.8.abbr",
                ordinal: 9,
                days: 30,
            },
            // Frostwane, Frs, First frosts, fading light, herds brought in
            {
                name: "SOHL.Calendar.Default.Month.9.label",
                abbreviation: "SOHL.Calendar.Default.Month.9.abbr",
                ordinal: 10,
                days: 30,
            },
            // Snorest, Sno, Deep winter, Quiet, hearth, mending tools
            {
                name: "SOHL.Calendar.Default.Month.10.label",
                abbreviation: "SOHL.Calendar.Default.Month.10.abbr",
                ordinal: 11,
                days: 30,
            },
            // Thawrise, Tha, Snows melt, life stirs, hope returns
            {
                name: "SOHL.Calendar.Default.Month.11.label",
                abbreviation: "SOHL.Calendar.Default.Month.11.abbr",
                ordinal: 12,
                days: 30,
            },
        ],
    },
    days: {
        values: [
            {
                name: "SOHL.Calendar.Default.Weekday.0.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.0.abbr",
                ordinal: 1,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.1.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.1.abbr",
                ordinal: 2,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.2.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.2.abbr",
                ordinal: 3,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.3.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.3.abbr",
                ordinal: 4,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.4.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.4.abbr",
                ordinal: 5,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.5.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.5.abbr",
                ordinal: 6,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.6.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.6.abbr",
                ordinal: 7,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.7.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.7.abbr",
                ordinal: 8,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.8.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.8.abbr",
                ordinal: 9,
            },
            {
                name: "SOHL.Calendar.Default.Weekday.9.label",
                abbreviation: "SOHL.Calendar.Default.Weekday.9.abbr",
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
                name: "SOHL.Calendar.Default.Season.0.label",
                monthStart: 1,
                monthEnd: 3,
            },
            {
                name: "SOHL.Calendar.Default.Season.1.label",
                monthStart: 4,
                monthEnd: 6,
            },
            {
                name: "SOHL.Calendar.Default.Season.2.label",
                monthStart: 7,
                monthEnd: 9,
            },
            {
                name: "SOHL.Calendar.Default.Season.3.label",
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
