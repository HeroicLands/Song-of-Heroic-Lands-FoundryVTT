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
import { SohlLogic, SohlDataModel } from "@common";
import { SohlAction } from "@common/event";
import { RegisterClass } from "@utils/decorators";
import { GearMixin, SohlItem, SubTypeMixin } from ".";
import { ImpactModifier, ValueModifier } from "@common/modifier";
import { defineType } from "@utils";

const { NumberField, StringField, SchemaField } = foundry.data.fields;
const kProjectileGear = Symbol("ProjectileGear");
const kData = Symbol("ProjectileGear.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "ProjectileGearLogic",
    }),
)
export class ProjectileGear
    extends SubTypeMixin(GearMixin(SohlLogic))
    implements ProjectileGear.Logic
{
    declare weight: ValueModifier;
    declare value: ValueModifier;
    declare quality: ValueModifier;
    declare durability: ValueModifier;
    declare readonly parent: ProjectileGear.Data;
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
    /**
     * The type moniker for the ProjectileGear item.
     */
    export const Kind = "Projectilegear";

    /**
     * The FontAwesome icon class for the ProjectileGear item.
     */
    export const IconCssClass = "fas fa-sack";

    /**
     * The image path for the ProjectileGear item.
     */
    export const Image = "systems/sohl/assets/icons/sack.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.ProjectileGear.SubType", {
        NONE: "none",
        ARROW: "arrow",
        BOLT: "bolt",
        BULLET: "bullet",
        DART: "dart",
        OTHER: "other",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export interface Logic
        extends SubTypeMixin.Logic<SubType>,
            GearMixin.Logic {
        readonly parent: ProjectileGear.Data;
    }

    export interface Data extends SubTypeMixin.Data<SubType>, GearMixin.Data {
        get logic(): ProjectileGear.Logic;
        shortName: string;
        impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactModifier.AspectType;
        };
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: ProjectileGear.SubType,
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
        SubTypes,
    ) as unknown as Constructor<ProjectileGear.Data> &
        SohlDataModel.TypeDataModelStatics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: ProjectileGear,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends DataModelShape {
        static readonly LOCALIZATION_PREFIXES = ["ProjectileGear"];
        readonly [kData] = true;
        declare subType: SubType;
        declare shortName: string;
        declare impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactModifier.AspectType;
        };

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
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
                        initial: ImpactModifier.ASPECT.BLUNT,
                        required: true,
                        choices: ImpactModifier.Aspects,
                    }),
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/projectilegear.hbs",
                },
            });
    }
}
