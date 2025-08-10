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
import { SubTypeMixin } from "@common/item/SubTypeMixin";
import { GearMixin, kGearMixin } from "@common/item/GearMixin";
import { ValueModifier } from "@common/modifier/ValueModifier";
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
    extends SubTypeMixin(GearMixin(SohlLogic))
    implements ProjectileGear.Logic
{
    declare readonly [kGearMixin]: true;
    declare readonly parent: ProjectileGear.Data;
    declare weight: ValueModifier;
    declare value: ValueModifier;
    declare quality: ValueModifier;
    declare durability: ValueModifier;
    readonly [kProjectileGear] = true;

    static isA(obj: unknown): obj is ProjectileGear {
        return (
            typeof obj === "object" && obj !== null && kProjectileGear in obj
        );
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace ProjectileGear {
    export interface Logic
        extends SubTypeMixin.Logic<ProjectileGearSubType>,
            GearMixin.Logic {
        readonly parent: Data;
    }

    export interface Data
        extends SubTypeMixin.Data<ProjectileGearSubType>,
            GearMixin.Data {
        readonly logic: Logic;
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
        declare _logic: ProjectileGear.Logic;
        readonly [kData] = true;

        get logic(): ProjectileGear.Logic {
            this._logic ??= new ProjectileGear(this);
            return this._logic;
        }
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
