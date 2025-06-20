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

import { SohlMap } from "@utils/collection";
import {
    ImpactModifier,
    MasteryLevelModifier,
    ValueModifier,
    CombatModifier,
} from "@common/modifier";
import {
    AttackResult,
    CombatResult,
    DefendResult,
    ImpactResult,
    OpposedTestResult,
    SuccessTestResult,
} from "@common/result";
import { AnimateEntity, InanimateObject, SohlActor } from "@common/actor";
import {
    Affiliation,
    Affliction,
    ArmorGear,
    BodyLocation,
    BodyPart,
    BodyZone,
    CombatTechniqueStrikeMode,
    ConcoctionGear,
    ContainerGear,
    Domain,
    Injury,
    MeleeWeaponStrikeMode,
    MiscGear,
    MissileWeaponStrikeMode,
    Mystery,
    MysticalAbility,
    MysticalDevice,
    Philosophy,
    ProjectileGear,
    Protection,
    SohlItem,
    Skill,
    Trait,
    WeaponGear,
} from "@common/item";
import { SohlActiveEffect } from "@common/effect";
import { SohlCombatant } from "@common/combatant";
import * as utils from "@utils";
import { defineType, FilePath, toFilePath } from "@utils";
import { SohlDataModel } from "@common";

const ActorDataModels: Record<string, SohlDataModel.Metadata> = {
    [AnimateEntity.DataModel.kind]: AnimateEntity.DataModel._metadata,
    [InanimateObject.DataModel.kind]: InanimateObject.DataModel._metadata,
};

const ItemDataModels: Record<string, SohlDataModel.Metadata> = {
    [Affiliation.DataModel.kind]: Affiliation.DataModel._metadata,
    [Affliction.DataModel.kind]: Affliction.DataModel._metadata,
    [ArmorGear.DataModel.kind]: ArmorGear.DataModel._metadata,
    [BodyLocation.DataModel.kind]: BodyLocation.DataModel._metadata,
    [BodyPart.DataModel.kind]: BodyPart.DataModel._metadata,
    [BodyZone.DataModel.kind]: BodyZone.DataModel._metadata,
    [CombatTechniqueStrikeMode.DataModel.kind]:
        CombatTechniqueStrikeMode.DataModel._metadata,
    [ConcoctionGear.DataModel.kind]: ConcoctionGear.DataModel._metadata,
    [ContainerGear.DataModel.kind]: ContainerGear.DataModel._metadata,
    [Domain.DataModel.kind]: Domain.DataModel._metadata,
    [Injury.DataModel.kind]: Injury.DataModel._metadata,
    [MeleeWeaponStrikeMode.DataModel.kind]:
        MeleeWeaponStrikeMode.DataModel._metadata,
    [MiscGear.DataModel.kind]: MiscGear.DataModel._metadata,
    [MissileWeaponStrikeMode.DataModel.kind]:
        MissileWeaponStrikeMode.DataModel._metadata,
    [Mystery.DataModel.kind]: Mystery.DataModel._metadata,
    [MysticalAbility.DataModel.kind]: MysticalAbility.DataModel._metadata,
    [MysticalDevice.DataModel.kind]: MysticalDevice.DataModel._metadata,
    [Philosophy.DataModel.kind]: Philosophy.DataModel._metadata,
    [ProjectileGear.DataModel.kind]: ProjectileGear.DataModel._metadata,
    [Protection.DataModel.kind]: Protection.DataModel._metadata,
    [Skill.DataModel.kind]: Skill.DataModel._metadata,
    [Trait.DataModel.kind]: Trait.DataModel._metadata,
    [WeaponGear.DataModel.kind]: WeaponGear.DataModel._metadata,
};

/**
 * Abstract class representing a system variant for the Song of Heroic Lands (SoHL).
 * This class provides a structure for defining system-specific properties and methods.
 */
export abstract class SohlSystem {
    protected static _variants: SohlMap<string, SohlSystem>;
    protected static _curVariant?: SohlSystem;
    static readonly CONFIG: SohlSystem.Config = {
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
                    types: Object.keys(ActorDataModels),
                },
            ],
            DataModels: Object.fromEntries(
                Object.keys(ActorDataModels).map((i) => [
                    i,
                    ActorDataModels[i].ctor,
                ]),
            ),
            typeLabels: Object.fromEntries(
                Object.keys(ActorDataModels).map((i) => [
                    i,
                    `TYPES.Actor.${i}`,
                ]),
            ),
            typeIcons: Object.fromEntries(
                Object.keys(ActorDataModels).map((i) => [
                    i,
                    ActorDataModels[i].iconCssClass,
                ]),
            ),
            types: Object.keys(ActorDataModels),
            defaultType: AnimateEntity.DataModel.kind,
            compendiums: ["sohl.leg-characters", "sohl.leg-creatures"],
            macros: {},
        },
        Item: {
            documentClass: SohlItem,
            documentSheets: [
                {
                    cls: SohlItem.Sheet,
                    types: Object.keys(ItemDataModels).filter(
                        (t) => t !== ContainerGear.DataModel.kind,
                    ),
                },
                {
                    cls: ContainerGear.Sheet,
                    types: [ContainerGear.DataModel.kind],
                },
            ],
            DataModels: Object.fromEntries(
                Object.keys(ItemDataModels).map((i) => [
                    i,
                    ItemDataModels[i].ctor,
                ]),
            ),
            typeLabels: Object.fromEntries(
                Object.keys(ItemDataModels).map((i) => [i, `TYPES.Item.${i}`]),
            ),
            typeIcons: Object.fromEntries(
                Object.keys(ItemDataModels).map((i) => [
                    i,
                    ItemDataModels[i].iconCssClass,
                ]),
            ),
            types: Object.keys(ItemDataModels),
            compendiums: [
                "sohl.leg-characteristics",
                "sohl.leg-possessions",
                "sohl.leg-mysteries",
            ],
            macros: {},
        },
        ActiveEffect: {
            documentClass: SohlActiveEffect,
            DataModels: {
                [SohlActiveEffect.DataModel.kind]: SohlActiveEffect.DataModel,
            },
            typeLabels: {
                [SohlActiveEffect.DataModel.kind]:
                    `TYPES.ActiveEffect.${SohlActiveEffect.DataModel.kind}`,
            },
            typeIcons: {
                [SohlActiveEffect.DataModel.kind]:
                    SohlActiveEffect.DataModel.iconCssClass,
            },
            types: [SohlActiveEffect.Kind],
            legacyTransferral: false,
        },
        Combatant: {
            documentClass: SohlCombatant,
        },
        // Macro: {
        //     documentClass: SohlMacro,
        //     documentSheet: SohlMacroConfig,
        // },
        ValueModifier,
        CombatModifier,
        ImpactModifier,
        MasteryLevelModifier,
        SuccessTestResult,
        OpposedTestResult,
        ImpactResult,
        CombatResult,
        AttackResult,
        DefendResult,
    };

    static readonly CONST: PlainObject = {} as const;

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

    /**
     * A registry of data models for this system variant.
     * Maps document types to their respective data models.
     */
    protected DataModelRegistry: SohlMap<
        string,
        SohlMap<string, SohlDataModel.Metadata>
    >;

    /**
     * Registry of all SohlBase classes.  This is a singleton across all variants.
     * It is used to register and retrieve classes that are part of the Sohl system.
     */
    readonly classRegistry: utils.SohlClassRegistry;

    readonly i18n: utils.SohlLocalize;

    readonly log: utils.SohlLogger;

    static selectVariant(variant?: string): SohlSystem {
        if (!variant) {
            variant = (game as any).settings.get("sohl", "variant") as string;
        }
        this._curVariant = SohlSystem._variants.get(variant);
        if (!this._curVariant) {
            throw new Error(
                `SohlSystem: No variant found for "${variant}". Available variants: ${Array.from(
                    this._variants.keys(),
                ).join(", ")}`,
            );
        }
        return this._curVariant;
    }

    static get variants(): utils.Itr<[string, SohlSystem]> {
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
        this.classRegistry = utils.SohlClassRegistry.getInstance();
        this.i18n = utils.SohlLocalize.getInstance();
        this.log = utils.SohlLogger.getInstance();
        this.DataModelRegistry = new SohlMap<
            string,
            SohlMap<string, SohlDataModel.Metadata>
        >();
        registerDataModel("Actor", AnimateEntity.DataModel._metadata);
        registerDataModel("Actor", InanimateObject.DataModel._metadata);
        registerDataModel("Item", Affiliation.DataModel._metadata);
        registerDataModel("Item", Affliction.DataModel._metadata);
        registerDataModel("Item", ArmorGear.DataModel._metadata);
        registerDataModel("Item", BodyLocation.DataModel._metadata);
        registerDataModel("Item", BodyPart.DataModel._metadata);
        registerDataModel("Item", BodyZone.DataModel._metadata);
        registerDataModel(
            "Item",
            CombatTechniqueStrikeMode.DataModel._metadata,
        );
        registerDataModel("Item", ConcoctionGear.DataModel._metadata);
        registerDataModel("Item", ContainerGear.DataModel._metadata);
        registerDataModel("Item", Domain.DataModel._metadata);
        registerDataModel("Item", Injury.DataModel._metadata);
        registerDataModel("Item", MeleeWeaponStrikeMode.DataModel._metadata);
        registerDataModel("Item", MiscGear.DataModel._metadata);
        registerDataModel("Item", MissileWeaponStrikeMode.DataModel._metadata);
        registerDataModel("Item", Mystery.DataModel._metadata);
        registerDataModel("Item", MysticalAbility.DataModel._metadata);
        registerDataModel("Item", MysticalDevice.DataModel._metadata);
        registerDataModel("Item", Philosophy.DataModel._metadata);
        registerDataModel("Item", ProjectileGear.DataModel._metadata);
        registerDataModel("Item", Protection.DataModel._metadata);
        registerDataModel("Item", Skill.DataModel._metadata);
        registerDataModel("Item", Trait.DataModel._metadata);
        registerDataModel("Item", WeaponGear.DataModel._metadata);
    }

    registerDataModel(docType: string, data: SohlDataModel.Metadata): void {
        const { kind } = data;
        if (!this.DataModelRegistry.has(docType)) {
            this.DataModelRegistry.set(
                docType,
                new SohlMap<string, SohlDataModel.Metadata>(),
            );
        }
        this.DataModelRegistry.get(docType)?.set(kind, data);
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

    get variants(): utils.Itr<[string, SohlSystem]> {
        return (this.constructor as any).variants;
    }
}

export namespace SohlSystem {
    export const {
        kind: VARIANT,
        values: Variants,
        isValue: isVariant,
        labels: VariantLabels,
    } = defineType("SOHL.SohlSystem.Variant", {});
    export type Variant = (typeof VARIANT)[keyof typeof VARIANT];

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
        DataModels: StrictObject<SohlDataModel<any>>;
        typeLabels: StrictObject<string>;
        typeIcons: StrictObject<FilePath>;
        types: string[];
        defaultType?: string;
        compendiums?: string[];
        macros?: StrictObject<FilePath>;
    }

    export interface Config {
        statusEffects: ConfigStatusEffect[];
        specialStatusEffects: StrictObject<string>;
        controlIcons: StrictObject<FilePath>;
        Actor: DocumentConfig;
        Item: DocumentConfig;
        ActiveEffect: DocumentConfig;
        Combatant: DocumentConfig;
        ValueModifier(
            data: Partial<ValueModifier.Data>,
            options?: Partial<ValueModifier.Options>,
        ): ValueModifier;
        CombatModifier(
            data: Partial<CombatModifier.Data>,
            options?: Partial<CombatModifier.Options>,
        ): CombatModifier;
        ImpactModifier(
            data: Partial<ImpactModifier.Data>,
            options?: Partial<ImpactModifier.Options>,
        ): ImpactModifier;
        MasteryLevelModifier(
            data: Partial<MasteryLevelModifier.Data>,
            options?: Partial<MasteryLevelModifier.Options>,
        ): MasteryLevelModifier;
        SuccessTestResult(
            data: Partial<SuccessTestResult.Data>,
            options?: Partial<SuccessTestResult.Options>,
        ): SuccessTestResult;
        OpposedTestResult(
            data: Partial<OpposedTestResult.Data>,
            options?: Partial<OpposedTestResult.Options>,
        ): OpposedTestResult;
        ImpactResult(
            data: Partial<ImpactResult.Data>,
            options?: Partial<ImpactResult.Options>,
        ): ImpactResult;
        CombatResult(
            data: Partial<CombatResult.Data>,
            options?: Partial<CombatResult.Options>,
        ): CombatResult;
        AttackResult(
            data: Partial<AttackResult.Data>,
            options?: Partial<AttackResult.Options>,
        ): AttackResult;
        DefendResult(
            data: Partial<DefendResult.Data>,
            options?: Partial<DefendResult.Options>,
        ): DefendResult;
    }
}

export type docType = "Item" | "Actor";
const metadata: StrictObject<SohlDataModel.Metadata> = {};

export function registerDataModel(
    docType: docType,
    data: SohlDataModel.Metadata,
): void {
    const { kind } = data;
    if (metadata) {
        metadata[kind] = data;
    }
}
