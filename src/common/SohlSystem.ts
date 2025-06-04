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

import {
    AnimateEntityDataModel,
    InanimateObjectDataModel,
} from "@common/actor/datamodel";
import { DataModelMetadata } from "@common";
import { SohlMap } from "@utils/collection";
import {
    AffiliationDataModel,
    AfflictionDataModel,
    ArmorGearDataModel,
    BodyLocationDataModel,
    BodyPartDataModel,
    BodyZoneDataModel,
    CombatTechniqueStrikeModeDataModel,
    ConcoctionGearDataModel,
    ContainerGearDataModel,
    DomainDataModel,
    InjuryDataModel,
    MeleeWeaponStrikeModeDataModel,
    MiscGearDataModel,
    MissileWeaponStrikeModeDataModel,
    MysteryDataModel,
    MysticalAbilityDataModel,
    MysticalDeviceDataModel,
    PhilosophyDataModel,
    ProjectileGearDataModel,
    ProtectionDataModel,
    SkillDataModel,
    TraitDataModel,
    WeaponGearDataModel,
} from "@common/item/datamodel";
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
import { SohlActor, SohlActorSheet } from "@common/actor";
import { SohlContainerGearSheet, SohlItem, SohlItemSheet } from "@common/item";
import { SohlActiveEffect, SohlActiveEffectDataModel } from "@common/effect";
import { SohlCombatant } from "@common/combatant/SohlCombatant";
import * as utils from "@utils";
import Document from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import DocumentSheetV2 from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/document-sheet.mjs";

export const SOHL_VARIANT = {
    LEGENDARY: "legendary",
    MISTY_ISLE: "mistyisle",
} as const;
export type SohlVariant = (typeof SOHL_VARIANT)[keyof typeof SOHL_VARIANT];

const ActorDataModels: Record<string, DataModelMetadata> = {
    [AnimateEntityDataModel.kind]: AnimateEntityDataModel._metadata,
    [InanimateObjectDataModel.kind]: InanimateObjectDataModel._metadata,
};

const ItemDataModels: Record<string, DataModelMetadata> = {
    [AffiliationDataModel.kind]: AffiliationDataModel._metadata,
    [AfflictionDataModel.kind]: AfflictionDataModel._metadata,
    [ArmorGearDataModel.kind]: ArmorGearDataModel._metadata,
    [BodyLocationDataModel.kind]: BodyLocationDataModel._metadata,
    [BodyPartDataModel.kind]: BodyPartDataModel._metadata,
    [BodyZoneDataModel.kind]: BodyZoneDataModel._metadata,
    [CombatTechniqueStrikeModeDataModel.kind]:
        CombatTechniqueStrikeModeDataModel._metadata,
    [ConcoctionGearDataModel.kind]: ConcoctionGearDataModel._metadata,
    [ContainerGearDataModel.kind]: ContainerGearDataModel._metadata,
    [DomainDataModel.kind]: DomainDataModel._metadata,
    [InjuryDataModel.kind]: InjuryDataModel._metadata,
    [MeleeWeaponStrikeModeDataModel.kind]:
        MeleeWeaponStrikeModeDataModel._metadata,
    [MiscGearDataModel.kind]: MiscGearDataModel._metadata,
    [MissileWeaponStrikeModeDataModel.kind]:
        MissileWeaponStrikeModeDataModel._metadata,
    [MysteryDataModel.kind]: MysteryDataModel._metadata,
    [MysticalAbilityDataModel.kind]: MysticalAbilityDataModel._metadata,
    [MysticalDeviceDataModel.kind]: MysticalDeviceDataModel._metadata,
    [PhilosophyDataModel.kind]: PhilosophyDataModel._metadata,
    [ProjectileGearDataModel.kind]: ProjectileGearDataModel._metadata,
    [ProtectionDataModel.kind]: ProtectionDataModel._metadata,
    [SkillDataModel.kind]: SkillDataModel._metadata,
    [TraitDataModel.kind]: TraitDataModel._metadata,
    [WeaponGearDataModel.kind]: WeaponGearDataModel._metadata,
};

/**
 * Abstract class representing a system variant for the Song of Heroic Lands (SoHL).
 * This class provides a structure for defining system-specific properties and methods.
 */
export abstract class SohlSystem {
    protected static _variants: SohlMap<string, SohlSystem>;
    protected static _curVariant?: SohlSystem;
    static readonly CONFIG: PlainObject = {
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
            defeated: "systems/sohl/assets/icons/surrender.svg",
        },
        Actor: {
            documentClass: SohlActor,
            documentSheets: [
                {
                    cls: SohlActorSheet,
                    types: Object.keys(ActorDataModels),
                },
            ],
            dataModels: Object.fromEntries(
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
            defaultType: AnimateEntityDataModel.kind,
            compendiums: ["sohl.leg-characters", "sohl.leg-creatures"],
            macros: {},
        },
        Item: {
            documentClass: SohlItem,
            documentSheets: [
                {
                    cls: SohlItemSheet,
                    types: Object.keys(ItemDataModels).filter(
                        (t) => t !== ContainerGearDataModel.kind,
                    ),
                },
                {
                    cls: SohlContainerGearSheet,
                    types: [ContainerGearDataModel.kind],
                },
            ],
            dataModels: Object.fromEntries(
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
            dataModels: {
                [SohlActiveEffectDataModel.kind]: SohlActiveEffectDataModel,
            },
            typeLabels: {
                [SohlActiveEffectDataModel.kind]: `TYPES.ActiveEffect.${SohlActiveEffectDataModel.kind}`,
            },
            typeIcons: {
                [SohlActiveEffectDataModel.kind]:
                    SohlActiveEffectDataModel.iconCssClass,
            },
            types: [SohlActiveEffectDataModel.kind],
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
    protected dataModelRegistry: SohlMap<
        string,
        SohlMap<string, DataModelMetadata>
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
        this.dataModelRegistry = new SohlMap<
            string,
            SohlMap<string, DataModelMetadata>
        >();
        registerDataModel("Actor", AnimateEntityDataModel._metadata);
        registerDataModel("Actor", InanimateObjectDataModel._metadata);
        registerDataModel("Item", AffiliationDataModel._metadata);
        registerDataModel("Item", AfflictionDataModel._metadata);
        registerDataModel("Item", ArmorGearDataModel._metadata);
        registerDataModel("Item", BodyLocationDataModel._metadata);
        registerDataModel("Item", BodyPartDataModel._metadata);
        registerDataModel("Item", BodyZoneDataModel._metadata);
        registerDataModel("Item", CombatTechniqueStrikeModeDataModel._metadata);
        registerDataModel("Item", ConcoctionGearDataModel._metadata);
        registerDataModel("Item", ContainerGearDataModel._metadata);
        registerDataModel("Item", DomainDataModel._metadata);
        registerDataModel("Item", InjuryDataModel._metadata);
        registerDataModel("Item", MeleeWeaponStrikeModeDataModel._metadata);
        registerDataModel("Item", MiscGearDataModel._metadata);
        registerDataModel("Item", MissileWeaponStrikeModeDataModel._metadata);
        registerDataModel("Item", MysteryDataModel._metadata);
        registerDataModel("Item", MysticalAbilityDataModel._metadata);
        registerDataModel("Item", MysticalDeviceDataModel._metadata);
        registerDataModel("Item", PhilosophyDataModel._metadata);
        registerDataModel("Item", ProjectileGearDataModel._metadata);
        registerDataModel("Item", ProtectionDataModel._metadata);
        registerDataModel("Item", SkillDataModel._metadata);
        registerDataModel("Item", TraitDataModel._metadata);
        registerDataModel("Item", WeaponGearDataModel._metadata);
    }

    registerDataModel(docType: string, data: DataModelMetadata): void {
        const { kind } = data;
        if (!this.dataModelRegistry.has(docType)) {
            this.dataModelRegistry.set(
                docType,
                new SohlMap<string, DataModelMetadata>(),
            );
        }
        this.dataModelRegistry.get(docType)?.set(kind, data);
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

export type docType = "Item" | "Actor";
const metadata: StrictObject<DataModelMetadata> = {};

export function registerDataModel(
    docType: docType,
    data: DataModelMetadata,
): void {
    const { kind } = data;
    if (metadata) {
        metadata[kind] = data;
    }
}
