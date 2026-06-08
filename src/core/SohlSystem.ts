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
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { CombatModifier } from "@src/domain/modifier/CombatModifier";
import { AttackResult } from "@src/domain/result/AttackResult";
import { DefendResult } from "@src/domain/result/DefendResult";
import { CombatResult } from "@src/domain/result/CombatResult";
import { ImpactResult } from "@src/domain/result/ImpactResult";
import { OpposedTestResult } from "@src/domain/result/OpposedTestResult";
import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
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
import { SohlScene } from "@src/document/scene/SohlScene";
import { SohlSceneDataModel } from "@src/document/scene/SohlSceneDataModel";
import { SohlSceneConfig } from "@src/document/scene/SohlSceneConfig";
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
    STATUS_EFFECT,
} from "@src/utils/constants";

/** Map of actor kind → its {@link SohlDataModel} constructor. */
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

export const {
    /** The actor-kind → Logic-class registry map. */
    kind: COMMON_ACTOR_LOGIC,
    /** All registered actor Logic constructors, as an array. */
    values: CommonActorLogic,
    /** Type guard: is the value one of the registered actor Logic classes? */
    isValue: isCommonActorLogic,
    /** Localized labels keyed by actor kind. */
    labels: CommonActorLogicLabels,
} = defineType("SOHL.Actor.Logic", {
    [ACTOR_KIND.BEING]: BeingLogic,
    [ACTOR_KIND.ASSEMBLY]: AssemblyLogic,
    [ACTOR_KIND.COHORT]: CohortLogic,
    [ACTOR_KIND.STRUCTURE]: StructureLogic,
    [ACTOR_KIND.VEHICLE]: VehicleLogic,
} as StrictObject<Constructor<SohlActorLogic<any>>>);

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

/** Map of item kind → its {@link SohlDataModel} constructor. */
export type ItemDMMap = Record<
    string,
    Constructor<SohlDataModel<any, SohlItem, any>>
>;
/** Canonical item-kind → DataModel registry, keyed by {@link ITEM_KIND}. */
export const ITEM_DM_DEF: ItemDMMap = {
    [ITEM_KIND.AFFILIATION]: AffiliationDataModel,
    [ITEM_KIND.AFFLICTION]: AfflictionDataModel,
    [ITEM_KIND.ARMORGEAR]: ArmorGearDataModel,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueDataModel,
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

export const {
    /** The item-kind → Logic-class registry map. */
    kind: COMMON_ITEM_LOGIC,
    /** All registered item Logic constructors, as an array. */
    values: CommonItemLogic,
    /** Type guard: is the value one of the registered item Logic classes? */
    isValue: isCommonItemLogic,
    /** Localized labels keyed by item kind. */
    labels: CommonItemLogicLabels,
} = defineType("TYPES.Item", {
    [ITEM_KIND.AFFILIATION]: AffiliationLogic,
    [ITEM_KIND.AFFLICTION]: AfflictionLogic,
    [ITEM_KIND.ARMORGEAR]: ArmorGearLogic,
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueLogic,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGearLogic,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGearLogic,
    [ITEM_KIND.TRAUMA]: TraumaLogic,
    [ITEM_KIND.MISCGEAR]: MiscGearLogic,
    [ITEM_KIND.MYSTERY]: MysteryLogic,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbilityLogic,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGearLogic,
    [ITEM_KIND.SKILL]: SkillLogic,
    [ITEM_KIND.TRAIT]: TraitLogic,
    [ITEM_KIND.WEAPONGEAR]: WeaponGearLogic,
} as StrictObject<Constructor<SohlItemLogic<any>>>);

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
    [ITEM_KIND.COMBATTECHNIQUE]: CombatTechniqueSheet,
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

/**
 * Central system class for the Song of Heroic Lands (SoHL).
 * Provides the canonical runtime registry/config surface for constructing
 * data models, results, and modifiers.
 */
export class SohlSystem {
    private static _instance: SohlSystem | null = null;

    /** Return the singleton instance, creating it on first call. */
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
    /**
     * The system's registration config, merged into Foundry's `CONFIG` at init.
     * It declares status effects, the world-time calendar, and — per document
     * type — the document/sheet/DataModel classes, plus the modifier and result
     * class registries. See {@link SohlSystem.Config} for the shape.
     */
    get CONFIG(): SohlSystem.Config {
        return {
            // `mergeObject` replaces arrays wholesale, so we must spread
            // Foundry's default statuses (dead, unconscious, sleep, stun,
            // prone, restrain, paralysis, frozen, …) here — otherwise they
            // would be wiped out, leaving combat conditions unrepresentable.
            statusEffects: [
                ...(
                    ((globalThis as any).CONFIG?.statusEffects ?? []) as any[]
                ).map((e) => ({ ...e })),
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
                    "sohl.timestamp": SohlCalendarData.formatTimestamp,
                    "sohl.relative": SohlCalendarData.formatRelativeTime,
                    "sohl.default": SohlCalendarData.formatDefault,
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
                    base: "fa-duotone fa-map",
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
    }

    /** The {@link utils} helper module (static access). */
    static readonly utils: typeof utils = utils;
    /** The {@link constants} module (static access). */
    static readonly constants: typeof constants = constants;
    /** Set true once the system has finished its `ready`-hook setup. */
    static ready: boolean = false;
    /** Localization helper (`sohl.i18n`). */
    readonly i18n: SohlLocalize;
    /** System logger (`sohl.log`). */
    readonly log: SohlLogger;
    /** In-memory trigger/event dispatcher (`sohl.events`). */
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
     * Apply a registered calendar to CONFIG.time, and re-initialize
     * game.time so the change takes effect without a reload. Safe to call
     * during the `init` hook before game.time exists.
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
        (game as any)?.time?.initializeCalendar?.();
    }

    /** The {@link utils} helper module (`sohl.utils`). */
    get utils(): typeof utils {
        return (this.constructor as any).utils;
    }

    /** The {@link constants} module (`sohl.constants`). */
    get constants(): typeof constants {
        return (this.constructor as any).constants;
    }

    protected constructor() {
        this.i18n = SohlLocalize.getInstance();
        this.log = SohlLogger.getInstance();
        this.events = new SohlEventQueue();
    }

    /**
     * Self-reference returning the singleton instance, so `sohl.game` reads
     * naturally alongside Foundry's `game.*` globals.
     */
    get game(): SohlSystem {
        return SohlSystem.getInstance();
    }

    /**
     * The currently active world calendar. May be a SohlCalendarData or any
     * CalendarData subclass installed by another module — code that consumes
     * this must use only the base CalendarData API (or guard with
     * `instanceof SohlCalendarData` before reaching for SoHL extensions).
     */
    get calendar(): foundry.data.CalendarData<foundry.data.CalendarData.TimeComponents> {
        return game.time.calendar;
    }

    /**
     * Register every actor, item, active-effect, and scene sheet with Foundry
     * and make them the default for their document types. Called once during
     * system initialization.
     */
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
        foundry.applications.apps.DocumentSheetConfig.registerSheet(
            CONFIG.Scene.documentClass,
            "sohl",
            SohlSceneConfig as any,
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
    export interface Config {
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
}
