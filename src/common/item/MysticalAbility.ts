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
import { SohlLogic } from "@common/SohlLogic";
import type { SohlAction } from "@common/event/SohlAction";
import {
    kMasteryLevelMixin,
    MasteryLevelMixin,
} from "@common/item/MasteryLevelMixin";
import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import {
    MysticalAbilitySubType,
    MysticalAbilitySubTypes,
} from "@utils/constants";
const kMysticalAbility = Symbol("MysticalAbility");
const kData = Symbol("MysticalAbility.Data");
const { SchemaField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

export class MysticalAbility
    extends SubTypeMixin(MasteryLevelMixin(SohlLogic))
    implements
        MysticalAbility.Logic,
        SubTypeMixin.Logic,
        MasteryLevelMixin.Logic
{
    declare [kMasteryLevelMixin]: true;
    declare masteryLevel: MasteryLevelModifier;
    declare magicMod: number;
    declare boosts: number;
    declare _availableFate: SohlItem<SohlLogic, any>[];
    declare availableFate: SohlItem<SohlLogic, any>[];
    declare valid: boolean;
    declare skillBase: MasteryLevelMixin.SkillBase;
    declare sdrIncr: number;
    improveWithSDR(context: SohlAction.Context): Promise<void> {
        throw new Error("Method not implemented.");
    }
    declare readonly parent: MysticalAbility.Data;
    readonly [kMysticalAbility] = true;

    static isA(obj: unknown): obj is MysticalAbility {
        return (
            typeof obj === "object" && obj !== null && kMysticalAbility in obj
        );
    }

    /** @inheritdoc */
    initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace MysticalAbility {
    export interface Logic
        extends MasteryLevelMixin.Logic,
            SubTypeMixin.Logic<MysticalAbilitySubType> {
        readonly parent: Data;
        readonly [kMysticalAbility]: true;
    }

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<MysticalAbilitySubType> {
        readonly logic: Logic;
        readonly [kData]: true;
        config: {
            usesCharges: boolean;
            usesSkills: boolean;
            assocPhilosophy: string;
            assocSkill: string;
            isImprovable: boolean;
        };
        domain: string;
        skills: string[];
        levelBase: number;
        charges: {
            value: number;
            max: number;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: MysticalAbilitySubType,
        ): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kData in obj &&
                (subType ? (obj as Data).subType === subType : true)
            );
        }
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        MysticalAbilitySubType,
        typeof MysticalAbilitySubTypes
    >(
        MasteryLevelMixin.DataModel(SohlItem.DataModel),
        MysticalAbilitySubTypes,
    ) as unknown as Constructor<MysticalAbility.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static readonly LOCALIZATION_PREFIXES = ["MysticalAbility"];
        declare abbrev: string;
        declare skillBaseFormula: string;
        declare masteryLevelBase: number;
        declare improveFlag: boolean;
        declare config: {
            usesCharges: boolean;
            usesSkills: boolean;
            assocPhilosophy: string;
            assocSkill: string;
            isImprovable: boolean;
        };
        declare domain: string;
        declare skills: string[];
        declare levelBase: number;
        declare charges: {
            value: number;
            max: number;
        };
        declare subType: MysticalAbilitySubType;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                config: new SchemaField({
                    usesCharges: new BooleanField({ initial: false }),
                    usesSkills: new BooleanField({ initial: false }),
                    assocPhilosophy: new StringField(),
                    assocSkill: new StringField(),
                    isImprovable: new BooleanField({ initial: false }),
                }),
                domain: new StringField(),
                levelBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                charges: new SchemaField({
                    value: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    // Note: if max charges is 0, then there is no maximum
                    max: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/mysticalability.hbs",
                },
            });
    }
}
