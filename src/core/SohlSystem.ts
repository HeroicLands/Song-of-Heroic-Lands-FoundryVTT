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

import { SohlMap } from "@src/utils/collection/SohlMap";
import { SohlDataModel } from "@src/core/SohlDataModel";
import { SohlCalendarData } from "@src/core/SohlCalendar";
import { SohlEventQueue } from "@src/core/SohlEventQueue";
import { ImpactModifier } from "@src/modifier/ImpactModifier";
import { MasteryLevelModifier } from "@src/modifier/MasteryLevelModifier";
import { ValueModifier } from "@src/modifier/ValueModifier";
import { CombatModifier } from "@src/modifier/CombatModifier";
import { AttackResult } from "@src/result/AttackResult";
import { DefendResult } from "@src/result/DefendResult";
import { CombatResult } from "@src/result/CombatResult";
import { ImpactResult } from "@src/result/ImpactResult";
import { OpposedTestResult } from "@src/result/OpposedTestResult";
import { SuccessTestResult } from "@src/result/SuccessTestResult";
// Actor logic
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { AssemblyLogic } from "@src/document/actor/logic/AssemblyLogic";
import { CohortLogic } from "@src/document/actor/logic/CohortLogic";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import { VehicleLogic } from "@src/document/actor/logic/VehicleLogic";

// Actor foundry
import {
    SohlActor,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@src/document/actor/foundry/SohlActor";
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
import { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { ConcoctionGearLogic } from "@src/document/item/logic/ConcoctionGearLogic";
import { ContainerGearLogic } from "@src/document/item/logic/ContainerGearLogic";
import { InjuryLogic } from "@src/document/item/logic/InjuryLogic";
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
import { CombatTechniqueDataModel } from "@src/document/item/foundry/CombatTechniqueDataModel";
import { CombatTechniqueSheet } from "@src/document/item/foundry/CombatTechniqueSheet";
import { ConcoctionGearDataModel } from "@src/document/item/foundry/ConcoctionGearDataModel";
import { ConcoctionGearSheet } from "@src/document/item/foundry/ConcoctionGearSheet";
import { ContainerGearDataModel } from "@src/document/item/foundry/ContainerGearDataModel";
import { ContainerGearSheet } from "@src/document/item/foundry/ContainerGearSheet";
import { InjuryDataModel } from "@src/document/item/foundry/InjuryDataModel";
import { InjurySheet } from "@src/document/item/foundry/InjurySheet";
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
import {
    SohlActiveEffect,
    SohlActiveEffectDataModel,
    SohlActiveEffectSheet,
} from "@src/document/effect/SohlActiveEffect";
import {
    SohlCombatant,
    SohlCombatantDataModel,
} from "@src/document/combatant/SohlCombatant";
import {
    SohlCombat,
    SohlCombatDataModel,
} from "@src/document/combat/SohlCombat";
import { SohlRegion, SohlRegionConfig } from "@src/document/region/SohlRegion";
import {
    SohlEncounter,
    SohlEncounterDataModel,
    SohlEncounterConfig,
} from "@src/document/region-behavior/SohlEncounter";

// Utilities
import * as utils from "@src/utils/helpers";
import * as constants from "@src/utils/constants";
import { FilePath, toFilePath } from "@src/utils/helpers";
import { SohlLocalize } from "@src/utils/SohlLocalize";
import { SohlLogger } from "@src/utils/SohlLogger";
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
} from "@src/utils/constants";

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
    [ITEM_KIND.AFFILIATION]: AffiliationDataModel,
    [ITEM_KIND.AFFLICTION]: AfflictionDataModel,
    [ITEM_KIND.ARMORGEAR]: ArmorGearDataModel,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueDataModel,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearDataModel,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearDataModel,
    [ITEM_KIND.INJURY]: InjuryDataModel,
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
    [ITEM_KIND.AFFILIATION]: AffiliationLogic,
    [ITEM_KIND.AFFLICTION]: AfflictionLogic,
    [ITEM_KIND.ARMORGEAR]: ArmorGearLogic,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueLogic,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearLogic,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearLogic,
    [ITEM_KIND.INJURY]: InjuryLogic,
    [ITEM_KIND.MISCGEAR]: MiscGearLogic,
    [ITEM_KIND.MYSTERY]: MysteryLogic,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilityLogic,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearLogic,
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
    [ITEM_KIND.AFFILIATION]: AffiliationSheet,
    [ITEM_KIND.AFFLICTION]: AfflictionSheet,
    [ITEM_KIND.ARMORGEAR]: ArmorGearSheet,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueSheet,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearSheet,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearSheet,
    [ITEM_KIND.INJURY]: InjurySheet,
    [ITEM_KIND.MISCGEAR]: MiscGearSheet,
    [ITEM_KIND.MYSTERY]: MysterySheet,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilitySheet,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearSheet,
    [ITEM_KIND.SKILL]: SkillSheet,
    [ITEM_KIND.TRAIT]: TraitSheet,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearSheet,
} as StrictObject<Constructor<SohlItemSheetBase>>);

/**
 * Central system class for the Song of Heroic Lands (SoHL).
 * Provides the canonical runtime registry/config surface for constructing
 * data models, results, and modifiers.
 */
export class SohlSystem {
    private static _instance: SohlSystem | null = null;

    static getInstance(): SohlSystem {
        if (!this._instance) {
            this._instance = new SohlSystem();
        }
        return this._instance;
    }

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

    static readonly utils: typeof utils = utils;
    static readonly constants: typeof constants = constants;
    static ready: boolean = false;
    readonly i18n: SohlLocalize;
    readonly log: SohlLogger;
    readonly events: SohlEventQueue;

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

    protected constructor() {
        this.i18n = SohlLocalize.getInstance();
        this.log = SohlLogger.getInstance();
        this.events = new SohlEventQueue();
    }

    get game(): SohlSystem {
        return SohlSystem.getInstance();
    }

    setupSheets(): void {
        ActorKinds.forEach((kind) => {
            foundry.applications.apps.DocumentSheetConfig.registerSheet(
                CONFIG.Actor.documentClass,
                "sohl",
                COMMON_ACTOR_SHEETS[kind] as any,
                {
                    types: [kind],
                    makeDefault: true,
                },
            );
        });
        ItemKinds.forEach((kind) => {
            foundry.applications.apps.DocumentSheetConfig.registerSheet(
                CONFIG.Item.documentClass,
                "sohl",
                COMMON_ITEM_SHEETS[kind] as any,
                {
                    types: [kind],
                    makeDefault: true,
                },
            );
        });
        foundry.applications.apps.DocumentSheetConfig.registerSheet(
            CONFIG.ActiveEffect.documentClass,
            "sohl",
            SohlActiveEffectSheet,
            {
                makeDefault: true,
            },
        );
    }
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
