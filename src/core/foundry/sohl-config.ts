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

import type { SohlDataModel } from "@src/core/foundry/SohlDataModel";
import { CombatModifier } from "@src/entity/modifier/CombatModifier";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { AttackResult } from "@src/entity/result/AttackResult";
import { CombatResult } from "@src/entity/result/CombatResult";
import { DefendResult } from "@src/entity/result/DefendResult";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { FilePath, toFilePath } from "@src/utils/helpers";
import { SohlSystem } from "@src/core/logic/SohlSystem";
import {
    ACTOR_KIND,
    ACTOR_METADATA,
    actorKindLabels,
    ActorKind,
    ActorKinds,
    DefinedType,
    defineType,
    ITEM_KIND,
    ITEM_METADATA,
    ItemKind,
    itemKindLabels,
    ItemKinds,
    SOHL_DEFAULT_CALENDAR_CONFIG,
    STATUS_EFFECT,
} from "@src/utils/constants";
import { SohlCalendarData } from "./SohlCalendar";
import {
    SohlActor,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@src/document/actor/foundry/SohlActor";

// Actor logic
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { AssemblyLogic } from "@src/document/actor/logic/AssemblyLogic";
import { CohortLogic } from "@src/document/actor/logic/CohortLogic";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import { VehicleLogic } from "@src/document/actor/logic/VehicleLogic";

// Actor Foundry
import { BeingDataModel } from "@src/document/actor/foundry/BeingDataModel";
import { BeingSheet } from "@src/document/actor/foundry/BeingSheet";
import { AssemblyDataModel } from "@src/document/actor/foundry/AssemblyDataModel";
import { AssemblySheet } from "@src/document/actor/foundry/AssemblySheet";
import { CohortDataModel } from "@src/document/actor/foundry/CohortDataModel";
import { CohortSheet } from "@src/document/actor/foundry/CohortSheet";
import { StructureDataModel } from "@src/document/actor/foundry/StructureDataModel";
import { StructureSheet } from "@src/document/actor/foundry/StructureSheet";
import { VehicleDataModel } from "@src/document/actor/foundry/VehicleDataModel";
import { VehicleSheet } from "@src/document/actor/foundry/VehicleSheet";

// Item logic
import { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { ArmorGearLogic } from "@src/document/item/logic/ArmorGearLogic";
import { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { ConcoctionGearLogic } from "@src/document/item/logic/ConcoctionGearLogic";
import { ContainerGearLogic } from "@src/document/item/logic/ContainerGearLogic";
import { TraumaLogic } from "@src/document/item/logic/TraumaLogic";
import { MiscGearLogic } from "@src/document/item/logic/MiscGearLogic";
import { MysteryLogic } from "@src/document/item/logic/MysteryLogic";
import { MysticalAbilityLogic } from "@src/document/item/logic/MysticalAbilityLogic";
import { ProjectileGearLogic } from "@src/document/item/logic/ProjectileGearLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { TraitLogic } from "@src/document/item/logic/TraitLogic";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";

// Item foundry
import {
    SohlItem,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@src/document/item/foundry/SohlItem";
import { AffiliationDataModel } from "@src/document/item/foundry/AffiliationDataModel";
import { AffiliationSheet } from "@src/document/item/foundry/AffiliationSheet";
import { AfflictionDataModel } from "@src/document/item/foundry/AfflictionDataModel";
import { AfflictionSheet } from "@src/document/item/foundry/AfflictionSheet";
import { ArmorGearDataModel } from "@src/document/item/foundry/ArmorGearDataModel";
import { ArmorGearSheet } from "@src/document/item/foundry/ArmorGearSheet";
import { AttributeDataModel } from "@src/document/item/foundry/AttributeDataModel";
import { AttributeSheet } from "@src/document/item/foundry/AttributeSheet";
import { LineageDataModel } from "@src/document/item/foundry/LineageDataModel";
import { LineageSheet } from "@src/document/item/foundry/LineageSheet";
import { CombatTechniqueDataModel } from "@src/document/item/foundry/CombatTechniqueDataModel";
import { CombatTechniqueSheet } from "@src/document/item/foundry/CombatTechniqueSheet";
import { ConcoctionGearDataModel } from "@src/document/item/foundry/ConcoctionGearDataModel";
import { ConcoctionGearSheet } from "@src/document/item/foundry/ConcoctionGearSheet";
import { ContainerGearDataModel } from "@src/document/item/foundry/ContainerGearDataModel";
import { ContainerGearSheet } from "@src/document/item/foundry/ContainerGearSheet";
import { TraumaDataModel } from "@src/document/item/foundry/TraumaDataModel";
import { TraumaSheet } from "@src/document/item/foundry/TraumaSheet";
import { MiscGearDataModel } from "@src/document/item/foundry/MiscGearDataModel";
import { MiscGearSheet } from "@src/document/item/foundry/MiscGearSheet";
import { MysteryDataModel } from "@src/document/item/foundry/MysteryDataModel";
import { MysterySheet } from "@src/document/item/foundry/MysterySheet";
import { MysticalAbilityDataModel } from "@src/document/item/foundry/MysticalAbilityDataModel";
import { MysticalAbilitySheet } from "@src/document/item/foundry/MysticalAbilitySheet";
import { ProjectileGearDataModel } from "@src/document/item/foundry/ProjectileGearDataModel";
import { ProjectileGearSheet } from "@src/document/item/foundry/ProjectileGearSheet";
import { SkillDataModel } from "@src/document/item/foundry/SkillDataModel";
import { SkillSheet } from "@src/document/item/foundry/SkillSheet";
import { TraitDataModel } from "@src/document/item/foundry/TraitDataModel";
import { TraitSheet } from "@src/document/item/foundry/TraitSheet";
import { WeaponGearDataModel } from "@src/document/item/foundry/WeaponGearDataModel";
import { WeaponGearSheet } from "@src/document/item/foundry/WeaponGearSheet";

// Effect/combatant/combat/region
import { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import { SohlActiveEffectDataModel } from "@src/document/effect/foundry/SohlActiveEffectDataModel";
import { SohlActiveEffectSheet } from "@src/document/effect/foundry/SohlActiveEffectSheet";
import {
    SohlCombatant,
    SohlCombatantDataModel,
} from "@src/document/combatant/foundry/SohlCombatant";
import { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
import {
    SohlCombat,
    SohlCombatDataModel,
} from "@src/document/combat/foundry/SohlCombat";
import { SohlScene } from "@src/document/scene/foundry/SohlScene";
import { SohlSceneDataModel } from "@src/document/scene/foundry/SohlSceneDataModel";
import { SohlSceneConfig } from "@src/document/scene/foundry/SohlSceneConfig";
import {
    formatDefault,
    formatRelativeTime,
    formatTimestamp,
} from "@src/core/logic/sohl-calendar-logic";

/** Map of actor kind → its `SohlDataModel` constructor. */
export type ActorDMMap = Record<
    string,
    Constructor<SohlDataModel<any, SohlActor, any>>
>;
/** Canonical actor-kind → DataModel registry, keyed by {@link ACTOR_KIND}. */
export const ACTOR_DM_DEF: ActorDMMap = {
    [ACTOR_KIND.BEING]: BeingDataModel,
    [ACTOR_KIND.ASSEMBLY]: AssemblyDataModel,
    [ACTOR_KIND.COHORT]: CohortDataModel,
    [ACTOR_KIND.STRUCTURE]: StructureDataModel,
    [ACTOR_KIND.VEHICLE]: VehicleDataModel,
} satisfies ActorDMMap;
const defActor: DefinedType<ActorDMMap> = defineType<ActorDMMap>(
    "TYPES.Actor",
    ACTOR_DM_DEF,
);
export const {
    /** The actor-kind → DataModel registry map. */
    kind: COMMON_ACTOR_DATA_MODEL,
    /** Type guard: is the value one of the registered actor DataModels? */
    isValue: isCommonActorDataModel,
    /** Localized labels keyed by actor kind. */
    labels: CommonActorDataModelLabels,
}: {
    kind: ActorDMMap;
    isValue: (value: unknown) => value is ActorDMMap[keyof ActorDMMap];
    labels: StrictObject<string>;
} = defActor;
/** All registered actor DataModel constructors, as an array. */
export const CommonActorDataModels: ActorDMMap[keyof ActorDMMap][] =
    Object.values(COMMON_ACTOR_DATA_MODEL);

/**
 * Actor-kind → concrete Logic class. Named (like {@link ITEM_LOGIC_DEF}) so the
 * per-kind logic instance type {@link ActorLogicByKind} can be derived from it.
 */
export const ACTOR_LOGIC_DEF = {
    /** Logic class for being (humanoid/creature) actors. */
    [ACTOR_KIND.BEING]: BeingLogic,
    /** Logic class for assembly actors (composed of nested beings). */
    [ACTOR_KIND.ASSEMBLY]: AssemblyLogic,
    /** Logic class for cohort actors (group of beings). */
    [ACTOR_KIND.COHORT]: CohortLogic,
    /** Logic class for structure actors (buildings, fortifications). */
    [ACTOR_KIND.STRUCTURE]: StructureLogic,
    /** Logic class for vehicle actors (wagons, ships, etc.). */
    [ACTOR_KIND.VEHICLE]: VehicleLogic,
};

// Compile-time check: ensure every ActorKind has an ACTOR_LOGIC_DEF entry.
const _ensureActorLogicCoversAllKinds: Record<ActorKind, unknown> =
    ACTOR_LOGIC_DEF;

/**
 * Actor-kind → concrete Logic *instance* type, derived from
 * {@link ACTOR_LOGIC_DEF} — e.g. `ActorLogicByKind["being"]` is `BeingLogic`.
 */
export interface ActorLogicByKind {
    /** Logic instance for being (humanoid/creature) actors. */
    being: BeingLogic;
    /** Logic instance for assembly actors (composed of nested beings). */
    assembly: AssemblyLogic;
    /** Logic instance for cohort actors (group of beings). */
    cohort: CohortLogic;
    /** Logic instance for structure actors (buildings, fortifications). */
    structure: StructureLogic;
    /** Logic instance for vehicle actors (wagons, ships, etc.). */
    vehicle: VehicleLogic;
}

export const {
    /** The actor-kind → Logic-class registry map. */
    kind: COMMON_ACTOR_LOGIC,
    /** All registered actor Logic constructors, as an array. */
    values: CommonActorLogic,
    /** Type guard: is the value one of the registered actor Logic classes? */
    isValue: isCommonActorLogic,
    /** Localized labels keyed by actor kind. */
    labels: CommonActorLogicLabels,
} = defineType(
    "SOHL.Actor.Logic",
    ACTOR_LOGIC_DEF as StrictObject<Constructor<SohlActorLogic<any>>>,
);

/** Combatant-kind → Logic-class registry (the combatant has a single kind). */
export const COMBATANT_LOGIC: StrictObject<Constructor<SohlCombatantLogic>> = {
    [SohlCombatantDataModel.kind]: SohlCombatantLogic,
};

export const {
    /** The actor-kind → sheet-class registry map. */
    kind: COMMON_ACTOR_SHEETS,
    /** All registered actor sheet constructors, as an array. */
    values: CommonActorSheets,
    /** Type guard: is the value one of the registered actor sheets? */
    isValue: isCommonActorSheet,
    /** Localized labels keyed by actor kind. */
    labels: CommonActorSheetLabels,
} = defineType("SOHL.Actor.Sheet", {
    [ACTOR_KIND.BEING]: BeingSheet as any,
    [ACTOR_KIND.ASSEMBLY]: AssemblySheet as any,
    [ACTOR_KIND.COHORT]: CohortSheet as any,
    [ACTOR_KIND.STRUCTURE]: StructureSheet as any,
    [ACTOR_KIND.VEHICLE]: VehicleSheet as any,
} as StrictObject<Constructor<SohlActorSheetBase>>);

/** Map of item kind → its `SohlDataModel` constructor. */
export type ItemDMMap = Record<
    string,
    Constructor<SohlDataModel<any, SohlItem, any>>
>;
/** Canonical item-kind → DataModel registry, keyed by {@link ITEM_KIND}. */
export const ITEM_DM_DEF: ItemDMMap = {
    [ITEM_KIND.AFFILIATION]: AffiliationDataModel,
    [ITEM_KIND.AFFLICTION]: AfflictionDataModel,
    [ITEM_KIND.ARMORGEAR]: ArmorGearDataModel,
    [ITEM_KIND.ATTRIBUTE]: AttributeDataModel,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueDataModel,
    [ITEM_KIND.LINEAGE]: LineageDataModel,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearDataModel,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearDataModel,
    [ITEM_KIND.TRAUMA]: TraumaDataModel,
    [ITEM_KIND.MISCGEAR]: MiscGearDataModel,
    [ITEM_KIND.MYSTERY]: MysteryDataModel,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilityDataModel,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearDataModel,
    [ITEM_KIND.SKILL]: SkillDataModel,
    [ITEM_KIND.TRAIT]: TraitDataModel,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearDataModel,
} satisfies ItemDMMap;
const defItem: DefinedType<ItemDMMap> = defineType<ItemDMMap>(
    "TYPES.Item",
    ITEM_DM_DEF,
);
export const {
    /** The item-kind → DataModel registry map. */
    kind: COMMON_ITEM_DATA_MODEL,
    /** Type guard: is the value one of the registered item DataModels? */
    isValue: isCommonItemDataModel,
    /** Localized labels keyed by item kind. */
    labels: CommonItemDataModelLabels,
}: {
    kind: ItemDMMap;
    isValue: (value: unknown) => value is ItemDMMap[keyof ItemDMMap];
    labels: StrictObject<string>;
} = defItem;
/** All registered item DataModel constructors, as an array. */
export const CommonItemDataModels: ItemDMMap[keyof ItemDMMap][] = Object.values(
    COMMON_ITEM_DATA_MODEL,
);

/**
 * Canonical item-kind → Logic-class registry, keyed by {@link ITEM_KIND}.
 *
 * @remarks
 * Declared as a precise object literal (no widening) so per-kind constructor
 * types survive — that is what {@link ItemLogicByKind} derives from. The runtime
 * registry {@link COMMON_ITEM_LOGIC} is intentionally widened (see below) to
 * preserve string-keyed indexing by consumers such as `SohlDataModel.create`.
 */
export const ITEM_LOGIC_DEF = {
    /** Logic class for affiliation items (factions, organizations). */
    [ITEM_KIND.AFFILIATION]: AffiliationLogic,
    /** Logic class for affliction items (disease, poison, injuries). */
    [ITEM_KIND.AFFLICTION]: AfflictionLogic,
    /** Logic class for armor gear items. */
    [ITEM_KIND.ARMORGEAR]: ArmorGearLogic,
    /** Logic class for attribute items (strength, agility, etc.). */
    [ITEM_KIND.ATTRIBUTE]: AttributeLogic,
    /** Logic class for combat technique items (fighting styles). */
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueLogic,
    /** Logic class for concoction gear items (potions, poisons). */
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearLogic,
    /** Logic class for container gear items (bags, chests). */
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearLogic,
    /** Logic class for lineage items (ancestry, bloodlines). */
    [ITEM_KIND.LINEAGE]: LineageLogic,
    /** Logic class for trauma items (wounds, injuries). */
    [ITEM_KIND.TRAUMA]: TraumaLogic,
    /** Logic class for miscellaneous gear items. */
    [ITEM_KIND.MISCGEAR]: MiscGearLogic,
    /** Logic class for mystery items (magic schools, arcane traditions). */
    [ITEM_KIND.MYSTERY]: MysteryLogic,
    /** Logic class for mystical ability items (spells, powers). */
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilityLogic,
    /** Logic class for projectile gear items (arrows, bolts). */
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearLogic,
    /** Logic class for skill items (combat, crafting, social, etc.). */
    [ITEM_KIND.SKILL]: SkillLogic,
    /** Logic class for trait items (personality traits, advantages). */
    [ITEM_KIND.TRAIT]: TraitLogic,
    /** Logic class for weapon gear items. */
    [ITEM_KIND.WEAPONGEAR]: WeaponGearLogic,
};

// Compile-time check: ensure every ItemKind has an ITEM_LOGIC_DEF entry.
// If there is an ItemKind without a Logic class, this line will fail to type-check.
const _ensureItemLogicCoversAllKinds: Record<ItemKind, unknown> =
    ITEM_LOGIC_DEF;

/**
 * Item-kind → concrete Logic *instance* type, derived from {@link ITEM_LOGIC_DEF}.
 *
 * @remarks
 * Lets callers resolve the precise logic type for a kind — e.g.
 * `ItemLogicByKind["skill"]` is `SkillLogic`. Consumed by
 * `SohlActor.getItemLogic` to return a concrete logic type from the item kind
 * passed at the call site.
 */
export interface ItemLogicByKind {
    /** Logic instance for affiliation items (factions, organizations). */
    affiliation: AffiliationLogic;
    /** Logic instance for affliction items (disease, poison, injuries). */
    affliction: AfflictionLogic;
    /** Logic instance for armor gear items. */
    armorgear: ArmorGearLogic;
    /** Logic instance for attribute items (strength, agility, etc.). */
    attribute: AttributeLogic;
    /** Logic instance for combat technique items (fighting styles). */
    combattechnique: CombatTechniqueLogic;
    /** Logic instance for concoction gear items (potions, poisons). */
    concoctiongear: ConcoctionGearLogic;
    /** Logic instance for container gear items (bags, chests). */
    containergear: ContainerGearLogic;
    /** Logic instance for lineage items (ancestry, bloodlines). */
    lineage: LineageLogic;
    /** Logic instance for trauma items (wounds, injuries). */
    trauma: TraumaLogic;
    /** Logic instance for miscellaneous gear items. */
    miscgear: MiscGearLogic;
    /** Logic instance for mystery items (magic schools, arcane traditions). */
    mystery: MysteryLogic;
    /** Logic instance for mystical ability items (spells, powers). */
    mysticalability: MysticalAbilityLogic;
    /** Logic instance for projectile gear items (arrows, bolts). */
    projectilegear: ProjectileGearLogic;
    /** Logic instance for skill items (combat, crafting, social, etc.). */
    skill: SkillLogic;
    /** Logic instance for trait items (personality traits, advantages). */
    trait: TraitLogic;
    /** Logic instance for weapon gear items. */
    weapongear: WeaponGearLogic;
}

/**
 * Per-kind arrays of logic instances — the shape returned by the
 * {@link SohlActorLogic.logicTypes} getter. Each property holds every embedded
 * item of that kind on the actor, in document order.
 *
 * @example
 * ```ts
 * const skills = actor.logic.logicTypes.skill; // SkillLogic[]
 * ```
 */
export interface ItemLogicArrayByKind {
    /** All affiliation logic instances on this actor. */
    affiliation: AffiliationLogic[];
    /** All affliction logic instances on this actor. */
    affliction: AfflictionLogic[];
    /** All armor gear logic instances on this actor. */
    armorgear: ArmorGearLogic[];
    /** All attribute logic instances on this actor. */
    attribute: AttributeLogic[];
    /** All combat technique logic instances on this actor. */
    combattechnique: CombatTechniqueLogic[];
    /** All concoction gear logic instances on this actor. */
    concoctiongear: ConcoctionGearLogic[];
    /** All container gear logic instances on this actor. */
    containergear: ContainerGearLogic[];
    /** All lineage logic instances on this actor. */
    lineage: LineageLogic[];
    /** All trauma logic instances on this actor. */
    trauma: TraumaLogic[];
    /** All miscellaneous gear logic instances on this actor. */
    miscgear: MiscGearLogic[];
    /** All mystery logic instances on this actor. */
    mystery: MysteryLogic[];
    /** All mystical ability logic instances on this actor. */
    mysticalability: MysticalAbilityLogic[];
    /** All projectile gear logic instances on this actor. */
    projectilegear: ProjectileGearLogic[];
    /** All skill logic instances on this actor. */
    skill: SkillLogic[];
    /** All trait logic instances on this actor. */
    trait: TraitLogic[];
    /** All weapon gear logic instances on this actor. */
    weapongear: WeaponGearLogic[];
}

export const {
    /** The item-kind → Logic-class registry map. */
    kind: COMMON_ITEM_LOGIC,
    /** All registered item Logic constructors, as an array. */
    values: CommonItemLogic,
    /** Type guard: is the value one of the registered item Logic classes? */
    isValue: isCommonItemLogic,
    /** Localized labels keyed by item kind. */
    labels: CommonItemLogicLabels,
} = defineType(
    "TYPES.Item",
    ITEM_LOGIC_DEF as StrictObject<Constructor<SohlItemLogic<any>>>,
);

export const {
    /** The item-kind → sheet-class registry map. */
    kind: COMMON_ITEM_SHEETS,
    /** All registered item sheet constructors, as an array. */
    values: CommonItemSheets,
    /** Type guard: is the value one of the registered item sheets? */
    isValue: isCommonItemSheet,
    /** Localized labels keyed by item kind. */
    labels: CommonItemSheetLabels,
} = defineType("SOHL.Item.Sheet", {
    [ITEM_KIND.AFFILIATION]: AffiliationSheet,
    [ITEM_KIND.AFFLICTION]: AfflictionSheet,
    [ITEM_KIND.ARMORGEAR]: ArmorGearSheet,
    [ITEM_KIND.ATTRIBUTE]: AttributeSheet,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueSheet,
    [ITEM_KIND.LINEAGE]: LineageSheet,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearSheet,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearSheet,
    [ITEM_KIND.TRAUMA]: TraumaSheet,
    [ITEM_KIND.MISCGEAR]: MiscGearSheet,
    [ITEM_KIND.MYSTERY]: MysterySheet,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilitySheet,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearSheet,
    [ITEM_KIND.SKILL]: SkillSheet,
    [ITEM_KIND.TRAIT]: TraitSheet,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearSheet,
} as StrictObject<Constructor<SohlItemSheetBase>>);

/** A calendar entry in the {@link SohlSystem} calendar registry. */
export interface CalendarRegistration {
    /** Display name (localization key or plain text) */
    label: string;
    /** Calendar data matching CalendarData.CreateData shape */
    config: object;
    /** CalendarData subclass to use (defaults to SohlCalendarData) */
    calendarClass?: typeof SohlCalendarData;
    /** If true, cannot be deleted via the settings UI */
    builtin?: boolean;
}

/** A status-effect entry merged into Foundry's `CONFIG.statusEffects`. */
export interface ConfigStatusEffect {
    /** Unique status-effect id. */
    id: string;
    /** Display name (or i18n key). */
    name: string;
    /** Icon path. */
    img: string;
}

/** Per-document-type registration block within {@link Config}. */
export interface DocumentConfig {
    /** The document subclass Foundry should instantiate. */
    documentClass: any;
    /** Sheet classes paired with the subtypes they apply to. */
    documentSheets: Array<{
        /** Sheet class constructor. */
        cls: any;
        /** Subtypes this sheet handles. */
        types: string[];
    }>;
    /** DataModel constructors keyed by subtype. */
    dataModels: StrictObject<
        Constructor<
            | SohlDataModel<any, any, any>
            | foundry.abstract.TypeDataModel<any, any>
        >
    >;
    /** Localized type labels keyed by subtype. */
    typeLabels: StrictObject<string>;
    /** Type icons keyed by subtype. */
    typeIcons: StrictObject<string>;
    /** All registered subtypes. */
    types: string[];
    /** Default subtype for new documents. */
    defaultType?: string;
    /** Compendium pack ids associated with this type. */
    compendiums?: string[];
    /** Macro file paths keyed by name. */
    macros?: StrictObject<FilePath>;
}

/** A simple registry of named classes. */
export interface ClassConfig {
    /** Constructors keyed by name. */
    classes: StrictObject<Constructor<any>>;
}

/**
 * Shape of {@link SohlSystem.CONFIG} — the system registration surface
 * merged into Foundry's `CONFIG`. Member docs are intentionally terse; the
 * authoritative detail lives on the referenced classes.
 */
export interface SohlConfig {
    /** Status effects merged into `CONFIG.statusEffects`. */
    statusEffects: ConfigStatusEffect[];
    /** Mapping of special status-effect roles to status ids. */
    specialStatusEffects: StrictObject<string>;
    /** Control-icon overrides keyed by role. */
    controlIcons: StrictObject<FilePath>;
    /** World-time / calendar configuration. */
    time: PlainObject;
    /** Actor registration block. */
    Actor: DocumentConfig;
    /** Item registration block. */
    Item: DocumentConfig;
    /** Active-effect registration block. */
    ActiveEffect: DocumentConfig;
    /** Combatant registration block. */
    Combatant: DocumentConfig;
    /** Combat registration block. */
    Combat: DocumentConfig;
    /** Scene registration block. */
    Scene: DocumentConfig;
    /** Modifier class registry. */
    Modifier: {
        /** Base value-modifier class. */
        ValueModifier: Constructor<ValueModifier>;
        /** Combat-modifier class. */
        CombatModifier: Constructor<CombatModifier>;
        /** Impact-modifier class. */
        ImpactModifier: Constructor<ImpactModifier>;
        /** Mastery-level-modifier class. */
        MasteryLevelModifier: Constructor<MasteryLevelModifier>;
    };
    /** Test/result class registry. */
    Result: {
        /** Success-test result class. */
        SuccessTestResult: Constructor<SuccessTestResult>;
        /** Opposed-test result class. */
        OpposedTestResult: Constructor<OpposedTestResult>;
        /** Impact result class. */
        ImpactResult: Constructor<ImpactResult>;
        /** Combat result class. */
        CombatResult: Constructor<CombatResult>;
        /** Attack result class. */
        AttackResult: Constructor<AttackResult>;
        /** Defend result class. */
        DefendResult: Constructor<DefendResult>;
    };
    /** Central system class */
    SohlSystem: typeof SohlSystem;
}

/**
 * The system's registration config, merged into Foundry's `CONFIG` at init.
 * It declares status effects, the world-time calendar, and — per document
 * type — the document/sheet/DataModel classes, plus the modifier and result
 * class registries. See {@link SohlSystem.Config} for the shape.
 */
export const SOHLCONFIG: SohlConfig = {
    // `mergeObject` replaces arrays wholesale, so we must spread
    // Foundry's default statuses (dead, unconscious, sleep, stun,
    // prone, restrain, paralysis, frozen, …) here — otherwise they
    // would be wiped out, leaving combat conditions unrepresentable.
    statusEffects: [
        ...(((globalThis as any).CONFIG?.statusEffects ?? []) as any[]).map(
            (e) => ({ ...e }),
        ),
        {
            id: STATUS_EFFECT.INCAPACITATED,
            name: "Incapacitated",
            img: "systems/sohl/assets/icons/knockout.svg",
        },
        {
            id: STATUS_EFFECT.VANQUISHED,
            name: "Vanquished",
            img: "systems/sohl/assets/icons/surrender.svg",
        },
        {
            id: STATUS_EFFECT.AURAL_SHOCK,
            name: "Aural Shock",
            img: "systems/sohl/assets/icons/shock.svg",
        },
        {
            id: STATUS_EFFECT.EVADING,
            name: "Evading",
            img: "systems/sohl/assets/icons/evade.svg",
        },
    ],

    specialStatusEffects: {
        /* These are the predefined foundry special statuses:
         * INVISIBLE: "invisible",
         * BLIND: "blind",
         * BURROW: "burrow",
         * HOVER: "hover",
         * FLY: "fly"
         */
        DEFEATED: STATUS_EFFECT.VANQUISHED,
    },

    controlIcons: {
        defeated: toFilePath("systems/sohl/assets/icons/surrender.svg"),
    },
    time: {
        worldCalendarConfig: SOHL_DEFAULT_CALENDAR_CONFIG,
        worldCalendarClass: SohlCalendarData,
        formatters: {
            "sohl.timestamp": formatTimestamp,
            "sohl.relative": formatRelativeTime,
            "sohl.default": formatDefault,
        },
    },
    Actor: {
        documentClass: SohlActor,
        documentSheets: ActorKinds.map((kind) => {
            return {
                cls: COMMON_ACTOR_SHEETS[kind],
                types: [kind],
            };
        }),
        dataModels: COMMON_ACTOR_DATA_MODEL,
        typeLabels: actorKindLabels,
        typeIcons: Object.fromEntries(
            ActorKinds.map((kind) => [kind, ACTOR_METADATA[kind].IconCssClass]),
        ),
        types: ActorKinds,
        defaultType: ACTOR_KIND.BEING,
        compendiums: ["sohl.leg-characters", "sohl.leg-creatures"],
        macros: {},
    },
    Item: {
        documentClass: SohlItem,
        documentSheets: ItemKinds.map((kind) => {
            return {
                cls: COMMON_ITEM_SHEETS[kind],
                types: [kind],
            };
        }),
        dataModels: COMMON_ITEM_DATA_MODEL,
        typeLabels: itemKindLabels,
        typeIcons: Object.fromEntries(
            ItemKinds.map((kind) => [kind, ITEM_METADATA[kind].IconCssClass]),
        ),
        types: ItemKinds,
        compendiums: [
            "sohl.leg-characteristics",
            "sohl.leg-possessions",
            "sohl.leg-mysteries",
        ],
        macros: {},
    },
    ActiveEffect: {
        documentClass: SohlActiveEffect,
        documentSheets: [
            {
                cls: SohlActiveEffectSheet,
                types: ["base", "sohleffectdata"],
            },
        ],
        dataModels: {
            sohleffectdata: SohlActiveEffectDataModel,
        },
        typeLabels: {
            base: "Base",
            sohleffectdata: "SOHL.SohlActiveEffect.sohleffectdata",
        },
        typeIcons: {
            base: "sohl-aura",
            sohleffectdata: "sohl-aura",
        },
        types: ["base", "sohleffectdata"],
    },
    Combatant: {
        documentClass: SohlCombatant,
        documentSheets: [],
        // Register the single combatant data model under the always-valid `base`
        // type (as Scene does). A named subtype would have to be declared in
        // system.json `documentTypes` AND defaulted, else combatants created by
        // the tracker/API fall back to typeless `base` with no `system.logic`,
        // crashing group seeding. The data model's static `kind` is unchanged, so
        // the COMBATANT_LOGIC lookup still resolves SohlCombatantLogic.
        dataModels: {
            base: SohlCombatantDataModel,
        },
        typeLabels: {
            base: "SOHL.SohlCombatant.combatantdata",
        },
        typeIcons: {
            base: "sohl-swordman",
        },
        types: ["base"],
    },
    Combat: {
        documentClass: SohlCombat,
        documentSheets: [],
        dataModels: {
            sohlcombatdata: SohlCombatDataModel,
        },
        typeLabels: {
            base: "Base",
            sohlcombatdata: "SOHL.SohlCombat.combatdata",
        },
        typeIcons: {
            base: "sohl-sword-clash",
            sohlcombatdata: "sohl-sword-clash",
        },
        types: ["base", "sohlcombatdata"],
    },
    Scene: {
        documentClass: SohlScene,
        documentSheets: [
            {
                cls: SohlSceneConfig,
                types: ["base"],
            },
        ],
        dataModels: {
            base: SohlSceneDataModel,
        },
        typeLabels: {
            base: "Base",
        },
        typeIcons: {
            base: "sohl-map",
        },
        types: ["base"],
    },
    Modifier: {
        ValueModifier: ValueModifier,
        CombatModifier: CombatModifier,
        ImpactModifier: ImpactModifier,
        MasteryLevelModifier: MasteryLevelModifier,
    },
    Result: {
        SuccessTestResult: SuccessTestResult,
        OpposedTestResult: OpposedTestResult,
        ImpactResult: ImpactResult,
        CombatResult: CombatResult,
        AttackResult: AttackResult,
        DefendResult: DefendResult,
    },
    // Central system class for module extension
    SohlSystem,
};
