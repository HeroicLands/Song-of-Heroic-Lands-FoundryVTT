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

import { SohlMap } from "@utils/collection/SohlMap";
import { SohlDataModel } from "@common/SohlDataModel";
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
import { BeingLogic, BeingDataModel, BeingSheet } from "@common/actor/Being";
import {
    AssemblyLogic,
    AssemblyDataModel,
    AssemblySheet,
} from "@common/actor/Assembly";
import {
    CohortDataModel,
    CohortLogic,
    CohortSheet,
} from "@common/actor/Cohort";
import {
    SohlActor,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import {
    SohlItem,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    AffiliationLogic,
    AffiliationDataModel,
    AffiliationSheet,
} from "@common/item/Affiliation";
import {
    AfflictionLogic,
    AfflictionDataModel,
    AfflictionSheet,
} from "@common/item/Affliction";
import {
    ArmorGearLogic,
    ArmorGearDataModel,
    ArmorGearSheet,
} from "@common/item/ArmorGear";
import {
    BodyLocationLogic,
    BodyLocationDataModel,
    BodyLocationSheet,
} from "@common/item/BodyLocation";
import {
    BodyPartLogic,
    BodyPartDataModel,
    BodyPartSheet,
} from "@common/item/BodyPart";
import {
    BodyZoneLogic,
    BodyZoneDataModel,
    BodyZoneSheet,
} from "@common/item/BodyZone";
import {
    CombatTechniqueStrikeModeLogic,
    CombatTechniqueStrikeModeDataModel,
    CombatTechniqueStrikeModeSheet,
} from "@common/item/CombatTechniqueStrikeMode";
import {
    ConcoctionGearLogic,
    ConcoctionGearDataModel,
    ConcoctionGearSheet,
} from "@common/item/ConcoctionGear";
import {
    ContainerGearLogic,
    ContainerGearDataModel,
    ContainerGearSheet,
} from "@common/item/ContainerGear";
import { DomainLogic, DomainDataModel, DomainSheet } from "@common/item/Domain";
import { InjuryLogic, InjuryDataModel, InjurySheet } from "@common/item/Injury";
import {
    MeleeWeaponStrikeModeLogic,
    MeleeWeaponStrikeModeDataModel,
    MeleeWeaponStrikeModeSheet,
} from "@common/item/MeleeWeaponStrikeMode";
import {
    MiscGearLogic,
    MiscGearDataModel,
    MiscGearSheet,
} from "@common/item/MiscGear";
import {
    MissileWeaponStrikeModeLogic,
    MissileWeaponStrikeModeDataModel,
    MissileWeaponStrikeModeSheet,
} from "@common/item/MissileWeaponStrikeMode";
import {
    MysteryLogic,
    MysteryDataModel,
    MysterySheet,
} from "@common/item/Mystery";
import {
    MysticalAbilityLogic,
    MysticalAbilityDataModel,
    MysticalAbilitySheet,
} from "@common/item/MysticalAbility";
import {
    MysticalDeviceLogic,
    MysticalDeviceDataModel,
    MysticalDeviceSheet,
} from "@common/item/MysticalDevice";
import {
    PhilosophyLogic,
    PhilosophyDataModel,
    PhilosophySheet,
} from "@common/item/Philosophy";
import {
    ProjectileGearLogic,
    ProjectileGearDataModel,
    ProjectileGearSheet,
} from "@common/item/ProjectileGear";
import {
    ProtectionLogic,
    ProtectionDataModel,
    ProtectionSheet,
} from "@common/item/Protection";
import { SkillLogic, SkillDataModel, SkillSheet } from "@common/item/Skill";
import { TraitLogic, TraitDataModel, TraitSheet } from "@common/item/Trait";
import {
    WeaponGearLogic,
    WeaponGearDataModel,
    WeaponGearSheet,
} from "@common/item/WeaponGear";
import { ActionLogic, ActionDataModel, ActionSheet } from "@common/item/Action";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SohlCombatant } from "@common/combatant/SohlCombatant";
import * as utils from "@utils/helpers";
import { FilePath, toFilePath } from "@utils/helpers";
import { SohlLocalize } from "@utils/SohlLocalize";
import { SohlLogger } from "@utils/SohlLogger";
import { Itr } from "@utils/Itr";
import { SohlBase } from "@common/SohlBase";
import { SohlEffectData } from "@common/effect/SohlEffectData";
import { SohlCombatantData } from "@common/combatant/SohlCombatantData";
import {
    ACTOR_KIND,
    ActorKinds,
    ACTOR_METADATA,
    ITEM_KIND,
    ItemKinds,
    ITEM_METADATA,
    EFFECT_KIND,
    EffectKinds,
    EFFECT_METADATA,
    COMBATANT_KIND,
    CombatantKinds,
    COMBATANT_METADATA,
    defineType,
    DefinedType,
    SOHL_DEFAULT_CALENDAR_CONFIG,
} from "@utils/constants";
import { getGame } from "@common/FoundryProxy";
import { SohlCalendarData } from "@common/SohlCalendar";
import {
    MovementProfileDataModel,
    MovementProfileLogic,
    MovementProfileSheet,
} from "@common/item/MovementProfile";
import {
    StructureDataModel,
    StructureLogic,
    StructureSheet,
} from "@common/actor/Structure";
import {
    VehicleDataModel,
    VehicleLogic,
    VehicleSheet,
} from "@common/actor/Vehicle";

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
    [ACTOR_KIND.BEING]: BeingSheet,
    [ACTOR_KIND.ASSEMBLY]: AssemblySheet,
    [ACTOR_KIND.COHORT]: CohortSheet,
    [ACTOR_KIND.STRUCTURE]: StructureSheet,
    [ACTOR_KIND.VEHICLE]: VehicleSheet,
} as StrictObject<Constructor<SohlActorSheetBase>>);

export type ItemDMMap = Record<
    string,
    Constructor<SohlDataModel<any, SohlItem, any>>
>;
export const ITEM_DM_DEF: ItemDMMap = {
    [ITEM_KIND.ACTION]: ActionDataModel,
    [ITEM_KIND.AFFILIATION]: AffiliationDataModel,
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

export const {
    kind: EFFECT_DATA_MODEL,
    values: EffectDataModels,
    isValue: isEffectDataModel,
    labels: EffectDataModelLabels,
} = defineType("TYPES.Effect", {
    [EFFECT_KIND.EFFECTDATA]: SohlEffectData.DataModel,
} as StrictObject<Constructor<SohlEffectData.DataModel>>);

export const {
    kind: EFFECT_LOGIC,
    values: EffectLogic,
    isValue: isEffectLogic,
    labels: EffectLogicLabels,
} = defineType("TYPES.Effect", {
    [EFFECT_KIND.EFFECTDATA]: SohlEffectData,
} as StrictObject<Constructor<SohlEffectData.Logic>>);

export const {
    kind: COMBATANT_DATA_MODEL,
    values: CombatantDataModels,
    isValue: isCombatantDataModel,
    labels: CombatantDataModelLabels,
} = defineType("TYPES.Combatant", {
    [COMBATANT_KIND.COMBATANTDATA]: SohlCombatantData.DataModel,
} as unknown as StrictObject<Constructor<SohlCombatantData.DataModel>>);

export const {
    kind: COMBATANT_LOGIC,
    values: CombatantLogic,
    isValue: isCombatantLogic,
    labels: CombatantLogicLabels,
} = defineType("TYPES.Combatant", {
    [COMBATANT_KIND.COMBATANTDATA]: SohlCombatantData,
} as StrictObject<Constructor<SohlCombatantData.Logic>>);

/**
 * Abstract class representing a system variant for the Song of Heroic Lands (SoHL).
 * This class provides a structure for defining system-specific properties and methods.
 */
export abstract class SohlSystem {
    protected static _variants: SohlMap<string, SohlSystem> = new SohlMap<
        string,
        SohlSystem
    >();
    protected static _curVariant?: SohlSystem;
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
                typeLabels: CommonActorDataModelLabels,
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
                typeLabels: CommonItemDataModelLabels,
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
                documentSheets: [],
                dataModels: EFFECT_DATA_MODEL,
                typeLabels: EffectDataModelLabels,
                typeIcons: Object.fromEntries(
                    EffectKinds.map((kind) => [
                        kind,
                        EFFECT_METADATA[kind].IconCssClass,
                    ]),
                ),
                types: EffectKinds,
                legacyTransferral: false,
            },
            Combatant: {
                documentClass: SohlCombatant,
                documentSheets: [],
                dataModels: COMBATANT_DATA_MODEL,
                typeLabels: CombatantDataModelLabels,
                typeIcons: Object.fromEntries(
                    CombatantKinds.map((kind) => [
                        kind,
                        COMBATANT_METADATA[kind].IconCssClass,
                    ]),
                ),
                types: CombatantKinds,
            },
            // Macro: {
            //     documentClass: SohlMacro,
            //     documentSheet: SohlMacroConfig,
            // },
            ValueModifier: ValueModifier,
            CombatModifier: CombatModifier,
            ImpactModifier: ImpactModifier,
            MasteryLevelModifier: MasteryLevelModifier,
            SuccessTestResult: SuccessTestResult,
            OpposedTestResult: OpposedTestResult,
            ImpactResult: ImpactResult,
            CombatResult: CombatResult,
            AttackResult: AttackResult,
            DefendResult: DefendResult,
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
    static ready: boolean = false;
    readonly classRegistry: SohlMap<string, Constructor<SohlBase>>;
    readonly dataModelRegistry: SohlMap<
        string,
        Constructor<SohlDataModel<any, any, any>>
    >;
    readonly i18n: SohlLocalize;
    readonly log: SohlLogger;

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

    protected constructor() {
        this.dataModelRegistry = new SohlMap<
            string,
            Constructor<SohlDataModel<any, any, any>>
        >([
            ...Object.entries(COMMON_ACTOR_DATA_MODEL),
            ...Object.entries(COMMON_ITEM_DATA_MODEL),
            ...Object.entries(EFFECT_DATA_MODEL),
        ]);
        this.classRegistry = new SohlMap<string, Constructor<SohlBase>>([
            ["ValueModifier", ValueModifier],
            ["CombatModifier", CombatModifier],
            ["ImpactModifier", ImpactModifier],
            ["MasteryLevelModifier", MasteryLevelModifier],
            ["SuccessTestResult", SuccessTestResult],
            ["OpposedTestResult", OpposedTestResult],
            ["ImpactResult", ImpactResult],
            ["CombatResult", CombatResult],
            ["AttackResult", AttackResult],
            ["DefendResult", DefendResult],
        ]);
        this.i18n = SohlLocalize.getInstance();
        this.log = SohlLogger.getInstance();
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

export namespace SohlSystem {
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
        dataModels: StrictObject<Constructor<SohlDataModel<any, any, any>>>;
        typeLabels: StrictObject<string>;
        typeIcons: StrictObject<string>;
        types: string[];
        defaultType?: string;
        compendiums?: string[];
        macros?: StrictObject<FilePath>;
        legacyTransferral?: boolean;
    }

    export interface ClassConfig {
        classes: StrictObject<Constructor<SohlBase>>;
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
        ValueModifier: Constructor<ValueModifier>;
        CombatModifier: Constructor<CombatModifier>;
        ImpactModifier: Constructor<ImpactModifier>;
        MasteryLevelModifier: Constructor<MasteryLevelModifier>;
        SuccessTestResult: Constructor<SuccessTestResult>;
        OpposedTestResult: Constructor<OpposedTestResult>;
        ImpactResult: Constructor<ImpactResult>;
        CombatResult: Constructor<CombatResult>;
        AttackResult: Constructor<AttackResult>;
        DefendResult: Constructor<DefendResult>;
    }
}
