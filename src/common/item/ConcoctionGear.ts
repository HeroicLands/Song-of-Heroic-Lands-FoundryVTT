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
import { RegisterClass } from "@utils/decorators";
import { GearMixin } from "./GearMixin";
import { SohlAction } from "@common/event";
import { defineType } from "@utils";
import { SohlItem, SubTypeMixin } from ".";

const { NumberField, StringField } = (foundry.data as any).fields;
const kConcoctionGear = Symbol("ConcoctionGear");
const kData = Symbol("ConcoctionGear.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "ConcoctionGear",
    }),
)
export class ConcoctionGear extends SohlLogic implements ConcoctionGear.Logic {
    declare readonly parent: ConcoctionGear.Data;
    readonly [kConcoctionGear] = true;

    static isA(obj: unknown): obj is ConcoctionGear {
        return (
            typeof obj === "object" && obj !== null && kConcoctionGear in obj
        );
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace ConcoctionGear {
    /**
     * The type moniker for the ConcoctionGear item.
     */
    export const Kind = "concoctiongear";

    /**
     * The FontAwesome icon class for the ConcoctionGear item.
     */
    export const IconCssClass = "fa-flask-round-potion";

    /**
     * The image path for the ConcoctionGear item.
     */
    export const Image = "systems/sohl/assets/icons/potion.svg";

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
    } = defineType("SOHL.ConcoctionGear.SubType", {
        MUNDANE: "mundane",
        EXOTIC: "exotic",
        ELIXIR: "elixir",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export const {
        kind: POTENCY,
        values: Potencies,
        isValue: isPotency,
    } = defineType("SOHL.ConcoctionGear.Potency", {
        NOT_APPLICABLE: "na",
        MILD: "mild",
        STRONG: "strong",
        GREAT: "great",
    });
    export type Potency = (typeof POTENCY)[keyof typeof POTENCY];

    export interface Logic extends SohlLogic.Logic {
        readonly [kConcoctionGear]: true;
        readonly parent: ConcoctionGear.Data;
    }

    export interface Data extends SubTypeMixin.Data<SubType> {
        readonly [kData]: true;
        get logic(): ConcoctionGear.Logic;
        potency: Potency;
        strength: number;
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: ConcoctionGear.SubType,
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

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: ConcoctionGear,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
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
        declare subType: SubType;
        declare potency: Potency;
        declare strength: number;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        get subTypeChoices(): string[] {
            return (this.constructor as any)._metadata.subTypes;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                potency: new StringField({
                    initial: POTENCY.NOT_APPLICABLE,
                    required: true,
                    choices: Object.values(POTENCY),
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
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/concoctiongear.hbs",
                },
            });
    }
}
