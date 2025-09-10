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
import { GearMixin, kGearMixin } from "@common/item/GearMixin";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@utils/constants";

const { NumberField, StringField, SchemaField } = foundry.data.fields;
const kProjectileGear = Symbol("ProjectileGear");
const kData = Symbol("ProjectileGear.Data");

export class ProjectileGear
    extends SubTypeMixin(GearMixin(SohlItem.BaseLogic))
    implements ProjectileGear.Logic
{
    declare readonly [kGearMixin]: true;
    declare readonly _parent: ProjectileGear.Data;
    readonly [kProjectileGear] = true;

    static isA(obj: unknown): obj is ProjectileGear {
        return (
            typeof obj === "object" && obj !== null && kProjectileGear in obj
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

export namespace ProjectileGear {
    export interface Logic
        extends SubTypeMixin.Logic<ProjectileGearSubType>,
            GearMixin.Logic {
        readonly _parent: Data;
    }

    export interface Data
        extends SubTypeMixin.Data<ProjectileGearSubType>,
            GearMixin.Data {
        shortName: string;
        impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactAspect;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: ProjectileGearSubType,
        ): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kData in obj &&
                (subType ? (obj as unknown as Data).subType === subType : true)
            );
        }
    }

    export const DataModelShape = SubTypeMixin.DataModel(
        GearMixin.DataModel(SohlItem.DataModel),
        ProjectileGearSubTypes,
    ) as unknown as Constructor<ProjectileGear.Data> &
        SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        static readonly LOCALIZATION_PREFIXES = ["ProjectileGear"];
        shortName!: string;
        impactBase!: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactAspect;
        };
        readonly [kData] = true;

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                shortName: new StringField(),
                impactBase: new SchemaField({
                    numDice: new NumberField({
                        integer: true,
                        initial: 0,
                        min: 0,
                    }),
                    die: new NumberField({
                        integer: true,
                        initial: 6,
                        min: 1,
                    }),
                    modifier: new NumberField({
                        integer: true,
                        initial: -1,
                        min: -1,
                    }),
                    aspect: new StringField({
                        initial: IMPACT_ASPECT.BLUNT,
                        required: true,
                        choices: IMPACT_ASPECT,
                    }),
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/projectilegear.hbs",
                },
            });
    }
}
