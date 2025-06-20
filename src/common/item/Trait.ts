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
import { SohlAction } from "@common/event";
import { MasteryLevelMixin, SohlItem, SubTypeMixin } from "@common/item";
import { defineType } from "@utils";
import { RegisterClass } from "@utils/decorators";
const {
    ArrayField,
    ObjectField,
    SchemaField,
    NumberField,
    StringField,
    BooleanField,
} = foundry.data.fields;

@RegisterClass(
    new SohlLogic.Element({
        kind: "Trait",
    }),
)
export class Trait<TData extends Trait.Data = Trait.Data>
    extends SubTypeMixin(MasteryLevelMixin(SohlLogic))
    implements Trait.Logic<TData>
{
    declare readonly parent: TData;
    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace Trait {
    /**
     * The type moniker for the Trait item.
     */
    export const Kind = "mysticalability";

    /**
     * The FontAwesome icon class for the Trait item.
     */
    export const IconCssClass = "fas fa-user-gear";

    /**
     * The image path for the Trait item.
     */
    export const Image = "systems/sohl/assets/icons/user-gear.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.Trait.SubType", {
        PHYSIQUE: "physique",
        PERSONALITY: "personality",
        TRANSCENDENT: "transcendent",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export const {
        kind: INTENSITY,
        values: TraitIntensities,
        isValue: isTraitIntensity,
    } = defineType("SOHL.Trait.Intensity", {
        TRAIT: "trait",
        IMPULSE: "impulse",
        DISORDER: "disorder",
        ATTRIBUTE: "attribute",
    });
    export type TraitIntensity = (typeof INTENSITY)[keyof typeof INTENSITY];

    export interface Logic<TData extends Data = Data>
        extends SohlLogic.Logic<TData> {}

    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<SubType> {
        textValue: string;
        max: number | null;
        isNumeric: boolean;
        intensity: TraitIntensity;
        valueDesc: {
            label: string;
            maxValue: number;
        }[];
        choices: StrictObject<string>;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Trait,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
    export class DataModel
        extends SubTypeMixin.DataModel<
            typeof SohlItem.DataModel<Trait>,
            SubType,
            typeof SubTypes
        >(MasteryLevelMixin.DataModel(SohlItem.DataModel<Trait>), SubTypes)
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["TRAIT"];
        declare abbrev: string;
        declare skillBaseFormula: string;
        declare masteryLevelBase: number;
        declare improveFlag: boolean;
        declare subType: SubType;
        declare textValue: string;
        declare max: number | null;
        declare isNumeric: boolean;
        declare intensity: TraitIntensity;
        declare valueDesc: {
            label: string;
            maxValue: number;
        }[];
        declare choices: StrictObject<string>;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                textValue: new StringField(),
                max: new NumberField({
                    integer: true,
                    nullable: true,
                    initial: null,
                }),
                isNumeric: new BooleanField({ initial: false }),
                intensity: new StringField({
                    initial: INTENSITY.TRAIT,
                    required: true,
                    choices: Object.values(INTENSITY),
                }),
                valueDesc: new ArrayField(
                    new SchemaField({
                        label: new StringField({
                            blank: false,
                            required: true,
                        }),
                        maxValue: new NumberField({
                            integer: true,
                            required: true,
                            initial: 0,
                        }),
                    }),
                ),
                choices: new ObjectField(),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/trait.hbs",
                },
            });
    }
}
