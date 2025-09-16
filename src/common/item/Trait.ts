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

import type { SohlEventContext } from "@common/event/SohlEventContext";
import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import {
    kMasteryLevelMixin,
    MasteryLevelMixin,
} from "@common/item/MasteryLevelMixin";
import {
    TRAIT_INTENSITY,
    TraitIntensities,
    TraitIntensity,
    TraitSubType,
    TraitSubTypes,
} from "@utils/constants";
const kTrait = Symbol("Trait");
const kData = Symbol("Trait.Data");
const {
    ArrayField,
    ObjectField,
    SchemaField,
    NumberField,
    StringField,
    BooleanField,
} = foundry.data.fields;

export class Trait
    extends SubTypeMixin(MasteryLevelMixin(SohlItem.BaseLogic))
    implements Trait.Logic
{
    declare readonly [kMasteryLevelMixin]: true;
    declare readonly _parent: Trait.Data;
    readonly [kTrait] = true;

    static isA(obj: unknown): obj is Trait {
        return typeof obj === "object" && obj !== null && kTrait in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Trait {
    export interface Logic
        extends MasteryLevelMixin.Logic,
            SubTypeMixin.Logic<TraitSubType> {
        readonly _parent: Data;
        readonly [kTrait]: true;
    }
    export interface Data
        extends MasteryLevelMixin.Data,
            SubTypeMixin.Data<TraitSubType> {
        readonly [kData]: true;
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

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        TraitSubType,
        typeof TraitSubTypes
    >(
        MasteryLevelMixin.DataModel(SohlItem.DataModel),
        TraitSubTypes,
    ) as unknown as Constructor<Trait.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["TRAIT"];
        declare abbrev: string;
        declare skillBaseFormula: string;
        declare masteryLevelBase: number;
        declare improveFlag: boolean;
        declare subType: TraitSubType;
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
                    initial: TRAIT_INTENSITY.TRAIT,
                    required: true,
                    choices: TraitIntensities,
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
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/trait.hbs",
                },
            });
    }
}
