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
// Type-only imports (erased at runtime) so this stays a dependency-free leaf
// module that both the branded classes and their consumers can import.
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import type { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import type {
    ItemLogicByKind,
    ActorLogicByKind,
} from "@src/core/foundry/sohl-config";
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import type { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
/** Persisted property key that records a data model's discriminator kind. */
export const KIND_KEY = "__kind" as const;
/** Persisted property key that records a data model's schema version. */
export const SCHEMA_VERSION_KEY: string = "__schemaVer" as const;

/**
 * Runtime type brands — an `instanceof` replacement for the cases where an
 * `instanceof` value-import would form a module cycle, or where a check must
 * match a whole subtype hierarchy.
 *
 * Each brand is a module-scoped `Symbol()` (not `Symbol.for`, whose global
 * string key would reopen the spoof door): un-spoofable, collision-free, and
 * invisible to `Object.keys` / `JSON.stringify` / spread (so it never leaks
 * into serialized data). A class attaches its brand with an inherited getter —
 * `get [BRAND.SohlLogic]() { return true; }` — so every subtype at any depth
 * carries it, and a class can carry its ancestors' brands too.
 *
 * Populate this lazily: a brand is only worth adding where the serializable
 * `data.kind` / `.kind` discriminants can't serve. See {@link isA}.
 */
export interface BrandType extends ItemLogicByKind, ActorLogicByKind {
    SohlLogic: SohlLogic<any>;
    SohlItemLogic: SohlItemLogic<any>;
    SohlActorLogic: SohlActorLogic<any>;
    SohlCombatantLogic: SohlCombatantLogic<any>;
    SohlTokenDocumentLogic: SohlTokenDocumentLogic;
}

/**
 * Symbol brands for the cycle-forced base types only — those an `instanceof`
 * value-import can't reach without forming a module cycle. Item/actor kinds are
 * **not** here: they are matched by their serializable `.kind` discriminant in
 * {@link isA} (no cycle, and a Symbol would buy only un-spoofability, which is
 * meaningless for a kind). Module-scoped `Symbol()`, never an own/serialized
 * property when attached via an inherited getter.
 */
export const BRAND = {
    SohlLogic: Symbol("SohlLogic"),
    SohlItemLogic: Symbol("SohlItemLogic"),
    SohlActorLogic: Symbol("SohlActorLogic"),
    SohlCombatantLogic: Symbol("SohlCombatantLogic"),
    SohlTokenDocumentLogic: Symbol("SohlTokenDocumentLogic"),
};

/**
 * Narrowing type guard: is `x` of the type keyed by `key`? Pass a
 * {@link BrandType} key — a base-type name (`"SohlLogic"`) or a kind value
 * (`ITEM_KIND.SKILL` / `ACTOR_KIND.BEING`, which narrow because `defineType`
 * preserves literals). Base types are matched by their {@link BRAND} Symbol;
 * item/actor kinds by the logic's `.kind` discriminant.
 *
 * @param x - The value to test.
 * @param key - The brand/kind key (a {@link BrandType} key).
 * @returns Whether `x` matches `key`, narrowing `x` to `BrandType[key]`.
 */
export function isA<K extends keyof BrandType>(
    x: unknown,
    key: K,
): x is BrandType[K] {
    const o = x as { kind?: unknown; [k: symbol]: unknown } | null | undefined;
    const brand = (BRAND as Partial<Record<keyof BrandType, symbol>>)[key];
    return brand !== undefined ? !!o?.[brand] : o?.kind === key;
}

/** Unicode glyphs used in formatted output (×, ≥, ≤, ∞, ★, ☆). */
export const SYMBOL: StrictObject<string> = {
    TIMES: String.fromCharCode(0x00d7),
    GREATERTHANOREQUAL: String.fromCodePoint(0x2265),
    LESSTHANOREQUAL: String.fromCodePoint(0x2264),
    INFINITY: String.fromCodePoint(0x221e),
    STARF: String.fromCharCode(0x2605),
    STAR: String.fromCharCode(0x2606),
    EMDASH: String.fromCharCode(0x2014),
};

export const {
    /** Map of log-level key → value. */
    kind: LOGLEVEL,
    /** All log-level values, as an array. */
    values: LogLevels,
    /** Type guard for log-level values. */
    isValue: isLogLevel,
} = defineType("SOHL.Logger.LogLevel", {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
});
/** Union of all log-level values. */
export type LogLevel = (typeof LOGLEVEL)[keyof typeof LOGLEVEL];

export const {
    /** Map of item-kind key → value. */
    kind: ITEM_KIND,
    /** All item-kind values, as an array. */
    values: ItemKinds,
    /** Type guard for item-kind values. */
    isValue: isItemKind,
    /** Localization keys per item kind. */
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
/** Union of all item-kind values. */
export type ItemKind = (typeof ITEM_KIND)[keyof typeof ITEM_KIND];

export const {
    /** Map of domain-family key → value. */
    kind: DOMAIN_FAMILY,
    /** All domain-family values, as an array. */
    values: DomainFamilies,
    /** Type guard for domain-family values. */
    isValue: isDomainFamily,
    /** Localization keys per domain family. */
    labels: domainFamilyLabels,
} = defineType("SOHL.Domain.FAMILY", {
    ARCANE: "arcane", // schools of magic, elements
    DIVINE: "divine", // deities, divine aspects
    RELIGION: "religion", // faiths, sects, cults — usually parented to a deity
    SPIRIT: "spirit", // totems, ancestor spirits
    ASTRAL: "astral", // birthsigns
    NATURAL: "natural", // geology, mathematics, biology, etc.
});
/** Union of all domain-family values. */
export type DomainFamily = (typeof DOMAIN_FAMILY)[keyof typeof DOMAIN_FAMILY];

export const {
    /** Map of actor-kind key → value. */
    kind: ACTOR_KIND,
    /** All actor-kind values, as an array. */
    values: ActorKinds,
    /** Type guard for actor-kind values. */
    isValue: isActorKind,
    /** Localization keys per actor kind. */
    labels: actorKindLabels,
} = defineType("TYPES.Actor", {
    BEING: "being",
    ASSEMBLY: "assembly",
    COHORT: "cohort",
    STRUCTURE: "structure",
    VEHICLE: "vehicle",
});
/** Union of all actor-kind values. */
export type ActorKind = (typeof ACTOR_KIND)[keyof typeof ACTOR_KIND];

export const {
    /** Map of item kind → display metadata (icon, image, key choices). */
    kind: ITEM_METADATA,
    /** All item-metadata entries, as an array. */
    values: ItemMetadatas,
    /** Type guard for item-metadata entries. */
    isValue: isItemMetadata,
    /** Localization keys per item-metadata entry. */
    labels: itemMetadataLabels,
} = defineType(`SOHL.Item.METADATA`, {
    [ITEM_KIND.AFFILIATION]: {
        IconCssClass: "sohl-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.AFFLICTION]: {
        IconCssClass: "sohl-oppression",
        Image: "systems/sohl/assets/icons/oppression.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.ARMORGEAR]: {
        IconCssClass: "sohl-armor",
        Image: "systems/sohl/assets/icons/armor.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.ATTRIBUTE]: {
        IconCssClass: "sohl-user-gear",
        Image: "systems/sohl/assets/icons/user-gear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.COMBATTECHNIQUE]: {
        IconCssClass: "sohl-punch",
        Image: "systems/sohl/assets/icons/punch.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.CONCOCTIONGEAR]: {
        IconCssClass: "sohl-potion",
        Image: "systems/sohl/assets/icons/potion.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.CONTAINERGEAR]: {
        IconCssClass: "sohl-sack",
        Image: "systems/sohl/assets/icons/sack.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.TRAUMA]: {
        IconCssClass: "sohl-injury",
        Image: "systems/sohl/assets/icons/injury.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.LINEAGE]: {
        IconCssClass: "sohl-body",
        Image: "systems/sohl/assets/icons/body.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MISCGEAR]: {
        IconCssClass: "sohl-miscgear",
        Image: "systems/sohl/assets/icons/miscgear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTERY]: {
        IconCssClass: "sohl-sparkles",
        Image: "systems/sohl/assets/icons/sparkles.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.MYSTICALABILITY]: {
        IconCssClass: "sohl-hand-sparkles",
        Image: "systems/sohl/assets/icons/hand-sparkles.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.PROJECTILEGEAR]: {
        IconCssClass: "sohl-arrow",
        Image: "systems/sohl/assets/icons/arrow.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.SKILL]: {
        IconCssClass: "sohl-head-gear",
        Image: "systems/sohl/assets/icons/head-gear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.TRAIT]: {
        IconCssClass: "sohl-user-gear",
        Image: "systems/sohl/assets/icons/user-gear.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ITEM_KIND.WEAPONGEAR]: {
        IconCssClass: "sohl-sword",
        Image: "systems/sohl/assets/icons/sword.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
});
/** Union of all item-metadata entries. */
export type ItemMetadata = (typeof ITEM_METADATA)[keyof typeof ITEM_METADATA];

// Compile-time check: ensure every ItemKind has an ITEM_METADATA entry.
// If there is an ItemKind without metadata, this line will fail to type-check.
const _ensureItemMetadataCoversAllKinds: Record<ItemKind, unknown> =
    ITEM_METADATA;

export const {
    /** Map of actor kind → display metadata (icon, image, key choices). */
    kind: ACTOR_METADATA,
    /** All actor-metadata entries, as an array. */
    values: ActorMetadatas,
    /** Type guard for actor-metadata entries. */
    isValue: isActorMetadata,
    /** Localization keys per actor-metadata entry. */
    labels: actorMetadataLabels,
} = defineType(`SOHL.Actor.METADATA`, {
    [ACTOR_KIND.BEING]: {
        IconCssClass: "sohl-person",
        Image: "systems/sohl/assets/icons/person.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.ASSEMBLY]: {
        IconCssClass: "sohl-stack",
        Image: "systems/sohl/assets/icons/stack.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.COHORT]: {
        IconCssClass: "sohl-people-group",
        Image: "systems/sohl/assets/icons/people-group.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.STRUCTURE]: {
        IconCssClass: "sohl-home",
        Image: "systems/sohl/assets/icons/home.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
    [ACTOR_KIND.VEHICLE]: {
        IconCssClass: "sohl-old-wagon",
        Image: "systems/sohl/assets/icons/old-wagon.svg",
        KeyChoices: [] as StrictObject<string>[],
    },
});
/** Union of all actor-metadata entries. */
export type ActorMetadata =
    (typeof ACTOR_METADATA)[keyof typeof ACTOR_METADATA];

export const {
    /** Map of reaction key → value. */
    kind: REACTION,
    /** All reaction values, as an array. */
    values: Reactions,
    /** Type guard for reaction values. */
    isValue: isReaction,
    /** Localization keys per reaction. */
    labels: reactionLabels,
} = defineType("SOHL.Actor.REACTION", {
    HOSTILE: "hostile",
    FRIENDLY: "friendly",
    NEUTRAL: "neutral",
});
/** Union of all reaction values. */
export type Reaction = (typeof REACTION)[keyof typeof REACTION];

export const {
    /** Map of movement-medium key → value. */
    kind: MOVEMENT_MEDIUM,
    /** All movement-medium values, as an array. */
    values: MovementMediums,
    /** Type guard for movement-medium values. */
    isValue: isMovementMedium,
    /** Localization keys per movement medium. */
    labels: movementMediumLabels,
} = defineType("SOHL.MovementMedium", {
    TERRESTRIAL: "terrestrial",
    AQUATIC: "aquatic",
    AERIAL: "aerial",
    BURROWING: "burrowing",
    ASTRAL: "astral",
});
/** Union of all movement-medium values. */
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
    /** Map of bleeding-susceptibility key → value. */
    kind: BLEEDING_SUSCEPTIBILITY,
    /** All bleeding-susceptibility values, as an array. */
    values: BleedingSusceptibilities,
    /** Type guard for bleeding-susceptibility values. */
    isValue: isBleedingSusceptibility,
    /** Localization keys per bleeding-susceptibility tier. */
    labels: bleedingSusceptibilityLabels,
} = defineType("SOHL.BleedingSusceptibility", {
    NONE: "none",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
});
/** Union of all bleeding-susceptibility values. */
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
    /** Map of amputability key → value. */
    kind: AMPUTABILITY,
    /** All amputability values, as an array. */
    values: Amputabilities,
    /** Type guard for amputability values. */
    isValue: isAmputability,
    /** Localization keys per amputability tier. */
    labels: amputabilityLabels,
} = defineType("SOHL.Amputability", {
    NONE: "none",
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
});
/** Union of all amputability values. */
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
    /** Map of body-role key → value. */
    kind: BODY_ROLE,
    /** All body-role values, as an array. */
    values: BodyRoles,
    /** Type guard for body-role values. */
    isValue: isBodyRole,
    /** Localization keys per body role. */
    labels: bodyRoleLabels,
} = defineType("SOHL.BodyRole", {
    VITAL: "vital",
    CORE: "core",
    MANIPULATOR: "manipulator",
    LOCOMOTOR: "locomotor",
});
/** Union of all body-role values. */
export type BodyRole = (typeof BODY_ROLE)[keyof typeof BODY_ROLE];

export const {
    /** Map of cohort-member-role key → value. */
    kind: COHORT_MEMBER_ROLE,
    /** All cohort-member-role values, as an array. */
    values: CohortMemberRoles,
    /** Type guard for cohort-member-role values. */
    isValue: isCohortMemberRole,
    /** Localization keys per cohort member role. */
    labels: cohortMemberRoleLabels,
} = defineType("SOHL.Cohort.MemberRole", {
    DIRECTOR: "director",
    MEMBER: "member",
    SUBORDINATE: "subordinate",
});
/** Union of all cohort-member-role values. */
export type CohortMemberRole =
    (typeof COHORT_MEMBER_ROLE)[keyof typeof COHORT_MEMBER_ROLE];

export const {
    /** Map of gear-kind key → value. */
    kind: GEAR_KIND,
    /** All gear-kind values, as an array. */
    values: GearKinds,
    /** Type guard for gear-kind values. */
    isValue: isGearKind,
    /** Localization keys per gear kind. */
    labels: gearKindLabels,
} = defineType(`SOHL.Gear.GEAR_KIND`, {
    ARMOR: "armorgear",
    WEAPON: "weapongear",
    PROJECTILE: "projectilegear",
    CONCOCTION: "concoctiongear",
    CONTAINER: "containergear",
    MISC: "miscgear",
});
/** Union of all gear-kind values. */
export type GearKind = (typeof GEAR_KIND)[keyof typeof GEAR_KIND];

export const {
    /** Map of value-delta info-flag key → shortcode. */
    kind: VALUE_DELTA_INFO,
    /** All value-delta info-flag shortcodes, as an array. */
    values: ValueDeltaInfos,
    /** Type guard for value-delta info-flag shortcodes. */
    isValue: isValueDeltaInfo,
} = defineType("SOHL.ValueDelta.INFO", {
    DISABLED: "Dsbl",
    NOMSLDEF: "NoMslDef",
    NOMODIFIERNODIE: "NMND",
    NOBLOCK: "NoBlk",
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
/** Union of all value-delta info-flag shortcodes. */
export type ValueDeltaInfo =
    (typeof VALUE_DELTA_INFO)[keyof typeof VALUE_DELTA_INFO];
/** Map of value-delta info shortcode → its localization name and shortcode. */
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
    /** Map of value-delta operator key → value. */
    kind: VALUE_DELTA_OPERATOR,
    /** All value-delta operator values, as an array. */
    values: ValueDeltaOperators,
    /** Type guard for value-delta operator values. */
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
/** Union of all value-delta operator values. */
export type ValueDeltaOperator =
    (typeof VALUE_DELTA_OPERATOR)[keyof typeof VALUE_DELTA_OPERATOR];
/** A value a delta may carry: a number or a boolean-as-string. */
export type ValueDeltaValue = string | number;
/**
 * Type guard for {@link ValueDeltaValue}.
 * @param value - The value to test.
 * @returns `true` if `value` is a number or the string `"true"`/`"false"`.
 */
export function isValueDeltaValue(value: unknown): value is ValueDeltaValue {
    return (
        typeof value === "number" ||
        (typeof value === "string" && ["true", "false"].includes(value))
    );
}

export const {
    /** Map of tactical-advantage key → value. */
    kind: TACTICAL_ADVANTAGES,
    /** All tactical-advantage values, as an array. */
    values: tacticalAdvantages,
    /** Type guard for tactical-advantage values. */
    isValue: isTacticalAdvantage,
} = defineType("SOHL.AttackResult.TacticalAdvantage", {
    IMPACT: "impact",
    PRECISION: "precision",
    ACTION: "action",
    SETUP: "setup",
});
/** Union of all tactical-advantage values. */
export type TacticalAdvantage =
    (typeof TACTICAL_ADVANTAGES)[keyof typeof TACTICAL_ADVANTAGES];

/** Success-test outcome tier, as a signed integer level. */
export type SuccessLevel = number;
/** Critical-failure success level (−1). */
export const CRITICAL_FAILURE: SuccessLevel = -1;
/** Marginal-failure success level (0). */
export const MARGINAL_FAILURE: SuccessLevel = 0;
/** Marginal-success success level (1). */
export const MARGINAL_SUCCESS: SuccessLevel = 1;
/** Critical-success success level (2). */
export const CRITICAL_SUCCESS: SuccessLevel = 2;

export const {
    /** Map of success-test mishap key → value. */
    kind: SUCCESS_TEST_RESULT_MISHAP,
    /** All success-test mishap values, as an array. */
    values: SuccessTestResultMishaps,
    /** Type guard for success-test mishap values. */
    isValue: isSuccessTestResultMishap,
} = defineType("SOHL.SuccessTestResult.Mishap", {
    MISFIRE: "misfire",
});
/** Union of all success-test mishap values. */
export type SuccessTestResultMishap =
    (typeof SUCCESS_TEST_RESULT_MISHAP)[keyof typeof SUCCESS_TEST_RESULT_MISHAP];

export const {
    /** Map of attack-mishap key → value. */
    kind: ATTACK_MISHAP,
    /** All attack-mishap values, as an array. */
    values: AttackMishaps,
    /** Type guard for attack-mishap values. */
    isValue: isAttackMishap,
} = defineType("SOHL.AttackResult.Mishap", {
    STUMBLE_TEST: "stumbletest",
    STUMBLE: "stumble",
    FUMBLE_TEST: "fumbletest",
    FUMBLE: "fumble",
    WEAPON_BREAK: "weaponBreak",
    MISSILE_MISFIRE: "missileMisfire",
});
/** Union of all attack-mishap values. */
export type AttackMishap = (typeof ATTACK_MISHAP)[keyof typeof ATTACK_MISHAP];

export const {
    /** Map of defend-mishap key → value. */
    kind: DEFEND_MISHAP,
    /** All defend-mishap values, as an array. */
    values: DefendResultMishaps,
    /** Type guard for defend-mishap values. */
    isValue: isDefendResultMishap,
} = defineType("SOHL.DefendResult.DefendMishap", {
    STUMBLE_TEST: "stumbletest",
    STUMBLE: "stumble",
    FUMBLE_TEST: "fumbletest",
    FUMBLE: "fumble",
    WEAPON_BREAK: "weaponBreak",
});
/** Union of all defend-mishap values. */
export type DefendResultMishap =
    (typeof DEFEND_MISHAP)[keyof typeof DEFEND_MISHAP];

export const {
    /** Map of success-test movement key → value. */
    kind: SUCCESS_TEST_RESULT_MOVEMENT,
    /** All success-test movement values, as an array. */
    values: SuccessTestResultMovements,
    /** Type guard for success-test movement values. */
    isValue: isSuccessTestResultMovement,
} = defineType("SOHL.SuccessTestResult.Movement", {
    STATIONARY: "stationary",
    MOVING: "moving",
});
/** Union of all success-test movement values. */
export type SuccessTestResultMovement =
    (typeof SUCCESS_TEST_RESULT_MOVEMENT)[keyof typeof SUCCESS_TEST_RESULT_MOVEMENT];

export const {
    /** Map of speaker roll-mode key → value. */
    kind: SOHL_SPEAKER_ROLL_MODE,
    /** All speaker roll-mode values, as an array. */
    values: SohlSpeakerRollModes,
    /** Type guard for speaker roll-mode values. */
    isValue: isSohlSpeakerRollMode,
} = defineType("SOHL.SohlSpeaker.ROLL_MODE", {
    SYSTEM: "roll",
    PUBLIC: "publicroll",
    SELF: "selfroll",
    BLIND: "blindroll",
    PRIVATE: "gmroll",
});
/** Union of all speaker roll-mode values. */
export type SohlSpeakerRollMode =
    (typeof SOHL_SPEAKER_ROLL_MODE)[keyof typeof SOHL_SPEAKER_ROLL_MODE];

export const {
    /** Map of speaker chat-style key → value. */
    kind: SOHL_SPEAKER_STYLE,
    /** All speaker chat-style values, as an array. */
    values: SohlSpeakerStyles,
    /** Type guard for speaker chat-style values. */
    isValue: isSohlSpeakerStyle,
} = defineType("SOHL.SohlSpeaker.STYLE", {
    OTHER: 0,
    OUT_OF_CHARACTER: 1,
    IN_CHARACTER: 2,
    EMOTE: 3,
});
/** Union of all speaker chat-style values. */
export type SohlSpeakerStyle =
    (typeof SOHL_SPEAKER_STYLE)[keyof typeof SOHL_SPEAKER_STYLE];

export const {
    /** Map of speaker sound key → audio file path. */
    kind: SOHL_SPEAKER_SOUND,
    /** All speaker sound paths, as an array. */
    values: SohlSpeakerSounds,
    /** Type guard for speaker sound paths. */
    isValue: isSohlSpeakerSound,
} = defineType("SOHL.SohlSpeaker.SOUND", {
    DICE: "sounds/dice.wav",
    LOCK: "sounds/lock.wav",
    NOTIFICATION: "sounds/notify.wav",
    COMBAT: "sounds/drums.wav",
});
/** Union of all speaker sound paths. */
export type SohlSpeakerSound =
    (typeof SOHL_SPEAKER_SOUND)[keyof typeof SOHL_SPEAKER_SOUND];

export const {
    /** Map of status-effect key → value. */
    kind: STATUS_EFFECT,
    /** All status-effect values, as an array. */
    values: StatusEffects,
    /** Type guard for status-effect values. */
    isValue: isStatusEffect,
} = defineType("SOHL.StatusEffect", {
    DEAD: "dead",
    UNCONSCIOUS: "unconscious",
    SLEEP: "sleep",
    STUN: "stun",
    PRONE: "prone",
    RESTRAINED: "restrain",
    PARALYZED: "paralysis",
    FLYING: "fly",
    BLIND: "blind",
    DEAF: "deaf",
    EVADING: "evade",
    SILENCED: "silence",
    FEARFUL: "fear",
    BURNING: "burning",
    FROZEN: "frozen",
    SHOCKED: "shock",
    CORRODED: "corrode",
    BLEEDING: "bleeding",
    DISEASED: "disease",
    POISONED: "poison",
    CURSED: "curse",
    REGENERATING: "regen",
    DEGENERATING: "degen",
    HOVERING: "hover",
    BURROWING: "burrow",
    UPGRADING: "upgrade",
    DOWNGRADING: "downgrade",
    TARGETED: "target",
    VISIBLE: "eye",
    BLESSED: "bless",
    FIRE_SHIELD: "fireShield",
    COLD_SHIELD: "coldShield",
    MAGIC_SHIELD: "magicShield",
    HOLY_SHIELD: "holyShield",
    INCAPACITATED: "incapacitated",
    VANQUISHED: "vanquished",
    AURAL_SHOCK: "auralshock",
});
/** Union of all status-effect values. */
export type StatusEffect = (typeof STATUS_EFFECT)[keyof typeof STATUS_EFFECT];

export const {
    /** Map of opposed-test tie-break key → value. */
    kind: OPPOSED_TEST_RESULT_TIEBREAK,
    /** All opposed-test tie-break values, as an array. */
    values: OpposedTestResultTieBreaks,
    /** Type guard for opposed-test tie-break values. */
    isValue: isOpposedTestResultTieBreak,
} = defineType("SOHL.OpposedTestResult.TieBreak", {
    SOURCE: 1,
    NONE: 0,
    TARGET: -1,
});
/** Union of all opposed-test tie-break values. */
export type OpposedTestResultTieBreak =
    (typeof OPPOSED_TEST_RESULT_TIEBREAK)[keyof typeof OPPOSED_TEST_RESULT_TIEBREAK];

export const {
    /** Map of impact-aspect key → value. */
    kind: IMPACT_ASPECT,
    /** All impact-aspect values, as an array. */
    values: ImpactAspects,
    /** Type guard for impact-aspect values. */
    isValue: isImpactAspect,
} = defineType("SOHL.ImpactModifier.Aspect", {
    BLUNT: "blunt",
    EDGED: "edged",
    PIERCING: "piercing",
    FIRE: "fire",
});
/** Union of all impact-aspect values. */
export type ImpactAspect = (typeof IMPACT_ASPECT)[keyof typeof IMPACT_ASPECT];

/** Single-character abbreviation for each impact aspect (b/e/p/f). */
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
    /** Map of context-menu sort-group key → value. */
    kind: SOHL_CONTEXT_MENU_SORT_GROUP,
    /** All context-menu sort-group values, as an array. */
    values: SohlContextMenuSortGroups,
    /** Type guard for context-menu sort-group values. */
    isValue: isSohlContextMenuSortGroup,
} = defineType("SOHL.ContextMenu.SortGroup", {
    DEFAULT: "default",
    ESSENTIAL: "essential",
    GENERAL: "general",
    HIDDEN: "hidden",
});
/** Union of all context-menu sort-group values. */
export type SohlContextMenuSortGroup =
    (typeof SOHL_CONTEXT_MENU_SORT_GROUP)[keyof typeof SOHL_CONTEXT_MENU_SORT_GROUP];
/**
 * Coerce an arbitrary string to a valid context-menu sort group.
 * @param group - The candidate sort-group string.
 * @returns The matching sort group, or `DEFAULT` if unrecognized.
 */
export function toSohlContextMenuSortGroup(
    group: string,
): SohlContextMenuSortGroup {
    if (isSohlContextMenuSortGroup(group)) return group;
    return SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
}

export const {
    /** Map of attribute effect-key name → change path. */
    kind: ATTRIBUTE_EFFECT_KEY,
    /** All attribute effect-key change paths, as an array. */
    values: AttributeEffectKeys,
    /** Type guard for attribute effect-key change paths. */
    isValue: isAttributeEffectKey,
    /** Localization keys per attribute effect key. */
    labels: attributeEffectKeyLabels,
} = defineType(`SOHL.Attribute.EffectKey`, {
    SCORE: "mod:logic.score",
    MASTERY_LEVEL: "mod:logic.masteryLevel",
    FATE: "mod:logic.fateMasteryLevel",
    SUCCESS_LEVEL: "logic.masteryLevel.successLevelMod",
});
/** Union of all attribute effect-key change paths. */
export type AttributeEffectKey =
    (typeof ATTRIBUTE_EFFECT_KEY)[keyof typeof ATTRIBUTE_EFFECT_KEY];

export const {
    /** Map of affliction effect-key name → change path. */
    kind: AFFLICTION_EFFECT_KEY,
    /** All affliction effect-key change paths, as an array. */
    values: AfflictionEffectKeys,
    /** Type guard for affliction effect-key change paths. */
    isValue: isAfflictionEffectKey,
    /** Localization keys per affliction effect key. */
    labels: afflictionEffectKeyLabels,
} = defineType(`SOHL.Affliction.EffectKey`, {
    LEVEL: "mod:logic.level",
    HEALING_RATE: "mod:logic.healingRate",
    CONTAGION_INDEX: "mod:logic.contagionIndex",
    DIAGNOSIS_BONUS: "mod:logic.diagnosisBonus",
});
/** Union of all affliction effect-key change paths. */
export type AfflictionEffectKey =
    (typeof AFFLICTION_EFFECT_KEY)[keyof typeof AFFLICTION_EFFECT_KEY];

export const {
    /** Map of armor-gear effect-key name → change path. */
    kind: ARMORGEAR_EFFECT_KEY,
    /** All armor-gear effect-key change paths, as an array. */
    values: ArmorGearEffectKeys,
    /** Type guard for armor-gear effect-key change paths. */
    isValue: isArmorGearEffectKey,
    /** Localization keys per armor-gear effect key. */
    labels: armorGearEffectKeyLabels,
} = defineType(`SOHL.ArmorGear.EffectKey`, {
    WEIGHT: "mod:logic.weight",
    VALUE: "mod:logic.value",
    QUALITY: "mod:logic.quality",
    DURABILITY: "mod:logic.durability",
    ENCUMBRANCE: "mod:logic.encumbrance",
    BLUNT: "mod:logic.protection.blunt",
    EDGED: "mod:logic.protection.edged",
    PIERCING: "mod:logic.protection.piercing",
    FIRE: "mod:logic.protection.fire",
});
/** Union of all armor-gear effect-key change paths. */
export type ArmorGearEffectKey =
    (typeof ARMORGEAR_EFFECT_KEY)[keyof typeof ARMORGEAR_EFFECT_KEY];

export const {
    /** Map of combat-technique effect-key name → change path. */
    kind: COMBATTECHNIQUE_EFFECT_KEY,
    /** All combat-technique effect-key change paths, as an array. */
    values: CombatTechniqueEffectKeys,
    /** Type guard for combat-technique effect-key change paths. */
    isValue: isCombatTechniqueEffectKey,
    /** Localization keys per combat-technique effect key. */
    labels: combatTechniqueEffectKeyLabels,
} = defineType(`SOHL.CombatTechnique.EffectKey`, {
    ATTACK: "mod:logic.strikeMode.attack",
    IMPACT: "mod:logic.strikeMode.impact",
    SPREAD: "mod:logic.strikeMode.spread",
});
/** Union of all combat-technique effect-key change paths. */
export type CombatTechniqueEffectKey =
    (typeof COMBATTECHNIQUE_EFFECT_KEY)[keyof typeof COMBATTECHNIQUE_EFFECT_KEY];

export const {
    /** Map of mystery effect-key name → change path. */
    kind: MYSTERY_EFFECT_KEY,
    /** All mystery effect-key change paths, as an array. */
    values: MysteryEffectKeys,
    /** Type guard for mystery effect-key change paths. */
    isValue: isMysteryEffectKey,
    /** Localization keys per mystery effect key. */
    labels: mysteryEffectKeyLabels,
} = defineType(`SOHL.Mystery.EffectKey`, {
    LEVEL: "mod:logic.level",
    CHARGES: "mod:logic.charges.value",
    MAX_CHARGES: "mod:logic.charges.max",
});
/** Union of all mystery effect-key change paths. */
export type MysteryEffectKey =
    (typeof MYSTERY_EFFECT_KEY)[keyof typeof MYSTERY_EFFECT_KEY];

export const {
    /** Map of mystical-ability effect-key name → change path. */
    kind: MYSTICALABILITY_EFFECT_KEY,
    /** All mystical-ability effect-key change paths, as an array. */
    values: MysticalAbilityEffectKeys,
    /** Type guard for mystical-ability effect-key change paths. */
    isValue: isMysticalAbilityEffectKey,
    /** Localization keys per mystical-ability effect key. */
    labels: mysticalAbilityEffectKeyLabels,
} = defineType(`SOHL.MysticalAbility.EffectKey`, {
    MASTERY_LEVEL: "mod:logic.masteryLevel",
    SUCCESS_LEVEL: "logic.masteryLevel.successLevelMod",
    LEVEL: "mod:logic.level",
    CHARGES: "mod:logic.charges.value",
    MAX_CHARGES: "mod:logic.charges.max",
});
/** Union of all mystical-ability effect-key change paths. */
export type MysticalAbilityEffectKey =
    (typeof MYSTICALABILITY_EFFECT_KEY)[keyof typeof MYSTICALABILITY_EFFECT_KEY];

export const {
    /** Map of skill effect-key name → change path. */
    kind: SKILL_EFFECT_KEYS,
    /** All skill effect-key change paths, as an array. */
    values: SkillEffectKeys,
    /** Type guard for skill effect-key change paths. */
    isValue: isSkillEffectKey,
    /** Localization keys per skill effect key. */
    labels: skillEffectKeyLabels,
} = defineType(`SOHL.Skill.EffectKey`, {
    BOOSTS: "logic.boosts",
    MASTERY_LEVEL: "mod:logic.masteryLevel",
    FATE: "mod:logic.fateMasteryLevel",
    SUCCESS_LEVEL: "logic.masteryLevel.successLevelMod",
});
/** Union of all skill effect-key change paths. */
export type SkillEffectKey =
    (typeof SKILL_EFFECT_KEYS)[keyof typeof SKILL_EFFECT_KEYS];

export const {
    /** Map of concoction-gear effect-key name → change path. */
    kind: CONCOCTIONGEAR_EFFECT_KEY,
    /** All concoction-gear effect-key change paths, as an array. */
    values: ConcoctionGearEffectKeys,
    /** Type guard for concoction-gear effect-key change paths. */
    isValue: isConcoctionGearEffectKey,
    /** Localization keys per concoction-gear effect key. */
    labels: concoctionGearEffectKeyLabels,
} = defineType(`SOHL.ConcoctionGear.EffectKey`, {
    WEIGHT: "mod:logic.weight",
    VALUE: "mod:logic.value",
    QUALITY: "mod:logic.quality",
    DURABILITY: "mod:logic.durability",
    STRENGTH: "mod:logic.strength",
});
/** Union of all concoction-gear effect-key change paths. */
export type ConcoctionGearEffectKey =
    (typeof CONCOCTIONGEAR_EFFECT_KEY)[keyof typeof CONCOCTIONGEAR_EFFECT_KEY];

export const {
    /** Map of container-gear effect-key name → change path. */
    kind: CONTAINERGEAR_EFFECT_KEY,
    /** All container-gear effect-key change paths, as an array. */
    values: ContainerGearEffectKeys,
    /** Type guard for container-gear effect-key change paths. */
    isValue: isContainerGearEffectKey,
    /** Localization keys per container-gear effect key. */
    labels: containerGearEffectKeyLabels,
} = defineType(`SOHL.ContainerGear.EffectKey`, {
    WEIGHT: "mod:logic.weight",
    VALUE: "mod:logic.value",
    QUALITY: "mod:logic.quality",
    DURABILITY: "mod:logic.durability",
    MAX_CAPACITY: "mod:logic.maxCapacity",
});
/** Union of all container-gear effect-key change paths. */
export type ContainerGearEffectKey =
    (typeof CONTAINERGEAR_EFFECT_KEY)[keyof typeof CONTAINERGEAR_EFFECT_KEY];

export const {
    /** Map of lineage effect-key name → change path. */
    kind: LINEAGE_EFFECT_KEY,
    /** All lineage effect-key change paths, as an array. */
    values: LineageEffectKeys,
    /** Type guard for lineage effect-key change paths. */
    isValue: isLineageEffectKey,
    /** Localization keys per lineage effect key. */
    labels: lineageEffectKeyLabels,
} = defineType(`SOHL.Lineage.EffectKey`, {
    BODY_WEIGHT: "mod:logic.bodyWeight",
    MOVE_TERRESTRIAL: "mod:logic.move.terrestrial",
    MOVE_AQUATIC: "mod:logic.move.aquatic",
    MOVE_AERIAL: "mod:logic.move.aerial",
    MOVE_BURROWING: "mod:logic.move.burrowing",
    MOVE_ASTRAL: "mod:logic.move.astral",
});
/** Union of all lineage effect-key change paths. */
export type LineageEffectKey =
    (typeof LINEAGE_EFFECT_KEY)[keyof typeof LINEAGE_EFFECT_KEY];

export const {
    /** Map of misc-gear effect-key name → change path. */
    kind: MISCGEAR_EFFECT_KEY,
    /** All misc-gear effect-key change paths, as an array. */
    values: MiscGearEffectKeys,
    /** Type guard for misc-gear effect-key change paths. */
    isValue: isMiscGearEffectKey,
    /** Localization keys per misc-gear effect key. */
    labels: miscGearEffectKeyLabels,
} = defineType(`SOHL.MiscGear.EffectKey`, {
    WEIGHT: "mod:logic.weight",
    VALUE: "mod:logic.value",
    QUALITY: "mod:logic.quality",
    DURABILITY: "mod:logic.durability",
});
/** Union of all misc-gear effect-key change paths. */
export type MiscGearEffectKey =
    (typeof MISCGEAR_EFFECT_KEY)[keyof typeof MISCGEAR_EFFECT_KEY];

export const {
    /** Map of projectile-gear effect-key name → change path. */
    kind: PROJECTILEGEAR_EFFECT_KEY,
    /** All projectile-gear effect-key change paths, as an array. */
    values: ProjectileGearEffectKeys,
    /** Type guard for projectile-gear effect-key change paths. */
    isValue: isProjectileGearEffectKey,
    /** Localization keys per projectile-gear effect key. */
    labels: projectileGearEffectKeyLabels,
} = defineType(`SOHL.ProjectileGear.EffectKey`, {
    WEIGHT: "mod:logic.weight",
    VALUE: "mod:logic.value",
    QUALITY: "mod:logic.quality",
    DURABILITY: "mod:logic.durability",
    IMPACT: "mod:logic.impact",
});
/** Union of all projectile-gear effect-key change paths. */
export type ProjectileGearEffectKey =
    (typeof PROJECTILEGEAR_EFFECT_KEY)[keyof typeof PROJECTILEGEAR_EFFECT_KEY];

export const {
    /** Map of trait effect-key name → change path. */
    kind: TRAIT_EFFECT_KEY,
    /** All trait effect-key change paths, as an array. */
    values: TraitEffectKeys,
    /** Type guard for trait effect-key change paths. */
    isValue: isTraitEffectKey,
    /** Localization keys per trait effect key. */
    labels: traitEffectKeyLabels,
} = defineType(`SOHL.Trait.EffectKey`, {
    SCORE: "mod:logic.score",
});
/** Union of all trait effect-key change paths. */
export type TraitEffectKey =
    (typeof TRAIT_EFFECT_KEY)[keyof typeof TRAIT_EFFECT_KEY];

export const {
    /** Map of trauma effect-key name → change path. */
    kind: TRAUMA_EFFECT_KEY,
    /** All trauma effect-key change paths, as an array. */
    values: TraumaEffectKeys,
    /** Type guard for trauma effect-key change paths. */
    isValue: isTraumaEffectKey,
    /** Localization keys per trauma effect key. */
    labels: traumaEffectKeyLabels,
} = defineType(`SOHL.Trauma.EffectKey`, {
    LEVEL: "mod:logic.level",
    HEALING_RATE: "mod:logic.healingRate",
});
/** Union of all trauma effect-key change paths. */
export type TraumaEffectKey =
    (typeof TRAUMA_EFFECT_KEY)[keyof typeof TRAUMA_EFFECT_KEY];

export const {
    /** Map of weapon-gear effect-key name → change path. */
    kind: WEAPONGEAR_EFFECT_KEY,
    /** All weapon-gear effect-key change paths, as an array. */
    values: WeaponGearEffectKeys,
    /** Type guard for weapon-gear effect-key change paths. */
    isValue: isWeaponGearEffectKey,
    /** Localization keys per weapon-gear effect key. */
    labels: weaponGearEffectKeyLabels,
} = defineType(`SOHL.WeaponGear.EffectKey`, {
    WEIGHT: "mod:logic.weight",
    VALUE: "mod:logic.value",
    QUALITY: "mod:logic.quality",
    DURABILITY: "mod:logic.durability",
    ENCUMBRANCE: "mod:logic.encumbrance",
    // Strike-mode-targeted modifier deltas. The `sm:` prefix dispatches to
    // each strike mode on the weapon matching change.strikeModePredicate.
    // Predicate variable: `sm` (the strike mode).
    SM_ATTACK: "mod:sm:attack",
    SM_IMPACT: "mod:sm:impact",
    SM_SPREAD: "mod:sm:spread",
    SM_LENGTH: "mod:sm:length",
    SM_REACH: "mod:sm:reach",
    SM_BASE_RANGE: "mod:sm:baseRange",
    SM_DRAW: "mod:sm:draw",
    SM_BLOCK: "mod:sm:defense.block",
    SM_COUNTERSTRIKE: "mod:sm:defense.counterstrike",
});
/** Union of all weapon-gear effect-key change paths. */
export type WeaponGearEffectKey =
    (typeof WEAPONGEAR_EFFECT_KEY)[keyof typeof WEAPONGEAR_EFFECT_KEY];

/**
 * Constants for the Heal Rate of an Affliction.
 */
export const AfflictionHealRate: StrictObject<number> = {
    NONE: -1,
    DEFEATED: 6,
    DEAD: 0,
} as const;

export const {
    /** Map of affliction-subtype key → value. */
    kind: AFFLICTION_SUBTYPE,
    /** All affliction-subtype values, as an array. */
    values: AfflictionSubTypes,
    /** Type guard for affliction-subtype values. */
    isValue: isAfflictionSubType,
    /** Localization keys per affliction subtype. */
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
/** Union of all affliction-subtype values. */
export type AfflictionSubType = (typeof AfflictionSubTypes)[number];

export const {
    /** Map of affliction-transmission key → value. */
    kind: AFFLICTION_TRANSMISSION,
    /** All affliction-transmission values, as an array. */
    values: AfflictionTransmissions,
    /** Type guard for affliction-transmission values. */
    isValue: isAfflictionTransmission,
    /** Localization keys per affliction transmission mode. */
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
/** Union of all affliction-transmission values. */
export type AfflictionTransmission = (typeof AfflictionTransmissions)[number];

export const {
    /** Map of fatigue-category key → value. */
    kind: FATIGUE_CATEGORY,
    /** All fatigue-category values, as an array. */
    values: FatigueCategories,
    /** Type guard for fatigue-category values. */
    isValue: isFatigueCategory,
    /** Localization keys per fatigue category. */
    labels: FatigueCategoryLabels,
} = defineType("SOHL.Affliction.FATIGUE_CATEGORY", {
    WINDEDNESS: "windedness",
    WEARINESS: "weariness",
    WEAKNESS: "weakness",
});
/** Union of all fatigue-category values. */
export type FatigueCategory =
    (typeof FATIGUE_CATEGORY)[keyof typeof FATIGUE_CATEGORY];

export const {
    /** Map of privation-category key → value. */
    kind: PRIVATION_CATEGORY,
    /** All privation-category values, as an array. */
    values: PrivationCategories,
    /** Type guard for privation-category values. */
    isValue: isPrivationCategory,
    /** Localization keys per privation category. */
    labels: PrivationCategoryLabels,
} = defineType("SOHL.Affliction.PRIVATION_CATEGORY", {
    ASPHIXIA: "asphixia",
    COLD: "cold",
    HEAT: "heat",
    STARVATION: "starvation",
    DEHYDRATION: "dehydration",
});
/** Union of all privation-category values. */
export type PrivationCategory =
    (typeof PRIVATION_CATEGORY)[keyof typeof PRIVATION_CATEGORY];

export const {
    /** Map of fear-level key → numeric value. */
    kind: FEAR_LEVEL,
    /** All fear-level numeric values, as an array. */
    values: FearLevels,
    /** Type guard for fear-level values. */
    isValue: isFearLevel,
    /** Localization keys per fear level. */
    labels: FearLevelLabels,
} = defineType("SOHL.Affliction.FEAR_LEVEL", {
    NONE: 0,
    BRAVE: 1,
    STEADY: 2,
    AFRAID: 3,
    TERRIFIED: 4,
    CATATONIC: 5,
});
/** Union of all fear-level values. */
export type FearLevel = (typeof FEAR_LEVEL)[keyof typeof FEAR_LEVEL];

export const {
    /** Map of morale-level key → numeric value. */
    kind: MORALE_LEVEL,
    /** All morale-level numeric values, as an array. */
    values: MoraleLevels,
    /** Type guard for morale-level values. */
    isValue: isMoraleLevel,
    /** Localization keys per morale level. */
    labels: MoraleLevelLabels,
} = defineType("SOHL.Affliction.MORALE_LEVEL", {
    NONE: 0,
    BRAVE: 1,
    STEADY: 2,
    WITHDRAWING: 3,
    ROUTED: 4,
    CATATONIC: 5,
});
/** Union of all morale-level values. */
export type MoraleLevel = (typeof MORALE_LEVEL)[keyof typeof MORALE_LEVEL];

export const {
    /** Map of concoction-gear subtype key → value. */
    kind: CONCOCTIONGEAR_SUBTYPE,
    /** All concoction-gear subtype values, as an array. */
    values: ConcoctionGearSubTypes,
    /** Type guard for concoction-gear subtype values. */
    isValue: isConcoctionGearSubType,
} = defineType("SOHL.ConcoctionGear.SubType", {
    MUNDANE: "mundane",
    EXOTIC: "exotic",
    ELIXIR: "elixir",
});
/** Union of all concoction-gear subtype values. */
export type ConcoctionGearSubType =
    (typeof CONCOCTIONGEAR_SUBTYPE)[keyof typeof CONCOCTIONGEAR_SUBTYPE];

export const {
    /** Map of concoction-gear potency key → value. */
    kind: CONCOCTIONGEAR_POTENCY,
    /** All concoction-gear potency values, as an array. */
    values: ConcoctionGearPotencies,
    /** Type guard for concoction-gear potency values. */
    isValue: isConcoctionGearPotency,
} = defineType("SOHL.ConcoctionGear.Potency", {
    NOT_APPLICABLE: "na",
    MILD: "mild",
    STRONG: "strong",
    GREAT: "great",
});
/** Union of all concoction-gear potency values. */
export type ConcoctionGearPotency =
    (typeof CONCOCTIONGEAR_POTENCY)[keyof typeof CONCOCTIONGEAR_POTENCY];

export const {
    /** Map of action-subtype key → value. */
    kind: ACTION_SUBTYPE,
    /** All action-subtype values, as an array. */
    values: ActionSubTypes,
    /** Type guard for action-subtype values. */
    isValue: isActionSubType,
    /** Localization keys per action subtype. */
    labels: ActionSubTypeLabels,
} = defineType("SOHL.Action.SubType", {
    INTRINSIC: "intrinsic",
    SCRIPT: "script",
});
/** Union of all action-subtype values. */
export type ActionSubType = (typeof ActionSubTypes)[number];

export const {
    /** Map of action-scope key → value. */
    kind: SOHL_ACTION_SCOPE,
    /** All action-scope values, as an array. */
    values: SohlActionScopes,
    /** Type guard for action-scope values. */
    isValue: isSohlActionScope,
} = defineType("SOHL.SohlAction.Scope", {
    SELF: "self",
    ITEM: "item",
    ACTOR: "actor",
    OTHER: "other",
});
/** Union of all action-scope values. */
export type SohlActionScope =
    (typeof SOHL_ACTION_SCOPE)[keyof typeof SOHL_ACTION_SCOPE];

export const {
    /** Map of mystery-subtype key → value. */
    kind: MYSTERY_SUBTYPE,
    /** All mystery-subtype values, as an array. */
    values: MysterySubTypes,
    /** Type guard for mystery-subtype values. */
    isValue: isMysterySubType,
} = defineType("SOHL.Mystery.SubType", {
    LEVEL: "level",
    BUFF: "buff",
    OTHER: "other",
});
/** Union of all mystery-subtype values. */
export type MysterySubType =
    (typeof MYSTERY_SUBTYPE)[keyof typeof MYSTERY_SUBTYPE];

export const {
    /** Map of mystical-ability subtype key → value. */
    kind: MYSTICALABILITY_SUBTYPE,
    /** All mystical-ability subtype values, as an array. */
    values: MysticalAbilitySubTypes,
    /** Type guard for mystical-ability subtype values. */
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
    BIRTHSIGN: "birthsign",
});
/** Union of all mystical-ability subtype values. */
export type MysticalAbilitySubType =
    (typeof MYSTICALABILITY_SUBTYPE)[keyof typeof MYSTICALABILITY_SUBTYPE];

export const {
    /** Map of projectile-gear subtype key → value. */
    kind: PROJECTILEGEAR_SUBTYPE,
    /** All projectile-gear subtype values, as an array. */
    values: ProjectileGearSubTypes,
    /** Type guard for projectile-gear subtype values. */
    isValue: isProjectileGearSubType,
} = defineType("SOHL.ProjectileGear.SubType", {
    NONE: "none",
    ARROW: "arrow",
    BOLT: "bolt",
    BULLET: "bullet",
    DART: "dart",
    OTHER: "other",
});
/** Union of all projectile-gear subtype values. */
export type ProjectileGearSubType =
    (typeof PROJECTILEGEAR_SUBTYPE)[keyof typeof PROJECTILEGEAR_SUBTYPE];

export const {
    /** Map of strike-mode-type key → value. */
    kind: STRIKE_MODE_TYPE,
    /** All strike-mode-type values, as an array. */
    values: StrikeModeTypes,
    /** Type guard for strike-mode-type values. */
    isValue: isStrikeModeType,
} = defineType("SOHL.StrikeMode.Type", {
    MELEE: "melee",
    MISSILE: "missile",
});
/** Union of all strike-mode-type values. */
export type StrikeModeType =
    (typeof STRIKE_MODE_TYPE)[keyof typeof STRIKE_MODE_TYPE];

export const {
    /** Map of skill-subtype key → value. */
    kind: SKILL_SUBTYPE,
    /** All skill-subtype values, as an array. */
    values: SkillSubTypes,
    /** Type guard for skill-subtype values. */
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
/** Union of all skill-subtype values. */
export type SkillSubType = (typeof SKILL_SUBTYPE)[keyof typeof SKILL_SUBTYPE];

export const {
    /** Map of skill-combat-category key → value. */
    kind: SKILL_COMBAT_CATEGORY,
    /** All skill-combat-category values, as an array. */
    values: SkillCombatCategories,
    /** Type guard for skill-combat-category values. */
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
/** Union of all skill-combat-category values. */
export type SkillCombatCategory =
    (typeof SKILL_COMBAT_CATEGORY)[keyof typeof SKILL_COMBAT_CATEGORY];

/**
 * Well-known skill `system.shortcode` values. The shortcode is static and
 * never localized (unlike the skill's name), so code that must locate a
 * specific skill on an actor keys off these instead of a magic string.
 */
export const {
    /** Map of skill-code key → shortcode. */
    kind: SKILL_CODE,
    /** All skill shortcodes, as an array. */
    values: SkillCodes,
    /** Type guard for skill shortcodes. */
    isValue: isSkillCode,
} = defineType("SOHL.Skill.CODE", {
    ACROBATICS: "acro",
    AGRICULTURE: "agri",
    ANIMALCRAFT: "anmcft",
    ARCHERY: "archery",
    AWARENESS: "awar",
    BOOMERANG: "bmrng",
    BREWING: "brew",
    CERAMICS: "cmcs",
    CHARM: "chrm",
    CLIMBING: "clmb",
    COMMAND: "cmd",
    COOKERY: "cook",
    DANCING: "dnce",
    DISCOURSE: "dscr",
    DODGE: "dge",
    DRAWING: "draw",
    EMBALMING: "embl",
    ENGINEERING: "eng",
    FISHING: "fish",
    FLETCHING: "fltch",
    FOLKLORE: "folklr",
    GLASSWORKING: "glas",
    GUILE: "guil",
    HERALDRY: "hrld",
    HERBLORE: "herb",
    HIDEWORKING: "hide",
    INITIATIVE: "init",
    INTRIGUE: "intr",
    JEWELCRAFT: "jewl",
    JUMPING: "jump",
    LANGUAGE: "lang",
    LAW: "law",
    LEGERDEMAIN: "lgdm",
    LOCKCRAFT: "lock",
    MASONRY: "masn",
    MATHEMATICS: "math",
    MELEE: "melee",
    MERCANTILISM: "mrcn",
    METALCRAFT: "mtlc",
    MILLING: "mill",
    MINERALOGY: "mnrl",
    MUSICIAN: "musc",
    PERFUMERY: "pfmy",
    PHYSICIAN: "pysn",
    PILOTING: "pilt",
    RIDING: "ridg",
    RITUAL: "ritual",
    RUNIC: "runic",
    SCRIPT: "script",
    SEAMANSHIP: "smsh",
    SHIPWRIGHT: "shpw",
    SHOCK: "shok",
    SINGING: "sing",
    SLING: "slng",
    STEALTH: "stlth",
    SURVIVAL: "srvl",
    SWIMMING: "swim",
    TEXTILECRAFT: "txtl",
    THEATRICS: "thtcs",
    THROWING: "thro",
    TIMBERCRAFT: "timb",
    TRACKING: "trak",
    WEAPONCRAFT: "wpnc",
    WOODWORKING: "wood",
});
/** Union of all skill shortcodes. */
export type SkillCode = (typeof SKILL_CODE)[keyof typeof SKILL_CODE];

export const {
    /** Map of attribute-code key → shortcode. */
    kind: ATTRIBUTE_CODE,
    /** All attribute shortcodes, as an array. */
    values: AttributeCodes,
    /** Type guard for attribute shortcodes. */
    isValue: isAttributeCode,
} = defineType("SOHL.Attribute.CODE", {
    AGILITY: "agl",
    AURA: "aur",
    COMELINESS: "cml",
    CREATIVITY: "cre",
    DEXTERITY: "dex",
    ELOQUENCE: "elo",
    EMPATHY: "emp",
    ENDURANCE: "end",
    MORALITY: "mor",
    PERCEPTION: "per",
    REASONING: "rea",
    STRENGTH: "str",
    VOICE: "voi",
    WILL: "wil",
});
/** Union of all attribute shortcodes. */
export type AttributeCode =
    (typeof ATTRIBUTE_CODE)[keyof typeof ATTRIBUTE_CODE];

export const {
    /** Map of affliction-code key → shortcode. */
    kind: AFFLICTION_CODE,
    /** All affliction shortcodes, as an array. */
    values: AfflictionCodes,
    /** Type guard for affliction shortcodes. */
    isValue: isAfflictionCode,
} = defineType("SOHL.Affliction.CODE", {
    ACONITE: "aconite",
    ANAEMIA: "anaemia",
    ARSENIC: "arsenic",
    ASTRAL_JOURNEYING: "astjourn",
    AURAL_SHOCK: "auralshk",
    BEE_VENOM: "beevnm",
    BELLADONNA: "bldna",
    BLACK_DEATH: "blkdth",
    BRONCHITIS: "brnchts",
    BURDEN: "burden",
    CHICKEN_POX: "chknpox",
    CHOLERA: "cholera",
    CNIDARIAN_TOXIN: "cndntxn",
    COLD_EXPOSURE: "coldexp",
    CURARE: "curare",
    CYTOTOXIN: "cytotxn",
    DEHYDRATED: "dehyd",
    DENGUE_FEVER: "dngfvr",
    DIGITALIS: "dgtls",
    DISEASED: "disd",
    ELEPHANTIASIS: "elph",
    FROSTBITTEN: "frost",
    HAULING: "haul",
    HEATSTRUCK: "htstrk",
    HEAT_EXHAUSTED: "htexh",
    HEAT_FATIGUED: "htfat",
    HEMLOCK: "hemlock",
    HEMORRHAGIC_VENOM: "hmgfvr",
    HEMOTOXIN: "hemotxn",
    HYPOGLYCEMIC: "hypgly",
    HYPOTHERMIC: "hypth",
    HYPOXIC: "hypox",
    INFECTED: "infect",
    LEISHMANIASIS: "lshmnss",
    LEPROSY: "leprosy",
    MALARIA: "malaria",
    MALNOURISHED: "malnut",
    MALNUTRITION: "mlntxn",
    MANDRAKE: "mandrk",
    MARCHING: "march",
    MEASLES: "measles",
    MELEE_FIGHTING: "fight",
    MENTAL_STRAIN: "mentstn",
    NEUROTOXIN: "nrotxn",
    PAIN: "pain",
    PHYSICAL_EXERTION: "physex",
    PNEUMONIA: "pnmna",
    POISONED: "poison",
    PONERATOXIN: "ponrtxn",
    PROTEIN_TOXIN: "prottxn",
    PSYCHOLOGICAL_DISTRESS: "psydist",
    RICIN: "ricin",
    RITUAL_INVOKING: "invk",
    RIVER_BLINDNESS: "rivrblnd",
    SLEEP_DEPRIVATION: "sleepdep",
    SMALLPOX: "smlpox",
    SPELLCASTING: "cast",
    SPIRIT_CONFLICT: "spiritcnfl",
    STARVING: "starv",
    SWELTERING: "swltr",
    TETRODOTOXIN: "tetdtxn",
    TRACHOMA: "trachoma",
    TUBERCULOSIS: "tbclos",
    TYPHOID_FEVER: "typhfvr",
    WASP_VENOM: "waspvnm",
});
/** Union of all affliction shortcodes. */
export type AfflictionCode =
    (typeof AFFLICTION_CODE)[keyof typeof AFFLICTION_CODE];

export const {
    /** Map of trait-code key → shortcode. */
    kind: TRAIT_CODE,
    /** All trait shortcodes, as an array. */
    values: TraitCodes,
    /** Type guard for trait shortcodes. */
    isValue: isTraitCode,
} = defineType("SOHL.Trait.CODE", {
    ABSENT_MINDED: "absntmd",
    ACROPHOBIA: "acrophb",
    ADAPTABLE: "adapt",
    ADVENTUROUS: "advs",
    AGGRESSIVE: "aggr",
    AGORAPHOBIA: "agorphb",
    AGREEABLE: "agree",
    ALBINISM: "albinism",
    ALFARPHOBIA: "alfrphb",
    ALLERGY: "alrgmjr",
    AMAXOPHOBIA: "amaxphb",
    AMBITIOUS: "ambx",
    ANDROPHOBIA: "andphb",
    ANTHOPHOBIA: "anthphb",
    ANTHROPOPHOBIA: "anthpphb",
    ANTISOCIAL: "antscl",
    ANXIETY: "anxiety",
    APATHETIC: "apthtc",
    APIPHOBIA: "apiphb",
    AQUAPHOBIA: "aquaphb",
    ARACHNOPHOBIA: "aracphb",
    ARROGANT: "arrogant",
    ARTHRITIS: "arthrts",
    ASSERTIVE: "assrtv",
    ASTHMA: "asthma",
    ASTRAPHOBIA: "astrphb",
    AUTHORITYOPHOBIA: "arithphb",
    AVOIDANT: "avoidant",
    BALLISTOPHOBIA: "ballphb",
    BAROPHOBIA: "barophb",
    BIBLIOPHOBIA: "biblphb",
    BIPOLAR_DISORDER: "bipolar",
    BLINDNESS: "blndnss",
    BODY_WEIGHT: "wt",
    BOTANOPHOBIA: "btnphb",
    CACOPHOBIA: "cacophb",
    CALM: "calm",
    CARDIOPHOBIA: "crdphb",
    CARRYING_CAPACITY: "cap",
    CATAGELOPHOBIA: "ctglphb",
    CATOPTROPHOBIA: "ctptrphb",
    CAULIFLOWER_EAR: "clflwrr",
    CAUTIOUS: "cautious",
    CHEMOPHOBIA: "chemophb",
    CHIROPTOPHOBIA: "chrptphb",
    CHROMOPHOBIA: "chrmphb",
    CHRONIC_ANGER: "angerchr",
    CHRONIC_FATIGUE_SYNDROME: "cfs",
    CLAUSTROPHOBIA: "clstrphb",
    CLEPTOPHOBIA: "clptphb",
    CLUBFOOT: "clubfoot",
    CODEPENDENT: "cdpndnt",
    COLD_INTOLERANCE: "coldinto",
    COMPASSIONATE: "cmpssnt",
    COMPULSIVE_DISCLOSURE: "cmpldsr",
    CONFIDENT: "cnfdnt",
    CONFORMIST: "cnfrmst",
    COULROPHOBIA: "clrphb",
    CUNNING: "cunning",
    CYNOPHOBIA: "cynophb",
    DEAFNESS: "deafness",
    DECISIVE: "decisive",
    DEMENTIA: "dementia",
    DENTOPHOBIA: "dentophb",
    DEPRESSION: "dprssn",
    DILIGENT: "diligent",
    DRAMATIC: "dramatic",
    DUERGARPHOBIA: "drgrphb",
    DWARFISM: "dwarfism",
    DYSPHONIA: "dysphn",
    DYSPHORIA: "dysphr",
    DYSTYCHIPHOBIA: "dystychi",
    ECZEMA: "eczema",
    EMETOPHOBIA: "emetophb",
    ENERGETIC: "enrgtc",
    ENIGMATIC: "engmtc",
    ENTHUSIASTIC: "enthsstc",
    ENTOMOPHOBIA: "entmphb",
    EOSOPHOBIA: "eosophb",
    EPHEBIPHOBIA: "ephbphb",
    EQUINOPHOBIA: "eqnphb",
    ERGOPHOBIA: "ergophb",
    FAVORED_PARTS: "favparts",
    FOCUSED: "focused",
    FRIGOPHOBIA: "frigophb",
    FRIVOLOUS: "frvls",
    GALEOPHOBIA: "galeophb",
    GAMOPHOBIA: "gamophb",
    GENEROUS: "generous",
    GEPHYROPHOBIA: "gphyrphb",
    GIGANTISM: "ggntsm",
    GLOSSOPHOBIA: "glssphb",
    GOAL_ORIENTED: "glrntd",
    GYNOPHOBIA: "gynophb",
    HAEMATOPHOBIA: "hmtphb",
    HEAT_INTOLERANCE: "htntlrnc",
    HELIOPHOBIA: "heliophb",
    HERPETOPHOBIA: "hrptphb",
    HOPLOPHOBIA: "hoplophb",
    HUMILITY: "humility",
    HYPERACUSIS: "hyprcss",
    HYPOCHONDRIASIS: "hypochon",
    IATROPHOBIA: "iatrophb",
    ICHTHYOPHOBIA: "ichthyop",
    IMAGINATIVE: "imgntv",
    IMPAIRED_HEARING: "impaired",
    IMPAIRED_SMELL: "impaire2",
    IMPAIRED_VISION: "imprdvsn",
    IMPULSIVE: "implsv",
    INDECISIVE: "indcsv",
    INDEPENDENT: "indpndnt",
    INDIGIPHOBIA: "indgphb",
    INNOVATIVE: "innvtv",
    INQUISITIVE: "inqstv",
    INTROVERTED: "intrvrtd",
    INTUITIVE: "inttv",
    IRRESPONSIBLE: "irrespon",
    KIND: "kind",
    KOUMPOUNOPHOBIA: "kmpnphb",
    LEPIDOPTEROPHOBIA: "lepidopt",
    LIGYROPHOBIA: "lgyrphb",
    LIMB_WEAKNESS: "lmbwknss",
    LOYAL: "loyal",
    MACHIAVELLIAN: "mchvlln",
    MEGALOMANIA: "mglmn",
    MEGALOPHOBIA: "mglphb",
    MELANOPHOBIA: "mlnphb",
    METICULOUS: "mtcls",
    MISANTHROPY: "msnthrpy",
    MONOPHOBIA: "monophb",
    MONSTRAPHOBIA: "mnstrphb",
    MORBUS_MONSTRUOSUS: "morbusmo",
    MOVE: "mov",
    MUSOPHOBIA: "musophb",
    MUTENESS: "muteness",
    NARCISSISM: "nrcsssm",
    NARCISSISTIC: "nrcssstc",
    NECROPHOBIA: "necrophb",
    NERVOUS: "nervous",
    NEUROFIBROMATOSIS: "neurofib",
    NOSOCOMEPHOBIA: "nscmphb",
    NUMBNESS: "numbness",
    NYCTOPHOBIA: "nyctophb",
    OBESITY: "obesity",
    OBSESSIVE: "obsssv",
    OMBROPHOBIA: "ombrophb",
    OPHIDIOPHOBIA: "ophdphb",
    OPTIMISM: "optimism",
    OVERACHIEVER: "ovrchvr",
    OVERCONFIDENT: "overconf",
    PARTIAL_AMNESIA: "amnsprtl",
    PASSIVE: "passive",
    PASSIVE_AGGRESSIVE: "passivea",
    PATIENT: "patient",
    PEDIOPHOBIA: "pediophb",
    PERFECTIONIST: "prfctnst",
    PESSIMISTIC: "pssmstc",
    PHAGOPHOBIA: "phagophb",
    PHOTOPHOBIA: "photophb",
    PHOTOSENSITIVITY: "photosen",
    PLAYFUL: "playful",
    POLYDACTYLY: "polydact",
    POLYPHAGIA: "plyphg",
    PRACTICAL: "prctcl",
    PRECISE: "precise",
    PTEROMERHANOPHOBIA: "pteromer",
    PTERONOPHOBIA: "ptrnphb",
    PTOCHOPHOBIA: "ptchphb",
    PYROPHOBIA: "pyrophb",
    RELIABLE: "reliable",
    RESILIENT: "rslnt",
    RESOURCEFUL: "rsrcfl",
    RESPONSIVE: "rspnsv",
    RETICENT: "reticent",
    SCHIZOPHRENIA: "schizop",
    SCOLIOSIS: "sclss",
    SEDUCER: "seducer",
    SELF_PROTECTIVE: "self-pro",
    SELF_SUFFICIENT: "self-suf",
    SENSITIVE: "snstv",
    SHORTNESS_OF_BREATH: "shrtbrth",
    SICARIOPHOBIA: "scrphb",
    SILLINESS: "sllnss",
    SIZE: "siz",
    SOCIABLE: "sociable",
    SOCIOPHOBIA: "sociophb",
    SPONTANEOUS: "spntns",
    STOIC: "stoic",
    STUBBORN: "stubborn",
    SUSPICIOUS: "sspcs",
    SYNDACTYLY: "syndacty",
    TEAM_ORIENTED: "tmrntd",
    THALASSOPHOBIA: "thlssphb",
    THANATOPHOBIA: "thntphb",
    THAUMATOPHOBIA: "thmtphb",
    THOUGHTFUL: "thghtfl",
    TINNITUS: "tinnitus",
    TOTAL_AMNESIA: "amnsttl",
    TREMORS: "tremors",
    TUROPHOBIA: "turophb",
    ULCER: "ulcer",
    VANITY: "vanity",
    VENUSTRAPHOBIA: "vnstrphb",
    VIGILANT: "vigilant",
    VITILIGO: "vitiligo",
    WATCHFUL: "watchful",
    XENOPHOBIA: "xenophb",
    ZOOPHOBIA: "zoophb",
});
/** Union of all trait shortcodes. */
export type TraitCode = (typeof TRAIT_CODE)[keyof typeof TRAIT_CODE];

export const {
    /** Map of trait-subtype key → value. */
    kind: TRAIT_SUBTYPE,
    /** All trait-subtype values, as an array. */
    values: TraitSubTypes,
    /** Type guard for trait-subtype values. */
    isValue: isTraitSubType,
} = defineType("SOHL.Trait.SubType", {
    PHYSIQUE: "physique",
    PERSONALITY: "personality",
});
/** Union of all trait-subtype values. */
export type TraitSubType = (typeof TRAIT_SUBTYPE)[keyof typeof TRAIT_SUBTYPE];

export const {
    /** Map of trauma-subtype key → value. */
    kind: TRAUMA_SUBTYPE,
    /** All trauma-subtype values, as an array. */
    values: TraumaSubTypes,
    /** Type guard for trauma-subtype values. */
    isValue: isTraumaSubType,
} = defineType("SOHL.Trauma.SubType", {
    PHYSICAL: "physical",
    MENTAL: "mental",
    SPIRITUAL: "spiritual",
    SHADOW: "shadow",
});
/** Union of all trauma-subtype values. */
export type TraumaSubType =
    (typeof TRAUMA_SUBTYPE)[keyof typeof TRAUMA_SUBTYPE];

/**
 * Injury severity levels, indexed by numeric level: `INJURY_LEVELS[0]` is
 * `"NA"` (no injury), then `M1` (1), `S2` (2), `S3` (3), `G4` (4), `G5` (5).
 * The leading letter is the severity band (Minor / Serious / Grievous) and
 * the digit is the level. Effective impact maps to a level via the bands in
 * the injury-resolution pipeline.
 */
export const INJURY_LEVELS = ["NA", "M1", "S2", "S3", "G4", "G5"] as const;

export const {
    /** Map of trait-intensity key → value. */
    kind: TRAIT_INTENSITY,
    /** All trait-intensity values, as an array. */
    values: TraitIntensities,
    /** Type guard for trait-intensity values. */
    isValue: isTraitIntensity,
} = defineType("SOHL.Trait.Intensity", {
    TRAIT: "trait",
    BENIGN: "benign",
    IMPULSE: "impulse",
    DISORDER: "disorder",
});
/** Union of all trait-intensity values. */
export type TraitIntensity =
    (typeof TRAIT_INTENSITY)[keyof typeof TRAIT_INTENSITY];

export const {
    /** Map of vehicle-occupant-role key → value. */
    kind: VEHICLE_OCCUPANT_ROLE,
    /** All vehicle-occupant-role values, as an array. */
    values: VehicleOccupantRoles,
    /** Type guard for vehicle-occupant-role values. */
    isValue: isVehicleOccupantRole,
} = defineType("SOHL.Vehicle.Occupant.Role", {
    CREW: "crew",
    PASSENGER: "passenger",
    DRAFT_CREATURE: "draftCreature",
});
/** Union of all vehicle-occupant-role values. */
export type VehicleOccupantRole =
    (typeof VEHICLE_OCCUPANT_ROLE)[keyof typeof VEHICLE_OCCUPANT_ROLE];

export const {
    /** Map of active-effect-scope key → value. */
    kind: ACTIVE_EFFECT_SCOPE,
    /** All active-effect-scope values, as an array. */
    values: ActiveEffectScopes,
    /** Type guard for active-effect-scope values. */
    isValue: isActiveEffectScope,
} = defineType("SOHL.ActiveEffect.Scope", {
    THIS: "this",
    ACTOR: "actor",
});
/** Union of all active-effect-scope values. */
export type ActiveEffectScope =
    (typeof ACTIVE_EFFECT_SCOPE)[keyof typeof ACTIVE_EFFECT_SCOPE];

/**
 * Full set of valid `scope` values on a SohlActiveEffect: the two built-ins
 * (`"this"`, `"actor"`) plus every registered item kind. Used as the
 * `choices` for the scope `StringField` so that a scope value of an item
 * kind (e.g. `"weapongear"`) is validated and the matching `*_EFFECT_KEY`
 * block can be selected for the changes UI.
 *
 * @returns The built-in scope values followed by every registered item kind.
 */
export function ActiveEffectScopeChoices(): string[] {
    return [...ActiveEffectScopes, ...ItemKinds];
}

export const {
    /** Map of test-type key → context-menu entry descriptor. */
    kind: TEST_TYPE,
    /** All test-type entry descriptors, as an array. */
    values: TestTypes,
    /** Type guard for test-type entry descriptors. */
    isValue: isTestType,
} = defineType("SOHL.SuccessTestResult.TestType", {
    SETIMPROVEFLAG: {
        id: "setImproveFlag",
        name: "Set Improve Flag",
        iconClass: "sohl-round-star-filled",
        condition: "item.system.canImprove && !item.system.data.improveFlag",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    UNSETIMPROVEFLAG: {
        id: "unsetImproveFlag",
        name: "Unset Improve Flag",
        iconClass: "sohl-round-star-unfilled",
        condition: "item.system.canImprove && !item.system.data.improveFlag",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    IMPROVEWITHSDR: {
        id: "improveWithSDR",
        name: "Improve with SDR",
        iconClass: "sohl-round-star-filled",
        condition: "item.system.canImprove && !item.system.data.improveFlag",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    SUCCESSTEST: {
        id: "successTest",
        name: "Success Test",
        iconClass: "sohl-bullseye-arrow",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTSTART: {
        id: "opposedTestStart",
        name: "Opposed Test Start",
        iconClass: "sohl-confrontation",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    SHOCKTEST: {
        id: "shockTest",
        name: "Shock Test",
        iconClass: "sohl-rear-aura",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    STUMBLETEST: {
        id: "stumbleTest",
        name: "Stumble Test",
        iconClass: "sohl-falling",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FUMBLETEST: {
        id: "fumbleTest",
        name: "Fumble Test",
        iconClass: "sohl-drop-weapon",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        id: "moraleTest",
        name: "Morale Test",
        iconClass: "sohl-rally-the-troops",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        id: "fearTest",
        name: "Fear Test",
        iconClass: "sohl-terror",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TRANSMITAFFLICTION: {
        id: "transmitAffliction",
        name: "Transmit Affliction",
        iconClass: "sohl-drowning",
        condition: "item.system.canTransmit",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        id: "contractAfflictionTest",
        name: "Contract Affliction Test",
        iconClass: "sohl-vomiting",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        id: "courseTest",
        name: "Course Test",
        iconClass: "sohl-heart-beats",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        id: "fatigueTest",
        name: "Fatigue Test",
        iconClass: "sohl-sleepy",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        id: "treatmentTest",
        name: "Treatment Test",
        iconClass: "sohl-caduceus",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        id: "diagnosisTest",
        name: "Diagnosis Test",
        iconClass: "sohl-stethoscope",
        condition: "item.system.data.isTreated",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: "healingTest",
        name: "Healing Test",
        iconClass: "sohl-healing",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    BLEEDINGSTOPPAGETEST: {
        id: "bleedingStoppageTest",
        name: "Bleeding Stoppage Test",
        iconClass: "sohl-armbandage",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    BLOODLOSSADVANCETEST: {
        id: "bloodlossAdvanceTest",
        name: "Bloodloss Advance Test",
        iconClass: "sohl-blood",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    OPPOSEDTESTRESUME: {
        id: "opposedTestResume",
        name: "Opposed Test Resume",
        iconClass: "sohl-continue",
        condition: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    BLOCK: {
        id: "blockTest",
        name: "Block Test",
        iconClass: "sohl-shield-reflect",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    COUNTERSTRIKE: {
        id: "counterstrikeTest",
        name: "Counterstrike Test",
        iconClass: "sohl-riposte",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DODGE: {
        id: "dodgeTest",
        name: "Dodge Test",
        iconClass: "sohl-dodge",
        // FIXME(#64): original walked actor.items.find for a usable "Dodge" skill;
        // reduce to "true" until SafeExpression supports collection iteration.
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    IGNORE: {
        id: "ignore",
        name: "Ignore",
        iconClass: "sohl-shrug",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMELEE: {
        id: "autoCombatMelee",
        name: "Auto Combat Melee",
        iconClass: "sohl-crossed-swords",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    AUTOCOMBATMISSILE: {
        id: "autoCombatMissile",
        name: "Auto Combat Missile",
        iconClass: "sohl-bowman",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    MISSILEATTACK: {
        id: "missileAttackTest",
        name: "Missile Attack Test",
        iconClass: "sohl-bowman",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    MELEEATTACK: {
        id: "meleeAttackTest",
        name: "Melee Attack Test",
        iconClass: "sohl-sword",
        condition: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<SohlContextMenu.Entry>);
/** Union of all test-type `id` strings. */
export type TestType = (typeof TEST_TYPE)[keyof typeof TEST_TYPE]["id"];

/** Default "Turning Wheel" calendar configuration for the SoHL world. */
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

/**
 * The bundle produced by {@link defineType} for a closed set of named values
 * (an "enum-like"). Callers destructure the pieces they need.
 *
 * @typeParam KMap - The literal key → value map the type is built from.
 */
export interface DefinedType<KMap extends Record<string, unknown>> {
    /** The original key → value map, preserved verbatim (the "enum object"). */
    kind: KMap;
    /** Every value in {@link kind}, as an array (handy for iteration/choices). */
    values: Array<KMap[keyof KMap]>;
    /** Type guard: narrows an unknown to one of {@link kind}'s values. */
    isValue: (v: unknown) => v is KMap[keyof KMap];
    /** Localization keys per entry: each key mapped to `` `${prefix}.${key}` ``. */
    labels: Record<string, string>;
    /**
     * Phantom value (always `null` at runtime) whose *type* is the value union.
     * Use `typeof X.Type` to name the union in type positions — never read it
     * at runtime.
     */
    Type: KMap[keyof KMap];
}

/**
 * Build an enum-like value set from a plain key → value map, together with the
 * helpers needed to use it: the value array, a runtime type guard, and a table
 * of localization keys. This is the foundation almost every SoHL constant set
 * is declared with, so understanding it explains the shape of `ACTOR_KIND`,
 * `ITEM_KIND`, `VALUE_DELTA_OPERATOR`, and the rest.
 *
 * The typical pattern is to immediately destructure the result, giving the map,
 * its values, its guard, and its labels each a conventional name, and then to
 * derive the value-union type with `(typeof KIND)[keyof typeof KIND]`:
 *
 * @example
 * ```ts
 * export const {
 *     kind: ACTOR_KIND,        // { BEING: "being", ASSEMBLY: "assembly", ... }
 *     values: ActorKinds,      // ["being", "assembly", ...]
 *     isValue: isActorKind,    // (v) => v is "being" | "assembly" | ...
 *     labels: actorKindLabels, // { BEING: "TYPES.Actor.BEING", ... }
 * } = defineType("TYPES.Actor", {
 *     BEING: "being",
 *     ASSEMBLY: "assembly",
 *     COHORT: "cohort",
 *     STRUCTURE: "structure",
 *     VEHICLE: "vehicle",
 * });
 *
 * // The value-union type, named from the kind map:
 * export type ActorKind = (typeof ACTOR_KIND)[keyof typeof ACTOR_KIND];
 * //   => "being" | "assembly" | "cohort" | "structure" | "vehicle"
 *
 * isActorKind("being"); // true
 * isActorKind("dragon"); // false
 * actorKindLabels.BEING; // "TYPES.Actor.BEING" (feed to the localizer)
 * ```
 *
 * @remarks
 * - The `const` type parameter preserves the literal keys and values, so the
 *   value union is exact (not widened to `string`).
 * - `labels` produces *localization keys*, not display text — resolve them
 *   through `SohlLocalize` when rendering.
 * - The returned `Type` member is a compile-time-only phantom; prefer the
 *   `(typeof KIND)[keyof typeof KIND]` form shown above for naming the union.
 *
 * @typeParam T - The literal key → value map; inferred from `def`.
 * @param prefix - Localization-key prefix joined to each entry key with a `.`
 *   to form {@link DefinedType.labels} (e.g. `"TYPES.Actor"`).
 * @param def - The key → value map defining the set.
 * @returns A {@link DefinedType} bundle: `{ kind, values, isValue, labels, Type }`.
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
        Object.entries(def).map(([k]) => [k, `${prefix}.${k}`]),
    ) as Record<StringKeys, string>;

    return {
        kind: def,
        values,
        isValue,
        labels,
        Type: null as unknown as KindValue,
    };
}
