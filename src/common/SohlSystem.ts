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

import { SohlMap } from "@utils/collection/SohlMap";
import { SohlDataModel } from "@common/SohlDataModel";
import { SohlCalendarData } from "@common/SohlCalendar";
import { SohlEventQueue } from "@common/SohlEventQueue";
import { ImpactModifier } from "@common/modifier/ImpactModifier";
import { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import { ValueModifier } from "@common/modifier/ValueModifier";
import { CombatModifier } from "@common/modifier/CombatModifier";
import { AttackResult } from "@common/result/AttackResult";
import { DefendResult } from "@common/result/DefendResult";
import { CombatResult } from "@common/result/CombatResult";
import { ImpactResult } from "@common/result/ImpactResult";
import { OpposedTestResult } from "@common/result/OpposedTestResult";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
// Actor logic
import { BeingLogic } from "@common/actor/logic/BeingLogic";
import { AssemblyLogic } from "@common/actor/logic/AssemblyLogic";
import { CohortLogic } from "@common/actor/logic/CohortLogic";
import { StructureLogic } from "@common/actor/logic/StructureLogic";
import { VehicleLogic } from "@common/actor/logic/VehicleLogic";

// Actor foundry
import {
    SohlActor,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/foundry/SohlActor";
import { BeingDataModel } from "@common/actor/foundry/BeingDataModel";
import { BeingSheet } from "@common/actor/foundry/BeingSheet";
import { AssemblyDataModel } from "@common/actor/foundry/AssemblyDataModel";
import { AssemblySheet } from "@common/actor/foundry/AssemblySheet";
import { CohortDataModel } from "@common/actor/foundry/CohortDataModel";
import { CohortSheet } from "@common/actor/foundry/CohortSheet";
import { StructureDataModel } from "@common/actor/foundry/StructureDataModel";
import { StructureSheet } from "@common/actor/foundry/StructureSheet";
import { VehicleDataModel } from "@common/actor/foundry/VehicleDataModel";
import { VehicleSheet } from "@common/actor/foundry/VehicleSheet";

// Item logic
import { ActionLogic } from "@common/item/logic/ActionLogic";
import { AffiliationLogic } from "@common/item/logic/AffiliationLogic";
import { AfflictionLogic } from "@common/item/logic/AfflictionLogic";
import { ArmorGearLogic } from "@common/item/logic/ArmorGearLogic";
import { BodyLocationLogic } from "@common/item/logic/BodyLocationLogic";
import { BodyPartLogic } from "@common/item/logic/BodyPartLogic";
import { BodyZoneLogic } from "@common/item/logic/BodyZoneLogic";
import { CombatTechniqueStrikeModeLogic } from "@common/item/logic/CombatTechniqueStrikeModeLogic";
import { ConcoctionGearLogic } from "@common/item/logic/ConcoctionGearLogic";
import { ContainerGearLogic } from "@common/item/logic/ContainerGearLogic";
import { DispositionLogic } from "@common/item/logic/DispositionLogic";
import { DomainLogic } from "@common/item/logic/DomainLogic";
import { InjuryLogic } from "@common/item/logic/InjuryLogic";
import { MeleeWeaponStrikeModeLogic } from "@common/item/logic/MeleeWeaponStrikeModeLogic";
import { MiscGearLogic } from "@common/item/logic/MiscGearLogic";
import { MissileWeaponStrikeModeLogic } from "@common/item/logic/MissileWeaponStrikeModeLogic";
import { MovementProfileLogic } from "@common/item/logic/MovementProfileLogic";
import { MysteryLogic } from "@common/item/logic/MysteryLogic";
import { MysticalAbilityLogic } from "@common/item/logic/MysticalAbilityLogic";
import { MysticalDeviceLogic } from "@common/item/logic/MysticalDeviceLogic";
import { PhilosophyLogic } from "@common/item/logic/PhilosophyLogic";
import { ProjectileGearLogic } from "@common/item/logic/ProjectileGearLogic";
import { ProtectionLogic } from "@common/item/logic/ProtectionLogic";
import { SkillLogic } from "@common/item/logic/SkillLogic";
import { TraitLogic } from "@common/item/logic/TraitLogic";
import { WeaponGearLogic } from "@common/item/logic/WeaponGearLogic";

// Item foundry
import {
    SohlItem,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/foundry/SohlItem";
import { ActionDataModel } from "@common/item/foundry/ActionDataModel";
import { ActionSheet } from "@common/item/foundry/ActionSheet";
import { AffiliationDataModel } from "@common/item/foundry/AffiliationDataModel";
import { AffiliationSheet } from "@common/item/foundry/AffiliationSheet";
import { AfflictionDataModel } from "@common/item/foundry/AfflictionDataModel";
import { AfflictionSheet } from "@common/item/foundry/AfflictionSheet";
import { ArmorGearDataModel } from "@common/item/foundry/ArmorGearDataModel";
import { ArmorGearSheet } from "@common/item/foundry/ArmorGearSheet";
import { BodyLocationDataModel } from "@common/item/foundry/BodyLocationDataModel";
import { BodyLocationSheet } from "@common/item/foundry/BodyLocationSheet";
import { BodyPartDataModel } from "@common/item/foundry/BodyPartDataModel";
import { BodyPartSheet } from "@common/item/foundry/BodyPartSheet";
import { BodyZoneDataModel } from "@common/item/foundry/BodyZoneDataModel";
import { BodyZoneSheet } from "@common/item/foundry/BodyZoneSheet";
import { CombatTechniqueStrikeModeDataModel } from "@common/item/foundry/CombatTechniqueStrikeModeDataModel";
import { CombatTechniqueStrikeModeSheet } from "@common/item/foundry/CombatTechniqueStrikeModeSheet";
import { ConcoctionGearDataModel } from "@common/item/foundry/ConcoctionGearDataModel";
import { ConcoctionGearSheet } from "@common/item/foundry/ConcoctionGearSheet";
import { ContainerGearDataModel } from "@common/item/foundry/ContainerGearDataModel";
import { ContainerGearSheet } from "@common/item/foundry/ContainerGearSheet";
import { DispositionDataModel } from "@common/item/foundry/DispositionDataModel";
import { DispositionSheet } from "@common/item/foundry/DispositionSheet";
import { DomainDataModel } from "@common/item/foundry/DomainDataModel";
import { DomainSheet } from "@common/item/foundry/DomainSheet";
import { InjuryDataModel } from "@common/item/foundry/InjuryDataModel";
import { InjurySheet } from "@common/item/foundry/InjurySheet";
import { MeleeWeaponStrikeModeDataModel } from "@common/item/foundry/MeleeWeaponStrikeModeDataModel";
import { MeleeWeaponStrikeModeSheet } from "@common/item/foundry/MeleeWeaponStrikeModeSheet";
import { MiscGearDataModel } from "@common/item/foundry/MiscGearDataModel";
import { MiscGearSheet } from "@common/item/foundry/MiscGearSheet";
import { MissileWeaponStrikeModeDataModel } from "@common/item/foundry/MissileWeaponStrikeModeDataModel";
import { MissileWeaponStrikeModeSheet } from "@common/item/foundry/MissileWeaponStrikeModeSheet";
import { MovementProfileDataModel } from "@common/item/foundry/MovementProfileDataModel";
import { MovementProfileSheet } from "@common/item/foundry/MovementProfileSheet";
import { MysteryDataModel } from "@common/item/foundry/MysteryDataModel";
import { MysterySheet } from "@common/item/foundry/MysterySheet";
import { MysticalAbilityDataModel } from "@common/item/foundry/MysticalAbilityDataModel";
import { MysticalAbilitySheet } from "@common/item/foundry/MysticalAbilitySheet";
import { MysticalDeviceDataModel } from "@common/item/foundry/MysticalDeviceDataModel";
import { MysticalDeviceSheet } from "@common/item/foundry/MysticalDeviceSheet";
import { PhilosophyDataModel } from "@common/item/foundry/PhilosophyDataModel";
import { PhilosophySheet } from "@common/item/foundry/PhilosophySheet";
import { ProjectileGearDataModel } from "@common/item/foundry/ProjectileGearDataModel";
import { ProjectileGearSheet } from "@common/item/foundry/ProjectileGearSheet";
import { ProtectionDataModel } from "@common/item/foundry/ProtectionDataModel";
import { ProtectionSheet } from "@common/item/foundry/ProtectionSheet";
import { SkillDataModel } from "@common/item/foundry/SkillDataModel";
import { SkillSheet } from "@common/item/foundry/SkillSheet";
import { TraitDataModel } from "@common/item/foundry/TraitDataModel";
import { TraitSheet } from "@common/item/foundry/TraitSheet";
import { WeaponGearDataModel } from "@common/item/foundry/WeaponGearDataModel";
import { WeaponGearSheet } from "@common/item/foundry/WeaponGearSheet";

// Effect/combatant/combat/region
import {
    SohlActiveEffect,
    SohlActiveEffectDataModel,
    SohlActiveEffectSheet,
} from "@common/effect/SohlActiveEffect";
import {
    SohlCombatant,
    SohlCombatantDataModel,
} from "@common/combatant/SohlCombatant";
import { SohlCombat, SohlCombatDataModel } from "@common/combat/SohlCombat";
import { SohlRegion, SohlRegionConfig } from "@common/region/SohlRegion";
import {
    SohlEncounter,
    SohlEncounterDataModel,
    SohlEncounterConfig,
} from "@common/region-behavior/SohlEncounter";

// Utilities
import * as utils from "@utils/helpers";
import * as constants from "@utils/constants";
import { FilePath, toFilePath } from "@utils/helpers";
import { SohlLocalize } from "@utils/SohlLocalize";
import { SohlLogger } from "@utils/SohlLogger";
import { Itr } from "@utils/Itr";
import {
    ACTOR_KIND,
    ActorKinds,
    actorKindLabels,
    ACTOR_METADATA,
    ITEM_KIND,
    ItemKinds,
    itemKindLabels,
    ITEM_METADATA,
    defineType,
    DefinedType,
    SOHL_DEFAULT_CALENDAR_CONFIG,
} from "@utils/constants";
import { getGame } from "@common/FoundryProxy";

export type ActorDMMap = Record<
    string,
    Constructor<SohlDataModel<any, SohlActor, any>>
>;
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
    kind: COMMON_ACTOR_DATA_MODEL,
    isValue: isCommonActorDataModel,
    labels: CommonActorDataModelLabels,
}: {
    kind: ActorDMMap;
    isValue: (value: unknown) => value is ActorDMMap[keyof ActorDMMap];
    labels: StrictObject<string>;
} = defActor;
export const CommonActorDataModels: ActorDMMap[keyof ActorDMMap][] =
    Object.values(COMMON_ACTOR_DATA_MODEL);

export const {
    kind: COMMON_ACTOR_LOGIC,
    values: CommonActorLogic,
    isValue: isCommonActorLogic,
    labels: CommonActorLogicLabels,
} = defineType("SOHL.Actor.Logic", {
    [ACTOR_KIND.BEING]: BeingLogic,
    [ACTOR_KIND.ASSEMBLY]: AssemblyLogic,
    [ACTOR_KIND.COHORT]: CohortLogic,
    [ACTOR_KIND.STRUCTURE]: StructureLogic,
    [ACTOR_KIND.VEHICLE]: VehicleLogic,
} as StrictObject<Constructor<SohlActorLogic<any>>>);

export const {
    kind: COMMON_ACTOR_SHEETS,
    values: CommonActorSheets,
    isValue: isCommonActorSheet,
    labels: CommonActorSheetLabels,
} = defineType("SOHL.Actor.Sheet", {
    [ACTOR_KIND.BEING]: BeingSheet as any,
    [ACTOR_KIND.ASSEMBLY]: AssemblySheet as any,
    [ACTOR_KIND.COHORT]: CohortSheet as any,
    [ACTOR_KIND.STRUCTURE]: StructureSheet as any,
    [ACTOR_KIND.VEHICLE]: VehicleSheet as any,
} as StrictObject<Constructor<SohlActorSheetBase>>);

export type ItemDMMap = Record<
    string,
    Constructor<SohlDataModel<any, SohlItem, any>>
>;
export const ITEM_DM_DEF: ItemDMMap = {
    [ITEM_KIND.ACTION]: ActionDataModel,
    [ITEM_KIND.AFFILIATION]: AffiliationDataModel,
    [ITEM_KIND.DISPOSITION]: DispositionDataModel,
    [ITEM_KIND.AFFLICTION]: AfflictionDataModel,
    [ITEM_KIND.ARMORGEAR]: ArmorGearDataModel,
    [ITEM_KIND.BODYLOCATION]: BodyLocationDataModel,
    [ITEM_KIND.BODYPART]: BodyPartDataModel,
    [ITEM_KIND.BODYZONE]: BodyZoneDataModel,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: CombatTechniqueStrikeModeDataModel,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearDataModel,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearDataModel,
    [ITEM_KIND.DOMAIN]: DomainDataModel,
    [ITEM_KIND.INJURY]: InjuryDataModel,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: MeleeWeaponStrikeModeDataModel,
    [ITEM_KIND.MISCGEAR]: MiscGearDataModel,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: MissileWeaponStrikeModeDataModel,
    [ITEM_KIND.MOVEMENTPROFILE]: MovementProfileDataModel,
    [ITEM_KIND.MYSTERY]: MysteryDataModel,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilityDataModel,
    [ITEM_KIND.MYSTICALDEVICE]: MysticalDeviceDataModel,
    [ITEM_KIND.PHILOSOPHY]: PhilosophyDataModel,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearDataModel,
    [ITEM_KIND.PROTECTION]: ProtectionDataModel,
    [ITEM_KIND.SKILL]: SkillDataModel,
    [ITEM_KIND.TRAIT]: TraitDataModel,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearDataModel,
} satisfies ItemDMMap;
const defItem: DefinedType<ItemDMMap> = defineType<ItemDMMap>(
    "TYPES.Item",
    ITEM_DM_DEF,
);
export const {
    kind: COMMON_ITEM_DATA_MODEL,
    isValue: isCommonItemDataModel,
    labels: CommonItemDataModelLabels,
}: {
    kind: ItemDMMap;
    isValue: (value: unknown) => value is ItemDMMap[keyof ItemDMMap];
    labels: StrictObject<string>;
} = defItem;
export const CommonItemDataModels: ItemDMMap[keyof ItemDMMap][] = Object.values(
    COMMON_ITEM_DATA_MODEL,
);

export const {
    kind: COMMON_ITEM_LOGIC,
    values: CommonItemLogic,
    isValue: isCommonItemLogic,
    labels: CommonItemLogicLabels,
} = defineType("TYPES.Item", {
    [ITEM_KIND.ACTION]: ActionLogic,
    [ITEM_KIND.AFFILIATION]: AffiliationLogic,
    [ITEM_KIND.DISPOSITION]: DispositionLogic,
    [ITEM_KIND.AFFLICTION]: AfflictionLogic,
    [ITEM_KIND.ARMORGEAR]: ArmorGearLogic,
    [ITEM_KIND.BODYLOCATION]: BodyLocationLogic,
    [ITEM_KIND.BODYPART]: BodyPartLogic,
    [ITEM_KIND.BODYZONE]: BodyZoneLogic,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: CombatTechniqueStrikeModeLogic,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearLogic,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearLogic,
    [ITEM_KIND.DOMAIN]: DomainLogic,
    [ITEM_KIND.INJURY]: InjuryLogic,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: MeleeWeaponStrikeModeLogic,
    [ITEM_KIND.MISCGEAR]: MiscGearLogic,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: MissileWeaponStrikeModeLogic,
    [ITEM_KIND.MOVEMENTPROFILE]: MovementProfileLogic,
    [ITEM_KIND.MYSTERY]: MysteryLogic,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilityLogic,
    [ITEM_KIND.MYSTICALDEVICE]: MysticalDeviceLogic,
    [ITEM_KIND.PHILOSOPHY]: PhilosophyLogic,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearLogic,
    [ITEM_KIND.PROTECTION]: ProtectionLogic,
    [ITEM_KIND.SKILL]: SkillLogic,
    [ITEM_KIND.TRAIT]: TraitLogic,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearLogic,
} as StrictObject<Constructor<SohlItemLogic<any>>>);

export const {
    kind: COMMON_ITEM_SHEETS,
    values: CommonItemSheets,
    isValue: isCommonItemSheet,
    labels: CommonItemSheetLabels,
} = defineType("SOHL.Item.Sheet", {
    [ITEM_KIND.ACTION]: ActionSheet,
    [ITEM_KIND.AFFILIATION]: AffiliationSheet,
    [ITEM_KIND.DISPOSITION]: DispositionSheet,
    [ITEM_KIND.AFFLICTION]: AfflictionSheet,
    [ITEM_KIND.ARMORGEAR]: ArmorGearSheet,
    [ITEM_KIND.BODYLOCATION]: BodyLocationSheet,
    [ITEM_KIND.BODYPART]: BodyPartSheet,
    [ITEM_KIND.BODYZONE]: BodyZoneSheet,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: CombatTechniqueStrikeModeSheet,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearSheet,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearSheet,
    [ITEM_KIND.DOMAIN]: DomainSheet,
    [ITEM_KIND.INJURY]: InjurySheet,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: MeleeWeaponStrikeModeSheet,
    [ITEM_KIND.MISCGEAR]: MiscGearSheet,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: MissileWeaponStrikeModeSheet,
    [ITEM_KIND.MOVEMENTPROFILE]: MovementProfileSheet,
    [ITEM_KIND.MYSTERY]: MysterySheet,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilitySheet,
    [ITEM_KIND.MYSTICALDEVICE]: MysticalDeviceSheet,
    [ITEM_KIND.PHILOSOPHY]: PhilosophySheet,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearSheet,
    [ITEM_KIND.PROTECTION]: ProtectionSheet,
    [ITEM_KIND.SKILL]: SkillSheet,
    [ITEM_KIND.TRAIT]: TraitSheet,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearSheet,
} as StrictObject<Constructor<SohlItemSheetBase>>);

/**
 * Abstract class representing a system variant for the Song of Heroic Lands (SoHL).
 * This class provides the canonical runtime registry/config surface for constructing
 * data models, results, and modifiers in a variant-agnostic way.
 *
 * Design contract:
 * - Runtime code resolves constructors through `sohl.CONFIG` and registries.
 * - Variants may override logic and sheets, but shared persisted data model schemas
 *   should remain stable across variants.
 * - Variant-specific persisted data belongs in `flags.sohl.<variant>...` and logic
 *   must handle missing flags safely.
 */
export abstract class SohlSystem {
    protected static _variants: SohlMap<string, SohlSystem> = new SohlMap<
        string,
        SohlSystem
    >();
    protected static _curVariant?: SohlSystem;
    protected static _calendars: SohlMap<
        string,
        SohlSystem.CalendarRegistration
    > = new SohlMap<string, SohlSystem.CalendarRegistration>();
    static get CONFIG(): SohlSystem.Config {
        return {
            statusEffects: [
                {
                    id: "incapacitated",
                    name: "incapacitated",
                    img: "systems/sohl/assets/icons/knockout.svg",
                },
                {
                    id: "vanquished",
                    name: "vanquished",
                    img: "systems/sohl/assets/icons/surrender.svg",
                },
            ],

            specialStatusEffects: {
                DEFEATED: "vanquished",
            },

            controlIcons: {
                defeated: toFilePath("systems/sohl/assets/icons/surrender.svg"),
            },
            time: {
                worldCalendarConfig: SOHL_DEFAULT_CALENDAR_CONFIG,
                worldCalendarClass: SohlCalendarData,
                formatters: {
                    timestamp: SohlCalendarData.formatTimestamp,
                    relative: SohlCalendarData.formatRelativeTime,
                    default: SohlCalendarData.formatDefault,
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
                    ActorKinds.map((kind) => [
                        kind,
                        ACTOR_METADATA[kind].IconCssClass,
                    ]),
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
                    ItemKinds.map((kind) => [
                        kind,
                        ITEM_METADATA[kind].IconCssClass,
                    ]),
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
                    base: "fa-duotone fa-aura",
                    sohleffectdata: "fa-duotone fa-people-group",
                },
                types: ["base", "sohleffectdata"],
            },
            Combatant: {
                documentClass: SohlCombatant,
                documentSheets: [],
                dataModels: {
                    sohlcombatantdata: SohlCombatantDataModel,
                },
                typeLabels: {
                    base: "Base",
                    sohlcombatantdata: "SOHL.SohlCombatant.combatantdata",
                },
                typeIcons: {
                    base: "fa-duotone fa-user-helmet-safety",
                    sohlcombatantdata: "fa-duotone fa-people-group",
                },
                types: ["base", "sohlcombatantdata"],
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
                    base: "fa-duotone fa-shield-halved",
                    sohlcombatdata: "fa-duotone fa-people-group",
                },
                types: ["base", "sohlcombatdata"],
            },
            Region: {
                documentClass: SohlRegion,
                sheetClass: SohlRegionConfig,
            },
            RegionBehavior: {
                dataModels: {
                    sohlencounter: SohlEncounterDataModel,
                },
                sheetClasses: {
                    sohlencounter: SohlEncounterConfig,
                },
                typeLabels: {
                    sohlencounter: "SOHL.Encounter.typeLabel",
                },
                typeIcons: {
                    sohlencounter: "fa-solid fa-dragon",
                },
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
            // Base system class for variant module extension
            SohlSystem,
        };
    }

    static get CONST(): PlainObject {
        return {} as const;
    }

    /**
     * A short string ID for this system variant.
     */
    static readonly ID: string;

    /**
     * The human-readable title of the system variant.
     */
    static readonly TITLE: string;

    /**
     * The system initialization message, displayed during loading.
     */
    static readonly INIT_MESSAGE: string;

    static readonly utils: typeof utils = utils;
    static readonly constants: typeof constants = constants;
    static ready: boolean = false;
    readonly i18n: SohlLocalize;
    readonly log: SohlLogger;
    readonly events: SohlEventQueue;

    static registerVariant(variantId: string, variant: SohlSystem): void {
        if (this._variants.has(variantId)) {
            throw new Error(
                `Variant with ID "${variantId}" is already registered.`,
            );
        }
        this._variants.set(variantId, variant);
    }

    static selectVariant(variantId?: string): SohlSystem {
        if (!variantId) {
            this._curVariant = SohlSystem._variants.values().next().value;
        } else {
            this._curVariant = SohlSystem._variants.get(variantId);
        }
        if (!this._curVariant) {
            throw new Error(
                `SohlSystem: No variant found for "${variantId}". Available variants: ${Array.from(
                    this._variants.keys(),
                ).join(", ")}`,
            );
        }
        return this._curVariant;
    }

    static get variants(): Itr<[string, SohlSystem]> {
        return this._variants.entries();
    }

    /* -------------------------------------------- */
    /*  Calendar Registry                           */
    /* -------------------------------------------- */

    /**
     * Register a calendar configuration. Overwrites any existing registration
     * with the same ID.
     */
    static registerCalendar(
        id: string,
        registration: SohlSystem.CalendarRegistration,
    ): void {
        this._calendars.set(id, registration);
    }

    /**
     * Remove a calendar registration. Throws if the calendar is builtin.
     */
    static unregisterCalendar(id: string): void {
        const cal = this._calendars.get(id);
        if (!cal) return;
        if (cal.builtin) {
            throw new Error(`Cannot delete built-in calendar "${id}".`);
        }
        this._calendars.delete(id);
    }

    /**
     * Get a registered calendar by ID.
     */
    static getCalendar(
        id: string,
    ): SohlSystem.CalendarRegistration | undefined {
        return this._calendars.get(id);
    }

    /**
     * All registered calendars.
     */
    static get calendars(): SohlMap<string, SohlSystem.CalendarRegistration> {
        return this._calendars;
    }

    /**
     * Apply a registered calendar to CONFIG.time.
     */
    static applyCalendar(id: string): void {
        const cal = this._calendars.get(id);
        if (!cal) {
            throw new Error(
                `Calendar "${id}" is not registered. Available: ${Array.from(
                    this._calendars.keys(),
                ).join(", ")}`,
            );
        }
        CONFIG.time.worldCalendarConfig = cal.config as any;
        CONFIG.time.worldCalendarClass = (cal.calendarClass ??
            SohlCalendarData) as any;
    }

    get CONFIG(): PlainObject {
        return (this.constructor as any).CONFIG;
    }

    get CONST(): PlainObject {
        return (this.constructor as any).CONST;
    }
    get id(): string {
        return (this.constructor as any).ID;
    }

    get title(): string {
        return (this.constructor as any).TITLE;
    }

    get initMessage(): string {
        return (this.constructor as any).INIT_MESSAGE;
    }

    get utils(): typeof utils {
        return (this.constructor as any).utils;
    }

    get constants(): typeof constants {
        return (this.constructor as any).constants;
    }

    /* -------------------------------------------- */
    /*  Variant-Aware Class Accessors               */
    /* -------------------------------------------- */

    /**
     * Variant-aware modifier constructors.
     * Usage: `new sohl.modifier.Value({}, { parent: this })`
     */
    get modifier() {
        const cfg = this.CONFIG.Modifier;
        return {
            Value: cfg.ValueModifier as Constructor<ValueModifier>,
            Combat: cfg.CombatModifier as Constructor<CombatModifier>,
            Impact: cfg.ImpactModifier as Constructor<ImpactModifier>,
            MasteryLevel:
                cfg.MasteryLevelModifier as Constructor<MasteryLevelModifier>,
        };
    }

    /**
     * Variant-aware result constructors.
     * Usage: `new sohl.result.SuccessTest({}, { parent: this })`
     */
    get result() {
        const cfg = this.CONFIG.Result;
        return {
            SuccessTest:
                cfg.SuccessTestResult as Constructor<SuccessTestResult>,
            OpposedTest:
                cfg.OpposedTestResult as Constructor<OpposedTestResult>,
            Impact: cfg.ImpactResult as Constructor<ImpactResult>,
            Combat: cfg.CombatResult as Constructor<CombatResult>,
            Attack: cfg.AttackResult as Constructor<AttackResult>,
            Defend: cfg.DefendResult as Constructor<DefendResult>,
        };
    }

    /**
     * Variant-aware modifier constant definitions.
     * Usage: `sohl.mod.OUTNUMBERED`, `sohl.mod.MLDSBL`
     */
    get mod(): PlainObject {
        return (this.CONFIG as any).MOD ?? {};
    }


    protected constructor() {
        this.i18n = SohlLocalize.getInstance();
        this.log = SohlLogger.getInstance();
        this.events = new SohlEventQueue();
    }

    get game(): SohlSystem {
        if (!(this.constructor as any).curVariant) {
            const variant = (getGame().settings as any).get(
                "sohl",
                "variant",
            ) as string;
            (this.constructor as any).selectVariant(variant);
        }
        return (this.constructor as any).curVariant;
    }

    get variants(): Itr<[string, SohlSystem]> {
        return (this.constructor as any).variants;
    }

    abstract setupSheets(): void;
}

// Register the default calendar
SohlSystem.registerCalendar("sohl-default", {
    label: "SOHL.CalendarSettings.default",
    config: SOHL_DEFAULT_CALENDAR_CONFIG,
    calendarClass: SohlCalendarData,
    builtin: true,
});

export namespace SohlSystem {
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

    export interface ConfigStatusEffect {
        id: string;
        name: string;
        img: string;
    }

    export interface DocumentConfig {
        documentClass: any;
        documentSheets: Array<{
            cls: any;
            types: string[];
        }>;
        dataModels: StrictObject<
            Constructor<
                | SohlDataModel<any, any, any>
                | foundry.abstract.TypeDataModel<any, any>
            >
        >;
        typeLabels: StrictObject<string>;
        typeIcons: StrictObject<string>;
        types: string[];
        defaultType?: string;
        compendiums?: string[];
        macros?: StrictObject<FilePath>;
    }

    export interface ClassConfig {
        classes: StrictObject<Constructor<any>>;
    }

    export interface Config {
        statusEffects: ConfigStatusEffect[];
        specialStatusEffects: StrictObject<string>;
        controlIcons: StrictObject<FilePath>;
        time: PlainObject;
        Actor: DocumentConfig;
        Item: DocumentConfig;
        ActiveEffect: DocumentConfig;
        Combatant: DocumentConfig;
        Combat: DocumentConfig;
        Region: {
            documentClass: any;
            sheetClass: any;
        };
        RegionBehavior: {
            dataModels: StrictObject<any>;
            sheetClasses: StrictObject<any>;
            typeLabels: StrictObject<string>;
            typeIcons: StrictObject<string>;
        };
        Modifier: {
            ValueModifier: Constructor<ValueModifier>;
            CombatModifier: Constructor<CombatModifier>;
            ImpactModifier: Constructor<ImpactModifier>;
            MasteryLevelModifier: Constructor<MasteryLevelModifier>;
        };
        Result: {
            SuccessTestResult: Constructor<SuccessTestResult>;
            OpposedTestResult: Constructor<OpposedTestResult>;
            ImpactResult: Constructor<ImpactResult>;
            CombatResult: Constructor<CombatResult>;
            AttackResult: Constructor<AttackResult>;
            DefendResult: Constructor<DefendResult>;
        };
        /** Base system class for variant module extension */
        SohlSystem: typeof SohlSystem;
    }
}
