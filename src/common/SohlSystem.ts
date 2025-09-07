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
import { Entity } from "@common/actor/Entity";
import { Assembly } from "@common/actor/Assembly";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { Affiliation } from "@common/item/Affiliation";
import { Affliction } from "@common/item/Affliction";
import { ArmorGear } from "@common/item/ArmorGear";
import { BodyLocation } from "@common/item/BodyLocation";
import { BodyPart } from "@common/item/BodyPart";
import { BodyZone } from "@common/item/BodyZone";
import { CombatTechniqueStrikeMode } from "@common/item/CombatTechniqueStrikeMode";
import { ConcoctionGear } from "@common/item/ConcoctionGear";
import { ContainerGear } from "@common/item/ContainerGear";
import { Domain } from "@common/item/Domain";
import { Injury } from "@common/item/Injury";
import { MeleeWeaponStrikeMode } from "@common/item/MeleeWeaponStrikeMode";
import { MiscGear } from "@common/item/MiscGear";
import { MissileWeaponStrikeMode } from "@common/item/MissileWeaponStrikeMode";
import { Mystery } from "@common/item/Mystery";
import { MysticalAbility } from "@common/item/MysticalAbility";
import { MysticalDevice } from "@common/item/MysticalDevice";
import { Philosophy } from "@common/item/Philosophy";
import { ProjectileGear } from "@common/item/ProjectileGear";
import { Protection } from "@common/item/Protection";
import { Skill } from "@common/item/Skill";
import { Trait } from "@common/item/Trait";
import { WeaponGear } from "@common/item/WeaponGear";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import { SohlCombatant } from "@common/combatant/SohlCombatant";
import * as utils from "@utils/helpers";
import { FilePath, toFilePath } from "@utils/helpers";
import { SohlLocalize } from "@utils/SohlLocalize";
import { SohlLogger } from "@utils/SohlLogger";
import { Itr } from "@utils/Itr";
import { SohlBase } from "@common/SohlBase";
import { SohlEffect } from "@common/effect/SohlEffect";
import {
    ACTOR_KIND,
    ACTOR_METADATA,
    ActorKinds,
    defineType,
    EFFECT_METADATA,
    EffectMetadatas,
    ITEM_KIND,
    ITEM_METADATA,
    ItemKinds,
} from "@utils/constants";

export const {
    kind: COMMON_ACTOR_DATA_MODEL,
    values: CommonActorDataModels,
    isValue: isCommonActorDataModel,
    labels: CommonActorDataModelLabels,
} = defineType("TYPES.Actor", {
    [ACTOR_KIND.ENTITY]: Entity.DataModel,
    [ACTOR_KIND.ASSEMBLY]: Assembly.DataModel,
} as Record<string, Constructor<SohlDataModel<any>>>);

export const {
    kind: COMMON_ACTOR_LOGIC,
    values: CommonActorLogic,
    isValue: isCommonActorLogic,
    labels: CommonActorLogicLabels,
} = defineType("SOHL.Actor.Logic", {
    [ACTOR_KIND.ENTITY]: Entity,
    [ACTOR_KIND.ASSEMBLY]: Assembly,
} as Record<string, Constructor<SohlActor.Logic>>);

export const {
    kind: COMMON_ITEM_DATA_MODEL,
    values: CommonItemDataModels,
    isValue: isCommonItemDataModel,
    labels: CommonItemDataModelLabels,
} = defineType("TYPES.Item", {
    [ITEM_KIND.AFFILIATION]: Affiliation.DataModel,
    [ITEM_KIND.AFFLICTION]: Affliction.DataModel,
    [ITEM_KIND.ARMORGEAR]: ArmorGear.DataModel,
    [ITEM_KIND.BODYLOCATION]: BodyLocation.DataModel,
    [ITEM_KIND.BODYPART]: BodyPart.DataModel,
    [ITEM_KIND.BODYZONE]: BodyZone.DataModel,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: CombatTechniqueStrikeMode.DataModel,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGear.DataModel,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGear.DataModel,
    [ITEM_KIND.DOMAIN]: Domain.DataModel,
    [ITEM_KIND.INJURY]: Injury.DataModel,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: MeleeWeaponStrikeMode.DataModel,
    [ITEM_KIND.MISCGEAR]: MiscGear.DataModel,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: MissileWeaponStrikeMode.DataModel,
    [ITEM_KIND.MYSTERY]: Mystery.DataModel,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbility.DataModel,
    [ITEM_KIND.MYSTICALDEVICE]: MysticalDevice.DataModel,
    [ITEM_KIND.PHILOSOPHY]: Philosophy.DataModel,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGear.DataModel,
    [ITEM_KIND.PROTECTION]: Protection.DataModel,
    [ITEM_KIND.SKILL]: Skill.DataModel,
    [ITEM_KIND.TRAIT]: Trait.DataModel,
    [ITEM_KIND.WEAPONGEAR]: WeaponGear.DataModel,
} as unknown as StrictObject<Constructor<SohlDataModel<any, any>>>);

export const {
    kind: COMMON_ITEM_LOGIC,
    values: CommonItemLogic,
    isValue: isCommonItemLogic,
    labels: CommonItemLogicLabels,
} = defineType("TYPES.Item", {
    [ITEM_KIND.AFFILIATION]: Affiliation,
    [ITEM_KIND.AFFLICTION]: Affliction,
    [ITEM_KIND.ARMORGEAR]: ArmorGear,
    [ITEM_KIND.BODYLOCATION]: BodyLocation,
    [ITEM_KIND.BODYPART]: BodyPart,
    [ITEM_KIND.BODYZONE]: BodyZone,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: CombatTechniqueStrikeMode,
    [ITEM_KIND.CONCOCTIONGEAR]: ConcoctionGear,
    [ITEM_KIND.CONTAINERGEAR]: ContainerGear,
    [ITEM_KIND.DOMAIN]: Domain,
    [ITEM_KIND.INJURY]: Injury,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: MeleeWeaponStrikeMode,
    [ITEM_KIND.MISCGEAR]: MiscGear,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: MissileWeaponStrikeMode,
    [ITEM_KIND.MYSTERY]: Mystery,
    [ITEM_KIND.MYSTICALABILITY]: MysticalAbility,
    [ITEM_KIND.MYSTICALDEVICE]: MysticalDevice,
    [ITEM_KIND.PHILOSOPHY]: Philosophy,
    [ITEM_KIND.PROJECTILEGEAR]: ProjectileGear,
    [ITEM_KIND.PROTECTION]: Protection,
    [ITEM_KIND.SKILL]: Skill,
    [ITEM_KIND.TRAIT]: Trait,
    [ITEM_KIND.WEAPONGEAR]: WeaponGear,
} as Record<string, Constructor<SohlItem.Logic>>);

export const {
    kind: EFFECT_DATA_MODEL,
    values: EffectDataModels,
    isValue: isEffectDataModel,
    labels: EffectDataModelLabels,
} = defineType("TYPES.Effect", {
    [EFFECT_METADATA.ACTIVEEFFECTDATA.Kind]: SohlEffect.DataModel,
} as Record<string, Constructor<SohlDataModel<any>>>);

export const {
    kind: EFFECT_LOGIC,
    values: EffectLogic,
    isValue: isEffectLogic,
    labels: EffectLogicLabels,
} = defineType("TYPES.Effect", {
    [EFFECT_METADATA.ACTIVEEFFECTDATA.Kind]: SohlEffect,
} as Record<string, Constructor<SohlEffect.Logic>>);

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
            Actor: {
                documentClass: SohlActor,
                documentSheets: [
                    {
                        cls: SohlActor.Sheet,
                        types: ActorKinds,
                    },
                ],
                dataModels: COMMON_ACTOR_DATA_MODEL,
                typeLabels: CommonActorDataModelLabels,
                typeIcons: Object.fromEntries(
                    Object.values(ACTOR_KIND).map((kind) => [
                        kind,
                        ACTOR_METADATA[kind].IconCssClass,
                    ]),
                ),
                types: ActorKinds,
                defaultType: ACTOR_KIND.ENTITY,
                compendiums: ["sohl.leg-characters", "sohl.leg-creatures"],
                macros: {},
            },
            Item: {
                documentClass: SohlItem,
                documentSheets: [
                    {
                        cls: SohlItem.Sheet,
                        types: ItemKinds.filter(
                            (t) => t !== ITEM_KIND.CONTAINERGEAR,
                        ),
                    },
                    {
                        cls: ContainerGear.Sheet,
                        types: [ITEM_KIND.CONTAINERGEAR],
                    },
                ],
                dataModels: COMMON_ITEM_DATA_MODEL,
                typeLabels: CommonItemDataModelLabels,
                typeIcons: Object.fromEntries(
                    Object.values(ITEM_KIND).map((kind) => [
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
                    Object.values(EFFECT_METADATA).map((meta) => [
                        meta.Kind,
                        meta.IconCssClass,
                    ]),
                ),
                types: EffectMetadatas.map((m) => m.Kind),
                legacyTransferral: false,
            },
            Combatant: {
                documentClass: SohlCombatant,
                documentSheets: [],
                dataModels: {},
                typeLabels: {},
                typeIcons: {},
                types: [],
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
    static simpleCalendar?: any;
    static ready: boolean = false;
    readonly classRegistry: SohlMap<string, Constructor<SohlBase>>;
    readonly dataModelRegistry: SohlMap<
        string,
        Constructor<SohlDataModel<any>>
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

    get simpleCalendar(): any {
        return (this.constructor as any).simpleCalendar;
    }

    get utils(): typeof utils {
        return (this.constructor as any).utils;
    }

    protected constructor() {
        this.dataModelRegistry = new SohlMap<
            string,
            Constructor<SohlDataModel<any>>
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
            const variant = (game as any).settings.get(
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
        dataModels: StrictObject<Constructor<SohlDataModel<any>>>;
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
