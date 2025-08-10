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
import { SohlItem } from "@common/item/SohlItem";
import { GearMixin, kGearMixin } from "@common/item/GearMixin";
import { ValueModifier } from "@common/modifier/ValueModifier";

const { NumberField } = foundry.data.fields;
const kContainerGear = Symbol("ContainerGear");
const kData = Symbol("ContainerGear.Data");

export class ContainerGear extends SohlLogic implements ContainerGear.Logic {
    declare readonly [kGearMixin]: true;
    declare readonly parent: ContainerGear.Data;
    weight!: ValueModifier;
    value!: ValueModifier;
    quality!: ValueModifier;
    durability!: ValueModifier;
    readonly [kContainerGear] = true;

    static isA(obj: unknown): obj is ContainerGear {
        return typeof obj === "object" && obj !== null && kContainerGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace ContainerGear {
    export interface Logic extends GearMixin.Logic {
        readonly parent: ContainerGear.Data;
        readonly [kContainerGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
        get logic(): ContainerGear.Logic;
        maxCapacityBase: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<ContainerGear.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["ContainerGear"];
        declare _logic: Logic;
        maxCapacityBase!: number;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new ContainerGear(this);
            return this._logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                maxCapacityBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/containergear.hbs",
                },
            });
    }
}
