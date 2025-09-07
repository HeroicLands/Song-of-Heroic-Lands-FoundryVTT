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

import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import { GearMixin, kGearMixin } from "@common/item/GearMixin";
const { StringField, SchemaField, ArrayField } = foundry.data.fields;
const kArmorGear = Symbol("ArmorGear");
const kData = Symbol("ArmorGear.Data");

export class ArmorGear
    extends GearMixin(SohlItem.BaseLogic)
    implements ArmorGear.Logic
{
    declare [kGearMixin]: true;
    declare readonly parent: ArmorGear.Data;
    protection!: PlainObject;
    traits!: StrictObject<string>;
    readonly [kArmorGear] = true;

    static isA(obj: unknown): obj is ArmorGear {
        return typeof obj === "object" && obj !== null && kArmorGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
        this.protection = {};
        this.traits = {};
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

export namespace ArmorGear {
    export interface Logic extends SohlItem.Logic, GearMixin.Logic {
        readonly parent: ArmorGear.Data;
        readonly [kArmorGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
        material: string;
        locations: {
            flexible: string[];
            rigid: string[];
        };
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<ArmorGear.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements ArmorGear.Data {
        static override readonly LOCALIZATION_PREFIXES = ["ArmorGear"];
        readonly [kData] = true;
        material!: string;
        locations!: { flexible: string[]; rigid: string[] };

        static override create<Logic>(
            data: PlainObject,
            options: PlainObject,
        ): Logic {
            if (!(options.parent instanceof SohlItem)) {
                throw new Error("Parent must be a SohlItem");
            }
            return new ArmorGear(data, { parent: options.parent }) as Logic;
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
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/armorgear.hbs",
                },
            });
    }
}
