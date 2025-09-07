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

import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import { ITEM_KIND } from "@utils/constants";
const { StringField, NumberField } = foundry.data.fields;

const kAffiliation = Symbol("Affiliation");
const kData = Symbol("Affiliation.Data");

export class Affiliation
    extends SohlItem.BaseLogic
    implements Affiliation.Logic
{
    declare readonly parent: Affiliation.Data;
    readonly [kAffiliation] = true;

    static isA(obj: unknown): obj is Affiliation {
        return typeof obj === "object" && obj !== null && kAffiliation in obj;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace Affiliation {
    export interface Logic extends SohlItem.Logic {
        readonly parent: Data;
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

    export class DataModel extends SohlItem.DataModel.Shape implements Data {
        static override readonly LOCALIZATION_PREFIXES = ["Affiliation"];
        static override readonly kind = ITEM_KIND.AFFILIATION;
        readonly [kData] = true;
        society!: string;
        office!: string;
        title!: string;
        level!: number;

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
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/affiliation.hbs",
                },
            });
    }
}
