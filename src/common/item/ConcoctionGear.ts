import { SohlDataModel, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { GearMixin } from "./GearMixin";
import { SohlAction } from "@common/event";
import { defineType } from "@utils";
import { SohlItem, SubTypeMixin } from ".";

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
const { NumberField, StringField } = (foundry.data as any).fields;
const kConcoctionGear = Symbol("ConcoctionGear");
const kDataModel = Symbol("ConcoctionGear.DataModel");

@RegisterClass(
    new SohlPerformer.Element({
        kind: "ConcoctionGearPerformer",
    }),
)
export class ConcoctionGear extends SohlPerformer<ConcoctionGear.Data> {
    readonly [kConcoctionGear] = true;

    static isA(obj: unknown): obj is ConcoctionGear {
        return (
            typeof obj === "object" && obj !== null && kConcoctionGear in obj
        );
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
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
    export type SubTypes = (typeof SUBTYPE)[keyof typeof SUBTYPE];

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

    export interface Data<TPerformer extends ConcoctionGear = ConcoctionGear>
        extends SohlItem.Data<TPerformer> {
        potency: Potency;
        strength: number;
    }

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
    export class DataModel<TPerformer extends ConcoctionGear = ConcoctionGear>
        extends GearMixin.DataModel(
            SubTypeMixin.DataModel(SohlItem.DataModel, SubTypes),
        )
        implements Data<TPerformer>, SubTypeMixin.Data<TPerformer, SubTypes>
    {
        static readonly LOCALIZATION_PREFIXES = ["ConcoctionGear"];
        potency!: Potency;
        strength!: number;
        subType!: SubTypes;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        get subTypeChoices(): string[] {
            return (this.constructor as any)._metadata.subTypes;
        }

        static defineSchema() {
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
