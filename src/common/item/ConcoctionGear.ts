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

import { GearMixin, kGearMixin } from "@common/item/GearMixin";
import { SohlItem } from "@common/item/SohlItem";
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import {
    CONCOCTIONGEAR_POTENCY,
    ConcoctionGearPotency,
    ConcoctionGearSubType,
} from "@utils/constants";

const { NumberField, StringField } = foundry.data.fields;
const kConcoctionGear = Symbol("ConcoctionGear");
const kData = Symbol("ConcoctionGear.Data");

export class ConcoctionGear
    extends GearMixin(SohlItem.BaseLogic)
    implements ConcoctionGear.Logic
{
    declare [kGearMixin]: true;
    declare readonly _parent: ConcoctionGear.Data;
    readonly [kConcoctionGear] = true;

    static isA(obj: unknown): obj is ConcoctionGear {
        return (
            typeof obj === "object" && obj !== null && kConcoctionGear in obj
        );
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

export namespace ConcoctionGear {
    export interface Logic
        extends SubTypeMixin.Logic<ConcoctionGearSubType>,
            GearMixin.Logic {
        readonly _parent: ConcoctionGear.Data;
        readonly [kConcoctionGear]: true;
    }

    export interface Data
        extends SubTypeMixin.Data<ConcoctionGearSubType>,
            GearMixin.Data {
        readonly [kData]: true;
        potency: ConcoctionGearPotency;
        strength: number;
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: ConcoctionGearSubType,
        ): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kData in obj &&
                (subType ? (obj as Data).subType === subType : true)
            );
        }
    }

    const DataModelShape = GearMixin.DataModel(
        SohlItem.DataModel,
    ) as unknown as Constructor<ConcoctionGear.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel
        extends DataModelShape
        implements ConcoctionGear.Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["ConcoctionGear"];
        declare abbrev: string;
        declare quantity: number;
        declare weightBase: number;
        declare valueBase: number;
        declare isCarried: boolean;
        declare isEquipped: boolean;
        declare qualityBase: number;
        declare durabilityBase: number;
        declare subType: ConcoctionGearSubType;
        declare potency: ConcoctionGearPotency;
        declare strength: number;
        readonly [kData] = true;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                potency: new StringField({
                    initial: CONCOCTIONGEAR_POTENCY.NOT_APPLICABLE,
                    required: true,
                    choices: Object.values(CONCOCTIONGEAR_POTENCY),
                }),
                strength: new NumberField({
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
                    template: "systems/sohl/templates/item/concoctiongear.hbs",
                },
            });
    }
}
