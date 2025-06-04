import { SohlPerformer, SohlDataModel } from "@common";
import { SohlAction } from "@common/event";
import { RegisterClass } from "@utils/decorators";
import { GearMixin, SohlItem } from ".";

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
const { NumberField } = (foundry.data as any).fields;
const kContainerGear = Symbol("ContainerGear");
const kDataModel = Symbol("ContainerGear.DataModel");

@RegisterClass(
    new SohlPerformer.Element({
        kind: "ContainerGearPerformer",
    }),
)
export class ContainerGear extends SohlPerformer<ContainerGear.Data> {
    readonly [kContainerGear] = true;

    static isA(obj: unknown): obj is ContainerGear {
        return typeof obj === "object" && obj !== null && kContainerGear in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
}

export namespace ContainerGear {
    /**
     * The type moniker for the ContainerGear item.
     */
    export const Kind = "containergear";

    /**
     * The FontAwesome icon class for the ContainerGear item.
     */
    export const IconCssClass = "fas fa-sack";

    /**
     * The image path for the ContainerGear item.
     */
    export const Image = "systems/sohl/assets/icons/sack.svg";

    export interface Data<TPerformer extends ContainerGear = ContainerGear>
        extends SohlItem.Data<TPerformer> {
        maxCapacityBase: number;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: ContainerGear,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel<TPerformer extends ContainerGear = ContainerGear>
        extends GearMixin.DataModel(SohlItem.DataModel)
        implements Data<TPerformer>
    {
        static readonly LOCALIZATION_PREFIXES = ["ContainerGear"];
        maxCapacityBase!: number;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema() {
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
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/containergear.hbs",
                },
            });
    }
}
