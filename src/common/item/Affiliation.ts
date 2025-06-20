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

import { RegisterClass } from "@utils/decorators";
import { SohlAction } from "@common/event";
import { SohlDataModel, SohlLogic } from "@common";
import { SohlItem } from "@common/item";
const { StringField, NumberField } = fvtt.data.fields;

const kAffiliation = Symbol("Affiliation");
const kData = Symbol("Affiliation.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: Affiliation.Kind,
    }),
)
export class Affiliation extends SohlLogic implements Affiliation.Logic {
    declare readonly parent: Affiliation.Data;
    readonly [kAffiliation] = true;

    static isA(obj: unknown): obj is Affiliation {
        return typeof obj === "object" && obj !== null && kAffiliation in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Affiliation {
    /**
     * The type moniker for the Affiliation item.
     */
    export const Kind = "affiliation";

    /**
     * The FontAwesome icon class for the Affiliation item.
     */
    export const IconCssClass = "fa-duotone fa-people-group";

    /**
     * The image path for the Affiliation item.
     */
    export const Image = "systems/sohl/assets/icons/people-group.svg";

    export interface Logic extends SohlLogic.Logic {
        readonly [kAffiliation]: true;
    }

    export interface Data extends SohlItem.Data {
        readonly [kData]: true;
        society: string;
        office: string;
        title: string;
        level: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            ctor: DataModel,
            logicClass: Affiliation,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel
        extends SohlItem.DataModel
        implements Affiliation.Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["Affiliation"];
        declare society: string;
        declare office: string;
        declare title: string;
        declare level: number;
        readonly [kData] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                society: new StringField(),
                office: new StringField(),
                title: new StringField(),
                level: new NumberField({
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
                    template: "systems/sohl/templates/item/affiliation.hbs",
                },
            });
    }
}
