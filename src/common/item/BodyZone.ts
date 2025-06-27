import { SohlDataModel, SohlLogic } from "@common";
import { SohlItem } from ".";
import { RegisterClass } from "@utils/decorators";
import { SohlAction } from "@common/event";

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
const { StringField } = (foundry.data as any).fields;
const kBodyZone = Symbol("BodyZone");
const kDataModel = Symbol("BodyZone.DataModel");

@RegisterClass(
    new SohlLogic.Element({
        kind: "BodyZone",
    }),
)
export class BodyZone extends SohlLogic implements BodyZone.Logic {
    declare readonly parent: BodyZone.Data;
    readonly [kBodyZone] = true;

    static isA(obj: unknown): obj is BodyZone {
        return typeof obj === "object" && obj !== null && kBodyZone in obj;
    }
    get bodyParts(): SohlItem[] {
        return this.actor?.itemTypes.bodypart || [];
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace BodyZone {
    /**
     * The type moniker for the BodyLocation item.
     */
    export const Kind = "bodyzone";

    /**
     * The FontAwesome icon class for the BodyLocation item.
     */
    export const IconCssClass = "fa-duotone fa-person";

    /**
     * The image path for the BodyLocation item.
     */
    export const Image = "systems/sohl/assets/icons/person.svg";

    export interface Logic extends SohlLogic.Logic {}

    export interface Data extends SohlItem.Data {
        abbrev: string;
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: BodyZone,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel extends SohlItem.DataModel implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["BodyZone"];
        declare readonly parent: SohlItem<BodyZone>;
        abbrev!: string;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema() {
            return {
                abbrev: new StringField(),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/bodyzone.hbs",
                },
            });
    }
}
