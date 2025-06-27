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
import { SohlDataModel, SohlLogic } from "@common";
import { SohlAction, SohlEvent } from "@common/event";
import { MasteryLevelMixin, SohlItem, SubTypeMixin } from "@common/item";
import { defineType } from "@utils";
import { RegisterClass } from "@utils/decorators";
const kMysticalAbility = Symbol("MysticalAbility");
const kData = Symbol("MysticalAbility.Data");
const { SchemaField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "MysticalAbility",
    }),
)
export class MysticalAbility
    extends SubTypeMixin(MasteryLevelMixin(SohlLogic))
    implements
        MysticalAbility.Logic,
        SubTypeMixin.Logic,
        MasteryLevelMixin.Logic
{
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
    /**
     * The type moniker for the MysticalAbility item.
     */
    export const Kind = "mysticalability";

    /**
     * The FontAwesome icon class for the MysticalAbility item.
     */
    export const IconCssClass = "fas fa-hand-sparkles";

    /**
     * The image path for the MysticalAbility item.
     */
    export const Image = "systems/sohl/assets/icons/hand-sparkles.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.MysticalAbility.SubType", {
        SHAMANICRITE: "shamanicrite",
        SPIRITACTION: "spiritaction",
        SPIRITPOWER: "spiritpower",
        BENEDICTION: "benediction",
        DIVINEDEVOTION: "divinedevotion",
        DIVINEINCANTATION: "divineincantation",
        ARCANEINCANTATION: "arcaneincantation",
        ARCANEINVOCATION: "arcaneinvocation",
        ARCANETALENT: "arcanetalent",
        ALCHEMY: "alchemy",
        DIVINATION: "divination",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export const {
        kind: DEGREE,
        values: Degrees,
        isValue: isDegree,
    } = defineType("SOHL.MysticalAbility.Degree", {
        PRIMARY: { name: "primary", value: 0 },
        SECONDARY: { name: "secondary", value: 1 },
        NEUTRAL: { name: "neutral", value: 2 },
        TERTIARY: { name: "tertiary", value: 3 },
        DIAMETRIC: { name: "diametric", value: 4 },
    });
    export type Degree = (typeof DEGREE)[keyof typeof DEGREE];

    export interface Logic extends SohlLogic.Logic {
        readonly parent: MysticalAbility.Data;
        readonly [kMysticalAbility]: true;
    }

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<SubType> {
        get logic(): MysticalAbility.Logic;
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
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        SubType,
        typeof SubTypes
    >(
        MasteryLevelMixin.DataModel(SohlItem.DataModel),
        SubTypes,
    ) as unknown as Constructor<MysticalAbility.Data> &
        SohlItem.DataModel.Statics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: MysticalAbility,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
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
        declare subType: SubType;
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
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/mysticalability.hbs",
                },
            });
    }
}
