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

import { SohlPerformer } from "@common";
import { SohlAction } from "@common/event";
import { RegisterClass } from "@utils/decorators";
import { GearMixin, SohlItem } from "@common/item";
const { StringField, SchemaField, ArrayField } = foundry.data.fields;
const kArmorGear = Symbol("ArmorGear");
const kDataModel = Symbol("ArmorGear.DataModel");

@RegisterClass(
    new SohlPerformer.Element({
        kind: "ArmorGearPerformer",
    }),
)
export class ArmorGear extends SohlPerformer<ArmorGear.Data> {
    protection!: PlainObject;
    traits!: StrictObject<string>;
    readonly [kArmorGear] = true;

    static isA(obj: unknown): obj is ArmorGear {
        return typeof obj === "object" && obj !== null && kArmorGear in obj;
    }

    initialize(options?: PlainObject): void {
        this.protection = {};
        this.traits = {};
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
}

export namespace ArmorGear {
    /**
     * The type moniker for the ArmorGear item.
     */
    export const Kind = "armorgear";

    /**
     * The FontAwesome icon class for the ArmorGear item.
     */
    export const IconCssClass = "fas fa-shield-halved";

    /**
     * The image path for the ArmorGear item.
     */
    export const Image = "systems/sohl/assets/icons/armor.svg";

    export interface Data<TPerformer extends ArmorGear = ArmorGear>
        extends SohlItem.Data<TPerformer> {
        material: string;
        locations: {
            flexible: string[];
            rigid: string[];
        };
    }

    export class DataModel<TPerformer extends ArmorGear = ArmorGear>
        extends GearMixin.DataModel(SohlItem.DataModel)
        implements Data<TPerformer>
    {
        static readonly LOCALIZATION_PREFIXES = ["ArmorGear"];
        declare material: string;
        declare locations: { flexible: string[]; rigid: string[] };
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                material: new StringField(),
                locations: new SchemaField({
                    flexible: new ArrayField(new StringField()),
                    rigid: new ArrayField(new StringField()),
                }),
            };
        }

        initialize(context?: SohlAction.Context): void {}

        evaluate(context?: SohlAction.Context): void {}

        finalize(context?: SohlAction.Context): void {}
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/armorgear.hbs",
                },
            });
    }
}
