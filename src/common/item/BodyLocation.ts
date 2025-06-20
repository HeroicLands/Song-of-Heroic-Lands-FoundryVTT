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
import { SohlItem } from ".";
import { SohlAction } from "@common/event";
const { BooleanField, StringField } = (foundry.data as any).fields;
const kBodyLocation = Symbol("BodyLocation");
const kDataModel = Symbol("BodyLocation.DataModel");

@RegisterClass(
    new SohlLogic.Element({
        kind: "BodyLocationLogic",
    }),
)
export class BodyLocation<TData extends BodyLocation.Data = BodyLocation.Data>
    extends SohlLogic
    implements BodyLocation.Logic
{
    declare readonly parent: TData;
    protection!: PlainObject;
    layers!: string;
    traits!: PlainObject;
    readonly [kBodyLocation] = true;

    static isA(obj: unknown): obj is BodyLocation {
        return typeof obj === "object" && obj !== null && kBodyLocation in obj;
    }

    initialize(options?: PlainObject): void {
        this.protection = {};
        this.layers = "";
        this.traits = {
            isRigid: false,
        };
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace BodyLocation {
    /**
     * The type moniker for the BodyLocation item.
     */
    export const Kind = "bodylocation";

    /**
     * The FontAwesome icon class for the BodyLocation item.
     */
    export const IconCssClass = "fa-solid fa-hand";

    /**
     * The image path for the BodyLocation item.
     */
    export const Image = "systems/sohl/assets/icons/hand.svg";

    export interface Logic extends SohlLogic.Logic {}

    export interface Data extends SohlItem.Data {
        abbrev: string;
        isFumble: boolean;
        isStumble: boolean;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: BodyLocation,
            iconCssClass: "fa-solid fa-hand",
            img: "systems/sohl/assets/icons/hand.svg",
            sheet: "systems/sohl/templates/item/bodylocation-sheet.hbs",
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends SohlItem.DataModel implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["BodyLocation"];
        declare abbrev: string;
        declare isFumble: boolean;
        declare isStumble: boolean;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                abbrev: new StringField(),
                isFumble: new BooleanField({ initial: false }),
                isStumble: new BooleanField({ initial: false }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/bodylocation.hbs",
                },
            });
    }
}
