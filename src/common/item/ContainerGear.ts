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
import { GearMixin, kGearMixin } from "@common/item/GearMixin";

const { NumberField } = foundry.data.fields;
const kContainerGear = Symbol("ContainerGear");
const kData = Symbol("ContainerGear.Data");

export class ContainerGear
    extends GearMixin(SohlItem.BaseLogic)
    implements ContainerGear.Logic
{
    declare readonly [kGearMixin]: true;
    declare readonly _parent: ContainerGear.Data;
    readonly [kContainerGear] = true;

    static isA(obj: unknown): obj is ContainerGear {
        return typeof obj === "object" && obj !== null && kContainerGear in obj;
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

export namespace ContainerGear {
    export interface Logic extends GearMixin.Logic {
        readonly _parent: ContainerGear.Data;
        readonly [kContainerGear]: true;
    }

    export interface Data extends GearMixin.Data {
        readonly [kData]: true;
        get logic(): ContainerGear.Logic;
        maxCapacityBase: number;
    }

    const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<ContainerGear.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["ContainerGear"];
        maxCapacityBase!: number;
        readonly [kData] = true;

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
